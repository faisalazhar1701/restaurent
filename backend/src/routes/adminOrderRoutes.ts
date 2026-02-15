import { Router, type Request, type Response, type NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';

const router = Router();

/** GET /api/admin/orders — list placed orders (read-only). Always returns an array. */
router.get('/orders', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await prisma.order.findMany({
      where: { status: 'placed' },
      orderBy: { createdAt: 'desc' },
      include: {
        items: { include: { menuItem: true } },
      },
    });
    const payload = (orders ?? []).map((o) => ({
      id: o.id,
      sessionId: o.sessionId,
      tableNumber: o.tableNumber,
      status: o.status,
      createdAt: o.createdAt,
      items: (o.items ?? []).map((i) => ({
        id: i.id,
        menuItemId: i.menuItemId,
        menuItemName: i.menuItem.name,
        quantity: i.quantity,
        priceAtOrder: Number(i.priceAtOrder),
      })),
    }));
    res.json(payload);
  } catch (e) {
    next(e);
  }
});

export default router;
