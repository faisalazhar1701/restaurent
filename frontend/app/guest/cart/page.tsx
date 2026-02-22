'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PageContainer } from '@/components/guest/PageContainer'
import { StepIndicator } from '@/components/guest/StepIndicator'
import { BottomBar } from '@/components/guest/BottomBar'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { VENUE_NAME } from '@/lib/dummy-data'
import { getGuestSession } from '@/lib/session'
import {
  createOrGetDraftOrder,
  addOrderItem,
  removeOrderItem,
  type OrderResponse,
  type OrderItemResponse,
  ApiError,
} from '@/lib/api'

export default function CartPage() {
  const router = useRouter()
  const [order, setOrder] = useState<OrderResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const refreshCart = async () => {
    const session = getGuestSession()
    if (!session) return null
    const draft = await createOrGetDraftOrder(session.sessionId)
    setOrder(draft)
    return draft
  }

  useEffect(() => {
    const session = getGuestSession()
    if (!session) {
      router.replace('/guest')
      return
    }
    const sessionId = session.sessionId
    let cancelled = false
    async function fetchDraft() {
      try {
        const draft = await createOrGetDraftOrder(sessionId)
        if (cancelled) return
        setOrder(draft)
        const items = draft?.items ?? []
        const itemCount = items.reduce((s, i) => s + (i.quantity ?? 0), 0)
        if (draft?.status === 'draft' && itemCount === 0) {
          router.replace('/guest/menu?message=empty_cart')
          return
        }
      } catch (e) {
        if (cancelled) return
        if (e instanceof ApiError && e.status === 404) {
          router.replace('/guest')
          return
        }
        setError('Unable to load your cart. Please try again.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchDraft()
    return () => { cancelled = true }
  }, [router])

  const handleUpdateQuantity = async (item: OrderItemResponse, delta: number) => {
    const session = getGuestSession()
    if (!session || !order || order.status !== 'draft') return
    const newQty = item.quantity + delta
    setUpdatingId(item.id)
    try {
      if (newQty < 1) {
        await removeOrderItem(item.id, session.sessionId)
      } else {
        await addOrderItem({
          orderId: order.id,
          menuItemId: item.menuItemId,
          quantity: newQty,
          sessionId: session.sessionId,
        })
      }
      await refreshCart()
    } catch {
      setError('Could not update quantity. Please try again.')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleRemove = async (item: OrderItemResponse) => {
    const session = getGuestSession()
    if (!session) return
    setUpdatingId(item.id)
    try {
      await removeOrderItem(item.id, session.sessionId)
      await refreshCart()
    } catch {
      setError('Could not remove item. Please try again.')
    } finally {
      setUpdatingId(null)
    }
  }

  const orderItems = order && Array.isArray(order.items) ? order.items : []
  const itemCount = orderItems.reduce((s, i) => s + (i.quantity ?? 0), 0)
  const total = orderItems.reduce((s, i) => s + (i.priceAtOrder ?? 0) * (i.quantity ?? 0), 0)

  if (loading) {
    return (
      <PageContainer title="Your cart" subtitle={VENUE_NAME}>
        <Skeleton lines={4} />
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer title="Your cart" subtitle={VENUE_NAME}>
        <p className="text-sm text-venue-danger">{error}</p>
        <BottomBar backHref="/guest/menu" />
      </PageContainer>
    )
  }

  return (
    <>
      <PageContainer title="Your cart" subtitle={VENUE_NAME}>
        <StepIndicator current="cart" />
        <p className="mb-6 text-xs text-slate-500">Review your order before checkout.</p>
        {order?.status === 'placed' ? (
          <p className="text-sm text-slate-500">Order already placed.</p>
        ) : orderItems.length === 0 ? (
          <EmptyState title="Your cart is empty" description="Add items from the menu." />
        ) : (
          <div className="space-y-4">
            {orderItems.map((item) => (
              <Card key={item.id} className="flex flex-wrap items-center justify-between gap-4 p-6 transition-all hover:shadow-md">
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-slate-900">{item.menuItemName}</h3>
                  <p className="mt-0.5 text-sm text-slate-500">
                    ${item.priceAtOrder.toFixed(2)} each
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 items-center rounded-xl border border-slate-200 bg-slate-50">
                    <button
                      type="button"
                      disabled={!!updatingId}
                      onClick={() => handleUpdateQuantity(item, -1)}
                      className="flex h-12 w-12 shrink-0 items-center justify-center text-lg font-medium text-slate-900 hover:bg-slate-100 disabled:opacity-50"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="min-w-[2.5rem] text-center text-base font-bold text-slate-900">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      disabled={!!updatingId}
                      onClick={() => handleUpdateQuantity(item, 1)}
                      className="flex h-12 w-12 shrink-0 items-center justify-center text-lg font-medium text-slate-900 hover:bg-slate-100 disabled:opacity-50"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <p className="w-24 shrink-0 text-right text-lg font-bold text-slate-900">
                    ${(item.quantity * item.priceAtOrder).toFixed(2)}
                  </p>
                  <button
                    type="button"
                    disabled={!!updatingId}
                    onClick={() => handleRemove(item)}
                    className="btn-secondary h-12 shrink-0 disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              </Card>
            ))}
            <Card className="p-6">
              <p className="text-right text-2xl font-bold text-slate-900">
                Total: ${total.toFixed(2)}
              </p>
            </Card>
          </div>
        )}
      </PageContainer>
      <BottomBar
        backHref="/guest/menu"
        nextHref={order?.status === 'placed' ? '/guest/rewards' : itemCount > 0 ? '/guest/dine-in' : undefined}
        nextLabel={order?.status === 'placed' ? 'Proceed' : 'Continue to checkout'}
      />
    </>
  )
}
