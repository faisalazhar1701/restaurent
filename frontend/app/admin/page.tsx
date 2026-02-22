'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BarChart3, Armchair, ClipboardList, DollarSign, Users, Clock, ArrowRight } from 'lucide-react'
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
        <header className="mb-8">
          <h1 className="text-2xl font-semibold text-venue-primary md:text-3xl">Dashboard</h1>
          <p className="mt-1 text-xs text-venue-muted">Loading…</p>
        </header>
        <Skeleton lines={4} />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header>
        <h1 className="text-2xl font-semibold text-venue-primary md:text-3xl">Dashboard</h1>
        <p className="mt-1 text-xs text-venue-muted">Live seating and revenue overview</p>
      </header>
      {error && (
        <Card className="p-4">
          <p className="text-sm text-venue-danger">{error}</p>
        </Card>
      )}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6 md:p-8 transition-all hover:shadow-lg">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-venue-accent/10 text-venue-accent">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-venue-muted">Utilization</p>
              <p className="text-2xl font-bold text-venue-primary">{stats?.utilizationPercent ?? 0}%</p>
            </div>
          </div>
        </Card>
        <Card className="p-6 md:p-8 transition-all hover:shadow-lg">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-venue-success/10 text-venue-success">
              <Armchair className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-venue-muted">Active tables</p>
              <p className="text-2xl font-bold text-venue-primary">
                {stats?.activeTablesCount ?? 0}
                <span className="ml-1 text-lg font-normal text-venue-muted">/ {stats?.tablesTotal ?? 0}</span>
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-6 md:p-8 transition-all hover:shadow-lg">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-venue-accent/10 text-venue-accent">
              <ClipboardList className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-venue-muted">Orders today</p>
              <p className="text-2xl font-bold text-venue-primary">{stats?.ordersToday ?? 0}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6 md:p-8 transition-all hover:shadow-lg">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-venue-warning/10 text-venue-warning">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-venue-muted">Revenue today</p>
              <p className="text-2xl font-bold text-venue-primary">${(stats?.totalRevenueToday ?? 0).toLocaleString()}</p>
            </div>
          </div>
        </Card>
      </section>
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6 md:p-8 transition-all hover:shadow-lg">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-venue-muted" />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-venue-muted">Active sessions today</p>
              <p className="text-2xl font-bold text-venue-primary">{stats?.activeSessionsToday ?? 0}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6 md:p-8 transition-all hover:shadow-lg">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-venue-muted" />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-venue-muted">Completed sessions today</p>
              <p className="text-2xl font-bold text-venue-primary">{stats?.completedSessionsToday ?? 0}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6 md:p-8 transition-all hover:shadow-lg">
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-venue-muted" />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-venue-muted">Avg session duration</p>
              <p className="text-2xl font-bold text-venue-primary">{stats?.avgSessionDurationMinutes ?? 0} min</p>
            </div>
          </div>
        </Card>
      </section>
      <Card className="p-6">
        <Link
          href="/admin/seating"
          className="flex items-center gap-2 text-sm font-medium text-venue-primary hover:text-venue-accent"
        >
          View seating map
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Card>
    </div>
  )
}
