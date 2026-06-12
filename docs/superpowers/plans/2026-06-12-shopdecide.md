# ShopDecide Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build ShopDecide (shopdecide.com) — a category-aware Indian product recommendation web app that aggregates ecommerce ratings, Reddit signals, and YouTube coverage into expert-quality BUY/WAIT/SKIP verdicts.

**Architecture:** Two-service system: a Python Scrapling microservice handles all web scraping (Google Shopping, Amazon.in, Flipkart, specialist review sites) and a Next.js 15 app handles the UI, auth, API orchestration, and AI synthesis via OpenRouter → DeepSeek V3.

**Tech Stack:** Next.js 15 (App Router) · TypeScript · shadcn/ui · Tailwind · Nunito font · NextAuth.js v5 · Prisma + SQLite · Python FastAPI + Scrapling · OpenRouter (DeepSeek V3) · YouTube Data API v3 · Reddit public JSON · next/image · lru-cache · Vercel Hobby

---

## File Structure

```
shopdecide/
├── apps/
│   ├── web/                          # Next.js app
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── (auth)/
│   │   │   │   │   └── auth/page.tsx            # Login / Sign Up screen
│   │   │   │   ├── (app)/
│   │   │   │   │   ├── layout.tsx               # Global nav + auth guard
│   │   │   │   │   ├── page.tsx                 # Home + Rankings
│   │   │   │   │   ├── search/page.tsx           # Loading → Results + Chat
│   │   │   │   │   ├── product/[id]/page.tsx     # Product Detail
│   │   │   │   │   ├── compare/page.tsx          # Compare screen
│   │   │   │   │   ├── wishlist/page.tsx         # Wishlist
│   │   │   │   │   └── profile/page.tsx          # Profile
│   │   │   │   └── api/
│   │   │   │       ├── auth/[...nextauth]/route.ts
│   │   │   │       ├── research/route.ts         # SSE research pipeline
│   │   │   │       ├── synthesize/route.ts       # DeepSeek synthesis
│   │   │   │       ├── refine/route.ts           # Chat refinement
│   │   │   │       └── rankings/route.ts         # Pre-computed rankings
│   │   │   ├── components/
│   │   │   │   ├── layout/nav.tsx               # Global sticky nav
│   │   │   │   ├── auth/auth-form.tsx            # Login/signup form
│   │   │   │   ├── search/
│   │   │   │   │   ├── search-input.tsx          # Search bar + chips
│   │   │   │   │   └── loading-steps.tsx         # 5-step research progress
│   │   │   │   ├── product/
│   │   │   │   │   ├── product-card.tsx          # Results screen card
│   │   │   │   │   ├── product-image.tsx         # Image + emoji fallback
│   │   │   │   │   ├── score-bar.tsx             # Score visualisation
│   │   │   │   │   └── verdict-badge.tsx         # BUY/WAIT/SKIP badge
│   │   │   │   ├── chat/chat-panel.tsx           # AI refinement panel
│   │   │   │   ├── rankings/
│   │   │   │   │   ├── category-tabs.tsx         # Scrollable category pills
│   │   │   │   │   ├── leaderboard.tsx           # Ranked list rows
│   │   │   │   │   └── all-grid.tsx              # 2-col all-categories grid
│   │   │   │   └── compare/scorecard.tsx         # Side-by-side table
│   │   │   ├── lib/
│   │   │   │   ├── types.ts                      # Product, AppState, etc.
│   │   │   │   ├── scrapling-client.ts           # HTTP client for Python service
│   │   │   │   ├── youtube.ts                    # YouTube Data API v3 client
│   │   │   │   ├── reddit.ts                     # Reddit public JSON client
│   │   │   │   ├── openrouter.ts                 # DeepSeek synthesis + refine
│   │   │   │   ├── scoring.ts                    # 0-100 scoring algorithm
│   │   │   │   ├── category-routing.ts           # Query → category + sources
│   │   │   │   ├── cache.ts                      # In-memory LRU cache
│   │   │   │   └── image-proxy.ts                # next/image remotePatterns config
│   │   │   ├── auth.ts                           # NextAuth config
│   │   │   └── middleware.ts                     # Auth guard + rate limiting
│   │   ├── prisma/
│   │   │   └── schema.prisma                     # User, Account, Wishlist models
│   │   ├── public/fonts/                         # Self-hosted Nunito (prod)
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   └── package.json
│   └── scraper/                      # Python Scrapling service
│       ├── main.py                   # FastAPI entry point
│       ├── scrapers/
│       │   ├── google_shopping.py    # Google Shopping India
│       │   ├── amazon.py             # Amazon.in ratings + image
│       │   ├── flipkart.py           # Flipkart ratings
│       │   ├── specialist.py         # RTINGS, GSMarena, Digit, etc.
│       │   └── mouthshut.py          # MouthShut India
│       ├── models.py                 # Pydantic request/response models
│       ├── requirements.txt
│       └── Procfile                  # Railway/Render deploy
└── .env.local                        # All env vars (root level)
```

---

## Phase 1 — Project Scaffolding

### Task 1: Initialise Next.js app with Tailwind + shadcn

**Files:**
- Create: `apps/web/` (entire Next.js project)
- Create: `apps/web/src/lib/types.ts`
- Create: `apps/web/tailwind.config.ts`

- [ ] **Step 1: Scaffold Next.js app**
```bash
mkdir -p apps/web && cd apps/web
npx create-next-app@latest . \
  --typescript --tailwind --eslint \
  --app --src-dir --no-import-alias
```

- [ ] **Step 2: Install dependencies**
```bash
cd apps/web
npm install next-auth@beta @auth/prisma-adapter prisma @prisma/client \
  lru-cache lucide-react class-variance-authority clsx tailwind-merge \
  @radix-ui/react-dialog @radix-ui/react-tabs @radix-ui/react-checkbox \
  framer-motion
npm install -D @types/lru-cache
```

- [ ] **Step 3: Initialise shadcn**

> ⚠️ Before running, read https://ui.shadcn.com/docs/installation/next to get the exact current CLI command — the API changes frequently.

```bash
npx shadcn@latest init
# When prompted: style=default, base color=neutral, CSS variables=yes
npx shadcn@latest add button input label card badge tabs checkbox textarea
```

- [ ] **Step 4: Add Nunito font to `app/layout.tsx`**
```tsx
import { Nunito } from 'next/font/google'
const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400','500','600','700','800','900'],
  variable: '--font-nunito',
})
// Apply: <body className={`${nunito.variable} font-sans`}>
```

- [ ] **Step 5: Set Nunito as default in `tailwind.config.ts`**
```ts
fontFamily: {
  sans: ['var(--font-nunito)', 'sans-serif'],
}
```

- [ ] **Step 6: Create global CSS variables in `src/app/globals.css`**
```css
:root {
  --bg: #fef9f0;
  --surface: #ffffff;
  --border: #e8ddd0;
  --border-light: #f0e8df;
  --muted-bg: #f5f0ea;
  --text-primary: #1c0a00;
  --text-secondary: #7c6e5a;
  --text-muted: #9a7e68;
  --accent: #f97316;
  --accent-dark: #ea580c;
  --accent-light: #fff7ed;
  --buy: #16a34a; --buy-bg: #dcfce7; --buy-border: #86efac;
  --wait: #d97706; --wait-bg: #fef3c7; --wait-border: #fde68a;
  --skip: #dc2626; --skip-bg: #fee2e2; --skip-border: #fca5a5;
}
body { background: var(--bg); font-family: var(--font-nunito), sans-serif; }
```

- [ ] **Step 7: Create `src/lib/types.ts`** with the full TypeScript interfaces from the spec:
```ts
export type Verdict = 'BUY' | 'WAIT' | 'SKIP'
export type RedditSentiment = 'positive' | 'mixed' | 'negative'

export interface Product {
  id: string
  name: string
  brand: string
  price: number
  store: string
  imageUrl: string
  imageFallbackEmoji: string
  amazonRating: number
  amazonReviews: number
  amazonLink: string
  flipkartRating: number
  flipkartReviews: number
  flipkartLink: string
  redditMentions: number
  redditSentiment: RedditSentiment
  redditLink: string
  redditInsight: string
  youtubeVideos: number
  youtubeViews: string
  youtubeLink: string
  youtubeInsight: string
  score: number
  verdict: Verdict
  badge: string | null
  aiVerdict: string
  expertSummary: string
  batteryScore: number
  ancScore: number
  waterScore: number
  category: string
}

export interface ChatMessage { type: 'user' | 'ai'; text: string }

export interface User {
  id: string
  name: string
  email: string
  image?: string
  joinDate: string
  wishlistIds: string[]
  searchCount: number
  emailNotifications: boolean
  priceDropAlerts: boolean
}

export interface ResearchEvent {
  type: 'step_start' | 'step_complete' | 'step_error' | 'product' | 'done' | 'error'
  step?: number
  product?: Product
  message?: string
}
```

- [ ] **Step 8: Configure `next.config.ts`**
```ts
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'm.media-amazon.com' },
      { protocol: 'https', hostname: '**.flipkart.com' },
      { protocol: 'https', hostname: '**.googleusercontent.com' },
      { protocol: 'https', hostname: '**.gstatic.com' },
      { protocol: 'https', hostname: '**.myntra.com' },
    ],
  },
}
export default nextConfig
```

- [ ] **Step 9: Commit**
```bash
git add -A && git commit -m "feat: scaffold Next.js app with Tailwind, shadcn, Nunito, types"
```

---

### Task 2: Prisma schema + database setup

**Files:**
- Create: `apps/web/prisma/schema.prisma`

- [ ] **Step 1: Initialise Prisma**
```bash
cd apps/web
npx prisma init --datasource-provider sqlite
```

- [ ] **Step 2: Write `prisma/schema.prisma`**
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id                 String    @id @default(cuid())
  name               String?
  email              String    @unique
  emailVerified      DateTime?
  image              String?
  password           String?
  searchCount        Int       @default(0)
  emailNotifications Boolean   @default(true)
  priceDropAlerts    Boolean   @default(false)
  createdAt          DateTime  @default(now())
  accounts           Account[]
  sessions           Session[]
  wishlistItems      WishlistItem[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model WishlistItem {
  id        String   @id @default(cuid())
  userId    String
  productId String
  productData String  // JSON blob of Product
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([userId, productId])
}
```

- [ ] **Step 3: Create `.env.local`**
```
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="<run: openssl rand -base64 32>"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
OPENROUTER_API_KEY=""
YOUTUBE_API_KEY=""
SCRAPLING_SERVICE_URL="http://localhost:8000"
```

- [ ] **Step 4: Run migration**
```bash
npx prisma migrate dev --name init
npx prisma generate
```

- [ ] **Step 5: Commit**
```bash
git add -A && git commit -m "feat: prisma schema with user, wishlist, auth tables"
```

---

## Phase 2 — Authentication

### Task 3: NextAuth.js v5 config (email/password + Google)

> ⚠️ NextAuth v5 (Auth.js) API differs significantly from v4. Read https://authjs.dev/getting-started before implementing.

**Files:**
- Create: `apps/web/src/auth.ts`
- Create: `apps/web/src/app/api/auth/[...nextauth]/route.ts`
- Create: `apps/web/src/middleware.ts`

- [ ] **Step 1: Create `src/auth.ts`**
```ts
import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async ({ email, password }) => {
        const user = await prisma.user.findUnique({ where: { email: String(email) } })
        if (!user?.password) return null
        const valid = await bcrypt.compare(String(password), user.password)
        return valid ? user : null
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/auth' },
})
```

- [ ] **Step 2: Create `src/lib/prisma.ts`**
```ts
import { PrismaClient } from '@prisma/client'
declare global { var prisma: PrismaClient | undefined }
export const prisma = global.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== 'production') global.prisma = prisma
```

- [ ] **Step 3: Create `src/app/api/auth/[...nextauth]/route.ts`**
```ts
import { handlers } from '@/auth'
export const { GET, POST } = handlers
```

- [ ] **Step 4: Create `src/middleware.ts`**
```ts
import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isAuthPage = req.nextUrl.pathname.startsWith('/auth')
  if (!isLoggedIn && !isAuthPage) {
    return NextResponse.redirect(new URL('/auth', req.url))
  }
  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL('/', req.url))
  }
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

- [ ] **Step 5: Install bcryptjs**
```bash
npm install bcryptjs && npm install -D @types/bcryptjs
```

- [ ] **Step 6: Commit**
```bash
git add -A && git commit -m "feat: NextAuth v5 with credentials + Google OAuth"
```

---

### Task 4: Auth screen UI (`/auth`)

**Files:**
- Create: `apps/web/src/components/auth/auth-form.tsx`
- Create: `apps/web/src/app/(auth)/auth/page.tsx`

- [ ] **Step 1: Create `src/app/api/auth/register/route.ts`** (sign-up endpoint)
```ts
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json()
  if (!name || !email || !password)
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing)
    return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
  const hashed = await bcrypt.hash(password, 12)
  await prisma.user.create({ data: { name, email, password: hashed } })
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 2: Create `src/components/auth/auth-form.tsx`**

Full form component with:
- Tab toggle: Login / Sign Up (pill switcher, `background: #f5f0ea`)
- Login fields: Email, Password → "Sign In" → calls `signIn('credentials', ...)`
- Sign Up fields: Full Name, Email, Password → calls `/api/auth/register` then `signIn`
- Divider OR
- Google button → `signIn('google')`
- Loading states, error messages
- All inputs: `border: 1.5px solid #e8ddd0`, `border-radius: 12px`, focus → `#f97316`
- CTA buttons: `background: #f97316`, hover → `#ea580c`

- [ ] **Step 3: Create `src/app/(auth)/auth/page.tsx`**
```tsx
import { AuthForm } from '@/components/auth/auth-form'

export default function AuthPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fef9f0 0%, #fff7ed 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '44px' }}>
          <div style={{ width: 56, height: 56, background: '#f97316', borderRadius: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: 28, fontWeight: 900, margin: '0 auto 16px' }}>✦</div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: '#1c0a00', letterSpacing: -1 }}>ShopDecide</h1>
          <p style={{ fontSize: 14, color: '#7c6e5a', fontWeight: 500, marginTop: 8 }}>India's smartest product recommender</p>
        </div>
        <AuthForm />
        <p style={{ textAlign: 'center', fontSize: 12, color: '#9a7e68', marginTop: 24 }}>
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Test auth flow manually**
  - `npm run dev` → navigate to `http://localhost:3000`
  - Should redirect to `/auth`
  - Sign up with email/password → should redirect to `/`
  - Logout → should redirect to `/auth`

- [ ] **Step 5: Commit**
```bash
git add -A && git commit -m "feat: auth screen with login/signup/google"
```

---

## Phase 3 — Python Scrapling Service

### Task 5: Scrapling service setup

**Files:**
- Create: `apps/scraper/requirements.txt`
- Create: `apps/scraper/models.py`
- Create: `apps/scraper/main.py`

- [ ] **Step 1: Create `apps/scraper/requirements.txt`**
```
fastapi==0.115.0
uvicorn[standard]==0.30.0
scrapling==0.3.0
pydantic==2.7.0
httpx==0.27.0
python-dotenv==1.0.0
```

- [ ] **Step 2: Install**
```bash
cd apps/scraper
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
scrapling install   # downloads stealth browser
```

- [ ] **Step 3: Create `apps/scraper/models.py`**
```python
from pydantic import BaseModel
from typing import Optional

class ProductSearchRequest(BaseModel):
    query: str
    category: Optional[str] = None

class ProductDataRequest(BaseModel):
    product_name: str
    category: Optional[str] = None

class ProductResult(BaseModel):
    name: str
    brand: str
    price: int
    store: str
    image_url: str
    amazon_rating: float
    amazon_reviews: int
    amazon_link: str
    flipkart_rating: float
    flipkart_reviews: int
    flipkart_link: str
    specialist_data: Optional[dict] = None
    mouthshut_rating: Optional[float] = None
    mouthshut_reviews: Optional[int] = None
```

- [ ] **Step 4: Create `apps/scraper/main.py`**
```python
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import ProductSearchRequest, ProductDataRequest, ProductResult
from scrapers.google_shopping import search_google_shopping
from scrapers.amazon import get_amazon_data
from scrapers.flipkart import get_flipkart_data
from scrapers.specialist import get_specialist_data
from scrapers.mouthshut import get_mouthshut_data
import os

app = FastAPI(title="ShopDecide Scrapling Service")

app.add_middleware(CORSMiddleware,
    allow_origins=[os.getenv("ALLOWED_ORIGIN", "http://localhost:3000")],
    allow_methods=["*"], allow_headers=["*"])

@app.get("/health")
async def health(): return {"status": "ok"}

@app.post("/search")
async def search(req: ProductSearchRequest):
    try:
        results = await search_google_shopping(req.query)
        return {"products": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/product")
async def product_data(req: ProductDataRequest):
    amazon, flipkart, specialist, mouthshut = await asyncio.gather(
        get_amazon_data(req.product_name),
        get_flipkart_data(req.product_name),
        get_specialist_data(req.product_name, req.category),
        get_mouthshut_data(req.product_name),
        return_exceptions=True
    )
    return {
        "amazon": amazon if not isinstance(amazon, Exception) else None,
        "flipkart": flipkart if not isinstance(flipkart, Exception) else None,
        "specialist": specialist if not isinstance(specialist, Exception) else None,
        "mouthshut": mouthshut if not isinstance(mouthshut, Exception) else None,
    }
```

- [ ] **Step 5: Start service and verify health endpoint**
```bash
uvicorn main:app --reload --port 8000
# In another terminal:
curl http://localhost:8000/health
# Expected: {"status": "ok"}
```

- [ ] **Step 6: Commit**
```bash
git add -A && git commit -m "feat: FastAPI scrapling service skeleton"
```

---

### Task 6: Google Shopping scraper

**Files:**
- Create: `apps/scraper/scrapers/google_shopping.py`

- [ ] **Step 1: Create `apps/scraper/scrapers/google_shopping.py`**
```python
from scrapling import StealthyFetcher
from typing import List, Dict
import re

async def search_google_shopping(query: str) -> List[Dict]:
    url = f"https://www.google.co.in/search?q={query.replace(' ', '+')}&tbm=shop&hl=en&gl=in"
    fetcher = StealthyFetcher()
    page = fetcher.fetch(url)
    results = []

    for item in page.css('.sh-dgr__grid-result, .sh-pr__product-results-grid .sh-dlr__list-result')[:10]:
        try:
            name = item.css_first('h4, .Xjkr3b, [data-sh-product-title]')
            price_el = item.css_first('.a8Pemb, .OFFNJ, [data-sh-product-price]')
            image_el = item.css_first('img')
            store_el = item.css_first('.aULzUe, .E5ocAb')
            rating_el = item.css_first('.Rsc7Yb, .XKHsLd')
            reviews_el = item.css_first('.NzUzee, .Ae6Kzd')

            if not name: continue
            price_text = price_el.text if price_el else '0'
            price = int(re.sub(r'[^\d]', '', price_text) or 0)

            results.append({
                "name": name.text.strip(),
                "price": price,
                "store": store_el.text.strip() if store_el else "Unknown",
                "imageUrl": image_el.attrib.get('src', '') if image_el else '',
                "rating": float(rating_el.text.strip()) if rating_el else 0.0,
                "reviewCount": int(re.sub(r'[^\d]', '', reviews_el.text) or 0) if reviews_el else 0,
            })
        except Exception:
            continue

    return results[:8]
```

- [ ] **Step 2: Test endpoint**
```bash
curl -X POST http://localhost:8000/search \
  -H "Content-Type: application/json" \
  -d '{"query": "boAt Airdopes TWS earbuds"}'
# Expected: JSON array of products with names, prices, images
```

- [ ] **Step 3: Commit**
```bash
git add -A && git commit -m "feat: google shopping scraper"
```

---

### Task 7: Amazon.in + Flipkart scrapers

**Files:**
- Create: `apps/scraper/scrapers/amazon.py`
- Create: `apps/scraper/scrapers/flipkart.py`

- [ ] **Step 1: Create `apps/scraper/scrapers/amazon.py`**
```python
from scrapling import StealthyFetcher
import re

async def get_amazon_data(product_name: str) -> dict:
    query = product_name.replace(' ', '+')
    url = f"https://www.amazon.in/s?k={query}"
    fetcher = StealthyFetcher()
    page = fetcher.fetch(url)

    item = page.css_first('[data-component-type="s-search-result"]')
    if not item:
        return {"rating": 0.0, "reviews": 0, "link": f"https://www.amazon.in/s?k={query}", "imageUrl": ""}

    rating_el = item.css_first('.a-icon-alt')
    reviews_el = item.css_first('.s-underline-text, [aria-label*="ratings"]')
    image_el = item.css_first('.s-image')
    link_el = item.css_first('h2 a')

    rating_text = rating_el.text if rating_el else '0'
    rating = float(re.search(r'[\d.]+', rating_text).group()) if re.search(r'[\d.]+', rating_text) else 0.0
    reviews_text = reviews_el.text if reviews_el else '0'
    reviews = int(re.sub(r'[^\d]', '', reviews_text) or 0)

    link = 'https://www.amazon.in' + link_el.attrib.get('href', '') if link_el else f"https://www.amazon.in/s?k={query}"

    return {
        "rating": rating,
        "reviews": reviews,
        "link": link,
        "imageUrl": image_el.attrib.get('src', '') if image_el else '',
    }
```

- [ ] **Step 2: Create `apps/scraper/scrapers/flipkart.py`**
```python
from scrapling import StealthyFetcher
import re

async def get_flipkart_data(product_name: str) -> dict:
    query = product_name.replace(' ', '+')
    url = f"https://www.flipkart.com/search?q={query}"
    fetcher = StealthyFetcher()
    page = fetcher.fetch(url)

    item = page.css_first('._1AtVbE, .cPHDOP')
    if not item:
        return {"rating": 0.0, "reviews": 0, "link": f"https://www.flipkart.com/search?q={query}"}

    rating_el = item.css_first('._3LWZlK, .XQDdHH')
    reviews_el = item.css_first('._2_R_DZ span, .Wphh3N span')

    rating = float(rating_el.text.strip()) if rating_el else 0.0
    reviews_text = reviews_el.text if reviews_el else '0'
    reviews = int(re.sub(r'[^\d]', '', reviews_text) or 0)
    link_el = item.css_first('a._1fQZEK, a.IRpwTa, a.s1Q9rs')
    link = 'https://www.flipkart.com' + link_el.attrib.get('href', '') if link_el else f"https://www.flipkart.com/search?q={query}"

    return {"rating": rating, "reviews": reviews, "link": link}
```

- [ ] **Step 3: Test product endpoint**
```bash
curl -X POST http://localhost:8000/product \
  -H "Content-Type: application/json" \
  -d '{"product_name": "boAt Airdopes 141 Pro", "category": "earbuds"}'
# Expected: amazon + flipkart objects with rating, reviews, link
```

- [ ] **Step 4: Commit**
```bash
git add -A && git commit -m "feat: amazon and flipkart scrapers"
```

---

### Task 8: Category-specific specialist scrapers + MouthShut

**Files:**
- Create: `apps/scraper/scrapers/specialist.py`
- Create: `apps/scraper/scrapers/mouthshut.py`

- [ ] **Step 1: Create `apps/scraper/scrapers/specialist.py`**

Routes to the correct specialist site based on category:
```python
from scrapling import StealthyFetcher
import re

CATEGORY_ROUTES = {
    'earbuds': 'rtings',
    'headphones': 'rtings',
    'speakers': 'rtings',
    'monitors': 'rtings',
    'tvs': 'rtings',
    'smartphones': 'gsmarena',
    'laptops': 'digit',
    'skincare': None,
    'supplements': 'examine',
}

async def get_specialist_data(product_name: str, category: str | None) -> dict | None:
    if not category: return None
    route = CATEGORY_ROUTES.get(category.lower())
    if route == 'rtings': return await _scrape_rtings(product_name)
    if route == 'gsmarena': return await _scrape_gsmarena(product_name)
    if route == 'examine': return await _scrape_examine(product_name)
    return None

async def _scrape_rtings(product_name: str) -> dict:
    query = product_name.replace(' ', '+')
    url = f"https://www.rtings.com/search#q={query}"
    fetcher = StealthyFetcher()
    page = fetcher.fetch(url)
    result = page.css_first('.search-results__result, .result')
    if not result: return {"source": "RTINGS.com", "found": False}
    score_el = result.css_first('.score, .rating')
    name_el = result.css_first('.result__name, h3')
    link_el = result.css_first('a')
    return {
        "source": "RTINGS.com",
        "found": True,
        "score": score_el.text.strip() if score_el else None,
        "name": name_el.text.strip() if name_el else product_name,
        "url": "https://www.rtings.com" + link_el.attrib.get('href', '') if link_el else "",
    }

async def _scrape_gsmarena(product_name: str) -> dict:
    query = product_name.replace(' ', '+')
    url = f"https://www.gsmarena.com/search.php3?sQuickSearch={query}"
    fetcher = StealthyFetcher()
    page = fetcher.fetch(url)
    result = page.css_first('.makers li, .result')
    if not result: return {"source": "GSMarena", "found": False}
    link_el = result.css_first('a')
    name_el = result.css_first('strong, span')
    return {
        "source": "GSMarena",
        "found": True,
        "name": name_el.text.strip() if name_el else product_name,
        "url": "https://www.gsmarena.com/" + link_el.attrib.get('href', '') if link_el else "",
    }

async def _scrape_examine(product_name: str) -> dict:
    query = product_name.replace(' ', '+')
    url = f"https://examine.com/search/?q={query}"
    fetcher = StealthyFetcher()
    page = fetcher.fetch(url)
    result = page.css_first('.search-result, .supplement-entry')
    if not result: return {"source": "Examine.com", "found": False}
    link_el = result.css_first('a')
    grade_el = result.css_first('.grade, .evidence-grade')
    return {
        "source": "Examine.com",
        "found": True,
        "evidenceGrade": grade_el.text.strip() if grade_el else None,
        "url": "https://examine.com" + link_el.attrib.get('href', '') if link_el else "",
    }
```

- [ ] **Step 2: Create `apps/scraper/scrapers/mouthshut.py`**
```python
from scrapling import StealthyFetcher
import re

async def get_mouthshut_data(product_name: str) -> dict:
    query = product_name.replace(' ', '+')
    url = f"https://www.mouthshut.com/search?q={query}&type=product"
    fetcher = StealthyFetcher()
    page = fetcher.fetch(url)
    result = page.css_first('.product-list-item, .product-item')
    if not result: return {"found": False, "rating": 0.0, "reviews": 0}
    rating_el = result.css_first('.rating, .star-rating')
    reviews_el = result.css_first('.review-count, .reviews')
    rating_text = rating_el.text if rating_el else '0'
    rating = float(re.search(r'[\d.]+', rating_text).group()) if re.search(r'[\d.]+', rating_text) else 0.0
    reviews = int(re.sub(r'[^\d]', '', reviews_el.text or '0')) if reviews_el else 0
    return {"found": True, "rating": rating, "reviews": reviews, "source": "MouthShut.com"}
```

- [ ] **Step 3: Commit**
```bash
git add -A && git commit -m "feat: specialist scrapers (RTINGS, GSMarena, Examine, MouthShut)"
```

---

## Phase 4 — Next.js Research Pipeline

### Task 9: Scrapling client + YouTube + Reddit + scoring

**Files:**
- Create: `apps/web/src/lib/scrapling-client.ts`
- Create: `apps/web/src/lib/youtube.ts`
- Create: `apps/web/src/lib/reddit.ts`
- Create: `apps/web/src/lib/scoring.ts`
- Create: `apps/web/src/lib/category-routing.ts`
- Create: `apps/web/src/lib/cache.ts`

- [ ] **Step 1: Create `src/lib/scrapling-client.ts`**
```ts
const BASE = process.env.SCRAPLING_SERVICE_URL!

export async function searchProducts(query: string, category?: string) {
  const res = await fetch(`${BASE}/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, category }),
    signal: AbortSignal.timeout(10000),
  })
  if (!res.ok) throw new Error(`Scrapling search failed: ${res.status}`)
  return res.json()
}

export async function getProductData(productName: string, category?: string) {
  const res = await fetch(`${BASE}/product`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ product_name: productName, category }),
    signal: AbortSignal.timeout(12000),
  })
  if (!res.ok) return null
  return res.json()
}
```

- [ ] **Step 2: Create `src/lib/youtube.ts`**
```ts
const YT_KEY = process.env.YOUTUBE_API_KEY!
const BASE = 'https://www.googleapis.com/youtube/v3'

export async function searchYouTube(productName: string) {
  const q = encodeURIComponent(`${productName} review India`)
  const url = `${BASE}/search?part=snippet&q=${q}&type=video&maxResults=10&regionCode=IN&key=${YT_KEY}`
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
  if (!res.ok) return null
  const data = await res.json()
  const items = data.items ?? []
  const videoIds = items.map((i: any) => i.id.videoId).join(',')
  if (!videoIds) return { videos: 0, totalViews: '0', link: '' }
  const statsUrl = `${BASE}/videos?part=statistics&id=${videoIds}&key=${YT_KEY}`
  const statsRes = await fetch(statsUrl, { signal: AbortSignal.timeout(5000) })
  const statsData = statsRes.ok ? await statsRes.json() : { items: [] }
  const totalViews = (statsData.items ?? []).reduce(
    (sum: number, v: any) => sum + parseInt(v.statistics?.viewCount ?? '0'), 0)
  const formatted = totalViews >= 1_000_000
    ? `${(totalViews / 1_000_000).toFixed(1)}M`
    : totalViews >= 1000 ? `${Math.round(totalViews / 1000)}K` : String(totalViews)
  return {
    videos: items.length,
    totalViews: formatted,
    link: `https://www.youtube.com/results?search_query=${encodeURIComponent(productName + ' review')}`,
  }
}
```

- [ ] **Step 3: Create `src/lib/reddit.ts`**
```ts
// Uses Google-powered search via Scrapling service for reliability
// Falls back to Reddit JSON API directly

const SUBREDDITS_BY_CATEGORY: Record<string, string[]> = {
  earbuds:      ['IndianGaming', 'indianaudiophiles', 'headphones', 'BudgetAudiophile'],
  headphones:   ['IndianGaming', 'indianaudiophiles', 'headphones'],
  smartphones:  ['IndianGaming', 'india'],
  skincare:     ['IndianSkincareAddicts', 'SkincareAddiction'],
  supplements:  ['Fitness_India', 'supplements', 'NutritionalScience'],
  watches:      ['watchesindia', 'Watches'],
  keyboards:    ['mkindia', 'MechanicalKeyboards'],
  default:      ['india', 'OnlineShopping_India', 'frugalmalefashion'],
}

export async function searchReddit(productName: string, category?: string) {
  const subs = SUBREDDITS_BY_CATEGORY[category ?? 'default'] ?? SUBREDDITS_BY_CATEGORY.default
  const primarySub = subs[0]
  const url = `https://www.reddit.com/r/${subs.join('+')}/search.json?q=${encodeURIComponent(productName)}&restrict_sr=1&sort=top&limit=25`
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'ShopDecide/1.0' },
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) return null
    const data = await res.json()
    const posts = data?.data?.children ?? []
    const positive = posts.filter((p: any) => p.data.score > 50).length
    const negative = posts.filter((p: any) => p.data.score < 5).length
    const sentiment = positive > negative * 2 ? 'positive' : negative > positive ? 'negative' : 'mixed'
    return {
      mentions: posts.length,
      sentiment,
      link: `https://www.reddit.com/r/${primarySub}/search?q=${encodeURIComponent(productName)}&sort=top`,
    }
  } catch { return null }
}
```

- [ ] **Step 4: Create `src/lib/scoring.ts`**
```ts
import type { Product } from './types'

function logNorm(value: number, cap: number): number {
  if (value <= 0) return 0
  return Math.min(Math.log(value + 1) / Math.log(cap + 1), 1)
}

export function scoreProduct(data: {
  amazonRating: number; amazonReviews: number
  flipkartRating: number; flipkartReviews: number
  redditSentiment: 'positive' | 'mixed' | 'negative' | null
  redditMentions: number; youtubeVideos: number
  suspicious: boolean
}): number {
  const avgRating = data.amazonRating > 0 && data.flipkartRating > 0
    ? (data.amazonRating + data.flipkartRating) / 2
    : data.amazonRating || data.flipkartRating
  const ratingNorm = avgRating / 5

  const totalReviews = data.amazonReviews + data.flipkartReviews
  const reviewNorm = logNorm(totalReviews, 10000)

  const sentimentMap = { positive: 1, mixed: 0.5, negative: 0 }
  const redditNorm = data.redditSentiment ? sentimentMap[data.redditSentiment] * Math.min(data.redditMentions / 50, 1) : 0

  const ytNorm = logNorm(data.youtubeVideos, 20)

  let score = (ratingNorm * 40) + (reviewNorm * 20) + (redditNorm * 20) + (ytNorm * 20)
  if (data.suspicious) score -= 10

  return Math.round(Math.max(0, Math.min(100, score)))
}

export function verdictFromScore(score: number): 'BUY' | 'WAIT' | 'SKIP' {
  if (score >= 75) return 'BUY'
  if (score >= 55) return 'WAIT'
  return 'SKIP'
}

export function scoreColor(score: number): string {
  if (score >= 80) return '#f97316'
  if (score >= 70) return '#fbbf24'
  return '#f87171'
}
```

- [ ] **Step 5: Create `src/lib/category-routing.ts`**
```ts
export type Category =
  | 'earbuds' | 'headphones' | 'speakers' | 'smartphones' | 'laptops'
  | 'monitors' | 'tvs' | 'skincare' | 'makeup' | 'supplements'
  | 'fitness_wearables' | 'watches' | 'fragrances' | 'boots'
  | 'denim' | 'spirits' | 'edc' | 'kitchen' | 'handbags'
  | 'fashion' | 'pens' | 'stationery' | 'keyboards' | 'coffee'
  | 'boardgames' | 'general'

// This is a heuristic — DeepSeek will confirm during synthesis
export function detectCategory(query: string): Category {
  const q = query.toLowerCase()
  if (/earbuds?|tws|in.ear|iem/.test(q)) return 'earbuds'
  if (/headphones?|over.ear|on.ear/.test(q)) return 'headphones'
  if (/speaker|soundbar/.test(q)) return 'speakers'
  if (/phone|smartphone|mobile|android|iphone/.test(q)) return 'smartphones'
  if (/laptop|notebook|macbook/.test(q)) return 'laptops'
  if (/monitor|display/.test(q)) return 'monitors'
  if (/tv|television/.test(q)) return 'tvs'
  if (/skincare|moisturis|serum|sunscreen|spf/.test(q)) return 'skincare'
  if (/makeup|foundation|lipstick|mascara|blush/.test(q)) return 'makeup'
  if (/protein|supplement|creatine|whey|vitamin/.test(q)) return 'supplements'
  if (/smartwatch|fitness.band|oura|garmin|fitbit/.test(q)) return 'fitness_wearables'
  if (/watch|timepiece/.test(q)) return 'watches'
  if (/perfume|fragrance|cologne|eau.de/.test(q)) return 'fragrances'
  if (/boot|shoe|leather.goods|wallet|belt/.test(q)) return 'boots'
  if (/denim|jeans|selvedge/.test(q)) return 'denim'
  if (/whisky|whiskey|rum|bourbon|scotch/.test(q)) return 'spirits'
  if (/knife|edc|everyday.carry|flashlight/.test(q)) return 'edc'
  if (/pan|cookware|knife|cast.iron|wok/.test(q)) return 'kitchen'
  if (/bag|handbag|purse|tote/.test(q)) return 'handbags'
  if (/shirt|kurta|dress|jeans|clothing|fashion/.test(q)) return 'fashion'
  if (/fountain.pen|nib|ink/.test(q)) return 'pens'
  if (/notebook|planner|stationery/.test(q)) return 'stationery'
  if (/keyboard|mechanical|keycap|switch/.test(q)) return 'keyboards'
  if (/coffee|espresso|grinder|aeropress/.test(q)) return 'coffee'
  if (/board.game|tabletop/.test(q)) return 'boardgames'
  return 'general'
}
```

- [ ] **Step 6: Create `src/lib/cache.ts`**
```ts
import { LRUCache } from 'lru-cache'
import crypto from 'crypto'

const cache = new LRUCache<string, { data: any; timestamp: number }>({
  max: 200,
  ttl: 1000 * 60 * 60 * 24, // 24 hours
})

export function normalizeQuery(q: string): string {
  return q.toLowerCase().trim().replace(/\s+/g, ' ').replace(/[^\w\s₹]/g, '')
}

export function cacheKey(q: string): string {
  return crypto.createHash('sha256').update(normalizeQuery(q)).digest('hex')
}

export function getCached<T>(key: string): T | null {
  const entry = cache.get(key)
  if (!entry) return null
  return entry.data as T
}

export function setCached(key: string, data: any): void {
  cache.set(key, { data, timestamp: Date.now() })
}

export function getCachedTimestamp(key: string): number | null {
  return cache.get(key)?.timestamp ?? null
}
```

- [ ] **Step 7: Commit**
```bash
git add -A && git commit -m "feat: scrapling client, youtube, reddit, scoring, category routing, cache"
```

---

### Task 10: OpenRouter / DeepSeek synthesis

> ⚠️ Read https://sdk.vercel.ai/docs before implementing — use Vercel AI SDK's OpenRouter provider.

**Files:**
- Create: `apps/web/src/lib/openrouter.ts`

- [ ] **Step 1: Install AI SDK**
```bash
npm install ai @ai-sdk/openai
```

- [ ] **Step 2: Create `src/lib/openrouter.ts`**
```ts
import { createOpenAI } from '@ai-sdk/openai'
import { generateText, Output } from 'ai'
import { z } from 'zod'

const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY!,
})

const ProductSynthesisSchema = z.object({
  verdict: z.enum(['BUY', 'WAIT', 'SKIP']),
  verdict_reason: z.string(),
  score: z.number().min(0).max(100),
  badge: z.string().nullable(),
  aiVerdict: z.string(),
  expertSummary: z.string(),
  top_complaints: z.array(z.string()),
  suspicious_signals: z.array(z.string()),
  cheaper_alternative: z.string().nullable(),
  redditInsight: z.string(),
  youtubeInsight: z.string(),
  batteryScore: z.number().min(0).max(5),
  ancScore: z.number().min(0).max(5),
  waterScore: z.number().min(0).max(4),
  detectedCategory: z.string(),
})

export async function synthesizeProduct(data: {
  productName: string
  brand: string
  price: number
  store: string
  amazonData: any
  flipkartData: any
  redditData: any
  youtubeData: any
  specialistData: any
  query: string
}) {
  const prompt = `You are a 20-year veteran consumer expert for the Indian market. 
Analyse this product and give a frank, evidence-based recommendation.

PRODUCT: ${data.productName} by ${data.brand} at ₹${data.price.toLocaleString('en-IN')} on ${data.store}
SEARCH QUERY: "${data.query}"

ECOMMERCE DATA:
- Amazon India: ${data.amazonData ? `★${data.amazonData.rating} from ${data.amazonData.reviews?.toLocaleString()} reviews` : 'unavailable'}
- Flipkart: ${data.flipkartData ? `★${data.flipkartData.rating} from ${data.flipkartData.reviews?.toLocaleString()} reviews` : 'unavailable'}

SOCIAL DATA:
- Reddit: ${data.redditData ? `${data.redditData.mentions} mentions, sentiment: ${data.redditData.sentiment}` : 'no data'}
- YouTube: ${data.youtubeData ? `${data.youtubeData.videos} videos, ${data.youtubeData.totalViews} total views` : 'no data'}

SPECIALIST REVIEW DATA:
${data.specialistData ? JSON.stringify(data.specialistData) : 'none'}

RULES:
- Lead with verdict. Be direct. No hedging.
- expertSummary must be ~150 words, editorial tone, cite specific numbers
- Expose the most common real complaints. Flag suspicious patterns (e.g. too many 5-star reviews with no text)
- If a cheaper Indian alternative delivers similar value, name it in cheaper_alternative
- batteryScore/ancScore/waterScore: assess from product name, category, and available data (0 = irrelevant)
- aiVerdict: one punchy sentence, italic-worthy, tells user the bottom line
- redditInsight: 2-3 sentences summarising Reddit community opinion
- youtubeInsight: 2-3 sentences on YouTube review coverage`

  const { output } = await generateText({
    model: openrouter('deepseek/deepseek-chat-v3.5'),
    output: Output.object({ schema: ProductSynthesisSchema }),
    prompt,
    maxTokens: 800,
  })

  return output
}

const RefinementSchema = z.object({
  aiText: z.string(),
  reorderedIds: z.array(z.string()),
  sortLabel: z.string(),
})

export async function refineRecommendations(data: {
  message: string
  products: Array<{ id: string; name: string; score: number; price: number; batteryScore: number; ancScore: number; waterScore: number; redditMentions: number; amazonReviews: number; flipkartReviews: number }>
  chatHistory: Array<{ type: string; text: string }>
}) {
  const prompt = `You are ShopDecide's AI assistant. The user is refining their product recommendations.

CURRENT PRODUCTS (in order): ${data.products.map(p => `${p.id}: ${p.name}`).join(', ')}

CHAT HISTORY: ${data.chatHistory.map(m => `${m.type}: ${m.text}`).join('\n')}

USER MESSAGE: "${data.message}"

Re-order the products based on what the user cares about and explain in 2-3 conversational sentences.
Return the product IDs in new priority order and a short sortLabel (e.g. "Battery life", "Price", "ANC").`

  const { output } = await generateText({
    model: openrouter('deepseek/deepseek-chat-v3.5'),
    output: Output.object({ schema: RefinementSchema }),
    prompt,
    maxTokens: 300,
  })

  return output
}
```

- [ ] **Step 3: Commit**
```bash
git add -A && git commit -m "feat: DeepSeek synthesis + refinement via OpenRouter AI SDK"
```

---

### Task 11: Research pipeline API route (SSE)

**Files:**
- Create: `apps/web/src/app/api/research/route.ts`
- Create: `apps/web/src/app/api/refine/route.ts`

- [ ] **Step 1: Create `src/app/api/research/route.ts`**
```ts
import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { searchProducts, getProductData } from '@/lib/scrapling-client'
import { searchYouTube } from '@/lib/youtube'
import { searchReddit } from '@/lib/reddit'
import { synthesizeProduct } from '@/lib/openrouter'
import { scoreProduct, verdictFromScore } from '@/lib/scoring'
import { detectCategory } from '@/lib/category-routing'
import { cacheKey, getCached, setCached, getCachedTimestamp } from '@/lib/cache'

function send(controller: ReadableStreamDefaultController, event: object) {
  controller.enqueue(`data: ${JSON.stringify(event)}\n\n`)
}

export const runtime = 'nodejs'
export const maxDuration = 45

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return new Response('Unauthorized', { status: 401 })

  const { query } = await req.json()
  if (!query?.trim()) return new Response('Missing query', { status: 400 })

  const key = cacheKey(query)
  const cached = getCached<any[]>(key)

  const stream = new ReadableStream({
    async start(controller) {
      if (cached) {
        send(controller, { type: 'cached', timestamp: getCachedTimestamp(key) })
        for (const p of cached) send(controller, { type: 'product', product: p })
        send(controller, { type: 'done' })
        controller.close()
        return
      }

      try {
        const category = detectCategory(query)
        send(controller, { type: 'step_start', step: 0, label: 'Searching Google Shopping India…' })
        const searchResults = await searchProducts(query, category)
        send(controller, { type: 'step_complete', step: 0 })

        // Popularity filter: skip products with too few reviews
        const candidates = searchResults.products?.slice(0, 8) ?? []

        send(controller, { type: 'step_start', step: 1, label: `Checking Amazon, Flipkart & specialist sites…` })
        const productDataList = await Promise.all(
          candidates.map((c: any) => getProductData(c.name, category))
        )
        send(controller, { type: 'step_complete', step: 1 })

        // Apply popularity filter (100+ reviews)
        const filtered = candidates.filter((_: any, i: number) => {
          const d = productDataList[i]
          return (d?.amazon?.reviews ?? 0) >= 100 || (d?.flipkart?.reviews ?? 0) >= 100
        }).slice(0, 5)

        if (filtered.length === 0) {
          send(controller, { type: 'error', message: 'no_results' })
          controller.close()
          return
        }

        send(controller, { type: 'step_start', step: 2, label: 'Reading Reddit & community discussions…' })
        const redditData = await Promise.all(
          filtered.map((c: any) => searchReddit(c.name, category))
        )
        send(controller, { type: 'step_complete', step: 2 })

        send(controller, { type: 'step_start', step: 3, label: 'Scanning YouTube reviews…' })
        const ytData = await Promise.all(
          filtered.map((c: any) => searchYouTube(c.name))
        )
        send(controller, { type: 'step_complete', step: 3 })

        send(controller, { type: 'step_start', step: 4, label: 'Generating expert analysis…' })
        const products = await Promise.all(
          filtered.map(async (c: any, i: number) => {
            const pd = productDataList[candidates.indexOf(c)]
            const synthesis = await synthesizeProduct({
              productName: c.name, brand: c.brand ?? '',
              price: c.price, store: c.store ?? '',
              amazonData: pd?.amazon, flipkartData: pd?.flipkart,
              redditData: redditData[i], youtubeData: ytData[i],
              specialistData: pd?.specialist, query,
            })
            const score = scoreProduct({
              amazonRating: pd?.amazon?.rating ?? 0,
              amazonReviews: pd?.amazon?.reviews ?? 0,
              flipkartRating: pd?.flipkart?.rating ?? 0,
              flipkartReviews: pd?.flipkart?.reviews ?? 0,
              redditSentiment: redditData[i]?.sentiment ?? null,
              redditMentions: redditData[i]?.mentions ?? 0,
              youtubeVideos: ytData[i]?.videos ?? 0,
              suspicious: synthesis.suspicious_signals.length > 1,
            })
            return {
              id: `${c.name}-${i}`.replace(/\s+/g, '-').toLowerCase(),
              name: c.name, brand: c.brand ?? '', price: c.price,
              store: c.store ?? '', imageUrl: c.imageUrl ?? '',
              imageFallbackEmoji: '📦', category,
              amazonRating: pd?.amazon?.rating ?? 0,
              amazonReviews: pd?.amazon?.reviews ?? 0,
              amazonLink: pd?.amazon?.link ?? `https://www.amazon.in/s?k=${encodeURIComponent(c.name)}`,
              flipkartRating: pd?.flipkart?.rating ?? 0,
              flipkartReviews: pd?.flipkart?.reviews ?? 0,
              flipkartLink: pd?.flipkart?.link ?? `https://www.flipkart.com/search?q=${encodeURIComponent(c.name)}`,
              redditMentions: redditData[i]?.mentions ?? 0,
              redditSentiment: redditData[i]?.sentiment ?? 'mixed',
              redditLink: redditData[i]?.link ?? '',
              redditInsight: synthesis.redditInsight,
              youtubeVideos: ytData[i]?.videos ?? 0,
              youtubeViews: ytData[i]?.totalViews ?? '0',
              youtubeLink: ytData[i]?.link ?? '',
              youtubeInsight: synthesis.youtubeInsight,
              score, verdict: synthesis.verdict,
              badge: synthesis.badge, aiVerdict: synthesis.aiVerdict,
              expertSummary: synthesis.expertSummary,
              batteryScore: synthesis.batteryScore,
              ancScore: synthesis.ancScore,
              waterScore: synthesis.waterScore,
            }
          })
        )
        send(controller, { type: 'step_complete', step: 4 })

        const sorted = products.sort((a, b) => b.score - a.score)
        setCached(key, sorted)
        for (const p of sorted) send(controller, { type: 'product', product: p })
        send(controller, { type: 'done' })
      } catch (e) {
        send(controller, { type: 'error', message: String(e) })
      }
      controller.close()
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
```

- [ ] **Step 2: Create `src/app/api/refine/route.ts`**
```ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { refineRecommendations } from '@/lib/openrouter'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { message, products, chatHistory } = await req.json()
  const result = await refineRecommendations({ message, products, chatHistory })
  return NextResponse.json(result)
}
```

- [ ] **Step 3: Commit**
```bash
git add -A && git commit -m "feat: SSE research pipeline + refine API routes"
```

---

## Phase 5 — Shared UI Components

### Task 12: Core reusable components

**Files:**
- Create: `apps/web/src/components/product/product-image.tsx`
- Create: `apps/web/src/components/product/verdict-badge.tsx`
- Create: `apps/web/src/components/product/score-bar.tsx`
- Create: `apps/web/src/components/layout/nav.tsx`

- [ ] **Step 1: Create `src/components/product/product-image.tsx`**
```tsx
'use client'
import Image from 'next/image'
import { useState } from 'react'

interface Props {
  src: string; alt: string; fallbackEmoji: string
  size: number; padding?: number
}

export function ProductImage({ src, alt, fallbackEmoji, size, padding = 8 }: Props) {
  const [failed, setFailed] = useState(!src)
  return (
    <div style={{
      width: size, height: size, background: '#f5f0ea', borderRadius: 12,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden', flexShrink: 0, position: 'relative',
    }}>
      {!failed && src ? (
        <Image src={src} alt={alt} fill
          style={{ objectFit: 'contain', padding }}
          onError={() => setFailed(true)} />
      ) : (
        <span style={{ fontSize: size * 0.35 }}>{fallbackEmoji}</span>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Create `src/components/product/verdict-badge.tsx`**
```tsx
import type { Verdict } from '@/lib/types'

const MAP = {
  BUY:  { bg: '#dcfce7', color: '#16a34a', icon: '🟢' },
  WAIT: { bg: '#fef3c7', color: '#d97706', icon: '🟡' },
  SKIP: { bg: '#fee2e2', color: '#dc2626', icon: '🔴' },
}

interface Props { verdict: Verdict; size?: 'sm' | 'md' | 'lg' }

export function VerdictBadge({ verdict, size = 'sm' }: Props) {
  const s = MAP[verdict]
  const fontSize = size === 'lg' ? 22 : size === 'md' ? 14 : 12
  const padding = size === 'lg' ? '18px 28px' : '5px 13px'
  return (
    <span style={{ background: s.bg, color: s.color, fontSize, fontWeight: 800,
      padding, borderRadius: 100, whiteSpace: 'nowrap', display: 'inline-block' }}>
      {s.icon} {verdict}
    </span>
  )
}
```

- [ ] **Step 3: Create `src/components/product/score-bar.tsx`**
```tsx
import { scoreColor } from '@/lib/scoring'

interface Props { score: number; showLabel?: boolean }

export function ScoreBar({ score, showLabel = true }: Props) {
  const color = scoreColor(score)
  return (
    <div>
      {showLabel && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#9a7e68', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Overall Score</span>
          <span style={{ fontSize: 14, fontWeight: 900, color }}>{score}</span>
        </div>
      )}
      <div style={{ height: 9, background: '#f0e8df', borderRadius: 5, overflow: 'hidden' }}>
        <div style={{ height: '100%', background: color, borderRadius: 5, width: `${score}%`,
          transition: 'width 0.7s cubic-bezier(0.4,0,0.2,1)' }} />
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create `src/components/layout/nav.tsx`**
```tsx
'use client'
import { signOut } from 'next-auth/react'
import Link from 'next/link'

interface Props { wishlistCount: number }

export function Nav({ wishlistCount }: Props) {
  return (
    <nav style={{ padding: '14px 32px', background: 'white', borderBottom: '1.5px solid #e8ddd0',
      display: 'flex', alignItems: 'center', gap: 16, position: 'sticky', top: 0, zIndex: 20,
      boxShadow: '0 2px 12px rgba(28,10,0,0.04)' }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
        <div style={{ width: 36, height: 36, background: '#f97316', borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 18, fontWeight: 900 }}>✦</div>
        <span style={{ fontSize: 18, fontWeight: 900, color: '#1c0a00', letterSpacing: '-0.3px' }}>ShopDecide</span>
      </Link>
      <div style={{ flex: 1 }} />
      <Link href="/wishlist" style={{ padding: '8px 16px', borderRadius: 10, border: '1.5px solid #e8ddd0',
        background: 'white', fontSize: 13, fontWeight: 700, color: '#7c6e5a', textDecoration: 'none' }}>
        ❤ Wishlist ({wishlistCount})
      </Link>
      <Link href="/profile" style={{ padding: '8px 16px', borderRadius: 10, border: '1.5px solid #e8ddd0',
        background: 'white', fontSize: 13, fontWeight: 700, color: '#7c6e5a', textDecoration: 'none' }}>
        👤 Profile
      </Link>
      <button onClick={() => signOut({ callbackUrl: '/auth' })}
        style={{ padding: '8px 16px', borderRadius: 10, border: '1.5px solid #e8ddd0',
          background: 'white', fontSize: 13, fontWeight: 700, color: '#dc2626', cursor: 'pointer' }}>
        Logout
      </button>
    </nav>
  )
}
```

- [ ] **Step 5: Commit**
```bash
git add -A && git commit -m "feat: ProductImage, VerdictBadge, ScoreBar, Nav components"
```

---

## Phase 6 — Home + Rankings

### Task 13: Home page with search + rankings

**Files:**
- Create: `apps/web/src/app/(app)/layout.tsx`
- Create: `apps/web/src/app/(app)/page.tsx`
- Create: `apps/web/src/components/search/search-input.tsx`
- Create: `apps/web/src/components/rankings/category-tabs.tsx`
- Create: `apps/web/src/components/rankings/leaderboard.tsx`
- Create: `apps/web/src/components/rankings/all-grid.tsx`
- Create: `apps/web/src/app/api/rankings/route.ts`

- [ ] **Step 1: Create `src/app/(app)/layout.tsx`**
```tsx
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Nav } from '@/components/layout/nav'
import { prisma } from '@/lib/prisma'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.email) redirect('/auth')
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { _count: { select: { wishlistItems: true } } }
  })
  return (
    <div style={{ minHeight: '100vh', background: '#fef9f0' }}>
      <Nav wishlistCount={user?._count.wishlistItems ?? 0} />
      {children}
    </div>
  )
}
```

- [ ] **Step 2: Create `src/components/search/search-input.tsx`**
```tsx
'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const CHIPS = [
  'Best budget smartphone under ₹15,000',
  'Air purifier for 300 sq ft room',
  'Running shoes under ₹3,000',
  'TWS earbuds for gym use',
]

export function SearchInput() {
  const router = useRouter()
  const [value, setValue] = useState('')
  const submit = (q: string) => {
    if (!q.trim()) return
    router.push(`/search?q=${encodeURIComponent(q.trim())}`)
  }
  return (
    <div style={{ width: '100%', maxWidth: 720 }}>
      <div style={{ background: 'white', border: '2px solid #e8ddd0', borderRadius: 20,
        display: 'flex', alignItems: 'center', overflow: 'hidden',
        boxShadow: '0 4px 32px rgba(28,10,0,0.08)', marginBottom: 16 }}>
        <span style={{ padding: '0 20px', fontSize: 22, color: '#9a7e68' }}>🔍</span>
        <input value={value} onChange={e => setValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit(value)}
          placeholder="e.g. best TWS earbuds under ₹2,500 for gym use"
          style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 16,
            color: '#1c0a00', padding: '20px 20px 20px 0', outline: 'none', fontWeight: 500 }} />
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginBottom: 24 }}>
        {CHIPS.map(chip => (
          <button key={chip} onClick={() => { setValue(chip); submit(chip) }}
            style={{ padding: '9px 18px', borderRadius: 100, border: '1.5px solid #e0d5cb',
              background: 'white', fontSize: 13, fontWeight: 600, color: '#4a3828', cursor: 'pointer' }}>
            {chip}
          </button>
        ))}
      </div>
      <button onClick={() => submit(value)}
        style={{ background: '#f97316', color: 'white', border: 'none', borderRadius: 14,
          padding: '16px 0', fontSize: 16, fontWeight: 800, cursor: 'pointer',
          boxShadow: '0 6px 24px rgba(249,115,22,0.4)', width: '100%' }}>
        Find Best Options →
      </button>
    </div>
  )
}
```

- [ ] **Step 3: Create `src/app/(app)/page.tsx`** (Home)
```tsx
import { SearchInput } from '@/components/search/search-input'
import { RankingsSection } from '@/components/rankings/rankings-section'

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '52px 24px 40px', background: 'linear-gradient(180deg, #fef9f0 0%, #fff7ed 100%)' }}>
        <div style={{ textAlign: 'center', marginBottom: 40, maxWidth: 720 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff7ed',
            border: '1px solid #fed7aa', padding: '6px 16px', borderRadius: 100, marginBottom: 20 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#ea580c', textTransform: 'uppercase', letterSpacing: 1 }}>
              Powered by real reviews
            </span>
          </div>
          <h1 style={{ fontSize: 48, fontWeight: 900, lineHeight: 1.1, color: '#1c0a00',
            marginBottom: 16, letterSpacing: '-1.5px' }}>
            What are you looking to{' '}
            <span style={{ color: '#f97316' }}>buy today?</span>
          </h1>
          <p style={{ fontSize: 16, color: '#7c6e5a', fontWeight: 500, lineHeight: 1.6 }}>
            AI-powered recommendations from Amazon, Flipkart, Reddit & YouTube — like asking a knowledgeable friend.
          </p>
        </div>
        <SearchInput />
        {/* Trust bar */}
        <div style={{ marginTop: 32, display: 'flex', gap: 28, flexWrap: 'wrap', justifyContent: 'center' }}>
          {['🛒 Amazon & Flipkart', '💬 Reddit', '▶️ YouTube', '🤖 AI analysis'].map(item => (
            <span key={item} style={{ fontSize: 13, color: '#9a7e68', fontWeight: 500 }}>{item}</span>
          ))}
        </div>
      </div>
      <RankingsSection />
    </div>
  )
}
```

- [ ] **Step 4: Create `src/components/rankings/rankings-section.tsx`** — client component with category tabs, "All" grid, and leaderboard. Fetches from `/api/rankings`. See spec for full visual design.

- [ ] **Step 5: Create `src/app/api/rankings/route.ts`** — returns static/seeded ranking data per category. For MVP, seed with 5 real products per major category (earbuds, smartphones, keyboards, skincare, supplements) using hard-coded data that mirrors the design file's sample products. Replace with dynamic pipeline data in v2.

- [ ] **Step 6: Commit**
```bash
git add -A && git commit -m "feat: home page with search input, hero, trust bar, rankings section"
```

---

## Phase 7 — Search Flow (Loading → Results → Chat)

### Task 14: Search page with loading steps + results + chat

**Files:**
- Create: `apps/web/src/app/(app)/search/page.tsx`
- Create: `apps/web/src/components/search/loading-steps.tsx`
- Create: `apps/web/src/components/product/product-card.tsx`
- Create: `apps/web/src/components/chat/chat-panel.tsx`

- [ ] **Step 1: Create `src/components/search/loading-steps.tsx`**

5-step progress component. Each step has: emoji, label, state (pending/active/complete). Progress bar fills as steps complete. Receives `currentStep: number` as prop. See spec for exact colors and animation.

- [ ] **Step 2: Create `src/components/product/product-card.tsx`**

Full card component per spec:
- ProductImage (120×120px)
- VerdictBadge + optional badge label + Score number (42px, colour-coded)
- Name + brand + price + store
- Amazon ★ + Flipkart ★ ratings row
- Reddit sentiment pill + YouTube pill
- ScoreBar
- AI verdict italic blockquote (verdict-tinted background)
- Compare checkbox with `onSelect` callback

- [ ] **Step 3: Create `src/components/chat/chat-panel.tsx`**

Right-side chat panel (380px):
- Header: `✦` + "Refine with AI" + subtitle
- Scrollable message area: AI bubbles (left, `#f5f0ea`) + user bubbles (right, `#f97316`)
- Typing indicator (3 animated dots, 1.6s)
- Textarea input: Enter sends, Shift+Enter newline
- On send: POST to `/api/refine`, get `{ aiText, reorderedIds }`, update product order

- [ ] **Step 4: Create `src/app/(app)/search/page.tsx`** (client component)
```tsx
'use client'
import { useEffect, useState, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { LoadingSteps } from '@/components/search/loading-steps'
import { ProductCard } from '@/components/product/product-card'
import { ChatPanel } from '@/components/chat/chat-panel'
import type { Product, ChatMessage, ResearchEvent } from '@/lib/types'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams.get('q') ?? ''
  const [phase, setPhase] = useState<'loading' | 'results'>('loading')
  const [loadingStep, setLoadingStep] = useState(0)
  const [products, setProducts] = useState<Product[]>([])
  const [sortBy, setSortBy] = useState<'score' | 'price' | 'reviews'>('score')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { type: 'ai', text: `I've found the best options for "${query}". Tell me what matters most to you — battery life, price, specific features — and I'll reorder these for you.` }
  ])
  const [isRefining, setIsRefining] = useState(false)

  useEffect(() => {
    if (!query) return
    const source = new EventSource(`/api/research?` + new URLSearchParams({ q: query }))
    // NOTE: SSE with POST — use fetch with streaming instead of EventSource
    // Implement using fetch + ReadableStream reader
    let step = 0
    const reader = fetch('/api/research', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    }).then(res => {
      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      function pump(): Promise<void> {
        return reader.read().then(({ done, value }) => {
          if (done) return
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const event: ResearchEvent = JSON.parse(line.slice(6))
            if (event.type === 'step_complete') setLoadingStep(s => s + 1)
            if (event.type === 'product') setProducts(p => [...p, event.product!])
            if (event.type === 'done') setPhase('results')
            if (event.type === 'error') setPhase('results') // show partial
          }
          return pump()
        })
      }
      return pump()
    })
  }, [query])

  const sorted = [...products].sort((a, b) => {
    if (sortBy === 'price') return a.price - b.price
    if (sortBy === 'reviews') return (b.amazonReviews + b.flipkartReviews) - (a.amazonReviews + a.flipkartReviews)
    return b.score - a.score
  })

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 3 ? [...prev, id] : prev
    )
  }

  if (phase === 'loading') return <LoadingSteps currentStep={loadingStep} query={query} />

  return (
    <div style={{ height: 'calc(100vh - 65px)', display: 'flex', flexDirection: 'column' }}>
      {/* Sticky header */}
      <div style={{ background: 'white', borderBottom: '1.5px solid #e8ddd0', padding: '13px 28px',
        display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 2px 14px rgba(0,0,0,0.05)' }}>
        <button onClick={() => router.push('/')}
          style={{ padding: '7px 14px', borderRadius: 9, border: '1.5px solid #e8ddd0',
            fontSize: 12, fontWeight: 700, color: '#7c6e5a', background: 'white', cursor: 'pointer' }}>
          ← Home
        </button>
        <span style={{ fontSize: 13, color: '#9a7e68' }}>Results for:</span>
        <span style={{ fontSize: 15, fontWeight: 800, color: '#1c0a00' }}>"{query}"</span>
        <div style={{ flex: 1 }} />
        {/* Sort pills */}
        <div style={{ background: '#f5f0ea', borderRadius: 10, padding: 4, display: 'flex', gap: 3 }}>
          {(['score', 'price', 'reviews'] as const).map(s => (
            <button key={s} onClick={() => setSortBy(s)}
              style={{ padding: '6px 14px', borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none',
                background: sortBy === s ? '#f97316' : 'transparent',
                color: sortBy === s ? 'white' : '#7c6e5a' }}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        {selectedIds.length >= 2 && (
          <button onClick={() => router.push(`/compare?ids=${selectedIds.join(',')}`)}
            style={{ background: '#1c0a00', color: 'white', padding: '9px 20px', borderRadius: 10,
              fontSize: 13, fontWeight: 800, border: 'none', cursor: 'pointer' }}>
            Compare {selectedIds.length} →
          </button>
        )}
      </div>
      {/* Content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {sorted.map((p, i) => (
            <ProductCard key={p.id} product={p} isSelected={selectedIds.includes(p.id)}
              onSelect={() => toggleSelect(p.id)} index={i}
              onClick={() => router.push(`/product/${p.id}`)} />
          ))}
        </div>
        <ChatPanel products={sorted} chatMessages={chatMessages}
          setChatMessages={setChatMessages} isRefining={isRefining}
          setIsRefining={setIsRefining}
          onReorder={(ids) => setProducts(p => [...p].sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id)))} />
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Test search flow end-to-end**
  - Ensure Python service is running on port 8000
  - Navigate to `http://localhost:3000`
  - Type "boAt TWS earbuds under 2000" → click Find Best Options
  - Should see loading screen → results with cards

- [ ] **Step 6: Commit**
```bash
git add -A && git commit -m "feat: search page with loading steps, product cards, chat panel"
```

---

## Phase 8 — Product Detail

### Task 15: Product detail page

**Files:**
- Create: `apps/web/src/app/(app)/product/[id]/page.tsx`
- Create: `apps/web/src/app/api/wishlist/route.ts`

- [ ] **Step 1: Create `src/app/api/wishlist/route.ts`**
```ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { email: session.user.email },
    include: { wishlistItems: { orderBy: { createdAt: 'desc' } } } })
  return NextResponse.json({ items: user?.wishlistItems ?? [] })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { productId, productData } = await req.json()
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  await prisma.wishlistItem.upsert({
    where: { userId_productId: { userId: user.id, productId } },
    update: {},
    create: { userId: user.id, productId, productData: JSON.stringify(productData) },
  })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { productId } = await req.json()
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  await prisma.wishlistItem.deleteMany({ where: { userId: user.id, productId } })
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 2: Create `src/app/(app)/product/[id]/page.tsx`**

Full product detail page matching the design spec:
- Two-column grid (left: image + store links + wishlist toggle; right: verdict + name + ratings + score + AI verdict + expert analysis)
- "What People Are Saying" section (Reddit card + YouTube card)
- Wishlist toggle via POST/DELETE `/api/wishlist`
- Image: full-width 1:1 square, 12px padding
- Store links: Amazon (`#FF9900`) + Flipkart (`#1F40FB`) buttons with real product URLs
- Product data passed via query param or pulled from cache

- [ ] **Step 3: Commit**
```bash
git add -A && git commit -m "feat: product detail page with wishlist toggle + community insights"
```

---

## Phase 9 — Compare, Wishlist, Profile

### Task 16: Compare screen

**Files:**
- Create: `apps/web/src/app/(app)/compare/page.tsx`
- Create: `apps/web/src/components/compare/scorecard.tsx`

- [ ] **Step 1: Create `src/components/compare/scorecard.tsx`**

Side-by-side scorecard table. CSS Grid with `200px 1fr [1fr 1fr]`. Rows: Best Price · Overall Score · Amazon Rating · Flipkart Rating · Reddit Sentiment · YouTube Coverage. Winner highlighting (lowest price → green, highest score → orange). See spec for exact cell styles.

- [ ] **Step 2: Create `src/app/(app)/compare/page.tsx`**
- Reads `?ids=id1,id2,id3` from URL
- Loads product data from SSE cache or re-fetches
- Three sections: Verdict Hero (BUY/WAIT/SKIP badges, large) → Scorecard → Expert Analysis cards
- Sticky header with ← Back + "Comparing N products" title + query

- [ ] **Step 3: Commit**
```bash
git add -A && git commit -m "feat: compare screen with verdict hero, scorecard, expert analysis"
```

---

### Task 17: Wishlist + Profile pages

**Files:**
- Create: `apps/web/src/app/(app)/wishlist/page.tsx`
- Create: `apps/web/src/app/(app)/profile/page.tsx`

- [ ] **Step 1: Create `src/app/(app)/wishlist/page.tsx`**
```tsx
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { WishlistGrid } from '@/components/wishlist/wishlist-grid'

export default async function WishlistPage() {
  const session = await auth()
  const user = await prisma.user.findUnique({
    where: { email: session!.user!.email! },
    include: { wishlistItems: { orderBy: { createdAt: 'desc' } } }
  })
  const items = (user?.wishlistItems ?? []).map(i => JSON.parse(i.productData))
  return (
    <div style={{ padding: '32px 40px', maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ fontSize: 32, fontWeight: 900, color: '#1c0a00', marginBottom: 8 }}>❤ My Wishlist</h1>
      <p style={{ fontSize: 14, color: '#7c6e5a', marginBottom: 28 }}>{items.length} items saved</p>
      <WishlistGrid items={items} />
    </div>
  )
}
```

`WishlistGrid` client component: renders product cards in grid layout with remove button. Empty state: 📋 icon + "Your wishlist is empty" + "Start Shopping →".

- [ ] **Step 2: Create `src/app/(app)/profile/page.tsx`**

Displays user info, stats (wishlist count, search count), preferences (email notifications + price drop alerts toggles), action buttons (Edit Profile, Change Password, Logout).

- [ ] **Step 3: Create API endpoint `src/app/api/profile/route.ts`** for updating preferences
```ts
// PATCH: update emailNotifications + priceDropAlerts
export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const data = await req.json()
  await prisma.user.update({
    where: { email: session.user.email },
    data: { emailNotifications: data.emailNotifications, priceDropAlerts: data.priceDropAlerts }
  })
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 4: Commit**
```bash
git add -A && git commit -m "feat: wishlist page + profile page with preferences"
```

---

## Phase 10 — Deploy

### Task 18: Deploy Scrapling service to Railway

- [ ] **Step 1: Create `apps/scraper/Procfile`**
```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

- [ ] **Step 2: Create `apps/scraper/runtime.txt`**
```
python-3.12
```

- [ ] **Step 3: Push to Railway**
  - Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
  - Point to `apps/scraper` directory
  - Set env var: `ALLOWED_ORIGIN=https://shopdecide.com`
  - Note the service URL (e.g. `https://scraper-xxx.up.railway.app`)

- [ ] **Step 4: Run post-deploy health check**
```bash
curl https://your-scraper.up.railway.app/health
# Expected: {"status": "ok"}
```

- [ ] **Step 5: Commit**
```bash
git add -A && git commit -m "feat: scrapling service deploy config"
```

---

### Task 19: Deploy Next.js app to Vercel

- [ ] **Step 1: Install Vercel CLI and link project**
```bash
npm i -g vercel
cd apps/web
vercel link
```

- [ ] **Step 2: Set environment variables on Vercel**
```bash
vercel env add OPENROUTER_API_KEY
vercel env add YOUTUBE_API_KEY
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL          # https://shopdecide.com
vercel env add GOOGLE_CLIENT_ID
vercel env add GOOGLE_CLIENT_SECRET
vercel env add DATABASE_URL          # Neon Postgres connection string
vercel env add SCRAPLING_SERVICE_URL # Railway URL from Task 18
```

- [ ] **Step 3: Switch DATABASE_URL to Neon (Postgres, free tier)**
  - Create free Neon account → create database → copy connection string
  - Update `prisma/schema.prisma` datasource: `provider = "postgresql"`
  - Run: `npx prisma migrate deploy`

- [ ] **Step 4: Deploy to Vercel**
```bash
vercel --prod
```

- [ ] **Step 5: Configure custom domain**
  - Vercel Dashboard → Project → Settings → Domains → Add `shopdecide.com`
  - Update DNS records at your registrar

- [ ] **Step 6: Smoke test production**
  - Visit `https://shopdecide.com` → should redirect to `/auth`
  - Sign up → search "best TWS earbuds under 2000" → verify results appear
  - Add to wishlist → verify persists on Wishlist page
  - Compare 2 products → verify compare screen works

- [ ] **Step 7: Final commit**
```bash
git add -A && git commit -m "feat: production deploy to Vercel + Railway"
```

---

## Environment Variables Reference

```bash
# apps/web/.env.local (dev) / Vercel env vars (prod)
DATABASE_URL="file:./dev.db"                    # sqlite dev / neon postgres prod
NEXTAUTH_SECRET="<openssl rand -base64 32>"
NEXTAUTH_URL="http://localhost:3000"            # https://shopdecide.com in prod
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
OPENROUTER_API_KEY=""
YOUTUBE_API_KEY=""
SCRAPLING_SERVICE_URL="http://localhost:8000"   # Railway URL in prod

# apps/scraper/.env
ALLOWED_ORIGIN="http://localhost:3000"          # https://shopdecide.com in prod
```

---

## Build Order Summary

| Phase | What it delivers |
|---|---|
| Phase 1 | Project scaffold, DB, types |
| Phase 2 | Working auth (email + Google) |
| Phase 3 | Python scraping service running |
| Phase 4 | Research pipeline (SSE + AI synthesis) |
| Phase 5 | Core UI components |
| Phase 6 | Home page + rankings |
| Phase 7 | Full search → results → chat flow |
| Phase 8 | Product detail + wishlist API |
| Phase 9 | Compare + wishlist + profile pages |
| Phase 10 | Production deploy |
