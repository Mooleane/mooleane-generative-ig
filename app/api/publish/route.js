import { prisma } from '../../../lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/route'
import { promises as fs } from 'fs'
import { join } from 'path'
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

        const session = await getServerSession(authOptions)
        if (!session) {
            return new Response(JSON.stringify({ message: 'Authentication required' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
        }

        // Download and save the image from the temporary URL
        let finalImageUrl = imageUrl.trim()
        try {
            const imageRes = await fetch(finalImageUrl)
            if (imageRes.ok) {
                const buffer = await imageRes.arrayBuffer()
                const filename = `${randomUUID()}.png`
                const filepath = join(process.cwd(), 'public', 'images', filename)

                // Save image to public folder
                await fs.writeFile(filepath, Buffer.from(buffer))

                // Use the local URL instead of the temporary one
                finalImageUrl = `/images/${filename}`
            }
        } catch (err) {
            console.error('Failed to download and save image', err)
            // If saving fails, still proceed with the original URL
        }

        const created = await prisma.publishedImage.create({ data: { imageUrl: finalImageUrl, prompt, ownerId: session.user.id } })

        return new Response(JSON.stringify(created), { status: 201, headers: { 'Content-Type': 'application/json' } })
    } catch (err) {
        console.error('Publish handler error', err)
        return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }
}
