'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { TableQrModal } from '@/components/guest/TableQrModal'
import { getTables, createTable, updateTableStatus, type RestaurantTable, ApiError } from '@/lib/api'

export default function AdminTablesPage() {
  const [tables, setTables] = useState<RestaurantTable[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addTableNumber, setAddTableNumber] = useState('')
  const [addZone, setAddZone] = useState('')
  const [addCapacity, setAddCapacity] = useState('4')
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const [qrTable, setQrTable] = useState<RestaurantTable | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

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
      <div className="mx-auto max-w-5xl">
        <header className="mb-10">
          <h1 className="text-2xl font-semibold tracking-tight text-venue-foreground sm:text-3xl">
            Tables
          </h1>
          <p className="mt-1 text-sm text-venue-muted">Loading…</p>
        </header>
        <Skeleton lines={6} />
      </div>
    )
  }

  const safeTables = Array.isArray(tables) ? tables : []

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-10">
        <h1 className="text-2xl font-semibold tracking-tight text-venue-foreground sm:text-3xl">
          Tables
        </h1>
        <p className="mt-1 text-sm text-venue-muted">
          Manage zones and table capacity
        </p>
      </header>

      {error && (
        <p className="mb-6 text-sm text-red-600">{error}</p>
      )}

      <Card className="mb-10 p-6">
        <h2 className="text-lg font-semibold text-venue-foreground">Add table</h2>
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
          className="mt-6 flex flex-wrap items-end gap-4"
        >
          <div className="min-w-[140px]">
            <label className="mb-1.5 block text-sm font-medium text-venue-foreground">
              Table number
            </label>
            <input
              type="number"
              min={1}
              value={addTableNumber}
              onChange={(e) => setAddTableNumber(e.target.value)}
              className="input-field"
              placeholder="e.g. 1"
              disabled={adding}
            />
          </div>
          <div className="min-w-[140px]">
            <label className="mb-1.5 block text-sm font-medium text-venue-foreground">
              Zone (optional)
            </label>
            <input
              type="text"
              value={addZone}
              onChange={(e) => setAddZone(e.target.value)}
              className="input-field"
              placeholder="e.g. A"
              disabled={adding}
            />
          </div>
          <div className="min-w-[100px]">
            <label className="mb-1.5 block text-sm font-medium text-venue-foreground">
              Capacity
            </label>
            <input
              type="number"
              min={1}
              max={20}
              value={addCapacity}
              onChange={(e) => setAddCapacity(e.target.value)}
              className="input-field w-24"
              disabled={adding}
            />
          </div>
          <button
            type="submit"
            disabled={adding}
            className="btn-primary disabled:opacity-50"
          >
            {adding ? 'Adding…' : 'Add table'}
          </button>
        </form>
        {addError && (
          <p className="mt-4 text-sm text-red-600">{addError}</p>
        )}
      </Card>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-venue-foreground">All tables</h2>
        <Link
          href="/admin/seating"
          className="text-sm font-medium text-venue-foreground hover:underline"
        >
          View seating map →
        </Link>
      </div>

      {safeTables.length === 0 ? (
        <EmptyState
          title="No tables yet"
          description="Add a table above to get started."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {safeTables.map((t) => (
            <Card key={t.id} className="p-5 transition-shadow hover:shadow-md">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-venue-foreground">
                  {t.zone ? `${t.zone}-${t.tableNumber}` : `Table ${t.tableNumber}`}
                </p>
                <Badge
                  variant={
                    t.status === 'available'
                      ? 'available'
                      : t.status === 'disabled'
                        ? 'disabled'
                        : 'occupied'
                  }
                >
                  {t.status === 'available'
                    ? 'Available'
                    : t.status === 'disabled'
                      ? 'Disabled'
                      : 'Occupied'}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-venue-muted">
                Capacity {t.capacity ?? 4}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={updatingId === t.id || t.status === 'occupied'}
                  onClick={async () => {
                    if (t.status === 'available') {
                      setUpdatingId(t.id)
                      try {
                        await updateTableStatus(t.id, 'disabled')
                        await refreshTables()
                      } catch {
                        // ignore
                      } finally {
                        setUpdatingId(null)
                      }
                    }
                  }}
                  className="btn-secondary text-sm disabled:opacity-50"
                >
                  {updatingId === t.id ? '…' : 'Disable'}
                </button>
                <button
                  type="button"
                  disabled={updatingId === t.id || t.status === 'available'}
                  onClick={async () => {
                    if (t.status === 'disabled' || t.status === 'occupied') {
                      setUpdatingId(t.id)
                      try {
                        await updateTableStatus(t.id, 'available')
                        await refreshTables()
                      } catch {
                        // ignore
                      } finally {
                        setUpdatingId(null)
                      }
                    }
                  }}
                  className="btn-secondary text-sm disabled:opacity-50"
                >
                  {updatingId === t.id ? '…' : 'Enable'}
                </button>
                <button
                  type="button"
                  onClick={() => setQrTable(t)}
                  className="btn-secondary text-sm"
                >
                  View QR
                </button>
                <button
                  type="button"
                  onClick={() => setQrTable(t)}
                  className="btn-secondary text-sm"
                >
                  Download QR
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {qrTable && (
        <TableQrModal
          tableNumber={qrTable.tableNumber}
          zone={qrTable.zone}
          onClose={() => setQrTable(null)}
        />
      )}
    </div>
  )
}
