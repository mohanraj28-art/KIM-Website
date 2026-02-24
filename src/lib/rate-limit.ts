// Simple in-memory rate limiter (use Redis/Upstash for production)
const requestCounts = new Map<string, { count: number; resetAt: number }>()

export async function rateLimit(
    key: string,
    maxRequests: number,
    windowSeconds: number
): Promise<{ success: boolean; remaining: number; resetAt: number }> {
    const now = Date.now()
    const windowMs = windowSeconds * 1000

    const current = requestCounts.get(key)

    if (!current || current.resetAt <= now) {
        const resetAt = now + windowMs
        requestCounts.set(key, { count: 1, resetAt })
        return { success: true, remaining: maxRequests - 1, resetAt }
    }

    if (current.count >= maxRequests) {
        return { success: false, remaining: 0, resetAt: current.resetAt }
    }

    current.count++
    return { success: true, remaining: maxRequests - current.count, resetAt: current.resetAt }
}

// Clean expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
    setInterval(() => {
        const now = Date.now()
        for (const [key, value] of requestCounts.entries()) {
            if (value.resetAt <= now) {
                requestCounts.delete(key)
            }
        }
    }, 5 * 60 * 1000)
}
