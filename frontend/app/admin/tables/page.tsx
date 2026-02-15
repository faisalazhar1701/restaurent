'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { getTables, createTable, type RestaurantTable, ApiError } from '@/lib/api'

export default function AdminTablesPage() {
  const [tables, setTables] = useState<RestaurantTable[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addTableNumber, setAddTableNumber] = useState('')
  const [addZone, setAddZone] = useState('')
  const [addCapacity, setAddCapacity] = useState('4')
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  const refreshTables = async () => {
    try {
      const data = await getTables()
      setTables(Array.isArray(data) ? data : [])
      setError(null)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not load tables.')
    }
  }

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const data = await getTables()
        if (!cancelled) setTables(Array.isArray(data) ? data : [])
        if (!cancelled) setError(null)
      } catch (e) {
        if (!cancelled) setError(e instanceof ApiError ? e.message : 'Could not load tables.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  if (loading) {
    return (
      <div className="max-w-5xl">
        <h1 className="mb-1 text-2xl font-semibold text-venue-primary sm:text-3xl">
          Manage tables
        </h1>
        <p className="mb-8 text-sm text-venue-muted">Loading…</p>
        <Skeleton lines={6} />
      </div>
    )
  }

  const safeTables = Array.isArray(tables) ? tables : []

  return (
    <div className="max-w-5xl">
      <h1 className="mb-1 text-2xl font-semibold text-venue-primary sm:text-3xl">
        Manage tables
      </h1>
      <p className="mb-8 text-sm text-venue-muted">
        View all tables. Add tables below.
      </p>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <Card className="mb-6 p-4">
        <h2 className="mb-3 text-lg font-semibold text-venue-primary">Add table</h2>
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            const num = parseInt(addTableNumber.trim(), 10)
            if (!Number.isInteger(num) || num < 1) {
              setAddError('Table number must be a positive number.')
              return
            }
            const cap = parseInt(addCapacity.trim(), 10)
            const capacity = Number.isInteger(cap) && cap >= 1 && cap <= 20 ? cap : 4
            setAdding(true)
            setAddError(null)
            try {
              await createTable({ tableNumber: num, zone: addZone.trim() || null, capacity })
              setAddTableNumber('')
              setAddZone('')
              setAddCapacity('4')
              await refreshTables()
            } catch (err) {
              setAddError(err instanceof ApiError ? err.message : 'Could not add table.')
            } finally {
              setAdding(false)
            }
          }}
          className="flex flex-wrap items-end gap-3"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-venue-muted">Table number</label>
            <input
              type="number"
              min={1}
              value={addTableNumber}
              onChange={(e) => setAddTableNumber(e.target.value)}
              className="rounded border border-venue-border bg-white px-3 py-2 text-venue-primary"
              placeholder="e.g. 1"
              disabled={adding}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-venue-muted">Zone (optional)</label>
            <input
              type="text"
              value={addZone}
              onChange={(e) => setAddZone(e.target.value)}
              className="rounded border border-venue-border bg-white px-3 py-2 text-venue-primary"
              placeholder="e.g. A"
              disabled={adding}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-venue-muted">Capacity</label>
            <input
              type="number"
              min={1}
              max={20}
              value={addCapacity}
              onChange={(e) => setAddCapacity(e.target.value)}
              className="w-20 rounded border border-venue-border bg-white px-3 py-2 text-venue-primary"
              disabled={adding}
            />
          </div>
          <button
            type="submit"
            disabled={adding}
            className="rounded bg-venue-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
          >
            {adding ? 'Adding…' : 'Add table'}
          </button>
        </form>
        {addError && <p className="mt-2 text-sm text-red-600">{addError}</p>}
      </Card>

      <p className="mb-4">
        <Link href="/admin/seating" className="text-sm font-medium text-venue-primary hover:underline">
          View seating →
        </Link>
      </p>

      {safeTables.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="font-medium text-venue-primary">No tables yet</p>
          <p className="mt-1 text-sm text-venue-muted">Add a table above to get started.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {safeTables.map((t) => (
            <Card key={t.id} className="p-4">
              <p className="font-semibold text-venue-primary">
                {t.zone ? `${t.zone}-${t.tableNumber}` : `Table ${t.tableNumber}`}
              </p>
              <p className="text-sm text-venue-muted">
                Capacity {t.capacity ?? 4} · {t.status === 'available' ? 'Available' : 'Occupied'}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
