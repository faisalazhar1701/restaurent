'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { getAdminAnalytics, ApiError } from '@/lib/api'

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<{
    utilizationPercent: number
    tablesTotal: number
    activeTablesCount: number
    ordersToday: number
    totalRevenueToday: number
    activeSessionsToday?: number
    completedSessionsToday?: number
    avgSessionDurationMinutes?: number
  } | null>(null)

  useEffect(() => {
    let cancelled = false
    getAdminAnalytics()
      .then((data) => {
        if (!cancelled) setStats(data)
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof ApiError ? e.message : 'Could not load analytics.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl">
        <header className="mb-10">
          <h1 className="text-2xl font-semibold tracking-tight text-venue-primary sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-venue-muted">Loading…</p>
        </header>
        <Skeleton lines={4} />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-10">
        <h1 className="text-2xl font-semibold tracking-tight text-venue-primary sm:text-3xl">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-venue-muted">Live seating and revenue overview</p>
      </header>
      {error && <p className="mb-6 text-sm text-red-600">{error}</p>}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6 transition-shadow hover:shadow-card-hover">
          <p className="text-sm font-medium uppercase tracking-wide text-venue-muted">Utilization</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-venue-primary">
            {stats?.utilizationPercent ?? 0}%
          </p>
          <p className="mt-1 text-xs text-venue-muted">Tables in use</p>
        </Card>
        <Card className="p-6 transition-shadow hover:shadow-card-hover">
          <p className="text-sm font-medium uppercase tracking-wide text-venue-muted">Active tables</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-venue-primary">
            {stats?.activeTablesCount ?? 0}
            <span className="ml-1 text-xl font-normal text-venue-muted">/ {stats?.tablesTotal ?? 0}</span>
          </p>
          <p className="mt-1 text-xs text-venue-muted">Occupied / total</p>
        </Card>
        <Card className="p-6 transition-shadow hover:shadow-card-hover">
          <p className="text-sm font-medium uppercase tracking-wide text-venue-muted">Orders today</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-venue-primary">
            {stats?.ordersToday ?? 0}
          </p>
          <p className="mt-1 text-xs text-venue-muted">Paid orders</p>
        </Card>
        <Card className="p-6 transition-shadow hover:shadow-card-hover">
          <p className="text-sm font-medium uppercase tracking-wide text-venue-muted">Revenue today</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-venue-primary">
            ${(stats?.totalRevenueToday ?? 0).toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-venue-muted">Paid orders only</p>
        </Card>
      </section>
      <section className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6 transition-shadow hover:shadow-card-hover">
          <p className="text-sm font-medium text-venue-muted">Active sessions today</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-venue-primary">
            {stats?.activeSessionsToday ?? 0}
          </p>
        </Card>
        <Card className="p-6 transition-shadow hover:shadow-card-hover">
          <p className="text-sm font-medium text-venue-muted">Completed sessions today</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-venue-primary">
            {stats?.completedSessionsToday ?? 0}
          </p>
        </Card>
        <Card className="p-6 transition-shadow hover:shadow-card-hover">
          <p className="text-sm font-medium text-venue-muted">Avg session duration</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-venue-primary">
            {stats?.avgSessionDurationMinutes ?? 0} min
          </p>
        </Card>
      </section>
      <div className="mt-10">
        <Link
          href="/admin/seating"
          className="inline-flex items-center gap-1 text-sm font-medium text-venue-primary hover:underline"
        >
          View seating map
          <span aria-hidden>→</span>
        </Link>
      </div>
    </div>
  )
}
