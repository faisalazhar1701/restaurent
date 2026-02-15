import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Admin user for placeholder login (foundation only; auth checks env vars)
  const admin = await prisma.user.upsert({
    where: { id: 'admin-user-1' },
    update: {},
    create: {
      id: 'admin-user-1',
      role: 'admin',
    },
  });
  console.log('Admin user:', admin.id);

  // Menu categories (aligned with frontend dummy data)
  const hot = await prisma.menuCategory.upsert({
    where: { id: 'cat-hot' },
    update: { name: 'Hot meals' },
    create: { id: 'cat-hot', name: 'Hot meals' },
  });
  const cold = await prisma.menuCategory.upsert({
    where: { id: 'cat-cold' },
    update: { name: 'Salads & cold' },
    create: { id: 'cat-cold', name: 'Salads & cold' },
  });
  const drinks = await prisma.menuCategory.upsert({
    where: { id: 'cat-drinks' },
    update: { name: 'Drinks' },
    create: { id: 'cat-drinks', name: 'Drinks' },
  });
  const desserts = await prisma.menuCategory.upsert({
    where: { id: 'cat-desserts' },
    update: { name: 'Desserts' },
    create: { id: 'cat-desserts', name: 'Desserts' },
  });

  // Menu items
  const items = [
    { id: 'item-1', name: 'Grilled chicken bowl', categoryId: hot.id, price: 12.5, description: 'Rice, greens, house sauce' },
    { id: 'item-2', name: 'Beef burger & fries', categoryId: hot.id, price: 14, description: 'Angus beef, brioche bun' },
    { id: 'item-3', name: 'Vegetable stir-fry', categoryId: hot.id, price: 11, description: 'Seasonal vegetables, jasmine rice' },
    { id: 'item-4', name: 'Caesar salad', categoryId: cold.id, price: 9.5, description: 'Romaine, parmesan, croutons' },
    { id: 'item-5', name: 'Fresh juice — orange', categoryId: drinks.id, price: 4.5, description: 'Freshly squeezed' },
    { id: 'item-6', name: 'Iced latte', categoryId: drinks.id, price: 5, description: 'Oat or regular milk' },
    { id: 'item-7', name: 'Chocolate brownie', categoryId: desserts.id, price: 5.5, description: 'Warm, with vanilla cream' },
  ];

  for (const item of items) {
    await prisma.menuItem.upsert({
      where: { id: item.id },
      update: { name: item.name, price: item.price, description: item.description },
      create: { ...item, isActive: true },
    });
  }

  // Tables (aligned with frontend zones; capacity = number of guests)
  const tables = [
    { id: 'table-1', tableNumber: 1, zone: 'A', capacity: 4, status: 'available' as const },
    { id: 'table-2', tableNumber: 2, zone: 'A', capacity: 4, status: 'occupied' as const },
    { id: 'table-3', tableNumber: 3, zone: 'A', capacity: 2, status: 'available' as const },
    { id: 'table-4', tableNumber: 4, zone: 'A', capacity: 6, status: 'occupied' as const },
    { id: 'table-5', tableNumber: 5, zone: 'B', capacity: 4, status: 'available' as const },
    { id: 'table-6', tableNumber: 6, zone: 'B', capacity: 4, status: 'occupied' as const },
    { id: 'table-7', tableNumber: 7, zone: 'B', capacity: 8, status: 'available' as const },
    { id: 'table-8', tableNumber: 8, zone: 'C', capacity: 4, status: 'occupied' as const },
  ];

  for (const t of tables) {
    await prisma.restaurantTable.upsert({
      where: { id: t.id },
      update: { status: t.status, zone: t.zone, capacity: t.capacity },
      create: t,
    });
  }

  console.log('Seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
