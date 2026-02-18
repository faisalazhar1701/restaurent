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

// Admin restaurants
export type AdminRestaurant = { id: string; name: string; isActive: boolean }

export async function getAdminRestaurants(): Promise<AdminRestaurant[]> {
  return toArray<AdminRestaurant>(await request<unknown>('/api/admin/restaurants'))
}

export async function createAdminRestaurant(name: string): Promise<AdminRestaurant> {
  return request<AdminRestaurant>('/api/admin/restaurants', {
    method: 'POST',
    body: JSON.stringify({ name: name.trim() }),
  })
}

export async function updateAdminRestaurant(
  id: string,
  params: Partial<{ name: string; isActive: boolean }>
): Promise<AdminRestaurant> {
  return request<AdminRestaurant>(`/api/admin/restaurants/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(params),
  })
}

// Admin menu (products) API
export type AdminMenuCategory = { id: string; name: string; count: number; restaurantId?: string | null; orderIndex?: number; isActive?: boolean }
export type AdminMenuItem = {
  id: string
  name: string
  price: number
  description?: string | null
  isActive: boolean
  categoryId: string
  restaurantId?: string | null
  category?: { id: string; name: string }
}

export async function getAdminCategories(restaurantId?: string | null): Promise<AdminMenuCategory[]> {
  const data = await request<unknown>('/api/admin/menu/categories', {
    params: restaurantId != null && restaurantId !== '' ? { restaurantId } : undefined,
  })
  return toArray<AdminMenuCategory>(data)
}

export async function createAdminCategory(name: string, restaurantId?: string | null): Promise<AdminMenuCategory> {
  return request<AdminMenuCategory>('/api/admin/menu/categories', {
    method: 'POST',
    body: JSON.stringify({ name: name.trim(), restaurantId: restaurantId || null }),
  })
}

export async function updateAdminCategory(id: string, name: string): Promise<{ id: string; name: string }> {
  return request<{ id: string; name: string }>(`/api/admin/menu/categories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ name: name.trim() }),
  })
}

export async function getAdminItems(categoryId?: string, restaurantId?: string | null): Promise<AdminMenuItem[]> {
  const params: Record<string, string> = {}
  if (categoryId) params.categoryId = categoryId
  if (restaurantId != null && restaurantId !== '') params.restaurantId = restaurantId
  const data = await request<unknown>('/api/admin/menu/items', {
    params: Object.keys(params).length ? params : undefined,
  })
  return toArray<AdminMenuItem>(data)
}

export async function createAdminItem(params: {
  name: string
  price: number
  description?: string | null
  categoryId: string
  restaurantId?: string | null
  isActive?: boolean
}): Promise<AdminMenuItem> {
  return request<AdminMenuItem>('/api/admin/menu/items', {
    method: 'POST',
    body: JSON.stringify(params),
  })
}

export async function updateAdminItem(
  id: string,
  params: Partial<{ name: string; price: number; description: string | null; isActive: boolean; categoryId: string }>
): Promise<AdminMenuItem> {
  return request<AdminMenuItem>(`/api/admin/menu/items/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(params),
  })
}

export type AdminLoginResponse = { token: string; user: { id: string; role: string } }

export async function adminLogin(email: string, password: string): Promise<AdminLoginResponse> {
  return request<AdminLoginResponse>('/api/auth/admin/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}
