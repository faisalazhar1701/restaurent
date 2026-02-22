import { type ReactNode, type ButtonHTMLAttributes } from 'react'

export function Button({
  children,
  variant = 'primary',
  className = '',
  ...props
}: {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'accent'
  className?: string
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const base = 'rounded-lg px-4 py-2.5 text-sm font-medium min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'border border-gray-300 bg-white text-venue-foreground hover:bg-gray-50',
    accent: 'bg-venue-primary text-white hover:bg-blue-700',
  }
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}
