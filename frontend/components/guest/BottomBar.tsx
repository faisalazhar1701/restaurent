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
    <div className="sticky bottom-0 z-10 mt-auto flex gap-3 border-t border-gray-200 bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <Link href={backHref} className="btn-secondary flex-1 min-h-[48px] py-3.5 text-center">
        Back
      </Link>
      {nextHref ? (
        <Link href={nextHref} className="btn-primary flex-1 min-h-[48px] py-3.5 text-center">
          {nextLabel}
        </Link>
      ) : null}
    </div>
  )
}
