'use client'

import { Inbox } from 'lucide-react'

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
}: {
  title: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-[#E5E7EB] bg-white px-8 py-16 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F9FAFB] text-venue-muted">
        <Icon className="h-7 w-7" />
      </div>
      <p className="text-base font-medium text-venue-primary">{title}</p>
      {description && (
        <p className="mt-2 text-sm text-venue-muted">{description}</p>
      )}
    </div>
  )
}
