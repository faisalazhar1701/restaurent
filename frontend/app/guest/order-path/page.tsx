'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PageContainer } from '@/components/guest/PageContainer'
import { BottomBar } from '@/components/guest/BottomBar'
import { Card } from '@/components/ui/Card'
import { ORDER_PATHS, VENUE_NAME } from '@/lib/dummy-data'
import { getGuestSession, getGuestPrefs, setGuestPrefs } from '@/lib/session'

export default function OrderPathPage() {
  const router = useRouter()

  useEffect(() => {
    if (!getGuestSession()) {
      router.replace('/guest')
      return
    }
    const prefs = getGuestPrefs()
    if (prefs?.guestCount == null || prefs.guestCount < 1) {
      router.replace('/guest/dine-in')
      return
    }
    if (prefs?.orderTiming === 'now' || prefs?.orderTiming === 'later') {
      router.replace('/guest/seating')
    }
  }, [router])

  const handleSelect = (id: 'now' | 'later') => {
    const prefs = getGuestPrefs() ?? {}
    setGuestPrefs({ ...prefs, orderTiming: id })
    const guestCount = prefs?.guestCount ?? 0
    if (guestCount == null || guestCount < 1) {
      router.replace('/guest/dine-in')
    } else {
      router.replace('/guest/seating')
    }
  }

  return (
    <>
      <PageContainer title="How would you like to order?" subtitle={VENUE_NAME}>
        <div className="space-y-4">
          {ORDER_PATHS.map((p) => (
            <Card key={p.id} className="p-6 transition-shadow hover:shadow-card-hover">
              <h3 className="font-semibold text-slate-900">{p.title}</h3>
              <p className="mt-2 text-sm text-slate-500">{p.description}</p>
              <button
                type="button"
                onClick={() => handleSelect(p.id)}
                className="btn-primary mt-4"
              >
                {p.title}
              </button>
            </Card>
          ))}
        </div>
      </PageContainer>
      <BottomBar backHref="/guest/dine-in" nextHref="/guest/seating" nextLabel="Continue to seating" />
    </>
  )
}
