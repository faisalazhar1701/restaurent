export const VENUE_NAME = 'Central Food Court'
export const PEOPLE_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, '9+'] as const
export const GUEST_COUNTS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const

export const ORDER_PATHS = [
  { id: 'now', title: 'Order now', description: 'Submit your order right away.' },
  { id: 'later', title: 'Order later', description: 'Set a time for your order.' },
] as const

export const REWARDS_TIER = { name: 'Silver', points: 420, nextTier: 'Gold', pointsToNext: 80 }
export const REWARDS_LIST = [
  { id: '1', name: 'Welcome drink', pointsRequired: 0, unlocked: true },
  { id: '2', name: 'Free dessert', pointsRequired: 500, unlocked: true },
  { id: '3', name: 'Main course 50% off', pointsRequired: 1500, unlocked: false },
  { id: '4', name: 'Free meal', pointsRequired: 3000, unlocked: false },
] as const

export const ADMIN_STATS = {
  occupancy: 68,
  tablesTotal: 48,
  tablesOccupied: 33,
  ordersToday: 312,
  guestsToday: 847,
  revenueToday: 12420,
  avgWaitMinutes: 8,
}

export const ANALYTICS_PLACEHOLDER = {
  dailyVisits: [120, 180, 150, 220, 190, 280, 312],
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
}
