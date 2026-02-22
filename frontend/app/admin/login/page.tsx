'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { adminLogin, getApiBaseUrlOrNull, ApiError } from '@/lib/api'
import { setAdminToken } from '@/lib/adminAuth'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const apiConfigured = getApiBaseUrlOrNull() != null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const data = await adminLogin(email.trim(), password)
      const token = data?.token
      if (typeof token !== 'string') {
        setError('Invalid response. Please try again.')
        return
      }
      setAdminToken(token)
      router.replace('/admin/seating')
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.status === 401) setError('Invalid email or password.')
        else if (e.status === 408) setError('Request timed out. Please try again.')
        else if (e.status === 503 || e.status === 0) setError('Service unavailable. Please try again later.')
        else setError(e.message || 'Something went wrong. Please try again.')
      } else {
        setError(e instanceof Error ? e.message : 'Could not sign in. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-16">
      <div className="w-full max-w-[400px]">
        <div className="mb-10 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Venue Seat
          </h1>
          <p className="mt-2 text-sm text-slate-500">Admin sign in</p>
        </div>
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {!apiConfigured && (
              <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                Service is not configured. Please contact support.
              </p>
            )}
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-900">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field"
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-900">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-field"
              />
            </div>
            {error && (
              <p className="text-sm text-venue-danger">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading || !apiConfigured}
              className="btn-primary w-full py-3.5 disabled:opacity-50"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </Card>
        <p className="mt-8 text-center text-sm text-slate-500">
          <Link href="/" className="font-medium text-slate-900 hover:underline">
            ← Back to home
          </Link>
        </p>
      </div>
    </main>
  )
}
