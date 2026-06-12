# ShopDecide — Design Spec
**Date:** 2026-06-12
**Website:** shopdecide.com
**Status:** Final — Ready for Implementation

---

## Overview

ShopDecide is a web app where users describe what they want to buy in plain English and receive expert-quality product recommendations grounded in real ecommerce reviews, Reddit discussions, and YouTube coverage from India — like asking a knowledgeable friend, not reading a marketing brochure.

The intelligence comes from a **category-aware multi-source research system** — the app detects the product category and routes to the highest-signal review platforms for that category (RTINGS.com for headphones, GSMarena for smartphones, Examine.com for supplements, etc.) rather than using the same generic sources for everything.

Results are synthesised by DeepSeek V3 (via OpenRouter) into a scored, ranked recommendation with an expert voice that leads with verdicts, surfaces real complaints, and flags suspicious review patterns.

---

## The 8 Screens

| Screen | Route | Auth required |
|---|---|---|
| Auth (Login / Sign Up) | `/auth` | No |
| Home + Rankings | `/` | Yes |
| Loading / Research Progress | `/search` (loading state) | Yes |
| Results + AI Chat Refinement | `/search` (results state) | Yes |
| Product Detail | `/product/[id]` | Yes |
| Compare | `/compare` | Yes |
| Wishlist | `/wishlist` | Yes |
| Profile | `/profile` | Yes |

---

## Navigation Flow

```
/auth  →  (login/signup)  →  /
/      →  (search submit) →  /search (loading → results)
/search results  →  (click card)    →  /product/[id]
/search results  →  (compare ≥2)   →  /compare
/compare         →  (← back)       →  /search results
/product/[id]    →  (← back)       →  previous screen
nav              →  Wishlist        →  /wishlist
nav              →  Profile         →  /profile
```

---

## Screen 1 — Auth (`/auth`)

**Purpose:** Login or sign up before accessing the app.

- Full-viewport warm gradient background: `linear-gradient(135deg, #fef9f0 0%, #fff7ed 100%)`
- Centred card: `max-width: 420px`, white, `border-radius: 24px`, `padding: 40px 32px`
- Logo: 56×56px orange square (`#f97316`), `border-radius: 16px`, white `✦` glyph
- App name: **ShopDecide** — `font-size: 32px; font-weight: 900`
- Tagline: "India's smartest product recommender"

**Tab toggle:** Login / Sign Up — pill switcher (`background: #f5f0ea`)

**Login form fields:** Email, Password → "Sign In" button
**Sign Up form fields:** Full Name, Email, Password → "Create Account" button

**Divider:** OR

**Google button:** "Continue with Google" — white border button, hover → orange border

**Footer:** "By signing in, you agree to our Terms of Service and Privacy Policy"

---

## Screen 2 — Home (`/`)

### Global Nav (sticky, all authenticated screens)
- Logo: 36×36px orange square + **ShopDecide** wordmark
- Right: `❤ Wishlist (N)` · `👤 Profile` · `Logout` (red hover)
- `background: white; border-bottom: 1.5px solid #e8ddd0; position: sticky; top: 0; z-index: 20`

### Hero Section
- Background: `linear-gradient(180deg, #fef9f0 0%, #fff7ed 100%)`
- Badge: "POWERED BY REAL REVIEWS" — orange pill
- Headline: "What are you looking to **buy today?**" — `font-size: 48px; font-weight: 900` — "buy today?" in `#f97316`
- Subheading: "AI-powered recommendations from Amazon, Flipkart, Reddit & YouTube — like asking a knowledgeable friend."
- Search input: full-width, `max-width: 720px`, large rounded input with 🔍 icon
- Placeholder: "e.g. best TWS earbuds under ₹2,500 for gym use"
- 4 example chips (clickable, pre-fill + trigger search):
  1. "Best budget smartphone under ₹15,000"
  2. "Air purifier for 300 sq ft room"
  3. "Running shoes under ₹3,000"
  4. "TWS earbuds for gym use"
- CTA: "Find Best Options →" — full-width orange button, `max-width: 720px`
- Trust bar: 🛒 Amazon & Flipkart · 💬 Reddit · ▶️ YouTube · 🤖 AI analysis

### Top Picks Rankings Section
- Section header: "Top Picks Right Now" · "Ranked by real reviews, Reddit signals & expert sources" · "Updated 3 days ago" pill
- **Category tab bar** (horizontal scroll, no wrap):
  ⭐ All · 📱 Smartphones · 🎧 Audio & Earbuds · 💻 Laptops & Monitors · 💄 Skincare & Beauty · 💊 Supplements & Fitness · 👕 Fashion (Men's) · 👗 Fashion (Women's) · 🍳 Kitchen & Cookware · ⌚ Watches · 🌸 Fragrances · 🥾 Heritage Boots · 🥃 Spirits & Whiskey · ⌨️ Mech. Keyboards · 🔪 EDC & Knives · ✒️ Fountain Pens · 📓 Stationery · 🎲 Board Games · ☕ Coffee Gear · 👜 Luxury Handbags
- **"All" tab:** 2-column card grid, top #1 per category. Each card: 160×160px image, category chip, verdict badge, name, brand, price, score
- **Category tab:** Leaderboard list. Each row: 64×64px image, rank badge (#1 gold/#2 silver/#3 bronze), name + brand + price, score + verdict badge
- "See all 100 →" button at bottom of leaderboard
- Clicking any item → `/product/[id]`

---

## Screen 3 — Loading / Research Progress

**Purpose:** Shown during backend research. Builds trust by showing each source "checking in".

- Full viewport, centred, `max-width: 540px`
- Pulsing `✦` icon (72×72px, `#fff7ed` bg, `#fed7aa` border)
- "RESEARCHING FOR YOU" label + query in quotes
- 5 steps fire sequentially (~750ms apart):
  1. 🔍 Searching Google Shopping India…
  2. 🛒 Checking Amazon, Flipkart & specialist review sites…
  3. 💬 Reading Reddit & community discussions…
  4. ▶️ Scanning YouTube reviews…
  5. 🤖 Generating expert analysis…
- Step label in step 2 adapts to category (e.g. "Checking RTINGS.com + Amazon…" for audio)
- Step states: pending (muted) → active (orange pulse + "Running…") → complete (green ✓ + "Done ✓")
- Progress bar: `linear-gradient(90deg, #f97316, #fbbf24)` fills 10%→28%→46%→64%→82% per step

---

## Screen 4 — Results + AI Chat Refinement

**Layout:** `height: 100vh`, sticky header, two-column content area

### Sticky Header
- ← Home · "Results for: {query}" · source summary badge ("Based on X reviews · Y Reddit posts · Z YouTube videos") · Sort pills (Score / Price / Reviews) · "Compare N →" CTA (appears when ≥2 selected)

### Left Panel — Product Cards (3–5)
Each card (`background: white`, orange border when selected):
- **Image:** 120×120px, `#f5f0ea` bg, `border-radius: 12px`, `object-fit: contain`, 8px padding. Emoji fallback if no image.
- **Top row:** Verdict badge (🟢 BUY / 🟡 WAIT / 🔴 SKIP) + optional label badge (e.g. "Best Value") + score (42px, colour by score tier)
- **Name + price:** Product name (21px/900), brand, price in `#f97316` (26px/900), store
- **Divider**
- **Ratings row:** Amazon ★X.X (N,NNN) | Flipkart ★X.X (N,NNN)
- **Social badges:** Reddit sentiment pill + YouTube coverage pill
- **Score bar:** labelled "OVERALL SCORE", coloured fill
- **AI verdict quote:** left-border blockquote, italic, verdict-tinted background
- **Compare checkbox:** "Add to compare"
- Entry animation: `cardIn` staggered 90ms

### Right Panel — AI Refinement Chat (380px wide)
- Header: `✦` icon + "Refine with AI" + "Tell me what matters to you — I'll update recommendations"
- AI bubble: `#f5f0ea` bg, `border-radius: 18px 18px 18px 4px`
- User bubble: `#f97316` bg, white text, right-aligned
- Typing indicator: 3 animated dots while refining (1.6s)
- Input: textarea, Enter to send / Shift+Enter for new line, orange send button
- Keyword → sort mapping (battery, price, anc, waterproof, brand, reddit, reviews)
- Chat history persists for session; auto-scrolls to latest message

---

## Screen 5 — Product Detail (`/product/[id]`)

**Layout:** `max-width: 1200px`, two-column grid

### Left Column
- **Hero image:** Full-width 1:1 square, `#f5f0ea` bg, `border-radius: 20px`, 12px padding, emoji fallback
- **Store links:**
  - 🛒 "View on Amazon (₹X,XXX)" — `#FF9900` background
  - 🛒 "View on Flipkart (₹X,XXX)" — `#1F40FB` background
- **Wishlist button:** "❤ Add to Wishlist" / "❌ Remove from Wishlist" — toggles state

### Right Column
- Verdict badge + optional label badge
- Product name (32px/900) + brand
- Ratings: Amazon ★X.X (N reviews) | Flipkart ★X.X (N reviews)
- **Score panel** (`#f5f0ea` bg): 48px score number + bar + "/100 — AI composite score"
- **AI verdict quote:** left-border blockquote, italic
- **Expert Analysis card:** heading + ~150 word editorial paragraph + Key Specs grid (Price, Store)

### "What People Are Saying" Section (below the grid)
Two cards side by side:
- **💬 Reddit Community:** mention count, sentiment badge, insight paragraph, "Read Reddit Threads →" link (opens real Reddit search URL, `#FF4500` button)
- **▶ YouTube Reviews:** video count + total views, "⭐ Highly covered" badge, insight paragraph, "Watch on YouTube →" link (`#FF0000` button)

---

## Screen 6 — Compare (`/compare`)

**Layout:** `max-width: 1200px`, sticky header, scrollable content

### Section 1 — Expert Verdict Hero
- "EXPERT VERDICT" label (uppercase, centre)
- Per product: brand, name, price, large verdict badge (BUY/WAIT/SKIP) — hero element of the page

### Section 2 — Full Scorecard (CSS Grid)
Rows: Best Price · Overall Score · Amazon Rating · Flipkart Rating · Reddit Sentiment · YouTube Coverage
- Winner highlighting: lowest price → green, highest score → orange
- Column borders between products

### Section 3 — Expert Analysis
Per-product cards with verdict-coloured top border + 100–150 word editorial paragraph

---

## Screen 7 — Wishlist (`/wishlist`)

- Heading: "❤ My Wishlist" + item count
- Grid: `repeat(auto-fill, minmax(200px, 1fr))`, gap 16px
- Each card: 1:1 image, verdict badge, remove ✕ button, name, brand, price, score
- Empty state: 📋 icon + "Your wishlist is empty" + "Start Shopping →" CTA

---

## Screen 8 — Profile (`/profile`)

- Avatar (🧑 emoji, 80×80px circle) + name + email + join date
- Stats grid: "Items in Wishlist" (orange) · "Searches Made" (green)
- Preferences:
  - ☐ Email me about new recommendations
  - ☐ Notify me of price drops on saved items
- Action buttons: Edit Profile · Change Password · 🚪 Logout (red)

---

## State Management (TypeScript interfaces)

```typescript
interface AppState {
  // Auth
  isLoggedIn: boolean;
  user: User | null;

  // Navigation
  screen: 'home' | 'loading' | 'results' | 'detail' | 'compare' | 'wishlist' | 'profile';

  // Search
  searchInput: string;
  searchQuery: string;
  loadingStep: number;          // -1 = idle, 0–4 = active step
  products: Product[];
  sortBy: 'score' | 'price' | 'reviews';
  selectedIds: string[];        // max 3 for compare

  // Detail
  detailProductId: string | null;

  // Chat refinement
  chatMessages: ChatMessage[];
  chatInput: string;
  isRefining: boolean;

  // Rankings
  activeCategory: string;

  // Wishlist
  wishlistIds: string[];
}

interface User {
  name: string;
  email: string;
  joinDate: string;
  wishlistCount: number;
  searchCount: number;
  emailNotifications: boolean;
  priceDropAlerts: boolean;
}

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;                 // INR
  store: string;
  imageUrl: string;
  imageFallbackEmoji: string;
  amazonRating: number;
  amazonReviews: number;
  amazonLink: string;
  flipkartRating: number;
  flipkartReviews: number;
  flipkartLink: string;
  redditMentions: number;
  redditSentiment: 'positive' | 'mixed' | 'negative';
  redditLink: string;
  redditInsight: string;
  youtubeVideos: number;
  youtubeViews: string;          // e.g. "2.4M"
  youtubeLink: string;
  youtubeInsight: string;
  score: number;                 // 0–100
  verdict: 'BUY' | 'WAIT' | 'SKIP';
  badge: string | null;
  aiVerdict: string;             // one-line italic quote
  expertSummary: string;         // ~150 word editorial paragraph
  batteryScore: number;          // 0–5
  ancScore: number;              // 0–5
  waterScore: number;            // 0–4
  category: string;
}

interface ChatMessage {
  type: 'user' | 'ai';
  text: string;
}
```

---

## Category Detection & Source Routing

DeepSeek classifies the query before any scraping. Source routing by category:

| Category | Specialist Sources | Priority Reddit Subs |
|---|---|---|
| Smartphones | GSMarena, Digit.in, Smartprix | r/IndianGaming, r/india |
| Audio (earbuds/headphones/speakers) | RTINGS.com, Audio Science Review, Headphone Zone | r/IndianGaming, r/indianaudiophiles, r/headphones, r/BudgetAudiophile |
| Laptops / Monitors / TVs | RTINGS.com, Digit.in, Nanoreview | r/IndianGaming, r/hardware |
| Skincare / Beauty | INCIDecoder, Nykaa community, Try and Review | r/IndianSkincareAddicts, r/SkincareAddiction |
| Cosmetics / Makeup | Temptalia (Matrix), MakeupAlley | r/IndianMakeupAddicts, r/MakeupAddiction |
| Supplements / Protein | Examine.com, Labdoor, Trustified (India) | r/Fitness_India, r/supplements, r/NutritionalScience |
| Fitness Wearables | The Quantified Scientist | r/Fitness_India, r/biohacking |
| Watches | Watchuseek, Chrono24 | r/watchesindia, r/Watches |
| Fragrances | Fragrantica, Parfumo | r/DesiFragranceAddicts, r/fragrance |
| Heritage Boots / Leather | Stridewise, Heddels | r/goodyearwelt, r/rawdenim, r/BuyItForLife |
| Selvedge / Raw Denim | Heddels | r/rawdenim, r/BuyItForLife |
| Whiskey / Spirits | Distiller, Whiskybase | r/scotch, r/bourbon |
| EDC / Knives | BladeForums, EverydayCarry.com | r/EDC, r/BuyItForLife |
| Kitchen Gear / Cookware | Serious Eats equipment reviews | r/BuyItForLife |
| Luxury Handbags | PurseForum (TPF), Clair by Rebag, Luxepolis (India) | r/handbags, r/Luxury |
| Fashion (High-Street) | Myntra community, LTK | r/IndianFashionAddicts, r/FemaleFashionAdvice |
| Fountain Pens | Fountain Pen Network, FPC.ink, FPI Forums | r/fountainpens |
| Stationery / Notebooks | The Pen Addict, JetPens guides, Scooboo (India) | r/stationery, r/notebooks |
| Mechanical Keyboards | Deskthority, Keeb-Finder | r/mkindia, r/MechanicalKeyboards |
| Coffee Gear | CoffeeReview.com | r/Coffee, r/espresso |
| Board Games | BoardGameGeek (BGG) | r/indianboardgamers, r/boardgames |
| General / Other | MouthShut.com | r/india, r/OnlineShopping_India, r/BuyItForLife |

**Universal sources (always fetched):** Amazon India + Flipkart (via Scrapling), YouTube Data API v3, MouthShut.com

**Google-powered Reddit search:** `site:reddit.com/r/{subreddit} {product} review` via Scrapling — bypasses Reddit's unreliable internal search.

---

## Data Pipeline

```
Client (browser)
  ├── POST /api/research       → orchestrates full pipeline, streams SSE events
  │    ├── Scrapling service   → Google Shopping + ecommerce ratings + specialist sites
  │    ├── Reddit search       → Google-powered, via Scrapling
  │    ├── YouTube Data API v3 → video search + view counts
  │    └── POST /api/synthesize → OpenRouter → DeepSeek V3 → structured JSON per product
  │
  └── POST /api/refine         → chat refinement turn (DeepSeek V3)
       └── returns { aiText, reorderedIds }

Scrapling Service (Python, Railway/Render free tier)
  └── StealthyFetcher: Google Shopping, Amazon.in, Flipkart, specialist review sites
```

### Popularity Filter
- 100+ reviews on Amazon India OR Flipkart
- Available on at least one major Indian platform
- If 0 pass: friendly empty state. If 1 passes: skip compare CTA.

### Scoring Algorithm
```
score = (ecommerce_rating_norm × 40)
      + (log_review_count_norm  × 20)
      + (reddit_sentiment_norm  × 20)
      + (youtube_coverage_norm  × 20)
      - 10 (if suspicious pattern detected)
clamped to [0, 100]
```

---

## AI Synthesis (DeepSeek V3 via OpenRouter)

Structured output per product:
```json
{
  "verdict": "BUY | WAIT | SKIP",
  "verdict_reason": "string",
  "score": 0-100,
  "badge": "string | null",
  "aiVerdict": "one-line italic quote for card",
  "expertSummary": "~150 word editorial paragraph",
  "top_complaints": ["string"],
  "suspicious_signals": ["string"],
  "cheaper_alternative": "string | null",
  "redditInsight": "2-3 sentence Reddit community summary",
  "youtubeInsight": "2-3 sentence YouTube coverage summary",
  "batteryScore": 0-5,
  "ancScore": 0-5,
  "waterScore": 0-4
}
```

Expert voice: leads with verdict, cites evidence counts, surfaces real complaints, flags suspicious patterns, no hedging.

---

## Product Images

Source priority: Google Shopping thumbnail → Amazon `og:image` → Flipkart `og:image`
Proxied via `next/image` with `remotePatterns` — automatic WebP conversion and caching.
Fallback: category emoji centred on `#f5f0ea` background.

| Screen | Container | Padding |
|---|---|---|
| Results card | 120×120px | 8px |
| Rankings leaderboard row | 64×64px | 6px |
| Rankings "All" grid | 160×160px | 8px |
| Product Detail hero | Full-width 1:1 | 12px |
| Compare header | 96×96px | 8px |
| Wishlist card | Responsive 1:1 | 8px |

All containers: `background: #f5f0ea; border-radius: 12px; object-fit: contain`

---

## Caching

- 24-hour cache per normalised query (SHA-256 key)
- Normalisation: lowercase, trim, collapse spaces, strip punctuation except `₹`
- Per-product data cached independently (reused by detail + compare without re-fetching)
- Cached results shown with "cached result" badge + timestamp
- Store: in-memory LRU for MVP

---

## Error Handling

| Failure | Behaviour |
|---|---|
| Google Shopping scrape fails | Stop pipeline, show retry |
| Individual source blocked | Mark "unavailable", continue |
| Reddit fails | Score component = 0, continue |
| YouTube quota exhausted | Mark "unavailable", continue |
| DeepSeek fails | Show raw scorecard without AI summary |
| 0 products pass filter | Friendly empty state |

---

## Tech Stack (all free / near-free)

| Layer | Choice | Cost |
|---|---|---|
| Framework | Next.js 15 (App Router) + TypeScript | Free |
| UI | shadcn/ui + Tailwind CSS + Nunito (Google Fonts) | Free |
| Auth | NextAuth.js (email/password + Google OAuth) | Free |
| Scraping service | Python + Scrapling (StealthyFetcher) | Free |
| Scraping host | Railway or Render free tier | Free |
| Social signals | Reddit public JSON + YouTube Data API v3 | Free |
| AI synthesis + chat | OpenRouter → DeepSeek V3 | ~$0.001/query |
| Hosting | Vercel Hobby | Free |
| Cache | In-memory LRU | Free |
| DB (auth + wishlist) | SQLite via Prisma (local) or Neon free tier (Postgres) | Free |

---

## Environment Variables

```
OPENROUTER_API_KEY=
YOUTUBE_API_KEY=
SCRAPLING_SERVICE_URL=
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
DATABASE_URL=
```

---

## Design System

**Font:** Nunito (Google Fonts), weights 400–900, applied to all elements

**Colors:**
```
Background:    #fef9f0    Card:       #ffffff    Border:      #e8ddd0
Text primary:  #1c0a00    Secondary:  #7c6e5a    Muted:       #9a7e68
Accent:        #f97316    Dark:       #ea580c    Light bg:    #fff7ed

BUY:  bg #dcfce7 · text #16a34a · border #86efac
WAIT: bg #fef3c7 · text #d97706 · border #fde68a
SKIP: bg #fee2e2 · text #dc2626 · border #fca5a5

Score ≥80: #f97316 · 70–79: #fbbf24 · <70: #f87171
```

**Animations:** fadeUp (350ms) · cardIn (450ms, stagger 90ms) · msgIn (300ms) · pulse (1–2s) · progress bar (700ms cubic-bezier)

---

## Out of Scope (v1)

- Actual price drop email notifications (preference saved, not sent)
- X/Twitter, Instagram, TikTok signals
- Image gallery / 360° view on detail screen
- Non-Indian ecommerce platforms
- Full review text crawling (ratings + counts only)
