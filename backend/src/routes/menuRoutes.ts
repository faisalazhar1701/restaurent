import { Router, type Request, type Response, type NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';

const router = Router();

/** Resolve active restaurant IDs for guest menu (empty = show legacy null-scoped only) */
async function getActiveRestaurantIds(): Promise<string[]> {
  const list = await prisma.restaurant.findMany({
    where: { isActive: true },
    select: { id: true },
  });
  return list.map((r) => r.id);
}

/** GET /api/menu/categories — guest: active restaurants + active categories only */
router.get('/categories', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const activeIds = await getActiveRestaurantIds();
    const where =
      activeIds.length > 0
        ? { isActive: true, OR: [{ restaurantId: { in: activeIds } }, { restaurantId: null }] }
        : { isActive: true, restaurantId: null };
    const categories = await prisma.menuCategory.findMany({
      where,
      orderBy: [{ orderIndex: 'asc' }, { name: 'asc' }],
      include: {
        _count: {
          select: {
            items: true,
          },
        },
      },
    });
    const categoryIds = categories.map((c) => c.id);
    const availableCounts = await prisma.menuItem.groupBy({
      by: ['categoryId'],
      where: {
        categoryId: { in: categoryIds },
        isActive: true,
      },
      _count: { id: true },
    });
    const countByCat = Object.fromEntries(availableCounts.map((g) => [g.categoryId, g._count.id]));
    res.json(
      categories.map((c) => ({
        id: c.id,
        name: c.name,
        count: countByCat[c.id] ?? 0,
      }))
    );
  } catch (e) {
    next(e);
  }
});

/** GET /api/menu/items — guest: optional ?categoryId=, only active items */
router.get('/items', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categoryId = req.query.categoryId as string | undefined;
    const activeIds = await getActiveRestaurantIds();
    const items = await prisma.menuItem.findMany({
      where:
        activeIds.length > 0
          ? {
              isActive: true,
              ...(categoryId ? { categoryId } : {}),
              OR: [
                { restaurantId: { in: activeIds } },
                { restaurantId: null },
              ],
            }
          : {
              isActive: true,
              restaurantId: null,
              ...(categoryId ? { categoryId } : {}),
            },
      orderBy: { name: 'asc' },
      include: { category: { select: { id: true, name: true } } },
    });
    res.json(
      items.map((i) => ({
        id: i.id,
        name: i.name,
        price: Number(i.price),
        description: i.description,
        categoryId: i.categoryId,
        category: i.category,
      }))
    );
  } catch (e) {
    next(e);
  }
});

export default router;
