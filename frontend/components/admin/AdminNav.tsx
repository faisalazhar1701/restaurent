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
    <nav className="flex flex-col p-2">
      {nav.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={`rounded px-3 py-2 text-sm ${
            pathname === href ? 'bg-white/10' : 'hover:bg-white/5'
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
        className="mt-2 rounded px-3 py-2 text-left text-sm text-white/80 hover:bg-white/5"
      >
        Sign out
      </button>
    </nav>
  )
}
