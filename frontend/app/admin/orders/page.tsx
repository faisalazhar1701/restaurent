'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import {
  getAdminOrders,
  getAdminItems,
  createOnSiteOrder,
  type AdminOrderResponse,
  type AdminMenuItem,
  ApiError,
} from '@/lib/api'

type OnSiteLineItem = { menuItemId: string; quantity: number; name: string }

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrderResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [filterRestaurant, setFilterRestaurant] = useState<string>('')
  const [filterPayment, setFilterPayment] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [showOnSite, setShowOnSite] = useState(false)
  const [onSiteTable, setOnSiteTable] = useState('')
  const [onSiteZone, setOnSiteZone] = useState('')
  const [onSiteGuestCount, setOnSiteGuestCount] = useState('2')
  const [onSiteItems, setOnSiteItems] = useState<OnSiteLineItem[]>([])
  const [onSiteMenuItems, setOnSiteMenuItems] = useState<AdminMenuItem[]>([])
  const [onSiteAdding, setOnSiteAdding] = useState(false)
  const [onSiteQrUrl, setOnSiteQrUrl] = useState<string | null>(null)

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

  useEffect(() => {
    if (!showOnSite) return
    let cancelled = false
    getAdminItems().then((list) => {
      if (!cancelled) setOnSiteMenuItems(Array.isArray(list) ? list : [])
    })
    return () => { cancelled = true }
  }, [showOnSite])

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl">
        <header className="mb-10">
          <h1 className="text-2xl font-semibold tracking-tight text-venue-primary sm:text-3xl">
            Orders
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
            Orders
          </h1>
        </header>
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  const safeOrders = Array.isArray(orders) ? orders : []
  const restaurants = Array.from(new Set(safeOrders.map((o) => o.restaurant?.name).filter(Boolean))) as string[]
  const filtered = safeOrders.filter((o) => {
    if (filterRestaurant && (o.restaurant?.name ?? '') !== filterRestaurant) return false
    if (filterPayment === 'paid' && o.paymentStatus !== 'paid') return false
    if (filterPayment === 'pending' && o.paymentStatus === 'paid') return false
    return true
  })

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-10">
        <h1 className="text-2xl font-semibold tracking-tight text-venue-primary sm:text-3xl">
          Orders
        </h1>
        <p className="mt-1 text-sm text-venue-muted">Placed orders from guests</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <select
            value={filterRestaurant}
            onChange={(e) => setFilterRestaurant(e.target.value)}
            className="input-field w-auto max-w-[180px]"
          >
            <option value="">All restaurants</option>
            {restaurants.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <select
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
            className="input-field w-auto max-w-[140px]"
          >
            <option value="">All payments</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </header>

      <Card className="mb-10 p-6">
        <button
          type="button"
          onClick={() => setShowOnSite(!showOnSite)}
          className="text-lg font-semibold text-venue-primary hover:underline"
        >
          {showOnSite ? '−' : '+'} Create on-site order (QR payment)
        </button>
        {showOnSite && (
          <div className="mt-6 space-y-4">
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-venue-primary">Table number</label>
                <input
                  type="number"
                  min={1}
                  value={onSiteTable}
                  onChange={(e) => setOnSiteTable(e.target.value)}
                  className="input-field w-28"
                  placeholder="e.g. 5"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-venue-primary">Zone (optional)</label>
                <input
                  type="text"
                  value={onSiteZone}
                  onChange={(e) => setOnSiteZone(e.target.value)}
                  className="input-field w-24"
                  placeholder="e.g. A"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-venue-primary">Guest count</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={onSiteGuestCount}
                  onChange={(e) => setOnSiteGuestCount(e.target.value)}
                  className="input-field w-24"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-venue-primary">Add items</label>
              <div className="flex flex-wrap gap-2">
                <select
                  id="onsite-item"
                  className="input-field min-w-[180px]"
                  onChange={(e) => {
                    const id = e.target.value
                    if (!id) return
                    const item = onSiteMenuItems.find((m) => m.id === id)
                    if (item) {
                      setOnSiteItems((prev) => [...prev, { menuItemId: item.id, quantity: 1, name: item.name }])
                      e.target.value = ''
                    }
                  }}
                >
                  <option value="">Select item…</option>
                  {onSiteMenuItems.map((m) => (
                    <option key={m.id} value={m.id}>{m.name} — ${Number(m.price).toFixed(2)}</option>
                  ))}
                </select>
              </div>
              <ul className="mt-2 space-y-1 text-sm text-venue-muted">
                {onSiteItems.map((line, i) => (
                  <li key={i} className="flex items-center gap-2">
                    {line.name} × {line.quantity}
                    <button
                      type="button"
                      onClick={() => setOnSiteItems((prev) => prev.filter((_, j) => j !== i))}
                      className="text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                    <input
                      type="number"
                      min={1}
                      value={line.quantity}
                      onChange={(e) => {
                        const q = parseInt(e.target.value, 10)
                        if (Number.isInteger(q) && q >= 1) {
                          setOnSiteItems((prev) => prev.map((x, j) => j === i ? { ...x, quantity: q } : x))
                        }
                      }}
                      className="input-field w-16"
                    />
                  </li>
                ))}
              </ul>
            </div>
            {onSiteQrUrl && (
              <div className="rounded-lg border border-venue-border bg-venue-surface p-4">
                <p className="font-medium text-venue-primary">QR payment link created</p>
                <a href={onSiteQrUrl} target="_blank" rel="noopener noreferrer" className="mt-2 block break-all text-sm text-venue-primary hover:underline">
                  {onSiteQrUrl}
                </a>
                <p className="mt-2 text-xs text-venue-muted">Guest scans QR or opens link → pays → seating + rewards</p>
              </div>
            )}
            <button
              type="button"
              disabled={onSiteAdding || onSiteItems.length === 0 || !onSiteTable.trim()}
              onClick={async () => {
                const tableNum = parseInt(onSiteTable.trim(), 10)
                if (!Number.isInteger(tableNum) || tableNum < 1) return
                setOnSiteAdding(true)
                setOnSiteQrUrl(null)
                try {
                  const res = await createOnSiteOrder({
                    tableNumber: tableNum,
                    zone: onSiteZone.trim() || null,
                    guestCount: parseInt(onSiteGuestCount, 10) || 2,
                    items: onSiteItems.map((x) => ({ menuItemId: x.menuItemId, quantity: x.quantity })),
                  })
                  setOnSiteQrUrl(res.qrPaymentUrl)
                  setOnSiteItems([])
                } catch (e) {
                  setError(e instanceof ApiError ? e.message : 'Could not create order.')
                } finally {
                  setOnSiteAdding(false)
                }
              }}
              className="btn-primary disabled:opacity-50"
            >
              {onSiteAdding ? 'Creating…' : 'Create order & get QR link'}
            </button>
          </div>
        )}
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          title={safeOrders.length === 0 ? 'No orders yet' : 'No orders match filters'}
          description={safeOrders.length === 0 ? 'Orders will appear here once guests place them.' : 'Try different filters.'}
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => {
            const items = Array.isArray(order.items) ? order.items : []
            const total = items.reduce((s, i) => s + (i.priceAtOrder ?? 0) * (i.quantity ?? 0), 0)
            const itemCount = items.reduce((s, i) => s + (i.quantity ?? 0), 0)
            const createdAt = order.createdAt
              ? new Date(order.createdAt).toLocaleString()
              : '—'
            return (
              <Card key={order.id} className="p-6 transition-shadow hover:shadow-card-hover">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-venue-primary">
                      Order {order.id.slice(0, 8)} · Table {order.tableNumber ?? '—'}
                    </p>
                    <p className="mt-0.5 text-sm text-venue-muted">
                      {createdAt}
                      {order.restaurant && ` · ${order.restaurant.name}`}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={order.paymentStatus === 'paid' ? 'available' : 'occupied'}>
                      {order.paymentStatus === 'paid' ? 'Paid' : order.paymentStatus ?? '—'}
                    </Badge>
                    <Badge variant="default">
                      {itemCount} {itemCount === 1 ? 'item' : 'items'}
                    </Badge>
                  </div>
                </div>
                <ul className="mt-4 space-y-1.5 border-t border-venue-border pt-4 text-sm text-venue-muted">
                  {items.map((i) => (
                    <li key={i.id}>
                      {i.menuItemName} × {i.quantity} — $
                      {((i.priceAtOrder ?? 0) * (i.quantity ?? 0)).toFixed(2)}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 font-semibold text-venue-primary">
                  Total: ${(order.total ?? total).toFixed(2)}
                </p>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
