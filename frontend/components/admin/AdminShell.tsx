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
      <div className="flex min-h-screen items-center justify-center bg-venue-surface text-venue-foreground">
        <p className="text-sm text-venue-muted">Loading…</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-venue-surface sm:flex-row">
      <aside className="w-full shrink-0 border-r border-gray-200 bg-white sm:w-56">
        <div className="border-b border-gray-200 px-5 py-5">
          <Link
            href="/admin"
            className="text-lg font-semibold tracking-tight text-venue-foreground"
          >
            Venue Seat
          </Link>
          <p className="mt-1 text-xs text-gray-500">Admin</p>
        </div>
        <AdminNav />
      </aside>
      <main className="flex-1 overflow-auto p-6 sm:p-8 lg:p-10">{children}</main>
    </div>
  )
}
