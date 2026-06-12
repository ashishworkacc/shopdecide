export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { searchProducts, getProductData } from '@/lib/scrapling-client'
import { searchYouTube } from '@/lib/youtube'
import { searchReddit } from '@/lib/reddit'
import { synthesizeProduct } from '@/lib/openrouter'
import { scoreProduct, verdictFromScore } from '@/lib/scoring'
import { detectCategory } from '@/lib/category-routing'
import { cacheKey, getCached, setCached, getCachedTimestamp } from '@/lib/cache'
import type { Product } from '@/lib/types'

export const runtime = 'nodejs'
export const maxDuration = 60

function sse(controller: ReadableStreamDefaultController, event: object) {
  controller.enqueue(`data: ${JSON.stringify(event)}\n\n`)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return new Response('Unauthorized', { status: 401 })

  const { query } = await req.json()
  if (!query?.trim()) return new Response('Missing query', { status: 400 })

  const key = cacheKey(query)
  const cached = getCached<Product[]>(key)

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const enqueue = (obj: object) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`))

      if (cached) {
        enqueue({ type: 'cached', timestamp: getCachedTimestamp(key) })
        for (const p of cached) enqueue({ type: 'product', product: p })
        enqueue({ type: 'done' })
        controller.close()
        return
      }

      try {
        const category = detectCategory(query)

        enqueue({ type: 'step_start', step: 0, label: 'Searching Google Shopping India…' })
        const searchResults = await searchProducts(query, category)
        const candidates: Array<{ name: string; brand?: string; price: number; store?: string; imageUrl?: string }> =
          searchResults.products?.slice(0, 8) ?? []
        enqueue({ type: 'step_complete', step: 0 })

        if (candidates.length === 0) {
          enqueue({ type: 'error', message: 'no_results' })
          controller.close()
          return
        }

        enqueue({ type: 'step_start', step: 1, label: 'Checking Amazon & Flipkart ratings…' })
        const productDataList = await Promise.all(
          candidates.map(c => getProductData(c.name, category))
        )
        enqueue({ type: 'step_complete', step: 1 })

        // Popularity filter: need 100+ reviews on at least one platform
        const filtered = candidates.filter((_, i) => {
          const d = productDataList[i]
          return (d?.amazon?.reviews ?? 0) >= 100 || (d?.flipkart?.reviews ?? 0) >= 100
        }).slice(0, 5)

        const filteredData = filtered.map(f => productDataList[candidates.indexOf(f)])

        if (filtered.length === 0) {
          // Fall back to top 5 if none pass popularity filter (e.g. new product)
          filtered.push(...candidates.slice(0, 5))
          filteredData.push(...productDataList.slice(0, 5))
        }

        enqueue({ type: 'step_start', step: 2, label: 'Reading Reddit discussions…' })
        const redditData = await Promise.all(
          filtered.map(c => searchReddit(c.name, category))
        )
        enqueue({ type: 'step_complete', step: 2 })

        enqueue({ type: 'step_start', step: 3, label: 'Scanning YouTube reviews…' })
        const ytData = await Promise.all(
          filtered.map(c => searchYouTube(c.name))
        )
        enqueue({ type: 'step_complete', step: 3 })

        enqueue({ type: 'step_start', step: 4, label: 'Generating expert analysis…' })
        const products = await Promise.all(
          filtered.map(async (c, i) => {
            const pd = filteredData[i]
            const synthesis = await synthesizeProduct({
              productName: c.name,
              brand: c.brand ?? '',
              price: c.price,
              store: c.store ?? '',
              amazonData: pd?.amazon ?? null,
              flipkartData: pd?.flipkart ?? null,
              redditData: redditData[i],
              youtubeData: ytData[i],
              specialistData: pd?.specialist ?? null,
              query,
            })

            const score = scoreProduct({
              amazonRating: pd?.amazon?.rating ?? 0,
              amazonReviews: pd?.amazon?.reviews ?? 0,
              flipkartRating: pd?.flipkart?.rating ?? 0,
              flipkartReviews: pd?.flipkart?.reviews ?? 0,
              redditSentiment: redditData[i]?.sentiment ?? null,
              redditMentions: redditData[i]?.mentions ?? 0,
              youtubeVideos: ytData[i]?.videos ?? 0,
              suspicious: (synthesis?.suspicious_signals?.length ?? 0) > 1,
            })

            const product: Product = {
              id: `${c.name}-${i}`.replace(/\s+/g, '-').toLowerCase().slice(0, 50),
              name: c.name,
              brand: c.brand ?? '',
              price: c.price,
              store: c.store ?? '',
              imageUrl: c.imageUrl ?? '',
              imageFallbackEmoji: '📦',
              category,
              amazonRating: pd?.amazon?.rating ?? 0,
              amazonReviews: pd?.amazon?.reviews ?? 0,
              amazonLink: pd?.amazon?.link ?? `https://www.amazon.in/s?k=${encodeURIComponent(c.name)}`,
              flipkartRating: pd?.flipkart?.rating ?? 0,
              flipkartReviews: pd?.flipkart?.reviews ?? 0,
              flipkartLink: pd?.flipkart?.link ?? `https://www.flipkart.com/search?q=${encodeURIComponent(c.name)}`,
              redditMentions: redditData[i]?.mentions ?? 0,
              redditSentiment: redditData[i]?.sentiment ?? 'mixed',
              redditLink: redditData[i]?.link ?? '',
              redditInsight: synthesis?.redditInsight ?? '',
              youtubeVideos: ytData[i]?.videos ?? 0,
              youtubeViews: ytData[i]?.totalViews ?? '0',
              youtubeLink: ytData[i]?.link ?? '',
              youtubeInsight: synthesis?.youtubeInsight ?? '',
              score,
              verdict: synthesis?.verdict ?? verdictFromScore(score),
              badge: synthesis?.badge ?? null,
              aiVerdict: synthesis?.aiVerdict ?? '',
              expertSummary: synthesis?.expertSummary ?? '',
              batteryScore: synthesis?.batteryScore ?? 0,
              ancScore: synthesis?.ancScore ?? 0,
              waterScore: synthesis?.waterScore ?? 0,
            }
            return product
          })
        )
        enqueue({ type: 'step_complete', step: 4 })

        const sorted = [...products].sort((a, b) => b.score - a.score)
        setCached(key, sorted)
        for (const p of sorted) enqueue({ type: 'product', product: p })
        enqueue({ type: 'done' })
      } catch (e) {
        enqueue({ type: 'error', message: e instanceof Error ? e.message : 'Research failed' })
      }
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
