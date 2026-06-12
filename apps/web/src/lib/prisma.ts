import { PrismaClient } from '@prisma/client'
import { PrismaNeonHttp } from '@prisma/adapter-neon'

declare global {
  // eslint-disable-next-line no-var
  var _prismaClient: PrismaClient | undefined
}

export function getPrisma(): PrismaClient {
  if (global._prismaClient) return global._prismaClient

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set')
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adapter = new PrismaNeonHttp(process.env.DATABASE_URL, {} as any)
  const client = new PrismaClient({ adapter })

  if (process.env.NODE_ENV !== 'production') global._prismaClient = client
  return client
}

// No-op — kept for call-site compatibility
export async function ensureDb(): Promise<void> {}
