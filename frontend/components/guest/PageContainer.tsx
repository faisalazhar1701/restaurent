'use client'

import { type ReactNode } from 'react'

/**
 * Guest page layout: clear typography hierarchy, consistent spacing.
 */
export function PageContainer({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-1 flex-col px-4 pb-6 pt-6 sm:px-6">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-venue-primary sm:text-3xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-venue-muted">{subtitle}</p>
        )}
      </header>
      <div className="flex-1">{children}</div>
    </div>
  )
}
