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
          className={`flex h-12 items-center gap-3 rounded-xl px-4 text-sm font-medium transition-all ${
            pathname === href
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
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
        className="mt-4 flex h-12 items-center gap-3 rounded-xl px-4 text-left text-sm font-medium text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900"
      >
        Sign out
      </button>
    </nav>
  )
}
