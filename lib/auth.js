import { createHmac, timingSafeEqual } from 'crypto'

const TOKEN_NAME = 'token'

function base64UrlEncode(buf) {
    return Buffer.from(buf).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

function base64UrlDecode(str) {
    str = str.replace(/-/g, '+').replace(/_/g, '/')
    while (str.length % 4) str += '='
    return Buffer.from(str, 'base64')
}

export function signToken(payload) {
    const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'dev-secret'
    const header = { alg: 'HS256', typ: 'JWT' }
    const now = Math.floor(Date.now() / 1000)
    const exp = now + 7 * 24 * 60 * 60
    const body = { ...payload, iat: now, exp }

    const segments = [base64UrlEncode(JSON.stringify(header)), base64UrlEncode(JSON.stringify(body))]
    const signingInput = segments.join('.')
    const sig = createHmac('sha256', secret).update(signingInput).digest()
    segments.push(base64UrlEncode(sig))
    return segments.join('.')
}

export function verifyToken(token) {
    try {
        const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'dev-secret'
        const parts = token.split('.')
        if (parts.length !== 3) return null
        const signingInput = parts[0] + '.' + parts[1]
        const sig = base64UrlDecode(parts[2])
        const expected = createHmac('sha256', secret).update(signingInput).digest()
        if (sig.length !== expected.length) return null
        if (!timingSafeEqual(sig, expected)) return null
        const payload = JSON.parse(base64UrlDecode(parts[1]).toString('utf8'))
        const now = Math.floor(Date.now() / 1000)
        if (payload.exp && now >= payload.exp) return null
        return payload
    } catch (e) {
        return null
    }
}

function parseCookies(cookieHeader) {
    if (!cookieHeader) return {}
    return Object.fromEntries(cookieHeader.split(';').map(c => c.trim().split('=').map(decodeURIComponent)))
}

export function getTokenFromRequest(request) {
    const cookieHeader = request.headers.get('cookie') || ''
    const cookies = parseCookies(cookieHeader)
    return cookies[TOKEN_NAME]
}

export function createSetCookieHeader(token) {
    const maxAge = 7 * 24 * 60 * 60
    return `${TOKEN_NAME}=${encodeURIComponent(token)}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax; Secure=${process.env.NODE_ENV === 'production'}`
}

export function createClearCookieHeader() {
    return `token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax; Secure=${process.env.NODE_ENV === 'production'}`
}
