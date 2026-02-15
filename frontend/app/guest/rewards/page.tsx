'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PageContainer } from '@/components/guest/PageContainer'
import { BottomBar } from '@/components/guest/BottomBar'
import { Card } from '@/components/ui/Card'
import { REWARDS_TIER, REWARDS_LIST } from '@/lib/dummy-data'
import { getGuestSession, clearGuestSession } from '@/lib/session'
import { releaseTable } from '@/lib/api'

export default function RewardsPage() {
  const router = useRouter()

  useEffect(() => {
    const session = getGuestSession()
    if (!session) {
      router.replace('/guest')
      return
    }
    releaseTable(session.sessionId).catch(() => {})
  }, [router])

  const handleDone = () => {
    clearGuestSession()
    router.replace('/guest')
  }

  return (
    <>
      <PageContainer title="Rewards" subtitle="Offers from other restaurants">
        <Card className="p-6">
          <p className="text-sm text-venue-muted">Your tier</p>
          <p className="mt-1 text-xl font-semibold text-venue-primary">{REWARDS_TIER.name}</p>
          <p className="mt-0.5 text-sm text-venue-muted">{REWARDS_TIER.points} points</p>
        </Card>
        <div className="mt-8">
          <p className="mb-4 font-medium text-venue-primary">Available offers</p>
          <div className="space-y-3">
            {REWARDS_LIST.map((r) => (
              <Card key={r.id} className="p-5">
                <p className="font-medium text-venue-primary">{r.name}</p>
                <p className="mt-1 text-sm text-venue-muted">
                  {r.unlocked ? 'Unlocked' : `${r.pointsRequired} points needed`}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </PageContainer>
      <div className="sticky bottom-0 mt-auto flex gap-3 border-t border-venue-border bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={handleDone}
          className="btn-primary flex-1 py-3.5"
        >
          Done
        </button>
      </div>
    </>
  )
}
