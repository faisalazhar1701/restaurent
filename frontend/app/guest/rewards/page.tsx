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
              <Card key={r.id} className="p-6 shadow-card hover:shadow-card-hover">
                <p className="text-lg font-semibold text-venue-primary">{r.title}</p>
                {r.description && (
                  <p className="mt-2 text-sm text-venue-muted">{r.description}</p>
                )}
                {r.restaurant && (
                  <p className="mt-1 text-sm text-venue-muted">From {r.restaurant.name}</p>
                )}
                <p className="mt-4 rounded-lg bg-venue-surface px-4 py-2 text-sm font-medium text-venue-primary">
                  Redeem at counter
                </p>
              </Card>
            ))}
          </div>
        )}
      </PageContainer>
      <div className="sticky bottom-0 mt-auto flex gap-3 border-t border-venue-border bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <button type="button" onClick={handleDone} className="btn-primary flex-1 py-3.5">
          Done
        </button>
      </div>
    </>
  )
}
