'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  UtensilsCrossed,
  Package,
  Armchair,
  Table2,
  ClipboardList,
  Gift,
  BarChart3,
  LogOut,
} from 'lucide-react'
import { clearAdminToken } from '@/lib/adminAuth'

const nav = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/restaurants', label: 'Restaurants', icon: UtensilsCrossed },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/seating', label: 'Seating', icon: Armchair },
  { href: '/admin/tables', label: 'Tables', icon: Table2 },
  { href: '/admin/orders', label: 'Orders', icon: ClipboardList },
  { href: '/admin/rewards', label: 'Rewards', icon: Gift },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1 p-4">
      {nav.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={`flex h-12 items-center gap-3 rounded-xl px-4 text-sm font-medium transition-all ${
            pathname === href
              ? 'bg-venue-primary text-white'
              : 'text-venue-muted hover:bg-[#F9FAFB] hover:text-venue-primary'
          }`}
        >
          <Icon className="h-5 w-5 shrink-0" />
          {label}
        </Link>
      ))}
      <button
        type="button"
        onClick={() => {
          clearAdminToken()
          window.location.href = '/admin/login'
        }}
        className="mt-4 flex h-12 items-center gap-3 rounded-xl px-4 text-left text-sm font-medium text-venue-muted transition-all hover:bg-[#F9FAFB] hover:text-venue-primary"
      >
        <LogOut className="h-5 w-5 shrink-0" />
        Sign out
      </button>
    </nav>
  )
}
