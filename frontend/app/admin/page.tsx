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
          <h1 className="text-2xl font-semibold tracking-tight text-venue-foreground sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500">Loading…</p>
        </header>
        <Skeleton lines={4} />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-10">
        <h1 className="text-2xl font-semibold tracking-tight text-venue-foreground sm:text-3xl">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-500">Live seating and revenue overview</p>
      </header>
      {error && <p className="mb-6 text-sm text-red-600">{error}</p>}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6 transition-shadow hover:shadow-md">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Utilization</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-venue-foreground">
            {stats?.utilizationPercent ?? 0}%
          </p>
          <p className="mt-1 text-xs text-gray-500">Tables in use</p>
        </Card>
        <Card className="p-6 transition-shadow hover:shadow-md">
          <p className="text-sm font-medium uppercase tracking-wide text-gray-500">Active tables</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-venue-foreground">
            {stats?.activeTablesCount ?? 0}
            <span className="ml-1 text-xl font-normal text-gray-500">/ {stats?.tablesTotal ?? 0}</span>
          </p>
          <p className="mt-1 text-xs text-gray-500">Occupied / total</p>
        </Card>
        <Card className="p-6 transition-shadow hover:shadow-md">
          <p className="text-sm font-medium uppercase tracking-wide text-gray-500">Orders today</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-venue-foreground">
            {stats?.ordersToday ?? 0}
          </p>
          <p className="mt-1 text-xs text-gray-500">Paid orders</p>
        </Card>
        <Card className="p-6 transition-shadow hover:shadow-md">
          <p className="text-sm font-medium uppercase tracking-wide text-gray-500">Revenue today</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-venue-foreground">
            ${(stats?.totalRevenueToday ?? 0).toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-gray-500">Paid orders only</p>
        </Card>
      </section>
      <section className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6 transition-shadow hover:shadow-md">
          <p className="text-sm font-medium text-gray-500">Active sessions today</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-venue-foreground">
            {stats?.activeSessionsToday ?? 0}
          </p>
        </Card>
        <Card className="p-6 transition-shadow hover:shadow-md">
          <p className="text-sm font-medium text-gray-500">Completed sessions today</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-venue-foreground">
            {stats?.completedSessionsToday ?? 0}
          </p>
        </Card>
        <Card className="p-6 transition-shadow hover:shadow-md">
          <p className="text-sm font-medium text-gray-500">Avg session duration</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-venue-foreground">
            {stats?.avgSessionDurationMinutes ?? 0} min
          </p>
        </Card>
      </section>
      <div className="mt-10">
        <Link
          href="/admin/seating"
          className="inline-flex items-center gap-1 text-sm font-medium text-venue-foreground hover:underline"
        >
          View seating map
          <span aria-hidden>→</span>
        </Link>
      </div>
    </div>
  )
}
