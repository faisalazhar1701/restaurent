import { Router, type Request, type Response, type NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';

const router = Router();

/** GET /api/rewards — guest: list active rewards */
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const rewards = await prisma.reward.findMany({
      where: { isActive: true },
      orderBy: { title: 'asc' },
      include: { restaurant: { select: { id: true, name: true } } },
    });
    res.json(
      rewards.map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        restaurantId: r.restaurantId,
        restaurant: r.restaurant ? { id: r.restaurant.id, name: r.restaurant.name } : null,
      }))
    );
  } catch (e) {
    next(e);
  }
});

export default router;
