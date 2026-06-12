import { createOpenAI } from '@ai-sdk/openai'
import { generateText, Output } from 'ai'
import { z } from 'zod'

function getOpenRouter() {
  return createOpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY!,
  })
}

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
  amazonData: { rating: number; reviews: number; link: string } | null
  flipkartData: { rating: number; reviews: number; link: string } | null
  redditData: { mentions: number; sentiment: string; link: string } | null
  youtubeData: { videos: number; totalViews: string; link: string } | null
  specialistData: unknown
  query: string
}) {
  const openrouter = getOpenRouter()

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
- Expose the most common real complaints. Flag suspicious review patterns.
- If a cheaper Indian alternative delivers similar value, name it in cheaper_alternative
- batteryScore/ancScore/waterScore: assess from product name and category (0 = irrelevant)
- aiVerdict: one punchy sentence, italic-worthy, tells user the bottom line
- redditInsight: 2-3 sentences summarising Reddit community opinion
- youtubeInsight: 2-3 sentences on YouTube review coverage`

  const { output } = await generateText({
    model: openrouter('deepseek/deepseek-v4-flash'),
    output: Output.object({ schema: ProductSynthesisSchema }),
    prompt,
    maxOutputTokens: 800,
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
  products: Array<{
    id: string
    name: string
    score: number
    price: number
    batteryScore: number
    ancScore: number
    waterScore: number
    redditMentions: number
    amazonReviews: number
    flipkartReviews: number
  }>
  chatHistory: Array<{ type: string; text: string }>
}) {
  const openrouter = getOpenRouter()

  const prompt = `You are ShopDecide's AI assistant. The user is refining their product recommendations.

CURRENT PRODUCTS (in order): ${data.products.map(p => `${p.id}: ${p.name} (score:${p.score}, ₹${p.price})`).join(', ')}

CHAT HISTORY: ${data.chatHistory.map(m => `${m.type}: ${m.text}`).join('\n')}

USER MESSAGE: "${data.message}"

Re-order the products based on what the user cares about and explain in 2-3 conversational sentences.
Return the product IDs in new priority order and a short sortLabel (e.g. "Battery life", "Price", "ANC").`

  const { output } = await generateText({
    model: openrouter('deepseek/deepseek-v4-flash'),
    output: Output.object({ schema: RefinementSchema }),
    prompt,
    maxOutputTokens: 300,
  })

  return output
}
