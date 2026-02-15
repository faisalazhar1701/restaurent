'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { getTables, type RestaurantTable, ApiError } from '@/lib/api'

function computeZones(tables: RestaurantTable[]) {
  const byZone = new Map<string, { total: number; occupied: number }>()
  for (const t of tables) {
    const z = t.zone ?? '(no zone)'
    const cur = byZone.get(z) ?? { total: 0, occupied: 0 }
    cur.total += 1
    if (t.status === 'occupied') cur.occupied += 1
    byZone.set(z, cur)
  }
  return Array.from(byZone.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([id, { total, occupied }]) => ({
      id,
      name: id === '(no zone)' ? 'Unassigned' : `Zone ${id}`,
      tables: total,
      occupied,
    }))
}

export default function AdminSeatingPage() {
  const [tables, setTables] = useState<RestaurantTable[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function fetchTables() {
      try {
        const data = await getTables()
        if (cancelled) return
        setTables(Array.isArray(data) ? data : [])
      } catch (e) {
        if (cancelled) return
        setError(e instanceof ApiError ? e.message : 'Could not load tables.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchTables()
    return () => { cancelled = true }
  }, [])

  if (loading) {
    return (
      <div className="max-w-5xl">
        <h1 className="mb-1 text-2xl font-semibold text-venue-primary sm:text-3xl">Seating</h1>
        <p className="mb-8 text-sm text-venue-muted">Loading…</p>
        <Skeleton lines={6} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-5xl">
        <h1 className="mb-1 text-2xl font-semibold text-venue-primary sm:text-3xl">Seating</h1>
        <p className="mt-4 text-red-600">{error}</p>
        <p className="mt-2 text-sm text-venue-muted">
          <Link href="/admin/tables" className="text-venue-primary hover:underline">
            Manage tables
          </Link>{' '}
          to add tables.
        </p>
      </div>
    )
  }

  const safeTables = Array.isArray(tables) ? tables : []
  const zones = computeZones(safeTables)

  return (
    <div className="max-w-5xl">
      <h1 className="mb-1 text-2xl font-semibold text-venue-primary sm:text-3xl">Seating</h1>
      <p className="mb-8 text-sm text-venue-muted">Table status and zone occupancy</p>

      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold text-venue-primary">Tables</h2>
        {safeTables.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="font-medium text-venue-primary">No tables yet</p>
            <p className="mt-1 text-sm text-venue-muted">Add tables from Manage tables.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {safeTables.map((t) => (
              <Card
                key={t.id}
                className={`p-5 text-center ${
                  t.status === 'available'
                    ? 'border-emerald-200 bg-emerald-50/60'
                    : 'border-amber-200 bg-amber-50/60'
                }`}
              >
                <p className="text-xl font-bold text-venue-primary">
                  {t.zone ? `${t.zone}-` : ''}{t.tableNumber}
                </p>
                <p
                  className={`mt-1.5 text-sm font-medium ${
                    t.status === 'available' ? 'text-emerald-700' : 'text-amber-700'
                  }`}
                >
                  {t.status === 'available' ? 'Available' : 'Occupied'}
                </p>
              </Card>
            ))}
          </div>
        )}
      </section>

      <h2 className="mb-4 text-lg font-semibold text-venue-primary">By zone</h2>
      <div className="mb-10 grid gap-4 sm:grid-cols-2">
        {zones.map((zone) => {
          const pct = zone.tables > 0 ? Math.round((zone.occupied / zone.tables) * 100) : 0
          return (
            <Card key={zone.id} className="p-5">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-venue-primary">{zone.name}</h3>
                <span className="rounded px-2 py-1 text-sm font-medium text-gray-700">
                  {zone.occupied}/{zone.tables}
                </span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-gray-300 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
