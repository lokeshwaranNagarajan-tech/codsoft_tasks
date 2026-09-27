import './globals.css'
import Navbar from '@/components/Navbar'

export const metadata = {
    title: 'MarketHub - Multi-Vendor Marketplace',
    description: 'Shop from multiple sellers in one place.',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className="bg-gray-50 min-h-screen">
                <Navbar />
                <main className="max-w-7xl mx-auto p-4">
                    {children}
                </main>
            </body>
        </html>
    )
}