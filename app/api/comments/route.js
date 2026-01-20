import { prisma } from '../../../lib/prisma'
import { getTokenFromRequest, verifyToken } from '../../../lib/auth'

export async function GET(request) {
    try {
        const url = new URL(request.url)
        const imageIdParam = url.searchParams.get('imageId')
        const imageId = Number(imageIdParam)
        if (!imageIdParam || Number.isNaN(imageId)) {
            return new Response(JSON.stringify({ message: 'Missing or invalid imageId' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
        }

        const comments = await prisma.comment.findMany({
            where: { imageId },
            orderBy: { createdAt: 'desc' },
            include: { author: { select: { id: true, name: true, email: true } } },
        })

        return new Response(JSON.stringify({ comments }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    } catch (err) {
        console.error('Comments GET error', err)
        return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }
}

export async function POST(request) {
    try {
        const token = getTokenFromRequest(request)
        const payload = token ? verifyToken(token) : null
        if (!payload?.id) {
            return new Response(JSON.stringify({ message: 'Authentication required' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
        }

        const body = await request.json()
        const { imageId, text } = body ?? {}
        if (!imageId || !text || typeof text !== 'string') {
            return new Response(JSON.stringify({ message: 'Missing imageId or text' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
        }

        const created = await prisma.comment.create({ data: { imageId: Number(imageId), text: text.trim(), authorId: payload.id }, include: { author: { select: { id: true, name: true, email: true } } } })

        return new Response(JSON.stringify(created), { status: 201, headers: { 'Content-Type': 'application/json' } })
    } catch (err) {
        console.error('Comments POST error', err)
        return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }
}

export async function DELETE(request) {
    try {
        const token = getTokenFromRequest(request)
        const payload = token ? verifyToken(token) : null
        if (!payload?.id) {
            return new Response(JSON.stringify({ message: 'Authentication required' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
        }

        const body = await request.json().catch(() => ({}))
        const { commentId } = body ?? {}
        if (!commentId) {
            return new Response(JSON.stringify({ message: 'Missing commentId' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
        }

        const existing = await prisma.comment.findUnique({ where: { id: Number(commentId) } })
        if (!existing) return new Response(JSON.stringify({ message: 'Not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } })
        if (existing.authorId !== payload.id) return new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403, headers: { 'Content-Type': 'application/json' } })

        await prisma.comment.delete({ where: { id: Number(commentId) } })
        return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    } catch (err) {
        console.error('Comments DELETE error', err)
        return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }
}
