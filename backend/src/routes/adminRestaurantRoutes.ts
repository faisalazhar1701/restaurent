import { Router, type Request, type Response, type NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

/** GET /api/admin/restaurants — list all restaurants */
router.get('/restaurants', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const list = await prisma.restaurant.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(
      list.map((r) => ({
        id: r.id,
        name: r.name,
        isActive: r.isActive,
      }))
    );
  } catch (e) {
    next(e);
  }
});

/** POST /api/admin/restaurants — create restaurant */
router.post('/restaurants', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const name = (req.body.name as string)?.trim();
    if (!name) {
      throw new AppError(400, 'Name is required');
    }
    const restaurant = await prisma.restaurant.create({
      data: { name, isActive: true },
    });
    res.status(201).json({ id: restaurant.id, name: restaurant.name, isActive: restaurant.isActive });
  } catch (e) {
    next(e);
  }
});

/** PATCH /api/admin/restaurants/:id — update restaurant (e.g. isActive) */
router.patch('/restaurants/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) throw new AppError(400, 'Restaurant id is required');
    const body = req.body as { name?: string; isActive?: boolean };
    const updateData: { name?: string; isActive?: boolean } = {};
    if (typeof body.name === 'string' && body.name.trim()) {
      updateData.name = body.name.trim();
    }
    if (typeof body.isActive === 'boolean') {
      updateData.isActive = body.isActive;
    }
    if (Object.keys(updateData).length === 0) {
      throw new AppError(400, 'No valid fields to update');
    }
    const restaurant = await prisma.restaurant.update({
      where: { id },
      data: updateData,
    });
    res.json({ id: restaurant.id, name: restaurant.name, isActive: restaurant.isActive });
  } catch (e) {
    next(e);
  }
});

export default router;
