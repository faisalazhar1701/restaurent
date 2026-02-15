import { type ReactNode } from 'react'

/**
 * Card: soft shadow, rounded corners, consistent padding.
 * Use for content blocks, stats, list items.
 */
export function Card({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={`rounded-xl border border-venue-border bg-white shadow-card ${className}`}
    >
      {children}
    </div>
  )
}
