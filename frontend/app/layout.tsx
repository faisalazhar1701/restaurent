import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Venue Seat — Mall & Food Court',
  description: 'Shared seating and ordering for malls and food courts',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  )
}
