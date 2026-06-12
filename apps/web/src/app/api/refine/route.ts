import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { refineRecommendations } from '@/lib/openrouter'

export const runtime = 'nodejs'
export const maxDuration = 30

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { message, products, chatHistory } = await req.json()
  const result = await refineRecommendations({ message, products, chatHistory })
  return NextResponse.json(result)
}
