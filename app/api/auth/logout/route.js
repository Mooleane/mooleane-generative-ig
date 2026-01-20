import { createClearCookieHeader } from '../../../../lib/auth'

export async function POST() {
    try {
        const clear = createClearCookieHeader()
        return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json', 'Set-Cookie': clear } })
    } catch (err) {
        console.error('Logout error', err)
        return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }
}
