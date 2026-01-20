import { prisma } from '../../../lib/prisma'
import { getTokenFromRequest, verifyToken } from '../../../lib/auth'

export async function GET(request) {
    try {
        const url = new URL(request.url)
        const pageParam = url.searchParams.get('page') ?? '1'
        const limitParam = url.searchParams.get('limit') ?? '10'

        const page = parseInt(pageParam, 10)
        let limit = parseInt(limitParam, 10)

        if (isNaN(page) || page < 1) {
            return new Response(JSON.stringify({ message: 'Invalid page' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
        }

        if (isNaN(limit) || limit < 1) {
            return new Response(JSON.stringify({ message: 'Invalid limit' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
        }

        if (limit > 50) limit = 50

        const skip = (page - 1) * limit

        const images = await prisma.publishedImage.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' } })
        const total = await prisma.publishedImage.count()
        const totalPages = Math.ceil(total / limit)

        // include liked flag for authenticated user (using token cookie)
        const token = getTokenFromRequest(request)
        const payload = token ? verifyToken(token) : null
        let imagesOut = images
        if (payload?.id) {
            const imageIds = images.map(i => i.id)
            const likes = await prisma.like.findMany({ where: { userId: payload.id, imageId: { in: imageIds } }, select: { imageId: true } })
            const likedSet = new Set(likes.map(l => l.imageId))
            imagesOut = images.map(i => ({ ...i, liked: likedSet.has(i.id) }))
        }

        return new Response(JSON.stringify({ images: imagesOut, total, page, totalPages }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    } catch (err) {
        console.error('Feed GET error', err)
        return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }
}

export async function PUT(request) {
    try {
        const body = await request.json()
        const { id, action, toggle } = body ?? {}

        if (id === undefined) {
            return new Response(JSON.stringify({ message: 'Missing id' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
        }

        const idNum = Number(id)
        if (!Number.isInteger(idNum) || idNum <= 0) {
            return new Response(JSON.stringify({ message: 'Invalid id' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
        }

        const token = getTokenFromRequest(request)
        const payload = token ? verifyToken(token) : null
        if (!payload?.id) {
            return new Response(JSON.stringify({ message: 'Authentication required' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
        }

        // toggle like for authenticated user when toggle=true
        if (toggle) {
            try {
                const existing = await prisma.like.findUnique({ where: { userId_imageId: { userId: payload.id, imageId: idNum } } })
                if (existing) {
                    const [, updated] = await prisma.$transaction([
                        prisma.like.delete({ where: { id: existing.id } }),
                        prisma.publishedImage.update({ where: { id: idNum }, data: { hearts: { decrement: 1 } } }),
                    ])
                    return new Response(JSON.stringify({ ...updated, liked: false }), { status: 200, headers: { 'Content-Type': 'application/json' } })
                } else {
                    const [, updated] = await prisma.$transaction([
                        prisma.like.create({ data: { userId: payload.id, imageId: idNum } }),
                        prisma.publishedImage.update({ where: { id: idNum }, data: { hearts: { increment: 1 } } }),
                    ])
                    return new Response(JSON.stringify({ ...updated, liked: true }), { status: 200, headers: { 'Content-Type': 'application/json' } })
                }
            } catch (err) {
                console.error('Toggle like error', err)
                return new Response(JSON.stringify({ message: 'Not found or conflict' }), { status: 404, headers: { 'Content-Type': 'application/json' } })
            }
        }

        // allow atomic increment/decrement when action provided (admin or other use)
        if (action === 'increment' || action === 'decrement') {
            try {
                const updateData = action === 'increment' ? { hearts: { increment: 1 } } : { hearts: { decrement: 1 } }
                const updated = await prisma.publishedImage.update({ where: { id: idNum }, data: updateData })
                return new Response(JSON.stringify(updated), { status: 200, headers: { 'Content-Type': 'application/json' } })
            } catch (err) {
                console.error('Atomic update error', err)
                return new Response(JSON.stringify({ message: 'Not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } })
            }
        }

        return new Response(JSON.stringify({ message: 'Missing action or toggle' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    } catch (err) {
        console.error('Feed PUT error', err)
        return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }
}

export async function DELETE(request) {
    try {
        const body = await request.json().catch(() => ({}))
        const { deleteAll } = body ?? {}

        // Debug endpoint to delete all posts
        if (deleteAll) {
            await prisma.$transaction([
                prisma.like.deleteMany({}),
                prisma.publishedImage.deleteMany({}),
            ])
            return new Response(JSON.stringify({ message: 'All posts deleted' }), { status: 200, headers: { 'Content-Type': 'application/json' } })
        }

        return new Response(JSON.stringify({ message: 'Missing deleteAll flag' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    } catch (err) {
        console.error('Feed DELETE error', err)
        return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }
}
