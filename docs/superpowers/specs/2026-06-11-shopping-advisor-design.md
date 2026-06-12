# Shopping Advisor — Design Spec
**Date:** 2026-06-12  
**Status:** Final — Incorporating Designer Handoff

---

## Overview

A web app where users describe what they want to buy in plain English and receive expert-quality product recommendations. The intelligence comes from a **category-aware multi-source research system** — the app detects what type of product is being searched, then routes to the highest-signal review platforms for that category (e.g. RTINGS.com for headphones, GSMarena for smartphones, r/IndianSkincareAddicts for skincare) rather than using the same generic sources for everything.

The AI synthesises real reviews, specialist platform data, Reddit discussions, and YouTube coverage into a scored, ranked recommendation. A real-time chat refinement panel on the results screen lets users narrow recommendations conversationally ("I need longer battery life", "sort by price").

---

## The 4 Screens

### Screen 1 — Home
User types a natural language shopping requirement. Example chips pre-fill and trigger search. CTA: "Find Best Options →".

### Screen 2 — Loading / Research Progress
5 animated steps fire sequentially (~750ms apart) while backend fetches data:
1. 🔍 Searching Google Shopping India…
2. 🛒 Checking Amazon, Flipkart & specialist review sites…
3. 💬 Reading Reddit & community discussions…
4. ▶️ Scanning YouTube reviews…
5. 🤖 Generating expert analysis…

Step 2 label adapts to detected category (e.g. "Checking RTINGS.com + Amazon…" for audio, "Checking GSMarena + Flipkart…" for smartphones).

### Screen 3 — Results
Two-column layout: left = ranked product cards (3–5), right = AI Refinement Chat panel. Sticky header with sort (Score / Price / Reviews) and Compare CTA. Products stream in as data resolves.

### Screen 4 — Compare
Side-by-side deep comparison for 2–3 selected products. Expert Verdict hero (BUY / WAIT / SKIP), full scorecard table, per-product expert analysis paragraphs.

---

## Navigation Flow

```
Home → (submit) → Loading → (steps complete) → Results
Results → (select ≥2 + Compare) → Compare
Compare → (← Back) → Results
Results / Compare → (← Home) → Home
```

---

## State Management (TypeScript interfaces)

```typescript
interface AppState {
  screen: 'home' | 'loading' | 'results' | 'compare';
  inputValue: string;
  searchQuery: string;
  loadingStep: number;           // -1 = idle, 0–4 = active step
  products: Product[];
  sortBy: 'score' | 'price' | 'reviews';
  selectedIds: string[];         // max 3 for compare
  chatMessages: ChatMessage[];
  chatInput: string;
  isRefining: boolean;           // shows typing indicator
}

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;                 // INR
  store: string;
  amazonRating: number;
  amazonReviews: number;
  flipkartRating: number;
  flipkartReviews: number;
  redditMentions: number;
  redditSentiment: 'positive' | 'mixed' | 'negative';
  youtubeVideos: number;
  youtubeViews: string;          // e.g. "2.4M"
  score: number;                 // 0–100
  verdict: 'BUY' | 'WAIT' | 'SKIP';
  badge: string | null;          // e.g. "Best Value", "Budget Pick"
  aiVerdict: string;             // one-line italic quote shown on card
  expertSummary: string;         // ~100–150 word editorial paragraph
  batteryScore: number;          // 0–5, used for chat refinement sorting
  ancScore: number;              // 0–5
  waterScore: number;            // 0–4
}

interface ChatMessage {
  type: 'user' | 'ai';
  text: string;
}
```

---

## Category Detection & Source Routing

### Step 0: Category Detection (before any scraping)
DeepSeek classifies the user's query into a category. This determines which specialist sources are fetched in addition to the universal sources (Amazon, Flipkart, Reddit, YouTube).

**Categories and their specialist sources:**

| Category | Specialist Review Sites | Priority Reddit Subs |
|---|---|---|
| **Tech / Gadgets (general)** | Digit.in, Beebom, Smartprix | r/IndianGaming, r/india |
| **Smartphones** | GSMarena, Digit.in, Smartprix | r/IndianGaming, r/india |
| **Audio (headphones, earbuds, speakers)** | RTINGS.com, Audio Science Review (ASR), Headphone Zone | r/IndianGaming, r/indianaudiophiles, r/headphones, r/BudgetAudiophile |
| **Skincare / Beauty** | INCIDecoder, Nykaa community section, Try and Review | r/IndianSkincareAddicts, r/SkincareAddiction |
| **Watches** | Watchuseek, Chrono24 | r/watchesindia, r/Watches |
| **Laptops / Monitors / TVs** | RTINGS.com (displays), Digit.in, Nanoreview | r/IndianGaming, r/hardware |
| **Fragrances / Perfumes** | Fragrantica, Parfumo | r/DesiFragranceAddicts, r/fragrance |
| **Mechanical Keyboards** | Deskthority, Keeb-Finder | r/mkindia, r/MechanicalKeyboards |
| **Coffee / Espresso** | CoffeeReview.com | r/Coffee, r/espresso |
| **Board Games** | BoardGameGeek (BGG) | r/indianboardgamers, r/boardgames |
| **Food / Restaurants** | Zomato | r/Bangalore / r/Mumbai / r/Delhi (city subs) |
| **Travel / Hotels** | MakeMyTrip, Goibibo | r/indiatravel |
| **Fountain Pens** | Fountain Pen Network (FPN), Fountain Pen Companion (fpc.ink), FPI Forums (India) | r/fountainpens |
| **Stationery / Notebooks / Paper** | The Pen Addict, JetPens guides, Scooboo / Factor Notes (India) | r/stationery, r/notebooks, r/bulletjournal |
| **Supplements / Protein / Nutrition** | Examine.com, Labdoor, Trustified (India) | r/Fitness_India, r/supplements, r/NutritionalScience, r/Fitness |
| **Fitness Wearables / Sleep Tech** | The Quantified Scientist | r/Fitness_India, r/biohacking, r/Fitness |
| **Biohacking / Longevity** | Examine.com, The Quantified Scientist | r/biohacking, r/PeterAttia, r/NutritionalScience |
| **Nootropics / Cognitive Supplements** | Examine.com | r/Nootropics, r/supplements |
| **Heritage Boots / Leather Goods** | Stridewise, Heddels (denim/workwear) | r/goodyearwelt, r/rawdenim, r/BuyItForLife |
| **Selvedge / Raw Denim** | Heddels (Scout database) | r/rawdenim, r/BuyItForLife |
| **Whiskey / Spirits** | Distiller, Whiskybase | r/scotch, r/bourbon, r/whiskey |
| **EDC / Knives / Pocket Tools** | BladeForums, EverydayCarry.com | r/EDC, r/BuyItForLife |
| **Kitchen Gear / Cookware / Knives** | Serious Eats equipment reviews | r/BuyItForLife, r/Cooking |
| **Luxury Handbags / Leather Goods** | PurseForum (TPF), Clair by Rebag, Luxepolis / Confidential Couture (India) | r/handbags, r/Luxury |
| **Fashion (High-Street)** | Myntra community reviews, LTK, Trendalytics | r/IndianFashionAddicts, r/FemaleFashionAdvice, r/frugalmalefashion |
| **Fashion (Sizing / Fit)** | Myntra community, LTK | r/IndianFashionAddicts, r/PetiteFashionAdvice, r/PlusSizeFashion, r/xxfitness |
| **Cosmetics / Makeup** | Temptalia (Matrix dupes), MakeupAlley | r/IndianMakeupAddicts, r/MakeupAddiction, r/BeautyBoxes |
| **General / Other** | MouthShut.com | r/india, r/OnlineShopping_India, r/frugalmalefashion, r/BuyItForLife |

**Universal sources (always fetched regardless of category):**
- Amazon India + Flipkart (ecommerce ratings via Scrapling)
- YouTube Data API v3
- MouthShut.com (India's broadest consumer review platform — covers everything)

### Google-Powered Reddit Search
Reddit's internal search is unreliable. All Reddit queries use Google via Scrapling:
```
site:reddit.com/r/{subreddit} {product name} review
```
This surfaces the exact threads where enthusiasts have stress-tested the product, bypassing Reddit's noisy internal search results.

### Source Scraping Tiers

| Tier | Sources | Method |
|---|---|---|
| **Tier 1 (structured data)** | RTINGS.com, GSMarena, Digit.in, Beebom, Smartprix | Scrapling StealthyFetcher — well-structured HTML |
| **Tier 2 (community)** | MouthShut.com, Nykaa community, Watchuseek | Scrapling StealthyFetcher |
| **Tier 3 (aggregated via Google)** | Reddit threads | Scrapling → Google search → follow thread links |
| **Tier 4 (API)** | YouTube Data API v3 | Direct API call from Next.js |
| **Tier 5 (ecommerce)** | Amazon.in, Flipkart | Scrapling StealthyFetcher |

Tier 1 specialist sites (RTINGS, GSMarena, etc.) are fetched **only when relevant to the detected category** — they are never fetched for every query.

---

## Data Pipeline

### Architecture: Python Scrapling sidecar + Next.js API routes

```
Next.js App (Vercel Hobby)
  ├── GET  /api/search       → Scrapling sidecar → Google Shopping India
  ├── GET  /api/ecommerce    → Scrapling sidecar → Amazon.in + Flipkart ratings
  ├── GET  /api/reddit       → Reddit public JSON API
  ├── GET  /api/youtube      → YouTube Data API v3
  └── POST /api/synthesize   → OpenRouter → DeepSeek V3
       └── POST /api/refine  → OpenRouter → DeepSeek V3 (chat turn)

Scrapling Service (Python, Railway/Render free tier)
  └── StealthyFetcher: Google Shopping, Amazon.in, Flipkart
      Bypasses Cloudflare and anti-bot detection reliably
```

Client orchestrates parallel API calls — each Next.js route completes within Vercel Hobby's 10s timeout. No single long-running function.

### Step 1: Product Discovery (Scrapling → Google Shopping India)
- Scrapes `google.co.in/search?q={query}&tbm=shop` with StealthyFetcher
- Returns: product names, prices, stores, aggregate ratings
- Timeout: 8s

### Step 2: Popularity Filter
Products must meet ALL criteria:
- 100+ reviews on Amazon India OR Flipkart
- Available on at least one major Indian platform

YouTube is a **soft signal** (scoring only, not a hard filter gate).

### Step 3: Ecommerce Data (Scrapling → Amazon.in + Flipkart)
- Amazon.in: rating, review count (from product listing page)
- Flipkart: rating, review count
- Fallback: mark source "unavailable" in scorecard if blocked, continue
- SerpAPI is NOT used — replaced fully by Scrapling (free)

### Step 4: Social & Specialist Signals (parallel, via Scrapling + Next.js)

**Reddit (Google-powered search via Scrapling):**
- Queries category-specific subreddits from the routing table above
- Uses Google search: `site:reddit.com/r/{subreddit} {product} review` — more reliable than Reddit's own search API
- Extracts: post titles, upvote counts, comment counts, top comment snippets
- Timeout 10s. On failure: score component = 0, continue.

**Specialist review sites (Scrapling, category-dependent):**
- Fetched only when the detected category matches (e.g. RTINGS only for audio/displays)
- Extracts: overall score, key test metrics, written verdict snippets
- Adds to AI synthesis context as high-trust signals

**MouthShut.com (always fetched for all categories):**
- India's broadest consumer review platform — covers everything
- Captures real consumer pain points often absent from ecommerce reviews
- Extracts: rating, review count, top positive/negative snippets

**YouTube:**
- Data API v3, `{product} review India`. Budget: 100 units/call, 10k units/day free.
- On quota exhaustion: mark unavailable, continue.

### Step 5: AI Synthesis (OpenRouter → DeepSeek V3)
One call per product. Structured JSON output:
```json
{
  "verdict": "BUY | WAIT | SKIP",
  "verdict_reason": "string (1 sentence)",
  "score": 0-100,
  "badge": "string | null",
  "aiVerdict": "string (one-line italic quote for card)",
  "expertSummary": "string (~100-150 words, editorial tone)",
  "top_complaints": ["string"],
  "suspicious_signals": ["string"],
  "cheaper_alternative": "string | null",
  "batteryScore": 0-5,
  "ancScore": 0-5,
  "waterScore": 0-4
}
```

Expert voice requirements: leads with verdict, cites evidence counts, surfaces real complaints, flags suspicious review patterns, no hedging.

### Step 6: Scoring Algorithm
```
score = (ecommerce_rating_norm × 40)
      + (log_review_count_norm × 20)
      + (reddit_sentiment_norm × 20)
      + (youtube_coverage_norm × 20)
      - 10 (if suspicious pattern detected)
```
Final score clamped to [0, 100].

---

## AI Chat Refinement Panel

The right panel on the Results screen allows multi-turn conversational refinement. Each user message:
1. Appears immediately as a user bubble
2. Shows typing indicator (1.6s)
3. AI responds in 2–3 sentences + reorders product IDs

**Keyword → sort action mapping:**

| Keyword(s) | Sort action |
|---|---|
| battery, charge | Sort by `batteryScore` desc |
| budget, cheap, price, ₹, cost | Sort by `price` asc |
| noise, anc, cancel | Sort by `ancScore` desc |
| waterproof, sweat, water, ipx, gym | Sort by `waterScore` desc |
| brand, reliable, quality | Sort by `score` desc |
| reddit, community | Sort by `redditMentions` desc |
| review, rating, popular | Sort by `amazonReviews + flipkartReviews` desc |
| (anything else) | Acknowledge, suggest refinement prompts |

`POST /api/refine` payload: `{ message, products[], chatHistory[] }`. DeepSeek responds with `{ aiText, reorderedIds }`.

---

## Caching

- **24-hour cache** per normalized query (SHA-256 key)
- Normalization: lowercase, trim, collapse spaces, strip punctuation except `₹`
- Per-product data also cached independently (reused by compare view)
- Store: in-memory LRU for MVP (no Vercel KV required)
- Cached results shown with "cached result" badge + timestamp

---

## Error Handling

| Failure | Behaviour |
|---|---|
| Google Shopping scrape fails | Stop pipeline, show retry prompt |
| Individual ecommerce source blocked | Mark "unavailable", continue |
| Reddit fails / 0 results | Reddit score = 0, continue |
| YouTube quota exhausted | Mark "unavailable", continue |
| DeepSeek/OpenRouter fails | Show raw scorecard without AI summary |
| 0 products pass filter | Friendly empty state with retry suggestion |
| 1 product passes filter | Skip compare CTA, show single recommendation |

---

## Tech Stack

| Layer | Choice | Cost |
|---|---|---|
| Framework | Next.js 15 (App Router) + TypeScript | Free |
| UI | shadcn/ui + Tailwind CSS + Nunito (Google Fonts) | Free |
| Scraping service | Python + Scrapling (StealthyFetcher) | Free |
| Scraping host | Railway or Render free tier | Free |
| Social signals | Reddit public JSON + YouTube Data API v3 | Free |
| AI synthesis + chat | OpenRouter → DeepSeek V3 | ~$0.001/query |
| Hosting | Vercel Hobby | Free |
| Cache | In-memory LRU | Free |

---

## Design System (from designer handoff)

### Font
Nunito (Google Fonts), weights 400/500/600/700/800/900. Applied to all elements including inputs, buttons, textareas.

### Colors
```
Background:       #fef9f0
Card/surface:     #ffffff
Border:           #e8ddd0
Border light:     #f0e8df
Muted bg:         #f5f0ea

Text primary:     #1c0a00
Text secondary:   #7c6e5a
Text muted:       #9a7e68
Text hint:        #c0b0a0

Accent orange:    #f97316
Accent dark:      #ea580c
Accent light bg:  #fff7ed
Accent border:    #fed7aa

BUY:  bg #dcfce7 · text #16a34a · border #86efac · light #f0fdf4
WAIT: bg #fef3c7 · text #d97706 · border #fde68a · light #fffbeb
SKIP: bg #fee2e2 · text #dc2626 · border #fca5a5 · light #fff5f5

Score ≥80: #f97316 · 70–79: #fbbf24 · <70: #f87171
Reddit positive: #dcfce7/#16a34a · mixed: #fef3c7/#d97706 · negative: #fee2e2/#dc2626
YouTube badge: #fef3f0/#c2410c
```

### Spacing / Radius / Shadows
- Card gap: 16px · Card padding: 24px · Section padding: 32–40px
- Cards: 20–24px radius · Buttons: 10–16px · Pills/badges: 100px (fully round)
- Card shadow: `0 2px 14px rgba(0,0,0,0.04)`
- Header shadow: `0 2px 14px rgba(0,0,0,0.05)`
- Search input shadow: `0 4px 32px rgba(28,10,0,0.08)`
- CTA shadow: `0 6px 24px rgba(249,115,22,0.4)`

### Animations
| Name | Properties | Duration |
|---|---|---|
| `fadeUp` | opacity 0→1, translateY 20px→0 | 350ms ease |
| `cardIn` | opacity 0→1, translateY 14px→0 | 450ms ease, staggered 90ms |
| `msgIn` | opacity 0→1, translateY 6px→0 | 300ms ease |
| `pulse` | opacity 1→0.4→1 | 1–2s ease-in-out |
| Progress bar | width transition | 700ms cubic-bezier(0.4,0,0.2,1) |

---

## API Keys Required (all server-side env vars)

| Variable | Service |
|---|---|
| `OPENROUTER_API_KEY` | OpenRouter → DeepSeek V3 |
| `YOUTUBE_API_KEY` | YouTube Data API v3 |
| `SCRAPLING_SERVICE_URL` | Internal URL of Python scraping service |

Reddit: no key needed. All keys server-side only, never exposed to client.

---

## Security
- Rate limiting: 5 req/min per IP via Next.js middleware
- No user data stored beyond 24h cache TTL
- No authentication required for v1

---

## Out of Scope (v1)
- Price tracking / alerts
- User accounts / saved searches
- X/Twitter, Instagram, TikTok signals
- Mobile app
- Non-Indian platforms
- Full review text crawling (ratings + counts only)
