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
    <div className="flex flex-1 flex-col">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-venue-primary">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-venue-muted">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}
