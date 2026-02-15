import { Router, type Request, type Response, type NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';

const router = Router();

/** GET /api/menu/categories */
router.get('/categories', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await prisma.menuCategory.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { items: true } } },
    });
    res.json(
      categories.map((c) => ({
        id: c.id,
        name: c.name,
        count: c._count.items,
      }))
    );
  } catch (e) {
    next(e);
  }
});

/** GET /api/menu/items — optional ?categoryId= */
router.get('/items', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categoryId = req.query.categoryId as string | undefined;
    const items = await prisma.menuItem.findMany({
      where: { isActive: true, ...(categoryId ? { categoryId } : {}) },
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
