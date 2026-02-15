import { Router, type Request, type Response, type NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

/** GET /api/tables — always returns an array */
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const tables = await prisma.restaurantTable.findMany({
      orderBy: [{ zone: 'asc' }, { tableNumber: 'asc' }],
    });
    const payload = tables.map((t) => ({
      id: t.id,
      tableNumber: t.tableNumber,
      zone: t.zone,
      capacity: t.capacity,
      status: t.status,
    }));
    res.json(payload);
  } catch (e) {
    next(e);
  }
});

/** POST /api/tables — create a table */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tableNumber = req.body.tableNumber != null ? Number(req.body.tableNumber) : undefined;
    const zone = req.body.zone as string | undefined | null;
    const capacityRaw = req.body.capacity != null ? Number(req.body.capacity) : undefined;
    const capacity =
      typeof capacityRaw === 'number' && Number.isInteger(capacityRaw) && capacityRaw >= 1 && capacityRaw <= 20
        ? capacityRaw
        : 4;
    if (tableNumber == null || !Number.isInteger(tableNumber) || tableNumber < 1) {
      throw new AppError(400, 'tableNumber is required and must be a positive integer');
    }
    const table = await prisma.restaurantTable.create({
      data: {
        tableNumber,
        zone: zone && String(zone).trim() ? String(zone).trim() : null,
        capacity,
        status: 'available',
      },
    });
    res.status(201).json({
      id: table.id,
      tableNumber: table.tableNumber,
      zone: table.zone,
      capacity: table.capacity,
      status: table.status,
    });
  } catch (e) {
    next(e);
  }
});

export default router;
