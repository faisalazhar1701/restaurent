'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Gift, CheckCircle } from 'lucide-react'
import { PageContainer } from '@/components/guest/PageContainer'
import { BottomBar } from '@/components/guest/BottomBar'
import { StepIndicator } from '@/components/guest/StepIndicator'
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
        <StepIndicator current="rewards" />
        {rewards.length === 0 ? (
          <EmptyState
            title="No rewards available right now"
            description="Check back later for offers."
            icon={Gift}
          />
        ) : (
          <div className="space-y-4">
            {rewards.map((r) => (
              <Card key={r.id} className="p-6 md:p-8 transition-all hover:shadow-lg">
                <div className="flex gap-6">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-venue-accent/10 text-venue-accent">
                    <Gift className="h-7 w-7" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-semibold text-venue-primary">{r.title}</p>
                    {r.description && (
                      <p className="mt-1 text-sm text-venue-muted">{r.description}</p>
                    )}
                    {r.restaurant && (
                      <p className="mt-1 text-xs text-venue-muted">From {r.restaurant.name}</p>
                    )}
                    <div className="mt-4 flex items-center gap-2 rounded-full bg-venue-success/10 px-4 py-2 w-fit">
                      <CheckCircle className="h-4 w-4 text-venue-success" />
                      <span className="text-sm font-medium text-venue-success">Redeem at counter</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </PageContainer>
      <div className="sticky bottom-0 z-10 mt-auto flex border-t border-[#E5E7EB] bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
        <button type="button" onClick={handleDone} className="btn-primary h-12 flex-1 flex items-center justify-center gap-2">
          <CheckCircle className="h-4 w-4" />
          Done
        </button>
      </div>
    </>
  )
}
