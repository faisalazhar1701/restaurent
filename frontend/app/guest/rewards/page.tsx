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
      <PageContainer title="Rewards" subtitle="">
        <Card className="p-6">
          <p className="text-sm text-venue-muted">Your tier</p>
          <p className="text-xl font-semibold text-venue-primary">{REWARDS_TIER.name}</p>
          <p className="mt-1 text-sm text-venue-muted">{REWARDS_TIER.points} points</p>
        </Card>
        <div className="mt-6 space-y-3">
          <p className="font-medium text-venue-primary">Rewards</p>
          {REWARDS_LIST.map((r) => (
            <Card key={r.id} className="p-4">
              <p className="font-medium">{r.name}</p>
              <p className="text-sm text-venue-muted">
                {r.unlocked ? 'Unlocked' : `${r.pointsRequired} points needed`}
              </p>
            </Card>
          ))}
        </div>
      </PageContainer>
      <div className="mt-auto flex gap-3 border-t border-venue-border bg-white p-4">
        <button
          type="button"
          onClick={handleDone}
          className="btn-primary flex-1 py-3"
        >
          Done
        </button>
      </div>
    </>
  )
}
