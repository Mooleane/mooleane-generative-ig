import { prisma } from '../../../lib/prisma'
import { getTokenFromRequest, verifyToken } from '../../../lib/auth'
import { randomUUID } from 'crypto'

export async function POST(request) {
    try {
        const body = await request.json()
        const { imageUrl, prompt } = body ?? {}

        if (imageUrl === undefined) {
            return new Response(JSON.stringify({ message: 'Missing imageUrl' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
        }

        if (typeof imageUrl !== 'string' || !imageUrl.trim()) {
            return new Response(JSON.stringify({ message: 'imageUrl must be a non-empty string' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
        }

        if (prompt === undefined) {
            return new Response(JSON.stringify({ message: 'Missing prompt' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
        }

        if (typeof prompt !== 'string') {
            return new Response(JSON.stringify({ message: 'prompt must be a string' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
        }

        const token = getTokenFromRequest(request)
        const payload = token ? verifyToken(token) : null
        if (!payload?.id) {
            return new Response(JSON.stringify({ message: 'Authentication required' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
        }

        // Download the image from the temporary URL and store in DB instead of filesystem
        let finalImageUrl = imageUrl.trim()
        let created
        try {
            const imageRes = await fetch(finalImageUrl)
            if (imageRes.ok) {
                const buffer = await imageRes.arrayBuffer()
                const mime = imageRes.headers.get('content-type') || 'application/octet-stream'

                created = await prisma.publishedImage.create({ data: { imageUrl: null, imageData: Buffer.from(buffer), imageMime: mime, stored: true, prompt, ownerId: payload.id } })
            } else {
                // fallback to storing the remote URL if download failed
                created = await prisma.publishedImage.create({ data: { imageUrl: finalImageUrl, prompt, ownerId: payload.id } })
            }
        } catch (err) {
            console.error('Failed to download and store image', err)
            // If saving fails, still proceed with the original URL
            created = await prisma.publishedImage.create({ data: { imageUrl: finalImageUrl, prompt, ownerId: payload.id } })
        }

        const out = {
            id: created.id,
            imageUrl: created.imageUrl ? created.imageUrl : `/api/images/${created.id}`,
            prompt: created.prompt,
            hearts: created.hearts,
            createdAt: created.createdAt,
            stored: !!created.stored,
            ownerId: created.ownerId ?? null,
        }

        return new Response(JSON.stringify(out), { status: 201, headers: { 'Content-Type': 'application/json' } })
    } catch (err) {
        console.error('Publish handler error', err)
        return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }
}
