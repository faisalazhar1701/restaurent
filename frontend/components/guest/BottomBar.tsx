'use client'

import Link from 'next/link'

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
    <div className="mt-auto flex gap-3 border-t border-venue-border bg-white p-4">
      <Link
        href={backHref}
        className="btn-secondary flex-1 text-center"
      >
        Back
      </Link>
      {nextHref ? (
        <Link
          href={nextHref}
          className="btn-primary flex-1 text-center"
        >
          {nextLabel}
        </Link>
      ) : null}
    </div>
  )
}
