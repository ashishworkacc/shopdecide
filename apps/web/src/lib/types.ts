export type Verdict = 'BUY' | 'WAIT' | 'SKIP'
export type RedditSentiment = 'positive' | 'mixed' | 'negative'

export interface Product {
  id: string
  name: string
  brand: string
  price: number
  store: string
  // Image — both field names accepted for compatibility
  image?: string
  imageUrl?: string
  imageFallbackEmoji?: string
  // Amazon
  amazonRating: number
  amazonReviews: number
  amazonUrl?: string
  amazonLink?: string
  // Flipkart
  flipkartRating: number
  flipkartReviews: number
  flipkartUrl?: string
  flipkartLink?: string
  // Reddit
  redditMentions: number
  redditSentiment: RedditSentiment
  redditLink?: string
  redditInsight?: string
  // YouTube
  youtubeVideos: number
  youtubeViews?: string
  youtubeLink?: string
  youtubeInsight?: string
  // Score & verdict
  score: number
  verdict: Verdict
  badge?: string | null
  aiVerdict?: string
  expertSummary?: string
  // Pros / Cons
  pros?: string[]
  cons?: string[]
  // Category-specific scores
  batteryScore?: number
  ancScore?: number
  waterScore?: number
  category?: string
}

export interface ChatMessage {
  type: 'user' | 'ai'
  text: string
}

export interface ResearchEvent {
  type: 'step_start' | 'step_complete' | 'product' | 'done' | 'error' | 'cached'
  step?: number
  label?: string
  product?: Product
  message?: string
  timestamp?: number
}

export interface WishlistItem {
  id: string
  productId: string
  productName: string
  productImage?: string | null
  currentPrice?: number | null
  verdict?: Verdict | null
  productData: string
  createdAt: string
}
