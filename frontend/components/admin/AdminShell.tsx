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
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Loading…</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 sm:flex-row">
      <aside className="w-full shrink-0 border-r border-slate-200 bg-white shadow-sm sm:w-64">
        <div className="border-b border-slate-200 px-6 py-6">
          <Link
            href="/admin"
            className="text-lg font-semibold tracking-tight text-slate-900"
          >
            Venue Seat
          </Link>
          <p className="mt-1 text-xs text-slate-500">Admin</p>
        </div>
        <AdminNav />
      </aside>
      <main className="flex-1 overflow-auto px-4 py-8 sm:px-8 lg:px-12">{children}</main>
    </div>
  )
}
