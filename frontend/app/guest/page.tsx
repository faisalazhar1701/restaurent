'use client'

import { useState } from 'react'
import { VENUE_NAME } from '@/lib/dummy-data'
import { createGuestSession, getApiBaseUrlOrNull, ApiError } from '@/lib/api'
import { setGuestSession } from '@/lib/session'

export default function GuestEntryPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const apiConfigured = getApiBaseUrlOrNull() != null

  const handleStartOrder = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await createGuestSession()
      const token = data?.token
      const sessionId = data?.session?.id
      if (typeof token !== 'string' || typeof sessionId !== 'string') {
        setError('Invalid session response. Please try again.')
        return
      }
      setGuestSession(token, sessionId)
      window.location.href = '/guest/menu'
    } catch (e: unknown) {
      let msg = 'Something went wrong. Please try again.'
      if (e instanceof ApiError) {
        if (e.status === 404 || e.status === 503) msg = 'Service unavailable. Please try again in a moment.'
        else if (e.status === 408) msg = 'Request timed out. Please try again.'
        else if (e.status === 0) msg = 'Network error. Please check your connection.'
        else msg = e.message || msg
      } else if (e instanceof Error && e.message) msg = e.message
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-venue-primary">
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="max-w-sm text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-venue-accent sm:text-sm">
            Welcome to
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {VENUE_NAME}
          </h1>
          <p className="mt-5 text-sm leading-relaxed text-white/85">
            Order at your table. Tap below to get started.
          </p>
        </div>
        {!apiConfigured && (
          <p className="mt-4 text-center text-sm text-amber-200">
            Service is not configured. Please contact support.
          </p>
        )}
        <button
          type="button"
          onClick={handleStartOrder}
          disabled={loading || !apiConfigured}
          className="btn-accent mt-10 w-full max-w-xs py-4 text-center text-base font-semibold disabled:opacity-50"
        >
          {loading ? 'Starting…' : 'Start order'}
        </button>
        {error && (
          <p className="mt-4 max-w-xs text-center text-sm text-red-200">{error}</p>
        )}
      </div>
      <p className="pb-6 text-center text-xs text-white/50">Powered by Venue Seat</p>
    </main>
  )
}
