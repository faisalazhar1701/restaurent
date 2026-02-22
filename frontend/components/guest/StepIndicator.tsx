'use client'

/**
 * Step indicator for guest flow: Menu → Cart → Seating
 */
export function StepIndicator({ current }: { current: 'menu' | 'cart' | 'seating' }) {
  const steps = [
    { id: 'menu' as const, label: 'Menu' },
    { id: 'cart' as const, label: 'Cart' },
    { id: 'seating' as const, label: 'Seating' },
  ]
  const currentIdx = steps.findIndex((s) => s.id === current)
  return (
    <nav aria-label="Progress" className="mb-8">
      <ol className="flex items-center gap-2">
        {steps.map((step, i) => {
          const isActive = i === currentIdx
          const isPast = i < currentIdx
          return (
            <li key={step.id} className="flex flex-1 items-center gap-2">
              {i > 0 && <div className="h-0.5 flex-1 rounded-full bg-slate-200" />}
              <span
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-venue-primary text-white shadow-md'
                    : isPast
                      ? 'bg-slate-900/5 text-slate-600'
                      : 'bg-slate-100 text-slate-400'
                }`}
              >
                {step.label}
              </span>
              {i < steps.length - 1 && <div className="h-0.5 flex-1 rounded-full bg-slate-200" />}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
