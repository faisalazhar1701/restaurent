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
          <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-xs text-slate-500">Loading…</p>
        </header>
        <Skeleton lines={4} />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-xs text-slate-500">Live seating and revenue overview</p>
      </header>
      {error && <p className="mb-6 text-sm text-venue-danger">{error}</p>}
      <section className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6 transition-all hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Utilization</p>
              <p className="text-2xl font-bold text-slate-900">{stats?.utilizationPercent ?? 0}%</p>
            </div>
          </div>
        </Card>
        <Card className="p-6 transition-all hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" /></svg>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Active tables</p>
              <p className="text-2xl font-bold text-slate-900">{stats?.activeTablesCount ?? 0}<span className="ml-1 text-lg font-normal text-slate-500">/ {stats?.tablesTotal ?? 0}</span></p>
            </div>
          </div>
        </Card>
        <Card className="p-6 transition-all hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Orders today</p>
              <p className="text-2xl font-bold text-slate-900">{stats?.ordersToday ?? 0}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6 transition-all hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Revenue today</p>
              <p className="text-2xl font-bold text-slate-900">${(stats?.totalRevenueToday ?? 0).toLocaleString()}</p>
            </div>
          </div>
        </Card>
      </section>
      <section className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6 transition-all hover:shadow-md">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Active sessions today</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{stats?.activeSessionsToday ?? 0}</p>
        </Card>
        <Card className="p-6 transition-all hover:shadow-md">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Completed sessions today</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{stats?.completedSessionsToday ?? 0}</p>
        </Card>
        <Card className="p-6 transition-all hover:shadow-md">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Avg session duration</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{stats?.avgSessionDurationMinutes ?? 0} min</p>
        </Card>
      </section>
      <div className="mt-8">
        <Link
          href="/admin/seating"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-900 hover:underline"
        >
          View seating map
          <span aria-hidden>→</span>
        </Link>
      </div>
    </div>
  )
}
