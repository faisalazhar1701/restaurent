'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clearAdminToken } from '@/lib/adminAuth'

export function AdminNav() {
  const pathname = usePathname()

  const nav = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/restaurants', label: 'Restaurants' },
    { href: '/admin/products', label: 'Products' },
    { href: '/admin/seating', label: 'Seating' },
    { href: '/admin/tables', label: 'Tables' },
    { href: '/admin/orders', label: 'Orders' },
    { href: '/admin/rewards', label: 'Rewards' },
    { href: '/admin/analytics', label: 'Analytics' },
  ]

  return (
    <nav className="flex flex-col gap-1 p-4">
      {nav.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors min-h-[44px] ${
            pathname === href
              ? 'bg-blue-50 text-venue-primary font-medium'
              : 'text-venue-muted hover:bg-venue-surface hover:text-venue-foreground'
          }`}
        >
          {label}
        </Link>
      ))}
      <button
        type="button"
        onClick={() => {
          clearAdminToken()
          window.location.href = '/admin/login'
        }}
        className="mt-4 flex items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-venue-foreground min-h-[44px]"
      >
        Sign out
      </button>
    </nav>
  )
}
