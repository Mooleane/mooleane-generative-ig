import { prisma } from '../../../../lib/prisma'
import bcrypt from 'bcryptjs'
import { signToken, createSetCookieHeader } from '../../../../lib/auth'

export async function POST(request) {
    try {
        const body = await request.json()
        const { email, password } = body ?? {}

        if (!email || !password) {
            return new Response(JSON.stringify({ message: 'Missing email or password' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
        }

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user || !user.password) {
            return new Response(JSON.stringify({ message: 'Invalid credentials' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
        }

        const ok = await bcrypt.compare(password, user.password)
        if (!ok) {
            return new Response(JSON.stringify({ message: 'Invalid credentials' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
        }

        const token = signToken({ id: user.id })
        const setCookie = createSetCookieHeader(token)

        const out = { id: user.id, email: user.email, name: user.name, image: user.image }
        return new Response(JSON.stringify(out), { status: 200, headers: { 'Content-Type': 'application/json', 'Set-Cookie': setCookie } })
    } catch (err) {
        console.error('Login error', err)
        return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }
}
