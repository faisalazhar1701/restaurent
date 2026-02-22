'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Plus, ShoppingCart } from 'lucide-react'
import { PageContainer } from '@/components/guest/PageContainer'
import { BottomBar } from '@/components/guest/BottomBar'
import { StepIndicator } from '@/components/guest/StepIndicator'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { VENUE_NAME } from '@/lib/dummy-data'
import { getGuestSession } from '@/lib/session'
import {
  getMenuCategories,
  getMenuItems,
  createOrGetDraftOrder,
  addOrderItem,
  type MenuCategory,
  type MenuItem,
  type OrderResponse,
  ApiError,
} from '@/lib/api'

function MenuPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const emptyCartMessage = searchParams.get('message') === 'empty_cart'
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [items, setItems] = useState<MenuItem[]>([])
  const [order, setOrder] = useState<OrderResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [addingId, setAddingId] = useState<string | null>(null)

  useEffect(() => {
    const session = getGuestSession()
    if (!session) {
      router.replace('/guest')
      return
    }
    const sessionId = session.sessionId
    let cancelled = false
    async function fetchAll() {
      try {
        const [cats, its, draft] = await Promise.all([
          getMenuCategories(),
          getMenuItems(),
          createOrGetDraftOrder(sessionId),
        ])
        if (cancelled) return
        setCategories(Array.isArray(cats) ? cats : [])
        setItems(Array.isArray(its) ? its : [])
        setOrder(draft ?? null)
        setActiveCategory(Array.isArray(cats) && cats[0] ? cats[0].id : null)
      } catch (e) {
        if (cancelled) return
        if (e instanceof ApiError && e.status === 404) {
          router.replace('/guest')
          return
        }
        setError('Unable to load menu. Please try again.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchAll()
    return () => { cancelled = true }
  }, [router])

  const handleAddToCart = async (item: MenuItem) => {
    const session = getGuestSession()
    if (!session || !order || order.status !== 'draft') return
    const sid = session.sessionId
    const orderItems = Array.isArray(order.items) ? order.items : []
    const existing = orderItems.find((i) => i.menuItemId === item.id)
    const quantity = existing ? existing.quantity + 1 : 1
    setAddingId(item.id)
    try {
      await addOrderItem({
        orderId: order.id,
        menuItemId: item.id,
        quantity,
        sessionId: sid,
      })
      const draft = await createOrGetDraftOrder(sid)
      setOrder(draft)
    } catch (e) {
      if (e instanceof ApiError && e.status === 400) setError(e.message)
    } finally {
      setAddingId(null)
    }
  }

  const safeItems = Array.isArray(items) ? items : []
  const safeCategories = Array.isArray(categories) ? categories : []
  const filteredItems = activeCategory
    ? safeItems.filter((i) => i.categoryId === activeCategory)
    : []
  const orderItems = order && Array.isArray(order.items) ? order.items : []
  const cartCount = orderItems.reduce((s, i) => s + (i.quantity ?? 0), 0)

  if (loading) {
    return (
      <PageContainer title="Menu" subtitle={VENUE_NAME}>
        <Skeleton lines={4} />
      </PageContainer>
    )
  }

  if (error && !safeCategories.length) {
    return (
      <PageContainer title="Menu" subtitle={VENUE_NAME}>
        <p className="text-sm text-venue-danger">{error}</p>
        <BottomBar backHref="/guest" />
      </PageContainer>
    )
  }

  return (
    <>
      <PageContainer title="Menu" subtitle={VENUE_NAME}>
        <StepIndicator current="menu" />
        {emptyCartMessage && (
          <Card className="p-4">
            <p className="text-sm text-venue-muted">Your cart is empty. Add items below to continue.</p>
          </Card>
        )}
        <Link
          href="/guest/cart"
          className="flex min-h-[56px] items-center justify-between rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm transition-all hover:shadow-lg"
        >
          <span className="flex items-center gap-2 font-medium text-venue-primary">
            <ShoppingCart className="h-5 w-5 text-venue-accent" />
            Cart
          </span>
          <span className="text-lg font-bold text-venue-primary">{cartCount} {cartCount === 1 ? 'item' : 'items'}</span>
        </Link>
        <div className="-mx-1 flex gap-2 overflow-x-auto pb-2">
          {safeCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`h-12 shrink-0 rounded-full px-5 text-sm font-medium transition-all ${
                activeCategory === cat.id
                  ? 'bg-venue-primary text-white shadow-md'
                  : 'border border-[#E5E7EB] bg-white text-venue-muted hover:border-venue-accent/50 hover:text-venue-primary'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
        <div className="space-y-4">
          {safeCategories.length === 0 ? (
            <EmptyState
              title="No products yet"
              description="Products will appear here once added from admin."
            />
          ) : filteredItems.length === 0 ? (
            <EmptyState title="No items in this category" description="Select another category." />
          ) : (
            filteredItems.map((item) => (
              <Card key={item.id} className="overflow-hidden transition-all hover:shadow-lg">
                <div className="flex gap-6 p-6">
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[#F9FAFB]">
                    <div className="flex h-full w-full items-center justify-center text-venue-muted">
                      <div className="h-12 w-12 rounded-lg bg-[#E5E7EB]" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold text-venue-primary">{item.name}</h3>
                    {item.description && (
                      <p className="mt-1 text-sm text-venue-muted">{item.description}</p>
                    )}
                    <div className="mt-4 flex items-center justify-between gap-4">
                      <p className="text-xl font-bold text-venue-primary">
                        ${Number(item.price).toFixed(2)}
                      </p>
                      <button
                        type="button"
                        disabled={!!addingId || order?.status !== 'draft'}
                        onClick={() => handleAddToCart(item)}
                        className="btn-accent flex h-12 items-center gap-2 px-6 disabled:opacity-50"
                      >
                        <Plus className="h-4 w-4" />
                        {addingId === item.id ? 'Adding…' : 'Add to cart'}
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </PageContainer>
      <BottomBar backHref="/guest" nextHref="/guest/cart" nextLabel="Continue to checkout" />
    </>
  )
}

export default function MenuPage() {
  return (
    <Suspense fallback={
      <PageContainer title="Menu" subtitle={VENUE_NAME}>
        <Skeleton lines={4} />
      </PageContainer>
    }>
      <MenuPageInner />
    </Suspense>
  )
}
