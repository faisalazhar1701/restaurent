'use client'

import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'

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
    <div className="sticky bottom-0 z-10 mt-auto flex gap-3 border-t border-[#E5E7EB] bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
      <Link
        href={backHref}
        className="btn-secondary flex flex-1 items-center justify-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>
      {nextHref ? (
        <Link
          href={nextHref}
          className="btn-primary flex flex-1 items-center justify-center gap-2"
        >
          {nextLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  )
}
