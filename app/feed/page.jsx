"use client"

import { useState } from "react"

export default function FeedPage() {
    const [page] = useState(1)
    const [images] = useState([])

    return (
        <main style={{ fontFamily: 'Inter, ui-sans-serif, system-ui', padding: 24, maxWidth: 920, margin: '0 auto' }}>
            <h1 style={{ fontSize: 28 }}>Feed</h1>
            <p style={{ color: '#666' }}>Published AI images will appear here.</p>

            <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                {images.length === 0 && (
                    <div style={{ padding: 18, border: '1px dashed #ddd', borderRadius: 8, color: '#666' }}>No images yet.</div>
                )}
            </div>

            <div style={{ marginTop: 18, display: 'flex', justifyContent: 'center', gap: 8 }}>
                <button disabled style={{ padding: '8px 12px', borderRadius: 8 }}>Previous</button>
                <span style={{ alignSelf: 'center', color: '#444' }}>Page {page}</span>
                <button disabled style={{ padding: '8px 12px', borderRadius: 8 }}>Next</button>
            </div>
        </main>
    )
}
