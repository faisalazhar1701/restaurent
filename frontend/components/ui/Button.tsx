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
  const base = 'h-12 rounded-xl px-6 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all'
  const variants = {
    primary: 'bg-venue-primary text-white hover:opacity-90',
    secondary: 'border border-venue-border bg-white text-venue-primary hover:bg-[#F9FAFB]',
    accent: 'bg-venue-accent text-white hover:opacity-90',
  }
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}
