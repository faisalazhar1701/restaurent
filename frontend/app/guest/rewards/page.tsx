'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PageContainer } from '@/components/guest/PageContainer'
import { BottomBar } from '@/components/guest/BottomBar'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { VENUE_NAME } from '@/lib/dummy-data'
import { getGuestSession, clearGuestSession } from '@/lib/session'
import { getOrderForSession, getRewards, type Reward, ApiError } from '@/lib/api'

export default function RewardsPage() {
  const router = useRouter()
  const [rewards, setRewards] = useState<Reward[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const session = getGuestSession()
    if (!session) {
      router.replace('/guest')
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const order = await getOrderForSession(session.sessionId)
        if (cancelled) return
        if (!order || order.status !== 'placed') {
          router.replace('/guest/seating')
          return
        }
        const list = await getRewards()
        if (cancelled) return
        setRewards(Array.isArray(list) ? list : [])
      } catch (e) {
        if (!cancelled && e instanceof ApiError && e.status === 404) {
          router.replace('/guest')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [router])

  const handleDone = () => {
    clearGuestSession()
    router.replace('/guest')
  }

  if (loading) {
    return (
      <PageContainer title="Rewards" subtitle={VENUE_NAME}>
        <Skeleton lines={4} />
      </PageContainer>
    )
  }

  return (
    <>
      <PageContainer title="Rewards" subtitle="Offers from restaurants">
        {rewards.length === 0 ? (
          <EmptyState title="No rewards available right now" description="Check back later for offers." />
        ) : (
          <div className="space-y-4">
            {rewards.map((r) => (
              <Card key={r.id} className="p-6 transition-shadow hover:shadow-md">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-venue-primary/10 text-venue-primary">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-semibold text-venue-foreground">{r.title}</p>
                    {r.description && (
                      <p className="mt-1 text-sm text-gray-500">{r.description}</p>
                    )}
                    {r.restaurant && (
                      <p className="mt-1 text-xs text-gray-500">From {r.restaurant.name}</p>
                    )}
                    <span className="mt-4 inline-block rounded-lg bg-green-100 px-3 py-1.5 text-sm font-medium text-green-800">
                      Redeem at counter
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </PageContainer>
      <div className="sticky bottom-0 z-10 mt-auto flex gap-3 border-t border-gray-200 bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <button type="button" onClick={handleDone} className="btn-primary flex-1 min-h-[48px] py-3.5">
          Done
        </button>
      </div>
    </>
  )
}
