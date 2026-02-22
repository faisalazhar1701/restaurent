import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Venue Seat — Mall & Food Court Operations',
  description: 'Shared seating, ordering, and insights for malls and food courts',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="font-sans">
      <body className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  )
}
