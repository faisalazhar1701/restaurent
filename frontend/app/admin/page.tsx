'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { ADMIN_STATS } from '@/lib/dummy-data'

export default function AdminDashboardPage() {
  return (
    <div className="max-w-5xl">
      <h1 className="mb-1 text-2xl font-semibold text-venue-primary sm:text-3xl">
        Dashboard
      </h1>
      <p className="mb-8 text-sm text-venue-muted">Overview</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5">
          <p className="text-sm text-venue-muted">Occupancy</p>
          <p className="text-2xl font-bold text-venue-primary">{ADMIN_STATS.occupancy}%</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-venue-muted">Tables</p>
          <p className="text-2xl font-bold text-venue-primary">
            {ADMIN_STATS.tablesOccupied}/{ADMIN_STATS.tablesTotal}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-venue-muted">Orders today</p>
          <p className="text-2xl font-bold text-venue-primary">{ADMIN_STATS.ordersToday}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-venue-muted">Revenue today</p>
          <p className="text-2xl font-bold text-venue-primary">
            ${ADMIN_STATS.revenueToday.toLocaleString()}
          </p>
        </Card>
      </div>
      <div className="mt-8">
        <Link href="/admin/seating" className="text-venue-primary hover:underline">
          View seating →
        </Link>
      </div>
    </div>
  )
}
