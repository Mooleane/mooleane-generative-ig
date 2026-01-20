
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
    const [expandedPost, setExpandedPost] = useState(null)
    const [comments, setComments] = useState({})
    const [loadingComments, setLoadingComments] = useState({})
    const [commentText, setCommentText] = useState({})
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

    async function fetchComments(imageId) {
        setLoadingComments(prev => ({ ...prev, [imageId]: true }))
        try {
            const res = await fetch(`/api/comments?imageId=${imageId}`)
            const data = await res.json().catch(() => ({}))
            if (res.ok) {
                setComments(prev => ({ ...prev, [imageId]: data.comments ?? [] }))
            }
        } catch (err) {
            console.error('Fetch comments error', err)
        } finally {
            setLoadingComments(prev => ({ ...prev, [imageId]: false }))
        }
    }

    async function addComment(imageId) {
        const text = commentText[imageId]?.trim()
        if (!text) return

        if (!session) {
            router.push('/auth/login')
            return
        }

        try {
            const res = await fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageId, text }),
            })

            if (res.ok) {
                const newComment = await res.json()
                setComments(prev => ({ ...prev, [imageId]: [newComment, ...(prev[imageId] ?? [])] }))
                setCommentText(prev => ({ ...prev, [imageId]: '' }))
            }
        } catch (err) {
            console.error('Add comment error', err)
        }
    }

    async function deleteComment(imageId, commentId) {
        try {
            const res = await fetch('/api/comments', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ commentId }),
            })

            if (res.ok) {
                setComments(prev => ({ ...prev, [imageId]: prev[imageId]?.filter(c => c.id !== commentId) ?? [] }))
            }
        } catch (err) {
            console.error('Delete comment error', err)
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
        // removed debug delete-all handler
    }

    return (
        <main style={{ fontFamily: 'Inter, ui-sans-serif, system-ui', padding: 24, maxWidth: 920, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ fontSize: 28 }}>Feed</h1>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button onClick={() => router.push('/')} style={{ padding: '6px 12px', borderRadius: 6, background: '#e6f4ea', color: '#055a28', fontSize: 12, border: 'none', cursor: 'pointer' }}>🔙 Generate</button>
                </div>
            </div>
            <p style={{ color: '#666' }}>Published AI images will appear here.</p>

            {loading && <p>Loading…</p>}
            {error && <p style={{ color: 'crimson' }}>{error}</p>}

            <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                {images.length === 0 && !loading && (
                    <div style={{ padding: 18, border: '1px dashed #ddd', borderRadius: 8, color: '#666' }}>No images yet.</div>
                )}

                {images.map((img) => (
                    <div key={img.id} style={{ border: '1px solid #eee', borderRadius: 8, padding: 8, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <div style={{ fontSize: 13, color: '#222', fontWeight: 600 }}>
                                {img.ownerName || img.ownerEmail || 'Anonymous'}
                            </div>
                            {session?.id === img.ownerId && (
                                <button
                                    onClick={async () => {
                                        if (!confirm('Delete this post?')) return
                                        try {
                                            const res = await fetch('/api/feed', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: img.id }) })
                                            if (res.ok) {
                                                setImages(prev => prev.filter(p => p.id !== img.id))
                                            } else {
                                                const d = await res.json().catch(() => ({}))
                                                alert(d?.message || 'Failed to delete')
                                            }
                                        } catch (err) {
                                            console.error('Delete post error', err)
                                            alert('Error deleting post')
                                        }
                                    }}
                                    style={{ padding: '6px 8px', borderRadius: 6, background: '#ffcdd2', color: '#c62828', border: 'none', cursor: 'pointer' }}
                                >
                                    Delete
                                </button>
                            )}
                        </div>
                        {
                            (() => {
                                const src = img.imageUrl || `/api/images/${img.id}`
                                return <img src={src} alt={img.prompt} style={{ width: '100%', borderRadius: 6, marginBottom: 8 }} />
                            })()
                        }
                        <p style={{ color: '#333', fontSize: 14, margin: '0 0 8px', fontWeight: 500 }}>{img.prompt}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <small style={{ color: '#666' }}>{new Date(img.createdAt).toLocaleString()}</small>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                {
                                    (() => {
                                        const isLiked = !!img.liked
                                        return (
                                            <>
                                                <button onClick={() => toggleHeart(img)} disabled={inFlight.has(img.id)} style={{ padding: '6px 8px', borderRadius: 6, background: isLiked ? '#ffebee' : undefined, border: 'none', cursor: 'pointer' }} aria-pressed={isLiked}>{isLiked ? '💖' : '🤍'}</button>
                                                <span style={{ fontSize: 14 }}>{img.hearts}</span>
                                                <button onClick={() => {
                                                    if (expandedPost === img.id) {
                                                        setExpandedPost(null)
                                                    } else {
                                                        setExpandedPost(img.id)
                                                        if (!comments[img.id]) fetchComments(img.id)
                                                    }
                                                }} style={{ padding: '6px 8px', borderRadius: 6, border: 'none', background: expandedPost === img.id ? '#e3f2fd' : undefined, cursor: 'pointer' }}>💬 Comments</button>
                                            </>
                                        )
                                    })()
                                }
                            </div>
                        </div>

                        {expandedPost === img.id && (
                            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #eee' }}>
                                {loadingComments[img.id] && <p style={{ fontSize: 12, color: '#666' }}>Loading comments…</p>}

                                {!loadingComments[img.id] && (
                                    <>
                                        <div style={{ marginBottom: 12 }}>
                                            {session ? (
                                                <>
                                                    <textarea
                                                        placeholder="Add a comment..."
                                                        value={commentText[img.id] ?? ''}
                                                        onChange={(e) => setCommentText(prev => ({ ...prev, [img.id]: e.target.value }))}
                                                        style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ddd', fontSize: 12, fontFamily: 'inherit', resize: 'vertical', minHeight: 60 }}
                                                    />
                                                    <button
                                                        onClick={() => addComment(img.id)}
                                                        disabled={!commentText[img.id]?.trim()}
                                                        style={{ marginTop: 6, padding: '6px 12px', borderRadius: 6, background: '#007bff', color: 'white', border: 'none', cursor: 'pointer', fontSize: 12 }}
                                                    >
                                                        Post Comment
                                                    </button>
                                                </>
                                            ) : (
                                                <div>
                                                    <button onClick={() => router.push('/auth/login')} style={{ padding: '6px 10px', borderRadius: 6 }}>Sign in to comment</button>
                                                </div>
                                            )}
                                        </div>

                                        <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                                            {!comments[img.id] || comments[img.id].length === 0 ? (
                                                <p style={{ fontSize: 12, color: '#999' }}>No comments yet.</p>
                                            ) : (
                                                comments[img.id].map(comment => (
                                                    <div key={comment.id} style={{ paddingBottom: 8, marginBottom: 8, borderBottom: '1px solid #f0f0f0' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                                                            <div>
                                                                <span style={{ fontSize: 12, fontWeight: 500, color: '#333' }}>{comment.author?.name || comment.author?.email || 'Anonymous'}</span>
                                                                <span style={{ fontSize: 11, color: '#999', marginLeft: 8 }}>{new Date(comment.createdAt).toLocaleString()}</span>
                                                            </div>
                                                            {session?.id === comment.authorId && (
                                                                <button
                                                                    onClick={() => deleteComment(img.id, comment.id)}
                                                                    style={{ fontSize: 10, background: 'none', border: 'none', color: '#c62828', cursor: 'pointer' }}
                                                                >
                                                                    Delete
                                                                </button>
                                                            )}
                                                        </div>
                                                        <p style={{ fontSize: 12, color: '#555', margin: 0 }}>{comment.text}</p>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
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
