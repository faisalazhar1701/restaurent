'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { getTables, getAdminSessions, endAdminSession, type RestaurantTable, type AdminSession, ApiError } from '@/lib/api'

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
      name: id === '(no zone)' ? 'Unassigned' : id,
      tables: total,
      occupied,
    }))
}

export default function AdminSeatingPage() {
  const [tables, setTables] = useState<RestaurantTable[]>([])
  const [sessions, setSessions] = useState<AdminSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [endingId, setEndingId] = useState<string | null>(null)

  const refresh = async () => {
    try {
      const [tData, sData] = await Promise.all([getTables(), getAdminSessions()])
      setTables(Array.isArray(tData) ? tData : [])
      setSessions(Array.isArray(sData) ? sData : [])
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not load.')
    }
  }

  useEffect(() => {
    let cancelled = false
    refresh().finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const handleEndSession = async (sessionId: string) => {
    setEndingId(sessionId)
    try {
      await endAdminSession(sessionId)
      await refresh()
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not end session.')
    } finally {
      setEndingId(null)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl">
        <header className="mb-10">
          <h1 className="text-2xl font-semibold tracking-tight text-venue-primary sm:text-3xl">
            Seating
          </h1>
          <p className="mt-1 text-sm text-venue-muted">Loading…</p>
        </header>
        <Skeleton lines={6} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl">
        <header className="mb-10">
          <h1 className="text-2xl font-semibold tracking-tight text-venue-primary sm:text-3xl">
            Seating
          </h1>
        </header>
        <p className="text-red-600">{error}</p>
        <p className="mt-3 text-sm text-venue-muted">
          <Link href="/admin/tables" className="font-medium text-venue-primary hover:underline">
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
    <div className="mx-auto max-w-5xl">
      <header className="mb-10">
        <h1 className="text-2xl font-semibold tracking-tight text-venue-primary sm:text-3xl">
          Seating
        </h1>
        <p className="mt-1 text-sm text-venue-muted">
          Live table status and zone occupancy
        </p>
      </header>

      <section className="mb-12">
        <h2 className="mb-4 text-lg font-semibold text-venue-primary">Tables</h2>
        {safeTables.length === 0 ? (
          <EmptyState
            title="No tables yet"
            description="Add tables from Manage tables to get started."
          />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5">
            {safeTables.map((t) => (
              <Card
                key={t.id}
                className="p-5 text-center transition-shadow hover:shadow-card-hover"
              >
                <p className="text-xl font-bold tracking-tight text-venue-primary">
                  {t.zone ? `${t.zone}-` : ''}{t.tableNumber}
                </p>
                <div className="mt-3">
                  <Badge variant={t.status === 'available' ? 'available' : 'occupied'}>
                    {t.status === 'available' ? 'Available' : 'Occupied'}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {sessions.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-4 text-lg font-semibold text-venue-primary">Active sessions</h2>
          <div className="space-y-4">
            {sessions.map((s) => (
              <Card key={s.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div>
                  <p className="font-semibold text-venue-primary">
                    Table {s.tableNumber ?? '—'}
                  </p>
                  <p className="text-sm text-venue-muted">
                    {s.guestCount ?? '—'} guest(s) · started {new Date(s.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={!!endingId}
                  onClick={() => handleEndSession(s.id)}
                  className="btn-secondary text-sm disabled:opacity-50"
                >
                  {endingId === s.id ? 'Ending…' : 'End session'}
                </button>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-4 text-lg font-semibold text-venue-primary">By zone</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {zones.map((zone) => {
            const pct = zone.tables > 0 ? Math.round((zone.occupied / zone.tables) * 100) : 0
            return (
              <Card key={zone.id} className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-venue-primary">{zone.name}</h3>
                  <span className="text-sm text-venue-muted">
                    {zone.occupied}/{zone.tables}
                  </span>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-venue-surface">
                  <div
                    className="h-full rounded-full bg-venue-primary/20 transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </Card>
            )
          })}
        </div>
      </section>
    </div>
  )
}
