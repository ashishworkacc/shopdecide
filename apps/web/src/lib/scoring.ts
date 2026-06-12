export function scoreProduct(data: {
  amazonRating: number
  amazonReviews: number
  flipkartRating: number
  flipkartReviews: number
  redditSentiment: 'positive' | 'mixed' | 'negative' | null
  redditMentions: number
  youtubeVideos: number
  suspicious: boolean
}): number {
  const avgRating =
    data.amazonRating > 0 && data.flipkartRating > 0
      ? (data.amazonRating + data.flipkartRating) / 2
      : data.amazonRating || data.flipkartRating
  const ratingNorm = avgRating / 5

  const totalReviews = data.amazonReviews + data.flipkartReviews
  const reviewNorm =
    totalReviews <= 0
      ? 0
      : Math.min(Math.log(totalReviews + 1) / Math.log(10001), 1)

  const sentimentMap = { positive: 1, mixed: 0.5, negative: 0 }
  const redditNorm = data.redditSentiment
    ? sentimentMap[data.redditSentiment] * Math.min(data.redditMentions / 50, 1)
    : 0

  const ytNorm =
    data.youtubeVideos <= 0
      ? 0
      : Math.min(Math.log(data.youtubeVideos + 1) / Math.log(21), 1)

  let score =
    ratingNorm * 40 + reviewNorm * 20 + redditNorm * 20 + ytNorm * 20
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
