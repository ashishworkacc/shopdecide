import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

let _prisma: PrismaClient | null = null

export function getPrisma(): PrismaClient {
  if (!_prisma) {
    _prisma = global.prisma ?? new PrismaClient()
    if (process.env.NODE_ENV !== 'production') global.prisma = _prisma
  }
  return _prisma
}

// Convenience export for direct use
export const prisma = getPrisma()
