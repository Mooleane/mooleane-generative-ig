"use client"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'

export default function Home() {
    const [session, setSession] = useState(null)
    const router = useRouter()

    useEffect(() => {
        let mounted = true
        fetch('/api/auth/session').then(r => r.json()).then(d => { if (mounted) setSession(d.session?.user ?? null) }).catch(() => { })
        return () => { mounted = false }
    }, [])
    const [prompt, setPrompt] = useState("")
    const [loading, setLoading] = useState(false)
    const [imageUrl, setImageUrl] = useState(null)
    const [error, setError] = useState(null)
    const [publishing, setPublishing] = useState(false)
    const [published, setPublished] = useState(null)

    async function generateImage() {
        setError(null)
        setImageUrl(null)
        setLoading(true)
        try {
            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt }),
            })

            const data = await res.json().catch(() => ({}))
            if (!res.ok) {
                const msg = data?.message || 'Generation failed'
                setError(msg)
                setLoading(false)
                return
            }

            if (!data?.imageUrl) {
                setError('No image returned')
                setLoading(false)
                return
            }

            setImageUrl(data.imageUrl)
        } catch (err) {
            console.error('Generate error', err)
            setError('Network error')
        } finally {
            setLoading(false)
        }
    }

    async function publishImage() {
        if (!imageUrl) return
        setPublishing(true)
        setError(null)
        try {
            const res = await fetch('/api/publish', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageUrl, prompt }),
            })
            const data = await res.json().catch(() => ({}))
            if (!res.ok) {
                setError(data?.message || 'Publish failed')
                return
            }

            setPublished(data)
        } catch (err) {
            console.error('Publish error', err)
            setError('Network error')
        } finally {
            setPublishing(false)
        }
    }

    return (
        <main style={{
            fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'center',
            padding: 24,
            gap: 24,
        }}>
            <div style={{ width: '100%', maxWidth: 920 }}>
                <h1 style={{ fontSize: 32, margin: 0 }}>Generate an AI Image</h1>
                <p style={{ marginTop: 8, color: '#444' }}>Enter a prompt and click Generate.</p>

                <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
                    <textarea
                        aria-label="prompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe the image you want to generate"
                        style={{ flex: 1, minHeight: 120, padding: 12, fontSize: 14, borderRadius: 8, border: '1px solid #e6e6e6' }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <button onClick={generateImage} disabled={loading || !prompt.trim()} style={buttonStyle}>{loading ? 'Generating…' : 'Generate'}</button>
                        <button onClick={session ? publishImage : () => router.push('/auth/login')} disabled={!imageUrl || publishing} style={{ ...buttonStyle, background: publishing ? '#ddd' : '#eee', color: publishing ? '#666' : '#333' }}>{session ? (publishing ? 'Publishing…' : 'Publish') : 'Sign in to publish'}</button>
                        <a href="/feed" style={{ textDecoration: 'none', color: '#0366d6', alignSelf: 'center', marginTop: 8 }}>View Feed</a>
                    </div>
                </div>

                <div style={{ marginTop: 8 }}>
                    {session ? (
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <img src={session.image ?? null} alt="avatar" style={{ width: 32, height: 32, borderRadius: 999 }} />
                            <span style={{ color: '#333' }}>Signed in as {session.email || session.name}</span>
                            <button onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); setSession(null) }} style={{ marginLeft: 8, padding: '6px 10px', borderRadius: 6 }}>Sign out</button>
                        </div>
                    ) : (
                        <div>
                            <button onClick={() => router.push('/auth/login')} style={{ padding: '6px 10px', borderRadius: 6 }}>Sign in</button>
                        </div>
                    )}
                </div>

                <div style={{ marginTop: 18 }}>
                    {loading && <p>Generating image…</p>}
                    {error && <p style={{ color: 'crimson' }}>{error}</p>}
                    {!loading && imageUrl && (
                        <div style={{ marginTop: 12 }}>
                            <img src={imageUrl} alt="Generated" style={{ maxWidth: '100%', borderRadius: 8 }} />
                            <p style={{ color: '#666', marginTop: 8 }}>Prompt: {prompt}</p>
                            {published && (
                                <p style={{ color: 'green', marginTop: 8 }}>Published (id: {published.id})</p>
                            )}
                        </div>
                    )}
                    {!loading && !imageUrl && (
                        <div style={{ marginTop: 12, padding: 18, border: '1px dashed #ddd', borderRadius: 8, color: '#666' }}>
                            No image generated yet.
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}

const buttonStyle = {
    padding: '10px 14px',
    borderRadius: 8,
    border: 'none',
    background: '#0366d6',
    color: 'white',
    cursor: 'pointer',
}


