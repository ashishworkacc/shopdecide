import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

declare global {
  // eslint-disable-next-line no-var
  var _prismaClient: PrismaClient | undefined
  // eslint-disable-next-line no-var
  var _dbReady: boolean | undefined
}

export function getPrisma(): PrismaClient {
  if (global._prismaClient) return global._prismaClient
  const client = new PrismaClient()
  if (process.env.NODE_ENV !== 'production') global._prismaClient = client
  return client
}

/**
 * Ensures the SQLite database file exists and has the current schema applied.
 * Safe to call multiple times — only runs once per process.
 */
export async function ensureDb(): Promise<void> {
  if (global._dbReady) return
  const url = process.env.DATABASE_URL ?? 'file:./dev.db'

  // Only auto-migrate SQLite (file: protocol)
  if (url.startsWith('file:')) {
    const filePath = url.replace(/^file:/, '')
    const absPath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath)
    const dbExists = fs.existsSync(absPath)

    if (!dbExists) {
      console.log(JSON.stringify({ level: 'info', msg: 'ensureDb: running prisma migrate deploy', path: absPath }))
      try {
        execSync('npx prisma migrate deploy', {
          env: { ...process.env, DATABASE_URL: url },
          stdio: 'pipe',
        })
      } catch (e) {
        console.error(JSON.stringify({ level: 'error', msg: 'ensureDb: migrate failed', error: String(e) }))
        // Try db push as fallback (faster for new envs)
        try {
          execSync('npx prisma db push --skip-generate', {
            env: { ...process.env, DATABASE_URL: url },
            stdio: 'pipe',
          })
        } catch (e2) {
          console.error(JSON.stringify({ level: 'error', msg: 'ensureDb: db push also failed', error: String(e2) }))
          throw new Error('Could not initialise database.')
        }
      }
    }
  }

  global._dbReady = true
}
