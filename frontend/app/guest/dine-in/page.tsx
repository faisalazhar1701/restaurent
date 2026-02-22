'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Users } from 'lucide-react'
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
        <p className="text-xs text-venue-muted">How many people are dining? We&apos;ll find a suitable table.</p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {GUEST_COUNTS.map((n) => (
            <Card key={n} className="p-6 md:p-8 transition-all hover:shadow-lg">
              <button
                type="button"
                onClick={() => handleSelect(n)}
                className="flex h-full min-h-[100px] w-full flex-col items-center justify-center gap-2"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-venue-accent/10 text-venue-accent">
                  <Users className="h-6 w-6" />
                </div>
                <span className="text-2xl font-bold text-venue-primary">{n}</span>
                <p className="text-sm text-venue-muted">
                  {n === 1 ? 'guest' : 'guests'}
                </p>
              </button>
            </Card>
          ))}
        </div>
      </PageContainer>
      <BottomBar backHref="/guest/cart" nextHref="/guest/order-path" nextLabel="Continue" />
    </>
  )
}
