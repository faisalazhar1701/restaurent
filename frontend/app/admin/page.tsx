'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { ADMIN_STATS } from '@/lib/dummy-data'

export default function AdminDashboardPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-10">
        <h1 className="text-2xl font-semibold tracking-tight text-venue-primary sm:text-3xl">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-venue-muted">Live seating and revenue overview</p>
      </header>
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6 transition-shadow hover:shadow-card-hover">
          <p className="text-sm font-medium text-venue-muted">Occupancy</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-venue-primary">
            {ADMIN_STATS.occupancy}%
          </p>
        </Card>
        <Card className="p-6 transition-shadow hover:shadow-card-hover">
          <p className="text-sm font-medium text-venue-muted">Tables</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-venue-primary">
            {ADMIN_STATS.tablesOccupied}/{ADMIN_STATS.tablesTotal}
          </p>
        </Card>
        <Card className="p-6 transition-shadow hover:shadow-card-hover">
          <p className="text-sm font-medium text-venue-muted">Orders today</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-venue-primary">
            {ADMIN_STATS.ordersToday}
          </p>
        </Card>
        <Card className="p-6 transition-shadow hover:shadow-card-hover">
          <p className="text-sm font-medium text-venue-muted">Revenue today</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-venue-primary">
            ${ADMIN_STATS.revenueToday.toLocaleString()}
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
