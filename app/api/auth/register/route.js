import { prisma } from '../../../../lib/prisma'
import bcrypt from 'bcryptjs'
import { signToken, createSetCookieHeader } from '../../../../lib/auth'

export async function POST(request) {
    try {
        const body = await request.json()
        const { email, password, name } = body ?? {}

        if (!email || !password) {
            return new Response(JSON.stringify({ message: 'Missing email or password' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
        }

        const existing = await prisma.user.findUnique({ where: { email } })
        if (existing) {
            return new Response(JSON.stringify({ message: 'User already exists' }), { status: 409, headers: { 'Content-Type': 'application/json' } })
        }

        const hashed = await bcrypt.hash(password, 10)
        const user = await prisma.user.create({ data: { email, name: name || null, password: hashed } })

        const token = signToken({ id: user.id })
        const setCookie = createSetCookieHeader(token)

        const out = { id: user.id, email: user.email, name: user.name, image: user.image }
        return new Response(JSON.stringify(out), { status: 201, headers: { 'Content-Type': 'application/json', 'Set-Cookie': setCookie } })
    } catch (err) {
        console.error('Register error', err)
        return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }
}
