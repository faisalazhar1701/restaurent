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
    <div className="flex flex-1 flex-col px-4 pb-8 pt-6 sm:px-6">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
        )}
      </header>
      <div className="flex-1">{children}</div>
    </div>
  )
}
