
"use client"

import { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'

export default function FeedPage() {
    const [page, setPage] = useState(1)
    const [images, setImages] = useState([])
    const [loading, setLoading] = useState(false)
    const [totalPages, setTotalPages] = useState(1)
    const [error, setError] = useState(null)
    const [session, setSession] = useState(null)
    const [inFlight, setInFlight] = useState(new Set())
    const router = useRouter()

    useEffect(() => {
        fetchPage(page)
    }, [page])

    useEffect(() => {
        let mounted = true
        fetch('/api/auth/session')
            .then(r => r.json())
            .then(d => { if (mounted) setSession(d.session?.user ?? null) })
            .catch(() => { })
        return () => { mounted = false }
    }, [])

    async function fetchPage(p = 1) {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch(`/api/feed?page=${p}&limit=10`)
            const data = await res.json().catch(() => ({}))
            if (!res.ok) {
                setError(data?.message || 'Failed to load feed')
                return
            }
            setImages(data.images ?? [])
            setTotalPages(data.totalPages ?? 1)
        } catch (err) {
            console.error('Fetch feed error', err)
            setError('Network error')
        } finally {
            setLoading(false)
        }
    }

    async function toggleHeart(item) {
        if (inFlight.has(item.id)) return

        if (!session) {
            router.push('/auth/login')
            return
        }

        const isLiked = !!item.liked
        // optimistic update
        const optimistic = images.map(i => i.id === item.id ? { ...i, hearts: i.hearts + (isLiked ? -1 : 1), liked: !isLiked } : i)
        setImages(optimistic)

        // mark in-flight
        setInFlight(prev => new Set(prev).add(item.id))

        try {
            const res = await fetch('/api/feed', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: item.id, toggle: true }),
            })

            if (!res.ok) {
                // revert optimistic
                setImages((prev) => prev.map(i => i.id === item.id ? item : i))
                return
            }

            const data = await res.json().catch(() => null)
            if (data) {
                setImages((prev) => prev.map(i => i.id === data.id ? data : i))
            }
        } catch (err) {
            console.error('Heart update error', err)
            setImages((prev) => prev.map(i => i.id === item.id ? item : i))
        } finally {
            setInFlight(prev => {
                const copy = new Set(prev)
                copy.delete(item.id)
                return copy
            })
        }
    }

    async function deleteAllPosts() {
        if (!confirm('Are you sure you want to delete ALL posts? This cannot be undone.')) return

        try {
            const res = await fetch('/api/feed', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ deleteAll: true }),
            })

            if (res.ok) {
                setImages([])
                setTotalPages(1)
                setPage(1)
                alert('All posts deleted')
            } else {
                alert('Failed to delete posts')
            }
        } catch (err) {
            console.error('Delete all error', err)
            alert('Error deleting posts')
        }
    }

    return (
        <main style={{ fontFamily: 'Inter, ui-sans-serif, system-ui', padding: 24, maxWidth: 920, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ fontSize: 28 }}>Feed</h1>
                <button onClick={deleteAllPosts} style={{ padding: '6px 12px', borderRadius: 6, background: '#ffcdd2', color: '#c62828', fontSize: 12, fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>🗑️ DEBUG: Delete All</button>
            </div>
            <p style={{ color: '#666' }}>Published AI images will appear here.</p>

            {loading && <p>Loading…</p>}
            {error && <p style={{ color: 'crimson' }}>{error}</p>}

            <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                {images.length === 0 && !loading && (
                    <div style={{ padding: 18, border: '1px dashed #ddd', borderRadius: 8, color: '#666' }}>No images yet.</div>
                )}

                {images.map((img) => (
                    <div key={img.id} style={{ border: '1px solid #eee', borderRadius: 8, padding: 8 }}>
                        <img src={img.imageUrl} alt={img.prompt} style={{ width: '100%', borderRadius: 6 }} />
                        <p style={{ color: '#333', fontSize: 14, margin: '8px 0 4px' }}>{img.prompt}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <small style={{ color: '#666' }}>{new Date(img.createdAt).toLocaleString()}</small>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                {
                                    (() => {
                                        const isLiked = !!img.liked
                                        return (
                                            <>
                                                <button onClick={() => toggleHeart(img)} disabled={inFlight.has(img.id)} style={{ padding: '6px 8px', borderRadius: 6, background: isLiked ? '#ffebee' : undefined }} aria-pressed={isLiked}>{isLiked ? '💖' : '🤍'}</button>
                                                <span>{img.hearts}</span>
                                            </>
                                        )
                                    })()
                                }
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: 18, display: 'flex', justifyContent: 'center', gap: 8 }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} style={{ padding: '8px 12px', borderRadius: 8 }}>Previous</button>
                <span style={{ alignSelf: 'center', color: '#444' }}>Page {page} / {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} style={{ padding: '8px 12px', borderRadius: 8 }}>Next</button>
            </div>
        </main>
    )
}
