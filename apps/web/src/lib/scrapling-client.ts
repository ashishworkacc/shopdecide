/**
 * Product data sourced via AI (DeepSeek) — replaces the local Python scraping service.
 * DeepSeek knows Indian e-commerce products, prices, and ratings from training data.
 */
import { createOpenAI } from '@ai-sdk/openai'
import { generateText, Output } from 'ai'
import { z } from 'zod'

function getOpenRouter() {
  return createOpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY!,
  })
}

const SearchResultSchema = z.object({
  products: z.array(z.object({
    name: z.string(),
    brand: z.string(),
    price: z.number(),
    store: z.string(),
    imageUrl: z.string().optional(),
  })).max(8),
})

const ProductDataSchema = z.object({
  amazon: z.object({
    rating: z.number().min(1).max(5),
    reviews: z.number(),
    link: z.string(),
  }).nullable(),
  flipkart: z.object({
    rating: z.number().min(1).max(5),
    reviews: z.number(),
    link: z.string(),
  }).nullable(),
  specialist: z.object({
    verdict: z.string(),
    pros: z.array(z.string()),
    cons: z.array(z.string()),
  }).nullable(),
})

export async function searchProducts(query: string, category?: string) {
  try {
    const openrouter = getOpenRouter()
    const { output } = await generateText({
      model: openrouter('deepseek/deepseek-chat'),
      output: Output.object({ schema: SearchResultSchema }),
      prompt: `You are a product database for the Indian market (Amazon.in / Flipkart).
List up to 8 REAL products that match this search query. Only include products actually sold in India.

QUERY: "${query}"
CATEGORY: ${category ?? 'general'}

Rules:
- Return real product names exactly as listed on Amazon.in or Flipkart
- Price in INR (₹) — use realistic current market prices
- brand: the manufacturer brand name
- store: "Amazon" or "Flipkart" (whichever is primary seller)
- Include a mix of price ranges if applicable
- imageUrl: leave empty string ""`,
      maxOutputTokens: 600,
    })
    return output ?? { products: [] }
  } catch {
    return { products: [] }
  }
}

export async function getProductData(productName: string, category?: string) {
  try {
    const openrouter = getOpenRouter()
    const { output } = await generateText({
      model: openrouter('deepseek/deepseek-chat'),
      output: Output.object({ schema: ProductDataSchema }),
      prompt: `You are a product ratings database for Amazon.in and Flipkart India.
Provide realistic ratings and review counts for this product as it appears on Indian e-commerce.

PRODUCT: "${productName}"
CATEGORY: ${category ?? 'general'}

Rules:
- Use REAL approximate ratings and review counts you know from training data
- If you genuinely don't know this product, estimate based on category averages (3.8-4.3 stars, 500-5000 reviews)
- amazon.link: https://www.amazon.in/s?k=${encodeURIComponent(productName)}
- flipkart.link: https://www.flipkart.com/search?q=${encodeURIComponent(productName)}
- specialist.verdict: one short sentence editorial take ("Best budget option", "Overhyped at this price", etc.)
- specialist.pros: 2-3 real strengths
- specialist.cons: 2-3 real weaknesses`,
      maxOutputTokens: 400,
    })
    return output
  } catch {
    return null
  }
}
