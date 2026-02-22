'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import {
  getAdminRestaurants,
  getAdminRewards,
  createAdminReward,
  updateAdminReward,
  type AdminRestaurant,
  type AdminReward,
  ApiError,
} from '@/lib/api'

export default function AdminRewardsPage() {
  const [rewards, setRewards] = useState<AdminReward[]>([])
  const [restaurants, setRestaurants] = useState<AdminRestaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', restaurantId: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const refresh = async () => {
    try {
      const [rwd, res] = await Promise.all([getAdminRewards(), getAdminRestaurants()])
      setRewards(Array.isArray(rwd) ? rwd : [])
      setRestaurants(Array.isArray(res) ? res : [])
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not load.')
    }
  }

  useEffect(() => {
    let cancelled = false
    refresh().finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    const title = form.title.trim()
    if (!title) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      await createAdminReward({
        title,
        description: form.description.trim() || null,
        restaurantId: form.restaurantId || null,
      })
      setForm({ title: '', description: '', restaurantId: '' })
      setShowForm(false)
      await refresh()
    } catch (e) {
      setSubmitError(e instanceof ApiError ? e.message : 'Could not create reward.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggle = async (r: AdminReward) => {
    setTogglingId(r.id)
    try {
      await updateAdminReward(r.id, { isActive: !r.isActive })
      await refresh()
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not update.')
    } finally {
      setTogglingId(null)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl">
        <header className="mb-10">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Rewards
          </h1>
          <p className="mt-1 text-sm text-slate-500">Loading…</p>
        </header>
        <Skeleton lines={6} />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-10">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Rewards
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage cross-restaurant rewards (mall-wide or per restaurant)
        </p>
      </header>

      {error && <p className="mb-6 text-sm text-venue-danger">{error}</p>}

      <Card className="mb-10 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Add reward</h2>
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="btn-primary text-sm"
          >
            {showForm ? 'Cancel' : 'Add reward'}
          </button>
        </div>
        {showForm && (
          <form onSubmit={handleCreate} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-900">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="input-field"
                placeholder="e.g. Free dessert"
                required
                disabled={submitting}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-900">Description (optional)</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="input-field"
                placeholder="Short description"
                disabled={submitting}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-900">Restaurant (optional = mall-wide)</label>
              <select
                value={form.restaurantId}
                onChange={(e) => setForm((f) => ({ ...f, restaurantId: e.target.value }))}
                className="input-field"
                disabled={submitting}
              >
                <option value="">Mall-wide</option>
                {restaurants.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
            {submitError && <p className="text-sm text-venue-danger">{submitError}</p>}
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Adding…' : 'Add'}
            </button>
          </form>
        )}
      </Card>

      {rewards.length === 0 ? (
        <EmptyState title="No rewards yet" description="Add rewards for guests to see after seating." />
      ) : (
        <div className="space-y-4">
          {rewards.map((r) => (
            <Card key={r.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
              <div>
                <p className="font-semibold text-slate-900">{r.title}</p>
                {r.description && <p className="mt-1 text-sm text-slate-500">{r.description}</p>}
                <p className="mt-1 text-sm text-slate-500">
                  {r.restaurant ? r.restaurant.name : 'Mall-wide'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={r.isActive ? 'available' : 'occupied'}>
                  {r.isActive ? 'Active' : 'Disabled'}
                </Badge>
                <button
                  type="button"
                  onClick={() => handleToggle(r)}
                  disabled={!!togglingId}
                  className="btn-secondary text-sm disabled:opacity-50"
                >
                  {togglingId === r.id ? '…' : r.isActive ? 'Disable' : 'Enable'}
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
