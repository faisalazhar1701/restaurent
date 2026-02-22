'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import {
  getAdminRestaurants,
  createAdminRestaurant,
  updateAdminRestaurant,
  type AdminRestaurant,
  ApiError,
} from '@/lib/api'

export default function AdminRestaurantsPage() {
  const [restaurants, setRestaurants] = useState<AdminRestaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [adding, setAdding] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const refresh = async () => {
    try {
      const data = await getAdminRestaurants()
      setRestaurants(Array.isArray(data) ? data : [])
      setError(null)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not load restaurants.')
    }
  }

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const data = await getAdminRestaurants()
        if (!cancelled) setRestaurants(Array.isArray(data) ? data : [])
        if (!cancelled) setError(null)
      } catch (e) {
        if (!cancelled) setError(e instanceof ApiError ? e.message : 'Could not load restaurants.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return
    setAdding(true)
    setSubmitError(null)
    try {
      await createAdminRestaurant(name)
      setNewName('')
      await refresh()
    } catch (e) {
      setSubmitError(e instanceof ApiError ? e.message : 'Could not add restaurant.')
    } finally {
      setAdding(false)
    }
  }

  const handleToggleActive = async (r: AdminRestaurant) => {
    setTogglingId(r.id)
    setSubmitError(null)
    try {
      await updateAdminRestaurant(r.id, { isActive: !r.isActive })
      await refresh()
    } catch (e) {
      setSubmitError(e instanceof ApiError ? e.message : 'Could not update restaurant.')
    } finally {
      setTogglingId(null)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl">
        <header className="mb-10">
          <h1 className="text-2xl font-semibold tracking-tight text-venue-foreground sm:text-3xl">
            Restaurants
          </h1>
          <p className="mt-1 text-sm text-venue-muted">Loading…</p>
        </header>
        <Skeleton lines={6} />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-10">
        <h1 className="text-2xl font-semibold tracking-tight text-venue-foreground sm:text-3xl">
          Restaurants
        </h1>
        <p className="mt-1 text-sm text-venue-muted">
          Add and enable or disable restaurants; use one per venue for menu scope
        </p>
      </header>

      {error && (
        <p className="mb-6 text-sm text-red-600">{error}</p>
      )}
      {submitError && (
        <p className="mb-6 text-sm text-red-600">{submitError}</p>
      )}

      <Card className="mb-10 p-6">
        <h2 className="text-lg font-semibold text-venue-foreground">Add restaurant</h2>
        <form onSubmit={handleAdd} className="mt-4 flex flex-wrap gap-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Restaurant name"
            className="input-field max-w-xs"
            disabled={adding}
          />
          <button type="submit" disabled={adding} className="btn-primary">
            {adding ? 'Adding…' : 'Add'}
          </button>
        </form>
      </Card>

      {restaurants.length === 0 ? (
        <EmptyState
          title="No restaurants yet"
          description="Add a restaurant to manage its menu and categories."
        />
      ) : (
        <div className="space-y-4">
          {restaurants.map((r) => (
            <Card key={r.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-venue-foreground">{r.name}</span>
                <Badge variant={r.isActive ? 'available' : 'occupied'}>
                  {r.isActive ? 'Active' : 'Disabled'}
                </Badge>
              </div>
              <button
                type="button"
                onClick={() => handleToggleActive(r)}
                disabled={togglingId !== null}
                className="btn-secondary text-sm disabled:opacity-50"
              >
                {togglingId === r.id ? 'Updating…' : r.isActive ? 'Disable' : 'Enable'}
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
