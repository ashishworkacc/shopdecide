import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var _prismaClient: PrismaClient | undefined
}

export function getPrisma(): PrismaClient {
  if (global._prismaClient) return global._prismaClient
  const client = new PrismaClient()
  if (process.env.NODE_ENV !== 'production') global._prismaClient = client
  return client
}

// No-op — kept for call-site compatibility; Neon doesn't need manual init
export async function ensureDb(): Promise<void> {}
