"""
ShopDecide Scraping Microservice
FastAPI + Scrapling (StealthyFetcher) for anti-bot scraping
Runs locally on port 8000; on Vercel, deployed as a Python function
"""

import re
import json
import hashlib
import time
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="ShopDecide Scraper", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# In-memory cache (TTL 6h)
# ---------------------------------------------------------------------------
_CACHE: dict[str, tuple[float, any]] = {}
CACHE_TTL = 6 * 3600


def cache_get(key: str):
    if key in _CACHE:
        ts, val = _CACHE[key]
        if time.time() - ts < CACHE_TTL:
            return val
        del _CACHE[key]
    return None


def cache_set(key: str, val):
    _CACHE[key] = (time.time(), val)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _cache_key(*parts: str) -> str:
    return hashlib.sha256("|".join(parts).lower().encode()).hexdigest()[:16]


def _price_from_text(text: str) -> Optional[int]:
    """Extract integer rupee price from messy strings like '₹1,499' or 'Rs. 2,500'."""
    m = re.search(r"[\d,]+", re.sub(r"[₹Rs.\s]", "", text))
    if m:
        try:
            return int(m.group().replace(",", ""))
        except ValueError:
            pass
    return None


def _rating_from_text(text: str) -> Optional[float]:
    m = re.search(r"(\d+\.?\d*)\s*(?:out of|/)\s*5", text, re.IGNORECASE)
    if m:
        try:
            return min(5.0, float(m.group(1)))
        except ValueError:
            pass
    m = re.search(r"\b([1-4]\.\d|5\.0?|[1-5])\b", text)
    if m:
        try:
            v = float(m.group(1))
            if 1 <= v <= 5:
                return v
        except ValueError:
            pass
    return None


def _reviews_from_text(text: str) -> int:
    text = text.replace(",", "").lower()
    m = re.search(r"(\d+)\s*(k\b)?", text)
    if m:
        n = int(m.group(1))
        if m.group(2):
            n *= 1000
        return n
    return 0


# ---------------------------------------------------------------------------
# Google Shopping scraper
# ---------------------------------------------------------------------------

class SearchRequest(BaseModel):
    query: str
    max_results: int = 8


class ProductResult(BaseModel):
    name: str
    brand: Optional[str] = None
    price: Optional[int] = None
    image: Optional[str] = None
    source: str  # "amazon" | "flipkart" | "google"
    url: Optional[str] = None
    rating: Optional[float] = None
    review_count: int = 0


@app.post("/search", response_model=list[ProductResult])
async def search_products(req: SearchRequest):
    key = _cache_key("search", req.query, str(req.max_results))
    cached = cache_get(key)
    if cached:
        return cached

    results = await _scrape_google_shopping(req.query, req.max_results)
    cache_set(key, results)
    return results


async def _scrape_google_shopping(query: str, max_results: int) -> list[ProductResult]:
    """Scrape Google Shopping results."""
    try:
        from scrapling import StealthyFetcher
    except ImportError:
        return []

    url = f"https://www.google.com/search?tbm=shop&q={query.replace(' ', '+')}&gl=in&hl=en"
    try:
        fetcher = StealthyFetcher()
        page = await fetcher.async_fetch(url)
    except Exception:
        return []

    results = []
    # Google Shopping product cards
    for card in page.find_all("div.sh-dgr__content"):
        if len(results) >= max_results:
            break
        try:
            name_el = card.find("h3.tAxDx") or card.find("div.Xjkr3b")
            price_el = card.find("span.a8Pemb") or card.find("span.HRLxBb")
            merchant_el = card.find("div.aULzUe")
            img_el = card.find("img")
            link_el = card.find("a")

            name = name_el.text.strip() if name_el else None
            price_text = price_el.text.strip() if price_el else ""
            price = _price_from_text(price_text)
            merchant = merchant_el.text.strip().lower() if merchant_el else ""
            image = img_el.get("src") if img_el else None
            url_href = link_el.get("href") if link_el else None

            if not name or not price:
                continue

            source = "amazon" if "amazon" in merchant else "flipkart" if "flipkart" in merchant else "google"
            results.append(ProductResult(
                name=name,
                price=price,
                image=image,
                source=source,
                url=url_href,
                brand=_extract_brand(name),
            ))
        except Exception:
            continue

    return results


def _extract_brand(name: str) -> Optional[str]:
    """Heuristic: first word is often the brand for tech products."""
    words = name.split()
    if words:
        return words[0]
    return None


# ---------------------------------------------------------------------------
# Amazon.in product page scraper
# ---------------------------------------------------------------------------

class AmazonRequest(BaseModel):
    url: str


class AmazonProduct(BaseModel):
    name: Optional[str] = None
    brand: Optional[str] = None
    price: Optional[int] = None
    rating: Optional[float] = None
    review_count: int = 0
    image: Optional[str] = None
    features: list[str] = []
    url: str


@app.post("/amazon", response_model=AmazonProduct)
async def scrape_amazon(req: AmazonRequest):
    key = _cache_key("amazon", req.url)
    cached = cache_get(key)
    if cached:
        return cached

    result = await _scrape_amazon_product(req.url)
    cache_set(key, result)
    return result


async def _scrape_amazon_product(url: str) -> AmazonProduct:
    try:
        from scrapling import StealthyFetcher
    except ImportError:
        return AmazonProduct(url=url)

    # Normalise ASIN URL
    asin_m = re.search(r"/dp/([A-Z0-9]{10})", url)
    if asin_m:
        url = f"https://www.amazon.in/dp/{asin_m.group(1)}"

    try:
        fetcher = StealthyFetcher()
        page = await fetcher.async_fetch(url)
    except Exception:
        return AmazonProduct(url=url)

    name_el = page.find("#productTitle")
    price_el = (
        page.find("span.a-price-whole")
        or page.find("#priceblock_ourprice")
        or page.find("#priceblock_dealprice")
    )
    rating_el = page.find("span.a-icon-alt")
    reviews_el = page.find("#acrCustomerReviewText")
    brand_el = page.find("#bylineInfo") or page.find("#brand")
    img_el = page.find("#landingImage") or page.find("#imgBlkFront")
    features = [li.text.strip() for li in page.find_all("#feature-bullets li")]

    name = name_el.text.strip() if name_el else None
    price = _price_from_text(price_el.text) if price_el else None
    rating = _rating_from_text(rating_el.text) if rating_el else None
    review_count = _reviews_from_text(reviews_el.text) if reviews_el else 0
    brand = brand_el.text.strip().replace("Brand: ", "").replace("Visit the ", "").replace(" Store", "") if brand_el else _extract_brand(name or "")
    image = img_el.get("src") if img_el else None

    return AmazonProduct(
        name=name,
        brand=brand,
        price=price,
        rating=rating,
        review_count=review_count,
        image=image,
        features=features[:8],
        url=url,
    )


# ---------------------------------------------------------------------------
# Flipkart product page scraper
# ---------------------------------------------------------------------------

class FlipkartRequest(BaseModel):
    url: str


class FlipkartProduct(BaseModel):
    name: Optional[str] = None
    brand: Optional[str] = None
    price: Optional[int] = None
    rating: Optional[float] = None
    review_count: int = 0
    image: Optional[str] = None
    url: str


@app.post("/flipkart", response_model=FlipkartProduct)
async def scrape_flipkart(req: FlipkartRequest):
    key = _cache_key("flipkart", req.url)
    cached = cache_get(key)
    if cached:
        return cached

    result = await _scrape_flipkart_product(req.url)
    cache_set(key, result)
    return result


async def _scrape_flipkart_product(url: str) -> FlipkartProduct:
    try:
        from scrapling import StealthyFetcher
    except ImportError:
        return FlipkartProduct(url=url)

    try:
        fetcher = StealthyFetcher()
        page = await fetcher.async_fetch(url)
    except Exception:
        return FlipkartProduct(url=url)

    name_el = page.find("span.B_NuCI") or page.find("h1.yhB1nd")
    price_el = page.find("div._30jeq3") or page.find("div._1vC4OE")
    rating_el = page.find("div._3LWZlK")
    reviews_el = page.find("span._2_R_DZ span") or page.find("span._13vcmD")
    img_el = page.find("img._396cs4") or page.find("img.q6DClP")

    name = name_el.text.strip() if name_el else None
    price = _price_from_text(price_el.text) if price_el else None
    rating = _rating_from_text(rating_el.text) if rating_el else None
    review_count_text = reviews_el.text if reviews_el else ""
    review_count = _reviews_from_text(review_count_text)
    image = img_el.get("src") if img_el else None

    return FlipkartProduct(
        name=name,
        brand=_extract_brand(name or ""),
        price=price,
        rating=rating,
        review_count=review_count,
        image=image,
        url=url,
    )


# ---------------------------------------------------------------------------
# Reddit sentiment scraper
# ---------------------------------------------------------------------------

class RedditRequest(BaseModel):
    query: str
    subreddits: list[str] = ["India", "IndiaShopping", "indianonlineshopping"]


class RedditPost(BaseModel):
    title: str
    score: int
    url: str
    sentiment: float  # -1 to 1


class RedditResult(BaseModel):
    posts: list[RedditPost]
    overall_sentiment: float
    mention_count: int


@app.post("/reddit", response_model=RedditResult)
async def scrape_reddit(req: RedditRequest):
    key = _cache_key("reddit", req.query, ",".join(req.subreddits))
    cached = cache_get(key)
    if cached:
        return cached

    result = await _fetch_reddit(req.query, req.subreddits)
    cache_set(key, result)
    return result


async def _fetch_reddit(query: str, subreddits: list[str]) -> RedditResult:
    """Use Reddit's JSON API (no auth needed for public posts)."""
    import urllib.request
    import urllib.parse

    posts = []
    for sub in subreddits[:3]:
        search_url = (
            f"https://www.reddit.com/r/{sub}/search.json"
            f"?q={urllib.parse.quote(query)}&restrict_sr=1&sort=relevance&limit=10&t=year"
        )
        try:
            req = urllib.request.Request(search_url, headers={"User-Agent": "ShopDecide/1.0"})
            with urllib.request.urlopen(req, timeout=5) as resp:
                data = json.loads(resp.read())
            for child in data.get("data", {}).get("children", []):
                d = child.get("data", {})
                title = d.get("title", "")
                score = d.get("score", 0)
                permalink = "https://reddit.com" + d.get("permalink", "")
                sentiment = _simple_sentiment(title + " " + d.get("selftext", ""))
                posts.append(RedditPost(title=title[:120], score=score, url=permalink, sentiment=sentiment))
        except Exception:
            continue

    overall = sum(p.sentiment for p in posts) / len(posts) if posts else 0.0
    return RedditResult(posts=posts[:15], overall_sentiment=round(overall, 3), mention_count=len(posts))


POSITIVE_WORDS = {"good", "great", "excellent", "awesome", "best", "love", "recommend", "worth", "buy", "happy", "satisfied", "perfect", "nice", "amazing", "superb", "value"}
NEGATIVE_WORDS = {"bad", "worst", "poor", "waste", "return", "regret", "issue", "problem", "broken", "defective", "avoid", "skip", "overpriced", "cheap", "fake", "disappointed"}


def _simple_sentiment(text: str) -> float:
    words = set(re.findall(r"\w+", text.lower()))
    pos = len(words & POSITIVE_WORDS)
    neg = len(words & NEGATIVE_WORDS)
    total = pos + neg
    if total == 0:
        return 0.0
    return round((pos - neg) / total, 3)


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------

@app.get("/health")
async def health():
    return {"status": "ok", "service": "shopdecide-scraper"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
