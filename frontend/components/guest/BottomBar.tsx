'use client'

import Link from 'next/link'

/**
 * Guest flow navigation: Back + optional Continue.
 * Sticky bottom, safe-area aware.
 */
export function BottomBar({
  backHref,
  nextHref,
  nextLabel = 'Continue',
}: {
  backHref: string
  nextHref?: string
  nextLabel?: string
}) {
  return (
    <div className="sticky bottom-0 mt-auto flex gap-3 border-t border-venue-border bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <Link href={backHref} className="btn-secondary flex-1 py-3.5 text-center">
        Back
      </Link>
      {nextHref ? (
        <Link href={nextHref} className="btn-primary flex-1 py-3.5 text-center">
          {nextLabel}
        </Link>
      ) : null}
    </div>
  )
}
