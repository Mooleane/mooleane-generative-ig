export const metadata = {
    title: 'Mooleane Generative IG',
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body style={{ fontFamily: 'system-ui, sans-serif', padding: 24 }}>
                {children}
            </body>
        </html>
    )
}
