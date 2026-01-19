import { prisma } from '../../../lib/prisma'

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

        return new Response(JSON.stringify({ images, total, page, totalPages }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    } catch (err) {
        console.error('Feed GET error', err)
        return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }
}

export async function PUT(request) {
    try {
        const body = await request.json()
        const { id, hearts } = body ?? {}

        if (id === undefined) {
            return new Response(JSON.stringify({ message: 'Missing id' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
        }

        if (hearts === undefined) {
            return new Response(JSON.stringify({ message: 'Missing hearts' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
        }

        const idNum = Number(id)
        const heartsNum = Number(hearts)

        if (!Number.isInteger(idNum) || idNum <= 0) {
            return new Response(JSON.stringify({ message: 'Invalid id' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
        }

        if (!Number.isInteger(heartsNum) || heartsNum < 0) {
            return new Response(JSON.stringify({ message: 'Invalid hearts' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
        }

        try {
            const updated = await prisma.publishedImage.update({ where: { id: idNum }, data: { hearts: heartsNum } })
            return new Response(JSON.stringify(updated), { status: 200, headers: { 'Content-Type': 'application/json' } })
        } catch (err) {
            // likely not found
            console.error('Update error', err)
            return new Response(JSON.stringify({ message: 'Not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } })
        }
    } catch (err) {
        console.error('Feed PUT error', err)
        return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }
}
