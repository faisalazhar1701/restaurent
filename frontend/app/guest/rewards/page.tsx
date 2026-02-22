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
              <Card key={r.id} className="p-6 transition-all hover:shadow-md">
                <div className="flex gap-5">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-venue-accent/10 text-venue-accent">
                    <span className="text-2xl" aria-hidden>🎁</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-semibold text-slate-900">{r.title}</p>
                    {r.description && (
                      <p className="mt-1 text-sm text-slate-500">{r.description}</p>
                    )}
                    {r.restaurant && (
                      <p className="mt-1 text-xs text-slate-500">From {r.restaurant.name}</p>
                    )}
                    <span className="mt-4 inline-block rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700">
                      Redeem at counter
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </PageContainer>
      <div className="sticky bottom-0 z-10 mt-auto flex border-t border-slate-200 bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <button type="button" onClick={handleDone} className="btn-primary h-12 flex-1">
          Done
        </button>
      </div>
    </>
  )
}
