import { promises as fs } from 'fs'
import { join } from 'path'
import { randomUUID } from 'crypto'

export async function POST(request) {
    try {
        const body = await request.json()
        const { prompt } = body ?? {}

        if (prompt === undefined) {
            return new Response(JSON.stringify({ message: 'Missing prompt' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
        }

        if (typeof prompt !== 'string') {
            return new Response(JSON.stringify({ message: 'Prompt must be a string' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
        }

        const trimmed = prompt.trim()
        if (trimmed.length === 0) {
            return new Response(JSON.stringify({ message: 'Prompt cannot be empty' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
        }

        const apiKey = process.env.OPENAI_API_KEY
        if (!apiKey) {
            console.error('OPENAI_API_KEY not set')
            return new Response(JSON.stringify({ message: 'Server misconfiguration' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
        }

        const openAiRes = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({ model: 'dall-e-2', prompt: trimmed, n: 1, size: '512x512' }),
        })

        const json = await openAiRes.json()
        if (!openAiRes.ok) {
            console.error('OpenAI error', json)
            return new Response(JSON.stringify({ message: 'OpenAI API error', details: json }), { status: 500, headers: { 'Content-Type': 'application/json' } })
        }

        const imageUrl = json?.data?.[0]?.url ?? null
        if (!imageUrl) {
            console.error('No image url returned', json)
            return new Response(JSON.stringify({ message: 'No image returned from OpenAI', details: json }), { status: 500, headers: { 'Content-Type': 'application/json' } })
        }

        // Download the image from OpenAI
        const imageRes = await fetch(imageUrl)
        if (!imageRes.ok) {
            console.error('Failed to download image from OpenAI')
            return new Response(JSON.stringify({ message: 'Failed to download image' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
        }

        // Makes the image a random filename
        const buffer = await imageRes.arrayBuffer()
        const filename = `${randomUUID()}.png`
        const filepath = join(process.cwd(), 'public', 'images', filename)

        // Save image to public folder
        await fs.writeFile(filepath, Buffer.from(buffer))

        const savedImageUrl = `/images/${filename}`

        return new Response(JSON.stringify({ imageUrl: savedImageUrl, prompt: trimmed }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    } catch (err) {
        console.error('Generate handler error', err)
        return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }
}
