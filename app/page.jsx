export default function Home() {
    return (
        <main style={{
            fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 24,
            gap: 24,
        }}>
            <div style={{textAlign: 'center'}}>
                <h1 style={{fontSize: 40, margin: 0}}>Welcome to Next.js!</h1>
                <p style={{marginTop: 8, color: '#444'}}>Get started by editing <code style={{background: '#f3f4f6', padding: '2px 6px', borderRadius: 6}}>app/page.jsx</code></p>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, width: '100%', maxWidth: 920}}>
                <a href="https://nextjs.org/docs" style={cardStyle} target="_blank" rel="noreferrer">Docs →<p style={cardDesc}>Find in-depth information about Next.js features and API.</p></a>
                <a href="https://nextjs.org/learn" style={cardStyle} target="_blank" rel="noreferrer">Learn →<p style={cardDesc}>Learn about Next.js in an interactive course with quizzes!</p></a>
                <a href="https://github.com/vercel/next.js/tree/canary/examples" style={cardStyle} target="_blank" rel="noreferrer">Examples →<p style={cardDesc}>Discover boilerplates and example projects to jumpstart your app.</p></a>
                <a href="https://vercel.com/new" style={cardStyle} target="_blank" rel="noreferrer">Deploy →<p style={cardDesc}>Instantly deploy your Next.js site to a shareable URL with Vercel.</p></a>
            </div>
        </main>
    )
}

const cardStyle = {
    padding: 18,
    border: '1px solid #e6e6e6',
    borderRadius: 12,
    textDecoration: 'none',
    color: 'inherit',
    background: 'white',
    boxShadow: '0 1px 2px rgba(16,24,40,0.03)',
}

const cardDesc = { margin: '8px 0 0', color: '#666', fontSize: 14 }
