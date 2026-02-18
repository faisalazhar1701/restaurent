const GUEST_TOKEN_KEY = 'guest_token'
const GUEST_SESSION_ID_KEY = 'guest_session_id'
const GUEST_PREFS_KEY = 'guest_prefs'
const GUEST_QR_CONTEXT_KEY = 'guest_qr_context'

export type GuestQrSource = 'entry' | 'table'

export type GuestQrContext = {
  source: GuestQrSource
  tableId?: string
  zoneId?: string
}

export function getGuestQrContext(): GuestQrContext | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(GUEST_QR_CONTEXT_KEY)
    return raw ? (JSON.parse(raw) as GuestQrContext) : null
  } catch {
    return null
  }
}

export function setGuestQrContext(ctx: GuestQrContext): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(GUEST_QR_CONTEXT_KEY, JSON.stringify(ctx))
}

export function clearGuestQrContext(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(GUEST_QR_CONTEXT_KEY)
}

export function getGuestSession(): { token: string; sessionId: string } | null {
  if (typeof window === 'undefined') return null
  const token = localStorage.getItem(GUEST_TOKEN_KEY)
  const sessionId = localStorage.getItem(GUEST_SESSION_ID_KEY)
  if (!token || !sessionId) return null
  return { token, sessionId }
}

export function setGuestSession(token: string, sessionId: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(GUEST_TOKEN_KEY, token)
  localStorage.setItem(GUEST_SESSION_ID_KEY, sessionId)
}

export function clearGuestSession(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(GUEST_TOKEN_KEY)
  localStorage.removeItem(GUEST_SESSION_ID_KEY)
  localStorage.removeItem(GUEST_PREFS_KEY)
  localStorage.removeItem(GUEST_QR_CONTEXT_KEY)
}

export type GuestPrefs = { guestCount?: number; dineIn?: boolean }

export function getGuestPrefs(): GuestPrefs | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(GUEST_PREFS_KEY)
    return raw ? (JSON.parse(raw) as GuestPrefs) : null
  } catch {
    return null
  }
}

export function setGuestPrefs(prefs: GuestPrefs): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(GUEST_PREFS_KEY, JSON.stringify(prefs))
}
