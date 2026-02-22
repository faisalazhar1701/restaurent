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
      className={`rounded-xl border border-gray-200 bg-white shadow-sm ${className}`}
    >
      {children}
    </div>
  )
}
