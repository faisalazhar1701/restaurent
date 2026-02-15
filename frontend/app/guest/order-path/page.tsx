'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PageContainer } from '@/components/guest/PageContainer'
import { BottomBar } from '@/components/guest/BottomBar'
import { Card } from '@/components/ui/Card'
import { ORDER_PATHS } from '@/lib/dummy-data'
import { getGuestSession } from '@/lib/session'

export default function OrderPathPage() {
  const router = useRouter()

  useEffect(() => {
    if (!getGuestSession()) router.replace('/guest')
  }, [router])

  return (
    <>
      <PageContainer title="How would you like to order?" subtitle="">
        <div className="space-y-3">
          {ORDER_PATHS.map((p) => (
            <Card key={p.id} className="p-5">
              <h3 className="font-semibold text-venue-primary">{p.title}</h3>
              <p className="mt-1 text-sm text-venue-muted">{p.description}</p>
              <button
                type="button"
                onClick={() => router.push('/guest/menu')}
                className="btn-primary mt-3"
              >
                Order now
              </button>
            </Card>
          ))}
        </div>
      </PageContainer>
      <BottomBar backHref="/guest/dine-in" nextHref="/guest/seating" nextLabel="Continue to seating" />
    </>
  )
}
