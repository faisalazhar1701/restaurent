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
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Seating
          </h1>
          <p className="mt-1 text-sm text-slate-500">Loading…</p>
        </header>
        <Skeleton lines={6} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl">
        <header className="mb-10">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Seating
          </h1>
        </header>
        <p className="text-venue-danger">{error}</p>
        <p className="mt-3 text-sm text-slate-500">
          <Link href="/admin/tables" className="font-medium text-slate-900 hover:underline">
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
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Seating
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Live table status and zone occupancy
        </p>
      </header>

      <section className="mb-12">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Tables</h2>
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
                className="p-6 text-center transition-all hover:shadow-md"
              >
                <p className="text-xl font-bold tracking-tight text-slate-900">
                  {t.zone ? `${t.zone}-` : ''}{t.tableNumber}
                </p>
                <p className="mt-1 text-sm text-slate-500">Capacity {t.capacity ?? 4}</p>
                <div className="mt-3">
                  <Badge variant={t.status === 'available' ? 'available' : t.status === 'disabled' ? 'disabled' : 'occupied'}>
                    {t.status === 'available' ? 'Available' : t.status === 'disabled' ? 'Disabled' : 'Occupied'}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {sessions.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Active sessions</h2>
          <div className="space-y-4">
            {sessions.map((s) => (
              <Card key={s.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div>
                  <p className="font-semibold text-slate-900">
                    Table {s.tableNumber ?? '—'}
                  </p>
                  <p className="text-sm text-slate-500">
                    {s.guestCount ?? '—'} guest(s) · started {new Date(s.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={!!endingId}
                  onClick={() => handleEndSession(s.id)}
                  className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {endingId === s.id ? 'Ending…' : 'End session'}
                </button>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">By zone</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {zones.map((zone) => {
            const pct = zone.tables > 0 ? Math.round((zone.occupied / zone.tables) * 100) : 0
            return (
              <Card key={zone.id} className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900">{zone.name}</h3>
                  <span className="text-sm text-slate-500">
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
