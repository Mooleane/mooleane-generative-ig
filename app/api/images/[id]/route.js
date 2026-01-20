import { prisma } from '../../../../lib/prisma'

export async function GET(request, context) {
    try {
        const params = await context.params
        const id = Number(params.id)
        if (!Number.isInteger(id) || id <= 0) {
            return new Response(JSON.stringify({ message: 'Invalid id' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
        }

        const img = await prisma.publishedImage.findUnique({ where: { id } })
        if (!img) return new Response(JSON.stringify({ message: 'Not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } })

        if (img.stored && img.imageData) {
            const buf = img.imageData
            const mime = img.imageMime || 'application/octet-stream'
            return new Response(Buffer.from(buf), { status: 200, headers: { 'Content-Type': mime } })
        }

        // If not stored, proxy or redirect to remote URL
        if (img.imageUrl) {
            try {
                const res = await fetch(img.imageUrl)
                const body = await res.arrayBuffer()
                const mime = res.headers.get('content-type') || 'application/octet-stream'
                return new Response(body, { status: res.status, headers: { 'Content-Type': mime } })
            } catch (err) {
                console.error('Proxy fetch failed', err)
                return new Response(JSON.stringify({ message: 'Failed to retrieve image' }), { status: 502, headers: { 'Content-Type': 'application/json' } })
            }
        }

        return new Response(JSON.stringify({ message: 'No image available' }), { status: 404, headers: { 'Content-Type': 'application/json' } })
    } catch (err) {
        console.error('Image GET error', err)
        return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }
}
