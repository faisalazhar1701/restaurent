// Dummy data – replace with API calls later

export const RESTAURANT = {
  name: 'The Garden Table',
  tagline: 'Fresh ingredients, simple flavors',
} as const;

export const MENU_CATEGORIES = ['Starters', 'Main', 'Drinks', 'Desserts'] as const;

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: (typeof MENU_CATEGORIES)[number];
  imagePlaceholder?: boolean;
}

export const MENU_ITEMS: MenuItem[] = [
  { id: '1', name: 'Bruschetta', price: 8.5, category: 'Starters' },
  { id: '2', name: 'Soup of the Day', price: 7, category: 'Starters' },
  { id: '3', name: 'Caesar Salad', price: 9.5, category: 'Starters' },
  { id: '4', name: 'Grilled Salmon', price: 18, category: 'Main' },
  { id: '5', name: 'Beef Burger', price: 14, category: 'Main' },
  { id: '6', name: 'Vegetable Pasta', price: 13, category: 'Main' },
  { id: '7', name: 'Chicken Bowl', price: 15, category: 'Main' },
  { id: '8', name: 'Iced Tea', price: 4, category: 'Drinks' },
  { id: '9', name: 'Fresh Lemonade', price: 4.5, category: 'Drinks' },
  { id: '10', name: 'Coffee', price: 3.5, category: 'Drinks' },
  { id: '11', name: 'Chocolate Cake', price: 7, category: 'Desserts' },
  { id: '12', name: 'Ice Cream', price: 5.5, category: 'Desserts' },
];

export const GUEST_COUNTS = Array.from({ length: 10 }, (_, i) => i + 1);

export const REWARDS = {
  pointsBalance: 1250,
  tiers: [
    { id: '1', name: 'Welcome Drink', points: 0, unlocked: true },
    { id: '2', name: 'Free Dessert', points: 500, unlocked: true },
    { id: '3', name: 'Main Course 50% Off', points: 1500, unlocked: false },
    { id: '4', name: 'Free Meal', points: 3000, unlocked: false },
  ],
} as const;

export const TABLES = [
  { id: '1', number: 1, status: 'available' as const },
  { id: '2', number: 2, status: 'occupied' as const },
  { id: '3', number: 3, status: 'available' as const },
  { id: '4', number: 4, status: 'occupied' as const },
  { id: '5', number: 5, status: 'available' as const },
  { id: '6', number: 6, status: 'available' as const },
  { id: '7', number: 7, status: 'occupied' as const },
  { id: '8', number: 8, status: 'available' as const },
];

export const ASSIGNED_TABLE_NUMBER = 3;

export const ADMIN_STATS = {
  ordersToday: 47,
  guestsToday: 128,
  revenueToday: 2840,
};
