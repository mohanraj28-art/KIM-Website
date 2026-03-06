// Prisma client singleton for Next.js
import { PrismaClient } from '../generated/client'

declare global {
  // eslint-disable-next-line no-var
  var __db: PrismaClient | undefined
}

export const db: PrismaClient =
  global.__db ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  global.__db = db
}

export const prisma = db

/**
 * Helper to handle Prisma errors or common data transformations
 */
export async function withDb<T>(fn: (db: PrismaClient) => Promise<T>): Promise<T> {
  try {
    return await fn(prisma)
  } catch (error) {
    console.error('[Database Error]', error)
    throw error
  }
}

export default prisma
