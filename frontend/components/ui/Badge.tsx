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
    available: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    occupied: 'bg-amber-50 text-amber-700 border border-amber-200',
    disabled: 'bg-slate-100 text-slate-600 border border-slate-200',
    default: 'bg-slate-100 text-slate-600',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
  }
  return (
    <span className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}
