'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
    <main className="flex min-h-screen flex-col items-center justify-center bg-venue-surface px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-venue-primary">Venue Seat</h1>
          <p className="mt-1 text-sm text-venue-muted">Admin sign in</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!apiConfigured && (
            <p className="text-sm text-amber-600">Service is not configured. Please contact support.</p>
          )}
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-venue-primary">
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
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-venue-primary">
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
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading || !apiConfigured}
            className="btn-primary min-h-[48px] w-full disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-venue-muted">
          <Link href="/" className="hover:text-venue-primary hover:underline">
            ← Back to home
          </Link>
        </p>
      </div>
    </main>
  )
}
