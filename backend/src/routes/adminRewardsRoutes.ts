import { Router, type Request, type Response, type NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

/** GET /api/admin/rewards — list all rewards */
router.get('/rewards', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const rewards = await prisma.reward.findMany({
      orderBy: { title: 'asc' },
      include: { restaurant: { select: { id: true, name: true } } },
    });
    res.json(
      rewards.map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        restaurantId: r.restaurantId,
        isActive: r.isActive,
        restaurant: r.restaurant ? { id: r.restaurant.id, name: r.restaurant.name } : null,
      }))
    );
  } catch (e) {
    next(e);
  }
});

/** POST /api/admin/rewards — create reward */
router.post('/rewards', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const title = (req.body.title as string)?.trim();
    const description = (req.body.description as string)?.trim() || null;
    const restaurantId = (req.body.restaurantId as string) || null;
    if (!title) throw new AppError(400, 'Title is required');
    const reward = await prisma.reward.create({
      data: { title, description, restaurantId, isActive: true },
      include: { restaurant: { select: { id: true, name: true } } },
    });
    res.status(201).json({
      id: reward.id,
      title: reward.title,
      description: reward.description,
      restaurantId: reward.restaurantId,
      isActive: reward.isActive,
      restaurant: reward.restaurant ? { id: reward.restaurant.id, name: reward.restaurant.name } : null,
    });
  } catch (e) {
    next(e);
  }
});

/** PATCH /api/admin/rewards/:id — update reward */
router.patch('/rewards/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) throw new AppError(400, 'Reward id is required');
    const body = req.body as { title?: string; description?: string; restaurantId?: string | null; isActive?: boolean };
    const updateData: { title?: string; description?: string | null; restaurantId?: string | null; isActive?: boolean } = {};
    if (typeof body.title === 'string' && body.title.trim()) updateData.title = body.title.trim();
    if (body.description !== undefined) updateData.description = typeof body.description === 'string' ? body.description.trim() || null : null;
    if (body.restaurantId !== undefined) updateData.restaurantId = body.restaurantId || null;
    if (typeof body.isActive === 'boolean') updateData.isActive = body.isActive;
    if (Object.keys(updateData).length === 0) throw new AppError(400, 'No valid fields to update');
    const reward = await prisma.reward.update({
      where: { id },
      data: updateData,
      include: { restaurant: { select: { id: true, name: true } } },
    });
    res.json({
      id: reward.id,
      title: reward.title,
      description: reward.description,
      restaurantId: reward.restaurantId,
      isActive: reward.isActive,
      restaurant: reward.restaurant ? { id: reward.restaurant.id, name: reward.restaurant.name } : null,
    });
  } catch (e) {
    next(e);
  }
});

export default router;
