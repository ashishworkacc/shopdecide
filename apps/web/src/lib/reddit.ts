import { SUBREDDITS_BY_CATEGORY } from './category-routing'

export async function searchReddit(productName: string, category?: string) {
  const subs =
    SUBREDDITS_BY_CATEGORY[category ?? 'default'] ??
    SUBREDDITS_BY_CATEGORY.default
  const primarySub = subs[0]
  const url = `https://www.reddit.com/r/${subs.join('+')}/search.json?q=${encodeURIComponent(productName)}&restrict_sr=1&sort=top&limit=25`

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'ShopDecide/1.0 (shopdecide.com)' },
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) return null

    const data = await res.json()
    const posts: Array<{ data: { score: number } }> =
      data?.data?.children ?? []

    if (posts.length === 0) return null

    const positive = posts.filter(p => p.data.score > 50).length
    const negative = posts.filter(p => p.data.score < 5).length
    const sentiment =
      positive > negative * 2
        ? 'positive'
        : negative > positive
          ? 'negative'
          : 'mixed'

    return {
      mentions: posts.length,
      sentiment: sentiment as 'positive' | 'mixed' | 'negative',
      link: `https://www.reddit.com/r/${primarySub}/search?q=${encodeURIComponent(productName)}&sort=top`,
    }
  } catch {
    return null
  }
}
