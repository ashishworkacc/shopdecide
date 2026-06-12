export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { createOpenAI } from '@ai-sdk/openai'
import { generateText, Output } from 'ai'
import { z } from 'zod'

export async function GET() {
  const key = process.env.OPENROUTER_API_KEY ?? ''
  const steps: string[] = [`key_prefix: ${key.slice(0, 15)}`]

  try {
    const openrouter = createOpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: key,
    })
    steps.push('calling generateText...')

    const schema = z.object({
      products: z.array(z.object({
        name: z.string(), brand: z.string(), price: z.number(), store: z.string(),
      })).max(3),
    })

    const { output, text } = await generateText({
      model: openrouter('deepseek/deepseek-v4-flash'),
      output: Output.object({ schema }),
      prompt: 'List 2 real boAt TWS earbuds sold in India under 2500 rupees.',
      maxOutputTokens: 300,
    })

    steps.push(`raw_text_length: ${text?.length ?? 0}`)
    steps.push(`output: ${JSON.stringify(output)}`)
    return NextResponse.json({ ok: true, steps, output })
  } catch (e: unknown) {
    const err = e as Error & { cause?: unknown }
    return NextResponse.json({
      ok: false, steps,
      error: err.message,
      cause: String(err.cause ?? ''),
      stack: err.stack?.split('\n').slice(0, 4),
    }, { status: 500 })
  }
}
