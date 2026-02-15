'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PageContainer } from '@/components/guest/PageContainer'
import { BottomBar } from '@/components/guest/BottomBar'
import { Card } from '@/components/ui/Card'
import { VENUE_NAME, GUEST_COUNTS } from '@/lib/dummy-data'
import { getGuestSession, setGuestPrefs } from '@/lib/session'

export default function DineInPage() {
  const router = useRouter()

  useEffect(() => {
    if (!getGuestSession()) router.replace('/guest')
  }, [router])

  const handleSelect = (count: number) => {
    setGuestPrefs({ guestCount: count, dineIn: true })
    router.push('/guest/order-path')
  }

  return (
    <>
      <PageContainer title="Party size" subtitle={VENUE_NAME}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {GUEST_COUNTS.map((n) => (
            <Card key={n} className="p-5 text-center">
              <button
                type="button"
                onClick={() => handleSelect(n)}
                className="btn-primary w-full"
              >
                {n} {n === 1 ? 'guest' : 'guests'}
              </button>
            </Card>
          ))}
        </div>
      </PageContainer>
      <BottomBar backHref="/guest/cart" nextHref="/guest/order-path" nextLabel="Continue" />
    </>
  )
}
