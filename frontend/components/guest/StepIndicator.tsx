'use client'

import { ChevronRight, ShoppingBag, ShoppingCart, Armchair, Gift } from 'lucide-react'

const STEPS = [
  { id: 'menu' as const, label: 'Menu', icon: ShoppingBag },
  { id: 'cart' as const, label: 'Cart', icon: ShoppingCart },
  { id: 'seating' as const, label: 'Seating', icon: Armchair },
  { id: 'rewards' as const, label: 'Rewards', icon: Gift },
]

export function StepIndicator({
  current,
}: {
  current: 'menu' | 'cart' | 'seating' | 'rewards'
}) {
  const currentIdx = STEPS.findIndex((s) => s.id === current)
  return (
    <nav aria-label="Progress" className="mb-8">
      <div className="flex items-center justify-between gap-1 overflow-x-auto">
        {STEPS.map((step, i) => {
          const isActive = i === currentIdx
          const isPast = i < currentIdx
          const Icon = step.icon
          return (
            <div key={step.id} className="flex flex-1 min-w-0 items-center">
              <div
                className={`flex flex-1 min-w-0 items-center justify-center gap-2 rounded-xl px-3 py-2.5 transition-all ${
                  isActive ? 'bg-venue-primary text-white' : isPast ? 'bg-venue-primary/10 text-venue-primary' : 'bg-[#F9FAFB] text-venue-muted'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate text-xs font-medium">{step.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <ChevronRight className="mx-0.5 h-4 w-4 shrink-0 text-venue-muted" aria-hidden />
              )}
            </div>
          )
        })}
      </div>
    </nav>
  )
}
