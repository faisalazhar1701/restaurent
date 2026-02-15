import { Router, type Request, type Response, type NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

/** GET /api/admin/menu/categories — list all categories */
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

/** POST /api/admin/menu/categories — create category */
router.post('/categories', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const name = (req.body.name as string)?.trim();
    if (!name) {
      throw new AppError(400, 'Name is required');
    }
    const category = await prisma.menuCategory.create({
      data: { name },
    });
    res.status(201).json({ id: category.id, name: category.name, count: 0 });
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
    const name = (req.body.name as string)?.trim();
    if (!name) {
      throw new AppError(400, 'Name is required');
    }
    const category = await prisma.menuCategory.update({
      where: { id },
      data: { name },
    });
    res.json({ id: category.id, name: category.name });
  } catch (e) {
    next(e);
  }
});

/** GET /api/admin/menu/items — list all items (including inactive), optional ?categoryId= */
router.get('/items', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categoryId = req.query.categoryId as string | undefined;
    const items = await prisma.menuItem.findMany({
      where: categoryId ? { categoryId } : {},
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
      data: { name, price, description, categoryId, isActive },
      include: { category: { select: { id: true, name: true } } },
    });
    res.status(201).json({
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

/** PATCH /api/admin/menu/items/:id — update item */
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
