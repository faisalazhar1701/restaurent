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
    <nav aria-label="Progress" className="mb-6">
      <ol className="flex items-center justify-between gap-2">
        {steps.map((step, i) => {
          const isActive = i === currentIdx
          const isPast = i < currentIdx
          return (
            <li
              key={step.id}
              className={`flex flex-1 items-center ${i < steps.length - 1 ? 'after:content-[""] after:flex-1 after:border-b after:border-venue-border after:mx-2' : ''}`}
            >
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  isActive
                    ? 'bg-venue-primary text-white'
                    : isPast
                      ? 'bg-venue-primary/10 text-venue-primary'
                      : 'bg-venue-surface text-venue-muted'
                }`}
              >
                {step.label}
              </span>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
