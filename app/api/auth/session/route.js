import { prisma } from '../../../../lib/prisma'
import { getTokenFromRequest, verifyToken } from '../../../../lib/auth'

export async function GET(request) {
    try {
        const token = getTokenFromRequest(request)
        if (!token) return new Response(JSON.stringify({ session: null }), { status: 200, headers: { 'Content-Type': 'application/json' } })

        const payload = verifyToken(token)
        if (!payload?.id) return new Response(JSON.stringify({ session: null }), { status: 200, headers: { 'Content-Type': 'application/json' } })

        const user = await prisma.user.findUnique({ where: { id: payload.id }, select: { id: true, email: true, name: true, image: true } })
        if (!user) return new Response(JSON.stringify({ session: null }), { status: 200, headers: { 'Content-Type': 'application/json' } })

        return new Response(JSON.stringify({ session: { user } }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    } catch (err) {
        console.error('Session error', err)
        return new Response(JSON.stringify({ session: null }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }
}
