'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PageContainer } from '@/components/guest/PageContainer'
import { BottomBar } from '@/components/guest/BottomBar'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { VENUE_NAME } from '@/lib/dummy-data'
import { getGuestSession, getGuestPrefs, clearGuestSession } from '@/lib/session'
import {
  assignTable,
  createOrGetDraftOrder,
  placeOrderApi,
  type OrderResponse,
  ApiError,
} from '@/lib/api'

export default function SeatingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [table, setTable] = useState<{ tableNumber: number; zone: string | null } | null>(null)
  const [order, setOrder] = useState<OrderResponse | null>(null)
  const [placed, setPlaced] = useState(false)
  const [placing, setPlacing] = useState(false)
  const [placeError, setPlaceError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const session = getGuestSession()
    if (!session) {
      router.replace('/guest')
      return
    }
    const sessionId = session.sessionId
    const prefs = getGuestPrefs()
    const guestCount = prefs?.guestCount ?? 2
    let cancelled = false
    async function doAssign() {
      try {
        const result = await assignTable({
          sessionId,
          guestCount,
        })
        if (cancelled) return
        setTable({ tableNumber: result.tableNumber, zone: result.zone })
      } catch (e) {
        if (cancelled) return
        if (e instanceof ApiError) {
          if (e.status === 404) {
            clearGuestSession()
            setError('Session expired. Please start again.')
          } else if (e.status === 409) {
            setError('No table available. Please try again shortly.')
          } else {
            setError(e.message ?? 'Something went wrong. Please try again.')
          }
        } else {
          setError('Could not assign table. Please try again.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    doAssign()
    return () => { cancelled = true }
  }, [router])

  useEffect(() => {
    if (!table) return
    const session = getGuestSession()
    if (!session) return
    const sessionId = session.sessionId
    let cancelled = false
    async function fetchDraft() {
      try {
        const draft = await createOrGetDraftOrder(sessionId)
        if (cancelled) return
        setOrder(draft)
      } catch {
        if (!cancelled) setOrder(null)
      }
    }
    fetchDraft()
    return () => { cancelled = true }
  }, [table])

  const handlePlaceOrder = async () => {
    const session = getGuestSession()
    const orderItems = order && Array.isArray(order.items) ? order.items : []
    if (!session || !order || orderItems.length === 0) return
    setPlacing(true)
    setPlaceError(null)
    try {
      await placeOrderApi(order.id, session.sessionId)
      setPlaced(true)
    } catch (e) {
      setPlaceError(
        e instanceof ApiError ? e.message ?? 'Unable to place order.' : 'Unable to place order.'
      )
    } finally {
      setPlacing(false)
    }
  }

  const handleRestart = () => {
    clearGuestSession()
    router.replace('/guest')
  }

  if (loading) {
    return (
      <PageContainer title="Your table" subtitle="Assigning…">
        <Card className="p-8 text-center">
          <Skeleton lines={3} />
        </Card>
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer title="Seating" subtitle={VENUE_NAME}>
        <p className="text-red-600">{error}</p>
        <button type="button" onClick={handleRestart} className="btn-primary mt-4">
          Start over
        </button>
        <BottomBar backHref="/guest" />
      </PageContainer>
    )
  }

  const orderItems = order && Array.isArray(order.items) ? order.items : []
  const canPlace = order && orderItems.length > 0 && !placed

  return (
    <>
      <PageContainer title="Your table" subtitle={VENUE_NAME}>
        <Card className="p-10 text-center">
          <p className="text-4xl font-bold tracking-tight text-venue-primary sm:text-5xl">
            Table {table?.zone ? `${table.zone}-` : ''}{table?.tableNumber}
          </p>
          <p className="mt-3 text-venue-muted">Your table has been assigned.</p>
        </Card>
        {canPlace && (
          <div className="mt-8">
            <button
              type="button"
              disabled={placing}
              onClick={handlePlaceOrder}
              className="btn-primary w-full py-4 disabled:opacity-50"
            >
              {placing ? 'Placing order…' : 'Place order'}
            </button>
            {placeError && (
              <p className="mt-3 text-sm text-red-600">{placeError}</p>
            )}
          </div>
        )}
        {placed && (
          <p className="mt-8 text-center text-lg font-semibold text-venue-primary">
            Order placed
          </p>
        )}
      </PageContainer>
      <BottomBar
        backHref="/guest/cart"
        nextHref={placed ? '/guest/rewards' : undefined}
        nextLabel={placed ? 'Proceed to rewards' : undefined}
      />
    </>
  )
}
