'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clearAdminToken } from '@/lib/adminAuth'

export function AdminNav() {
  const pathname = usePathname()

  const nav = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/seating', label: 'Seating' },
    { href: '/admin/tables', label: 'Tables' },
    { href: '/admin/orders', label: 'Orders' },
    { href: '/admin/analytics', label: 'Analytics' },
  ]

  return (
    <nav className="flex flex-col gap-0.5 p-4">
      {nav.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
            pathname === href
              ? 'bg-venue-primary/5 text-venue-primary'
              : 'text-venue-muted hover:bg-venue-surface hover:text-venue-primary'
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
        className="mt-4 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-venue-muted transition-colors hover:bg-venue-surface hover:text-venue-primary"
      >
        Sign out
      </button>
    </nav>
  )
}
