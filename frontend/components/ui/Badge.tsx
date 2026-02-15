'use client'

/**
 * Status badge for table availability, order status, etc.
 */
export function Badge({
  children,
  variant = 'default',
  className = '',
}: {
  children: React.ReactNode
  variant?: 'available' | 'occupied' | 'default' | 'success' | 'warning'
  className?: string
}) {
  const base = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium'
  const variants = {
    available: 'bg-emerald-50 text-venue-success',
    occupied: 'bg-amber-50 text-venue-warning',
    default: 'bg-gray-100 text-venue-muted',
    success: 'bg-emerald-50 text-venue-success',
    warning: 'bg-amber-50 text-venue-warning',
  }
  return (
    <span className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}
