const BASE = 'https://www.googleapis.com/youtube/v3'

export async function searchYouTube(productName: string) {
  const key = process.env.YOUTUBE_API_KEY
  if (!key) return null

  try {
    const q = encodeURIComponent(`${productName} review India`)
    const searchUrl = `${BASE}/search?part=snippet&q=${q}&type=video&maxResults=10&regionCode=IN&key=${key}`
    const res = await fetch(searchUrl, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) return null

    const data = await res.json()
    const items: Array<{ id: { videoId: string } }> = data.items ?? []
    if (items.length === 0) {
      return {
        videos: 0,
        totalViews: '0',
        link: `https://www.youtube.com/results?search_query=${encodeURIComponent(productName + ' review')}`,
      }
    }

    const videoIds = items.map(i => i.id.videoId).join(',')
    const statsUrl = `${BASE}/videos?part=statistics&id=${videoIds}&key=${key}`
    const statsRes = await fetch(statsUrl, { signal: AbortSignal.timeout(5000) })
    const statsData = statsRes.ok ? await statsRes.json() : { items: [] }

    const totalViews = (statsData.items ?? []).reduce(
      (sum: number, v: { statistics?: { viewCount?: string } }) =>
        sum + parseInt(v.statistics?.viewCount ?? '0'),
      0
    )

    const formatted =
      totalViews >= 1_000_000
        ? `${(totalViews / 1_000_000).toFixed(1)}M`
        : totalViews >= 1000
          ? `${Math.round(totalViews / 1000)}K`
          : String(totalViews)

    return {
      videos: items.length,
      totalViews: formatted,
      link: `https://www.youtube.com/results?search_query=${encodeURIComponent(productName + ' review')}`,
    }
  } catch {
    return null
  }
}
