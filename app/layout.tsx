import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'OAuthGuide — OAuth setup guides for any app',
  description: 'Get a complete OAuth setup guide for any app. Setup steps, approval timeline, known blockers — generated live by an AI agent.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${geist.className} antialiased`}>{children}</body>
    </html>
  )
}
