import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string | null, options?: Intl.DateTimeFormatOptions): string {
    if (!date) return 'N/A'
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        ...options,
    }).format(new Date(date))
}

export function formatDateTime(date: Date | string | null): string {
    if (!date) return 'N/A'
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(date))
}

export function formatRelativeTime(date: Date | string): string {
    const now = new Date()
    const then = new Date(date)
    const diffMs = now.getTime() - then.getTime()
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffSecs / 60)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffSecs < 60) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return formatDate(date)
}

export function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
}

export function maskEmail(email: string): string {
    const [local, domain] = email.split('@')
    const masked = local.slice(0, 2) + '***' + local.slice(-1)
    return `${masked}@${domain}`
}

export function maskPhone(phone: string): string {
    return phone.replace(/(\d{3})\d+(\d{2})/, '$1****$2')
}

export function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
}

export function generateOTP(length: number = 6): string {
    const digits = '0123456789'
    let otp = ''
    for (let i = 0; i < length; i++) {
        otp += digits[Math.floor(Math.random() * 10)]
    }
    return otp
}

export function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isDisposableEmail(email: string): boolean {
    const domain = email.split('@')[1]?.toLowerCase()
    const disposedDomains = [
        'mailinator.com', 'guerrillamail.com', 'tempmail.com', 'throwaway.email',
        'yopmail.com', '10minutemail.com', 'sharklasers.com', 'guerrillamailblock.com',
        'trashmail.com', 'fakeinbox.com', 'maildrop.cc', 'throwam.com'
    ]
    return disposedDomains.includes(domain)
}

export function generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = []
    for (let i = 0; i < count; i++) {
        const code = Math.random().toString(36).substring(2, 7).toUpperCase() + '-' +
            Math.random().toString(36).substring(2, 7).toUpperCase()
        codes.push(code)
    }
    return codes
}

export function formatBytes(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`
}

export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
}

export function parseUserAgent(ua: string): { browser: string; os: string; device: string } {
    const browser = ua.includes('Chrome') ? 'Chrome' :
        ua.includes('Firefox') ? 'Firefox' :
            ua.includes('Safari') ? 'Safari' :
                ua.includes('Edge') ? 'Edge' : 'Unknown'
    const os = ua.includes('Windows') ? 'Windows' :
        ua.includes('Mac') ? 'macOS' :
            ua.includes('Linux') ? 'Linux' :
                ua.includes('Android') ? 'Android' :
                    ua.includes('iOS') ? 'iOS' : 'Unknown'
    const device = ua.includes('Mobile') ? 'Mobile' :
        ua.includes('Tablet') ? 'Tablet' : 'Desktop'
    return { browser, os, device }
}
