'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { type ReactNode, useEffect, useState } from 'react'
import { getAdminToken } from '@/lib/adminAuth'
import { AdminNav } from '@/components/admin/AdminNav'

const LOGIN_PATH = '/admin/login'

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const isLoginPage = pathname === LOGIN_PATH

  useEffect(() => {
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    const token = getAdminToken()
    if (isLoginPage) {
      if (token) router.replace('/admin/seating')
      return
    }
    if (!token) router.replace(LOGIN_PATH)
  }, [ready, isLoginPage, router, pathname])

  if (isLoginPage) return <>{children}</>

  if (!ready || !getAdminToken()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-venue-surface">
        <p className="text-venue-muted">Loading…</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-venue-surface sm:flex-row">
      <aside className="w-full shrink-0 bg-venue-primary text-white sm:w-56">
        <div className="border-b border-white/10 p-4">
          <Link href="/admin" className="text-lg font-semibold tracking-tight">
            Venue Seat
          </Link>
          <p className="mt-0.5 text-xs text-white/60">Admin</p>
        </div>
        <AdminNav />
      </aside>
      <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  )
}
