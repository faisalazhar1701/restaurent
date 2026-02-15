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
  const base = 'rounded-lg px-4 py-2.5 text-sm font-medium disabled:opacity-50'
  const variants = {
    primary: 'bg-venue-primary text-white hover:opacity-90',
    secondary: 'border border-venue-primary/30 bg-white text-venue-primary hover:bg-venue-primary/5',
    accent: 'bg-venue-accent text-venue-primary hover:opacity-90',
  }
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}
