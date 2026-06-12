export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { searchProducts } from '@/lib/scrapling-client'

export async function GET() {
  const steps: string[] = []
  try {
    steps.push('key_present: ' + !!process.env.OPENROUTER_API_KEY)
    steps.push('key_prefix: ' + (process.env.OPENROUTER_API_KEY?.slice(0, 15) ?? 'none'))
    const result = await searchProducts('boAt Airdopes 141 TWS earbuds India', 'earbuds')
    steps.push('products_count: ' + result.products.length)
    return NextResponse.json({ ok: true, steps, result })
  } catch (e) {
    return NextResponse.json({ ok: false, steps, error: String(e) }, { status: 500 })
  }
}
