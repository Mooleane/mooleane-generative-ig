"use client"

import { useState } from "react"

export default function Home() {
    const [prompt, setPrompt] = useState("")
    const [loading, setLoading] = useState(false)
    const [imageUrl, setImageUrl] = useState(null)

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
                        <button disabled={loading || !prompt.trim()} style={buttonStyle}>Generate</button>
                        <button disabled={!imageUrl} style={{ ...buttonStyle, background: '#eee', color: '#333' }}>Publish</button>
                        <a href="/feed" style={{ textDecoration: 'none', color: '#0366d6', alignSelf: 'center', marginTop: 8 }}>View Feed</a>
                    </div>
                </div>

                <div style={{ marginTop: 18 }}>
                    {loading && <p>Generating image…</p>}
                    {!loading && imageUrl && (
                        <div style={{ marginTop: 12 }}>
                            <img src={imageUrl} alt="Generated" style={{ maxWidth: '100%', borderRadius: 8 }} />
                            <p style={{ color: '#666', marginTop: 8 }}>Prompt: {prompt}</p>
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
