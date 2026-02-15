'use client'

import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { ANALYTICS_PLACEHOLDER } from '@/lib/dummy-data'

export default function AdminAnalyticsPage() {
  const maxVisits = Math.max(...ANALYTICS_PLACEHOLDER.dailyVisits)
  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-10">
        <h1 className="text-2xl font-semibold tracking-tight text-venue-primary sm:text-3xl">
          Analytics
        </h1>
        <p className="mt-1 text-sm text-venue-muted">Time-based utilization and insights</p>
      </header>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-venue-primary">Daily visits</h2>
        <p className="mt-1 text-sm text-venue-muted">This week</p>
        <div className="mt-6 flex h-36 items-end justify-between gap-2">
          {ANALYTICS_PLACEHOLDER.dailyVisits.map((v, i) => (
            <div
              key={i}
              className="flex-1 rounded-t bg-venue-primary/15 transition-all hover:bg-venue-primary/25"
              style={{
                height: maxVisits > 0 ? `${(v / maxVisits) * 100}%` : '10%',
              }}
              title={`${ANALYTICS_PLACEHOLDER.labels[i]}: ${v}`}
            />
          ))}
        </div>
        <div className="mt-4 flex justify-between text-xs text-venue-muted">
          {ANALYTICS_PLACEHOLDER.labels.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>
      </Card>

      <div className="mt-10">
        <EmptyState
          title="More analytics coming soon"
          description="Revenue by zone, customer distribution, and time-based reports."
        />
      </div>
    </div>
  )
}
