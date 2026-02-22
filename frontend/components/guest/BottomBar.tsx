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
    <div className="sticky bottom-0 z-10 mt-auto flex gap-3 border-t border-slate-200 bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-4px_24px_rgba(15,23,42,0.08)]">
      <Link href={backHref} className="btn-secondary flex flex-1 items-center justify-center">
        Back
      </Link>
      {nextHref ? (
        <Link href={nextHref} className="btn-primary flex flex-1 items-center justify-center">
          {nextLabel}
        </Link>
      ) : null}
    </div>
  )
}
