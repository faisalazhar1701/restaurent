'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { getAdminOrders, type OrderResponse, ApiError } from '@/lib/api'

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function fetchOrders() {
      try {
        const data = await getAdminOrders()
        if (cancelled) return
        setOrders(Array.isArray(data) ? data : [])
      } catch (e) {
        if (cancelled) return
        setError(e instanceof ApiError ? e.message : 'Could not load orders.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchOrders()
    return () => { cancelled = true }
  }, [])

  if (loading) {
    return (
      <div className="max-w-5xl">
        <h1 className="mb-1 text-2xl font-semibold text-venue-primary sm:text-3xl">Orders</h1>
        <p className="mb-8 text-sm text-venue-muted">Loading…</p>
        <Skeleton lines={6} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-5xl">
        <h1 className="mb-1 text-2xl font-semibold text-venue-primary sm:text-3xl">Orders</h1>
        <p className="mt-4 text-red-600">{error}</p>
      </div>
    )
  }

  const safeOrders = Array.isArray(orders) ? orders : []

  return (
    <div className="max-w-5xl">
      <h1 className="mb-1 text-2xl font-semibold text-venue-primary sm:text-3xl">Orders</h1>
      <p className="mb-8 text-sm text-venue-muted">Placed orders from guests</p>

      {safeOrders.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="font-medium text-venue-primary">No orders yet</p>
          <p className="mt-1 text-sm text-venue-muted">Orders will appear here once guests place them.</p>
        </Card>
      ) : (
        <div className="space-y-5">
          {safeOrders.map((order) => {
            const items = Array.isArray(order.items) ? order.items : []
            const total = items.reduce((s, i) => s + (i.priceAtOrder ?? 0) * (i.quantity ?? 0), 0)
            const createdAt = order.createdAt
              ? new Date(order.createdAt).toLocaleString()
              : '—'
            return (
              <Card key={order.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-venue-primary">
                      Table {order.tableNumber ?? '—'}
                    </p>
                    <p className="mt-0.5 text-sm text-venue-muted">{createdAt}</p>
                  </div>
                  <span className="rounded bg-venue-primary/10 px-2.5 py-1 text-sm font-medium text-venue-primary">
                    Placed · {items.reduce((s, i) => s + (i.quantity ?? 0), 0)} items
                  </span>
                </div>
                <ul className="mt-3 space-y-1 text-sm text-venue-muted">
                  {items.map((i) => (
                    <li key={i.id}>
                      {i.menuItemName} × {i.quantity} — $
                      {((i.priceAtOrder ?? 0) * (i.quantity ?? 0)).toFixed(2)}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 font-semibold text-venue-primary">
                  Total: ${total.toFixed(2)}
                </p>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
