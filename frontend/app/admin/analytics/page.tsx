'use client'

import { EmptyState } from '@/components/ui/EmptyState'

export default function AdminAnalyticsPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-10">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Analytics
        </h1>
        <p className="mt-1 text-sm text-slate-500">Time-based utilization and insights</p>
      </header>

      <div className="mb-10">
        <EmptyState
          title="Analytics overview"
          description="View the Dashboard for live KPIs. More detailed analytics (revenue by zone, customer distribution) coming soon."
        />
      </div>
    </div>
  )
}
