function getApiBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_BASE_URL
  if (url == null || url === '') {
    throw new Error('Service is not configured. Please contact support.')
  }
  return url.replace(/\/$/, '')
}

export function getApiBaseUrlOrNull(): string | null {
  const url = process.env.NEXT_PUBLIC_API_BASE_URL
  if (url == null || url === '') return null
  return url.replace(/\/$/, '')
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: { error?: string }
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

const REQUEST_TIMEOUT_MS = 15000

async function request<T>(
  path: string,
  options?: RequestInit & { params?: Record<string, string> }
): Promise<T> {
  const { params, ...init } = options ?? {}
  const url = new URL(path, getApiBaseUrl())
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  }
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  let res: Response
  try {
    res = await fetch(url.toString(), {
      ...init,
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...init.headers },
    })
  } catch (e) {
    clearTimeout(timeoutId)
    if (e instanceof Error && e.name === 'AbortError') {
      throw new ApiError(408, 'Request timed out. Please try again.')
    }
    throw new ApiError(0, 'Network error. Please try again.')
  }
  clearTimeout(timeoutId)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = (data?.error as string) ?? res.statusText ?? 'Request failed'
    throw new ApiError(res.status, msg, data)
  }
  return data as T
}

export type GuestSession = {
  token: string
  session: { id: string; tableNumber?: number | null; guestCount?: number | null; expiresAt: string }
}

export async function createGuestSession(params?: {
  tableNumber?: number
  guestCount?: number
}): Promise<GuestSession> {
  return request<GuestSession>('/api/sessions/guest', {
    method: 'POST',
    body: JSON.stringify(params ?? {}),
  })
}

export type MenuCategory = { id: string; name: string; count: number }
export type MenuItem = {
  id: string
  name: string
  price: number
  description?: string | null
  categoryId: string
  category?: { id: string; name: string }
}

function toArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data
  return []
}

export async function getMenuCategories(): Promise<MenuCategory[]> {
  return toArray<MenuCategory>(await request<unknown>('/api/menu/categories'))
}

export async function getMenuItems(categoryId?: string): Promise<MenuItem[]> {
  const data = await request<unknown>('/api/menu/items', {
    params: categoryId ? { categoryId } : undefined,
  })
  return toArray<MenuItem>(data)
}

export type AssignTableResult = { tableNumber: number; zone: string | null; status: string }

export async function assignTable(params: {
  sessionId: string
  zone?: string | null
  guestCount?: number | null
}): Promise<AssignTableResult> {
  return request<AssignTableResult>('/api/seating/assign', {
    method: 'POST',
    body: JSON.stringify(params),
  })
}

export async function releaseTable(sessionId: string): Promise<void> {
  await request('/api/seating/release', {
    method: 'POST',
    body: JSON.stringify({ sessionId }),
  })
}

export type OrderItemResponse = {
  id: string
  menuItemId: string
  menuItemName: string
  quantity: number
  priceAtOrder: number
}

export type OrderResponse = {
  id: string
  sessionId: string
  tableNumber: number | null
  status: string
  createdAt: string
  items: OrderItemResponse[]
}

export async function createOrGetDraftOrder(sessionId: string): Promise<OrderResponse> {
  return request<OrderResponse>('/api/orders/draft', {
    method: 'POST',
    body: JSON.stringify({ sessionId }),
  })
}

export async function addOrderItem(params: {
  orderId: string
  menuItemId: string
  quantity: number
  sessionId: string
}): Promise<OrderItemResponse> {
  return request<OrderItemResponse>('/api/orders/items', {
    method: 'POST',
    body: JSON.stringify(params),
  })
}

export async function removeOrderItem(orderItemId: string, sessionId: string): Promise<void> {
  const url = new URL('/api/orders/items/' + encodeURIComponent(orderItemId), getApiBaseUrl())
  url.searchParams.set('sessionId', sessionId)
  const res = await fetch(url.toString(), { method: 'DELETE' })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiError(res.status, (data?.error as string) ?? res.statusText ?? 'Request failed', data)
}

export async function placeOrderApi(orderId: string, sessionId: string): Promise<OrderResponse> {
  return request<OrderResponse>('/api/orders/place', {
    method: 'POST',
    body: JSON.stringify({ orderId, sessionId }),
  })
}

export type RestaurantTable = {
  id: string
  tableNumber: number
  zone: string | null
  capacity?: number
  status: string
}

export async function getTables(): Promise<RestaurantTable[]> {
  return toArray<RestaurantTable>(await request<unknown>('/api/tables'))
}

export async function createTable(params: {
  tableNumber: number
  zone?: string | null
  capacity?: number
}): Promise<RestaurantTable> {
  return request<RestaurantTable>('/api/tables', {
    method: 'POST',
    body: JSON.stringify(params),
  })
}

export async function getAdminOrders(): Promise<OrderResponse[]> {
  return toArray<OrderResponse>(await request<unknown>('/api/admin/orders'))
}

export type AdminLoginResponse = { token: string; user: { id: string; role: string } }

export async function adminLogin(email: string, password: string): Promise<AdminLoginResponse> {
  return request<AdminLoginResponse>('/api/auth/admin/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}
