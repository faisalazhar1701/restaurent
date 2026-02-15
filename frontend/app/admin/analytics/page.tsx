'use client'

import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { ANALYTICS_PLACEHOLDER } from '@/lib/dummy-data'

export default function AdminAnalyticsPage() {
  return (
    <div className="max-w-5xl">
      <h1 className="mb-1 text-2xl font-semibold text-venue-primary sm:text-3xl">
        Analytics
      </h1>
      <p className="mb-8 text-sm text-venue-muted">Weekly visits</p>

      <Card className="p-6">
        <h2 className="mb-4 font-semibold text-venue-primary">Daily visits</h2>
        <div className="flex h-32 items-end justify-between gap-2">
          {ANALYTICS_PLACEHOLDER.dailyVisits.map((v, i) => (
            <div
              key={i}
              className="flex-1 rounded-t bg-venue-primary/60"
              style={{
                height: `${(v / Math.max(...ANALYTICS_PLACEHOLDER.dailyVisits)) * 100}%`,
              }}
              title={`${ANALYTICS_PLACEHOLDER.labels[i]}: ${v}`}
            />
          ))}
        </div>
        <div className="mt-2 flex justify-between text-xs text-venue-muted">
          {ANALYTICS_PLACEHOLDER.labels.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>
      </Card>

      <div className="mt-8">
        <EmptyState
          title="More analytics coming soon"
          description="Charts and reports will be available here."
        />
      </div>
    </div>
  )
}
