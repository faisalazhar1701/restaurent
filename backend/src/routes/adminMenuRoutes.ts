import { Router, type Request, type Response, type NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

/** GET /api/admin/menu/categories — list categories, optional ?restaurantId= */
router.get('/categories', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const restaurantId = (req.query.restaurantId as string) || undefined;
    const categories = await prisma.menuCategory.findMany({
      where: restaurantId ? { restaurantId } : {},
      orderBy: [{ orderIndex: 'asc' }, { name: 'asc' }],
      include: { _count: { select: { items: true } } },
    });
    res.json(
      categories.map((c) => ({
        id: c.id,
        name: c.name,
        count: c._count.items,
        restaurantId: c.restaurantId,
        orderIndex: c.orderIndex,
        isActive: c.isActive,
      }))
    );
  } catch (e) {
    next(e);
  }
});

/** POST /api/admin/menu/categories — create category */
router.post('/categories', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const name = (req.body.name as string)?.trim();
    const restaurantId = (req.body.restaurantId as string) || null;
    if (!name) {
      throw new AppError(400, 'Name is required');
    }
    const category = await prisma.menuCategory.create({
      data: { name, restaurantId, orderIndex: 0, isActive: true },
    });
    res.status(201).json({
      id: category.id,
      name: category.name,
      count: 0,
      restaurantId: category.restaurantId,
      orderIndex: category.orderIndex,
      isActive: category.isActive,
    });
  } catch (e) {
    next(e);
  }
});

/** PATCH /api/admin/menu/categories/:id — update category */
router.patch('/categories/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    if (!id) throw new AppError(400, 'Category id is required');
    const body = req.body as { name?: string; orderIndex?: number; isActive?: boolean };
    const updateData: { name?: string; orderIndex?: number; isActive?: boolean } = {};
    if (typeof body.name === 'string' && body.name.trim()) {
      updateData.name = body.name.trim();
    }
    if (typeof body.orderIndex === 'number') {
      updateData.orderIndex = body.orderIndex;
    }
    if (typeof body.isActive === 'boolean') {
      updateData.isActive = body.isActive;
    }
    if (Object.keys(updateData).length === 0) {
      throw new AppError(400, 'No valid fields to update');
    }
    const category = await prisma.menuCategory.update({
      where: { id },
      data: updateData,
    });
    res.json({
      id: category.id,
      name: category.name,
      restaurantId: category.restaurantId,
      orderIndex: category.orderIndex,
      isActive: category.isActive,
    });
  } catch (e) {
    next(e);
  }
});

/** GET /api/admin/menu/items — list items (including inactive), optional ?categoryId= ?restaurantId= */
router.get('/items', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categoryId = req.query.categoryId as string | undefined;
    const restaurantId = req.query.restaurantId as string | undefined;
    const where: { categoryId?: string; restaurantId?: string | null } = {};
    if (categoryId) where.categoryId = categoryId;
    if (restaurantId !== undefined) where.restaurantId = restaurantId || null;
    const items = await prisma.menuItem.findMany({
      where: Object.keys(where).length ? where : {},
      orderBy: [{ category: { name: 'asc' } }, { name: 'asc' }],
      include: { category: { select: { id: true, name: true } } },
    });
    res.json(
      items.map((i) => ({
        id: i.id,
        name: i.name,
        price: Number(i.price),
        description: i.description,
        isActive: i.isActive,
        categoryId: i.categoryId,
        restaurantId: i.restaurantId,
        category: i.category,
      }))
    );
  } catch (e) {
    next(e);
  }
});

/** POST /api/admin/menu/items — create item */
router.post('/items', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const name = (req.body.name as string)?.trim();
    const price = Number(req.body.price);
    const description = (req.body.description as string)?.trim() || null;
    const categoryId = req.body.categoryId as string;
    const restaurantId = (req.body.restaurantId as string) || null;
    const isActive = req.body.isActive !== false;

    if (!name) {
      throw new AppError(400, 'Name is required');
    }
    if (!Number.isFinite(price) || price < 0) {
      throw new AppError(400, 'Valid price is required');
    }
    if (!categoryId || typeof categoryId !== 'string') {
      throw new AppError(400, 'Category is required');
    }

    const category = await prisma.menuCategory.findUnique({ where: { id: categoryId } });
    if (!category) {
      throw new AppError(400, 'Category not found');
    }

    const item = await prisma.menuItem.create({
      data: { name, price, description, categoryId, restaurantId: restaurantId || category.restaurantId, isActive },
      include: { category: { select: { id: true, name: true } } },
    });
    res.status(201).json({
      id: item.id,
      name: item.name,
      price: Number(item.price),
      description: item.description,
      isActive: item.isActive,
      categoryId: item.categoryId,
      restaurantId: item.restaurantId,
      category: item.category,
    });
  } catch (e) {
    next(e);
  }
});

/** PATCH /api/admin/menu/items/:id — update item (including isActive toggle) */
router.patch('/items/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    if (!id) throw new AppError(400, 'Item id is required');
    const body = req.body;

    const updateData: {
      name?: string;
      price?: number;
      description?: string | null;
      isActive?: boolean;
      categoryId?: string;
    } = {};

    if (typeof body.name === 'string') {
      const name = body.name.trim();
      if (!name) throw new AppError(400, 'Name cannot be empty');
      updateData.name = name;
    }
    if (body.price !== undefined) {
      const price = Number(body.price);
      if (!Number.isFinite(price) || price < 0) throw new AppError(400, 'Invalid price');
      updateData.price = price;
    }
    if (body.description !== undefined) {
      updateData.description = typeof body.description === 'string' ? body.description.trim() || null : null;
    }
    if (typeof body.isActive === 'boolean') {
      updateData.isActive = body.isActive;
    }
    const categoryId = typeof body.categoryId === 'string' ? body.categoryId : undefined;
    if (categoryId) {
      const cat = await prisma.menuCategory.findUnique({ where: { id: categoryId } });
      if (!cat) throw new AppError(400, 'Category not found');
      updateData.categoryId = categoryId;
    }

    if (Object.keys(updateData).length === 0) {
      throw new AppError(400, 'No valid fields to update');
    }

    await prisma.menuItem.update({
      where: { id },
      data: updateData,
    });
    const item = await prisma.menuItem.findUnique({
      where: { id },
      include: { category: { select: { id: true, name: true } } },
    });
    if (!item) throw new AppError(404, 'Item not found');
    res.json({
      id: item.id,
      name: item.name,
      price: Number(item.price),
      description: item.description,
      isActive: item.isActive,
      categoryId: item.categoryId,
      category: item.category,
    });
  } catch (e) {
    next(e);
  }
});

export default router;
