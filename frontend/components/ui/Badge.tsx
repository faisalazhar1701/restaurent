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
  variant?: 'available' | 'occupied' | 'disabled' | 'default' | 'success' | 'warning'
  className?: string
}) {
  const base = 'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium'
  const variants = {
    available: 'bg-green-100 text-green-800 border border-green-200',
    occupied: 'bg-amber-100 text-amber-800 border border-amber-200',
    disabled: 'bg-gray-200 text-gray-600 border border-gray-300',
    default: 'bg-gray-100 text-venue-muted',
    success: 'bg-green-50 text-green-700 border border-green-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
  }
  return (
    <span className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}
