'use client'

import { Suspense, useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PageContainer } from '@/components/guest/PageContainer'
import { BottomBar } from '@/components/guest/BottomBar'
import { StepIndicator } from '@/components/guest/StepIndicator'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { VENUE_NAME } from '@/lib/dummy-data'
import { getGuestSession, getGuestPrefs, getGuestQrContext, clearGuestSession, setGuestSessionForOnSite } from '@/lib/session'
import {
  assignTable,
  createOrGetDraftOrder,
  getOrderForSession,
  getSeatingStatus,
  placeOrderApi,
  isPaymentEnabled,
  createPaymentCheckout,
  confirmPayment,
  type OrderResponse,
  ApiError,
} from '@/lib/api'

function SeatingPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [table, setTable] = useState<{ tableNumber: number; zone: string | null } | null>(null)
  const [preAssigned, setPreAssigned] = useState(false)
  const [order, setOrder] = useState<OrderResponse | null>(null)
  const [placed, setPlaced] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [placing, setPlacing] = useState(false)
  const [placeError, setPlaceError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [paymentEnabled, setPaymentEnabled] = useState(false)

  const handleRestart = useCallback(() => {
    clearGuestSession()
    router.replace('/guest')
  }, [router])

  useEffect(() => {
    const stripeSessionId = searchParams.get('stripe_session_id')
    const paymentStatus = searchParams.get('payment')
    const sessionIdFromUrl = searchParams.get('sessionId')
    const session = getGuestSession()

    // Payment success: on-site (sessionId in URL) or guest menu (session in storage)
    if (paymentStatus === 'success' && stripeSessionId) {
      const effectiveSessionId = sessionIdFromUrl || session?.sessionId
      if (!effectiveSessionId) {
        setError('Invalid payment link.')
        setLoading(false)
        return
      }
      let cancelled = false
      ;(async () => {
        try {
          await confirmPayment(stripeSessionId)
          if (cancelled) return
          if (sessionIdFromUrl) setGuestSessionForOnSite(sessionIdFromUrl)
          const [ord, status] = await Promise.all([
            getOrderForSession(effectiveSessionId),
            getSeatingStatus(effectiveSessionId),
          ])
          if (cancelled) return
          setOrder(ord)
          if (status.tableNumber != null) {
            setTable({ tableNumber: status.tableNumber, zone: status.zone })
          }
          setPlaced(true)
          setPaymentSuccess(true)
          router.replace('/guest/seating', { scroll: false })
        } catch (e) {
          if (!cancelled) {
            if (e instanceof ApiError) {
              if (e.status === 409 || (e.body as { code?: string })?.code === 'NO_TABLE_AVAILABLE') {
                setError('All tables are currently occupied. Please wait for availability.')
              } else if (e.status === 410) {
                setError('This table is not available. Please contact staff.')
              } else {
                setError(e.message ?? 'Could not confirm payment. Please try again.')
              }
            } else {
              setError('Could not confirm payment. Please try again.')
            }
          }
        } finally {
          if (!cancelled) setLoading(false)
        }
      })()
      return () => { cancelled = true }
    }

    if (!session) {
      router.replace('/guest')
      return
    }
    const prefs = getGuestPrefs()
    const guestCount = prefs?.guestCount
    if (guestCount == null || guestCount < 1) {
      router.replace('/guest/dine-in')
      return
    }

    if (paymentStatus === 'cancelled') {
      router.replace('/guest/seating', { scroll: false })
    }

    const qr = getGuestQrContext()
    const isTableQr = qr?.source === 'table' && qr?.tableId != null && qr?.zoneId != null
    if (isTableQr && qr.tableId && qr.zoneId) {
      const tableNumber = parseInt(qr.tableId, 10)
      if (Number.isInteger(tableNumber)) {
        setTable({ tableNumber, zone: qr.zoneId })
        setPreAssigned(true)
      }
    }

    let cancelled = false
    ;(async () => {
      try {
        const enabled = await isPaymentEnabled()
        if (cancelled) return
        setPaymentEnabled(enabled)

        if (enabled && isTableQr) {
          const ord = await getOrderForSession(session.sessionId)
          if (cancelled) return
          setOrder(ord)
          setLoading(false)
          return
        }

        if (enabled && !isTableQr && !table) {
          const ord = await getOrderForSession(session.sessionId)
          if (cancelled) return
          setOrder(ord)
          setLoading(false)
          return
        }

        if (!enabled) {
          const tableNum =
            isTableQr && qr?.tableId ? parseInt(qr.tableId, 10) : undefined
          const result = await assignTable({
            sessionId: session.sessionId,
            guestCount: guestCount ?? 2,
            optionalTableNumber: Number.isInteger(tableNum) ? tableNum : undefined,
            optionalZone: isTableQr ? qr?.zoneId ?? undefined : undefined,
          })
          if (cancelled) return
          setTable({ tableNumber: result.tableNumber, zone: result.zone })
        }

        const ord = !enabled ? await createOrGetDraftOrder(session.sessionId) : await getOrderForSession(session.sessionId)
        if (cancelled) return
        setOrder(ord)
        } catch (e) {
          if (!cancelled) {
            if (e instanceof ApiError) {
              if (e.status === 404) {
                clearGuestSession()
                setError('Session expired. Please start again.')
              } else if (e.status === 409 || (e.body as { code?: string })?.code === 'NO_TABLE_AVAILABLE') {
                setError('All tables are currently occupied. Please wait for availability.')
              } else if (e.status === 410) {
                setError('This table is not available. Please contact staff.')
              } else {
                setError(e.message ?? 'Something went wrong. Please try again.')
              }
            } else {
              setError('Could not load. Please try again.')
            }
          }
        } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [router, searchParams])

  useEffect(() => {
    if (!paymentEnabled && !table) return
    const session = getGuestSession()
    if (!session) return
    if (order && order.status === 'placed') return
    let cancelled = false
    ;(async () => {
      const ord = await getOrderForSession(session.sessionId)
      if (!cancelled && ord) setOrder(ord)
    })()
    return () => { cancelled = true }
  }, [table, paymentEnabled, order?.status])

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

  const handlePayNow = async () => {
    const session = getGuestSession()
    const prefs = getGuestPrefs()
    const guestCount = prefs?.guestCount ?? 2
    const qr = getGuestQrContext()
    const isTableQr = qr?.source === 'table' && qr?.tableId != null && qr?.zoneId != null
    const tableNum = isTableQr && qr?.tableId ? parseInt(qr.tableId, 10) : undefined
    const zone = qr?.source === 'table' && qr?.zoneId ? qr.zoneId : null
    if (!session || !order || (order.items?.length ?? 0) === 0) return
    setPlacing(true)
    setPlaceError(null)
    try {
      const { checkoutUrl } = await createPaymentCheckout({
        orderId: order.id,
        sessionId: session.sessionId,
        guestCount,
        zone,
        optionalTableNumber: Number.isInteger(tableNum) ? tableNum : undefined,
        optionalZone: isTableQr ? qr?.zoneId ?? undefined : undefined,
      })
      window.location.href = checkoutUrl
    } catch (e) {
      setPlaceError(e instanceof ApiError ? e.message : 'Unable to start payment.')
      setPlacing(false)
    }
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
    const isWaitState = error.includes('All tables are currently occupied') || error.includes('not available')
    return (
      <PageContainer title="Seating" subtitle={VENUE_NAME}>
        <StepIndicator current="seating" />
        <Card className="p-10 text-center border-2 border-venue-warning/30 bg-amber-50">
          <span className="mb-4 inline-block rounded-full bg-amber-100 px-4 py-1.5 text-sm font-semibold text-amber-800">
            Waiting
          </span>
          <p className={`text-lg font-medium ${isWaitState ? 'text-amber-800' : 'text-venue-danger'}`}>
            {error}
          </p>
          {isWaitState && (
            <p className="mt-3 text-sm text-venue-muted">
              Please wait for a table to become available, or ask staff for assistance.
            </p>
          )}
          <button type="button" onClick={handleRestart} className="btn-primary mt-8 h-12 w-full sm:w-auto sm:px-8">
            Start over
          </button>
        </Card>
        <BottomBar backHref="/guest/cart" />
      </PageContainer>
    )
  }

  const orderItems = order && Array.isArray(order.items) ? order.items : []
  const canPlace = order && orderItems.length > 0 && !placed && !paymentEnabled
  const canPay = order && orderItems.length > 0 && !placed && paymentEnabled

  return (
    <>
      <PageContainer title="Your table" subtitle={VENUE_NAME}>
        <StepIndicator current="seating" />
        <Card className="p-12 md:p-16 text-center transition-all hover:shadow-lg">
          <p className="text-7xl font-bold tracking-tight text-venue-primary sm:text-8xl md:text-9xl">
            {table ? `Table ${table.zone ? `${table.zone}-` : ''}${table.tableNumber}` : '—'}
          </p>
          {table && placed && (
            <span className="mt-4 inline-block rounded-full bg-venue-success/20 px-4 py-1.5 text-sm font-semibold text-venue-success">
              You&apos;re seated
            </span>
          )}
          <p className="mt-4 text-base text-venue-muted">
            {paymentSuccess ? 'Payment successful.' : preAssigned ? 'Pre-assigned via table QR.' : table ? 'Your table has been assigned.' : 'Complete payment to receive your table.'}
          </p>
        </Card>
        {canPlace && (
          <div className="mt-8">
            <button
              type="button"
              disabled={placing}
              onClick={handlePlaceOrder}
              className="btn-primary h-12 w-full disabled:opacity-50"
            >
              {placing ? 'Placing order…' : 'Confirm order'}
            </button>
            <p className="mt-2 text-center text-xs text-venue-muted">Payment handled at counter</p>
            {placeError && (
              <p className="mt-3 text-sm text-venue-danger">{placeError}</p>
            )}
          </div>
        )}
        {canPay && (
          <div className="mt-8">
            <button
              type="button"
              disabled={placing}
              onClick={handlePayNow}
              className="btn-primary h-12 w-full disabled:opacity-50"
            >
              {placing ? 'Redirecting…' : 'Pay now'}
            </button>
            <p className="mt-2 text-center text-xs text-venue-muted">Secure checkout · Payment at counter also available</p>
            {placeError && (
              <p className="mt-3 text-sm text-venue-danger">{placeError}</p>
            )}
          </div>
        )}
        {placed && (
          <Card className="mt-8 border-2 border-venue-success/30 bg-venue-success/5 p-8 text-center">
            <p className="text-lg font-semibold text-venue-success">
              {paymentSuccess ? 'Payment successful · Seating confirmed' : 'Order placed · Seating confirmed'}
            </p>
          </Card>
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

export default function SeatingPage() {
  return (
    <Suspense fallback={
      <PageContainer title="Your table" subtitle={VENUE_NAME}>
        <Card className="p-8 text-center">
          <Skeleton lines={3} />
        </Card>
      </PageContainer>
    }>
      <SeatingPageInner />
    </Suspense>
  )
}
