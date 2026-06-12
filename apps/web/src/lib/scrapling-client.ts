const BASE = process.env.SCRAPLING_SERVICE_URL ?? 'http://localhost:8000'

export async function searchProducts(query: string, category?: string) {
  try {
    const res = await fetch(`${BASE}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, category }),
      signal: AbortSignal.timeout(12000),
    })
    if (!res.ok) return { products: [] }
    return res.json()
  } catch {
    return { products: [] }
  }
}

export async function getProductData(productName: string, category?: string) {
  try {
    const res = await fetch(`${BASE}/product`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_name: productName, category }),
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}
