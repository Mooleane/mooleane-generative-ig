export const metadata = {
    title: 'Mooleane Generative IG',
}

import Providers from '../components/Providers'

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body style={{ fontFamily: 'system-ui, sans-serif', padding: 24 }}>
                <Providers>{children}</Providers>
            </body>
        </html>
    )
}
