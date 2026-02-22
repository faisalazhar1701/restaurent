'use client'

import { type ReactNode } from 'react'

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
        <h1 className="text-2xl font-semibold text-venue-primary md:text-3xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-xs text-venue-muted">{subtitle}</p>
        )}
      </header>
      <div className="flex-1 space-y-8">{children}</div>
    </div>
  )
}
