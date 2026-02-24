// Neo4j driver singleton for Next.js
import neo4j, { Driver, Session, QueryResult } from 'neo4j-driver'

declare global {
  // eslint-disable-next-line no-var
  var __neo4jDriver: Driver | undefined
}

function createDriver(): Driver {
  const uri = process.env.NEO4J_URI || 'bolt://localhost:7687'
  const user = process.env.NEO4J_USERNAME || 'neo4j'
  const password = process.env.NEO4J_PASSWORD || 'password'

  return neo4j.driver(uri, neo4j.auth.basic(user, password), {
    maxConnectionPoolSize: 50,
    connectionAcquisitionTimeout: 10000,
    logging: {
      level: process.env.NODE_ENV === 'development' ? 'warn' : 'error',
      logger: (level, message) => {
        if (level === 'error') console.error('[Neo4j]', message)
        else if (process.env.NODE_ENV === 'development') console.warn('[Neo4j]', message)
      },
    },
  })
}

// Singleton driver — reused across hot-reloads in dev
export const driver: Driver = global.__neo4jDriver ?? createDriver()
export const int = neo4j.int

if (process.env.NODE_ENV !== 'production') {
  global.__neo4jDriver = driver
}

/**
 * Safely convert a value from Neo4j to a JS number.
 * Handles both Neo4j Integer objects and native JS numbers/floats.
 */
export function toNum(val: any, fallback = 0): number {
  if (val === null || val === undefined) return fallback
  if (neo4j.isInt(val)) return val.toNumber()
  if (typeof val === 'number') return val
  const parsed = parseFloat(val)
  return isNaN(parsed) ? fallback : parsed
}

/**
 * Run a Cypher query and return raw QueryResult.
 * Automatically opens and closes a session.
 */
export async function runQuery(
  cypher: string,
  params: Record<string, unknown> = {}
): Promise<QueryResult> {
  const session: Session = driver.session({
    database: process.env.NEO4J_DATABASE || 'neo4j',
  })
  try {
    return await session.run(cypher, params)
  } finally {
    await session.close()
  }
}

/**
 * Run multiple queries in a single write transaction (atomic).
 */
export async function runTransaction(
  queries: Array<{ cypher: string; params?: Record<string, unknown> }>
): Promise<QueryResult[]> {
  const session: Session = driver.session({
    database: process.env.NEO4J_DATABASE || 'neo4j',
  })
  try {
    return await session.executeWrite(async (tx) => {
      const results: QueryResult[] = []
      for (const q of queries) {
        results.push(await tx.run(q.cypher, q.params ?? {}))
      }
      return results
    })
  } finally {
    await session.close()
  }
}

/**
 * Convert a Neo4j record's field to a plain JS object,
 * unwrapping Neo4j Integer types.
 */
export function toPlain<T>(record: Record<string, unknown>): T {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(record)) {
    if (neo4j.isInt(value)) {
      result[key] = value.toNumber()
    } else if (value instanceof Date) {
      result[key] = value.toISOString()
    } else if (value && typeof value === 'object' && 'year' in (value as object)) {
      // Neo4j DateTime
      result[key] = (value as { toStandardDate(): Date }).toStandardDate().toISOString()
    } else {
      result[key] = value
    }
  }
  return result as T
}

export default driver
