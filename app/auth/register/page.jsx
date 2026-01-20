"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [error, setError] = useState(null)
    const router = useRouter()

    async function submit(e) {
        e.preventDefault()
        setError(null)
        try {
            const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, name }) })
            const data = await res.json().catch(() => ({}))
            if (!res.ok) {
                setError(data?.message || 'Registration failed')
                return
            }
            router.push('/')
        } catch (err) {
            console.error(err)
            setError('Network error')
        }
    }

    return (
        <main style={{ padding: 24, maxWidth: 640, margin: '0 auto' }}>
            <h1>Register</h1>
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input placeholder="Name (optional)" value={name} onChange={(e) => setName(e.target.value)} />
                <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="submit">Register</button>
                {error && <p style={{ color: 'crimson' }}>{error}</p>}
            </form>
            <p>Already have an account? <a href="/auth/login">Sign in</a></p>
        </main>
    )
}
