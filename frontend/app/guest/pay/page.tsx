'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { PageContainer } from '@/components/guest/PageContainer'
import { Skeleton } from '@/components/ui/Skeleton'
import { VENUE_NAME } from '@/lib/dummy-data'
import { getApiBaseUrlOrNull } from '@/lib/api'

function GuestPayPageInner() {
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const orderId = searchParams.get('orderId')
    const sessionId = searchParams.get('sessionId')
    if (!orderId || !sessionId) {
      setError('Invalid link. Missing orderId or sessionId.')
      return
    }
    const base = getApiBaseUrlOrNull()
    if (!base) {
      setError('Service is not configured.')
      return
    }
    const url = `${base}/api/payment/qr-url?orderId=${encodeURIComponent(orderId)}&sessionId=${encodeURIComponent(sessionId)}`
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl
        } else {
          setError(data.error ?? 'Could not load payment.')
        }
      })
      .catch(() => setError('Could not load payment.'))
  }, [searchParams])

  if (error) {
    return (
      <PageContainer title="Payment" subtitle={VENUE_NAME}>
        <p className="text-sm text-venue-danger">{error}</p>
      </PageContainer>
    )
  }

  return (
    <PageContainer title="Payment" subtitle={VENUE_NAME}>
      <div className="p-8 text-center">
        <Skeleton lines={3} />
        <p className="mt-4 text-sm text-slate-500">Redirecting to payment…</p>
      </div>
    </PageContainer>
  )
}

export default function GuestPayPage() {
  return (
    <Suspense fallback={
      <PageContainer title="Payment" subtitle={VENUE_NAME}>
        <div className="p-8 text-center"><Skeleton lines={3} /></div>
      </PageContainer>
    }>
      <GuestPayPageInner />
    </Suspense>
  )
}
