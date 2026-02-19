import { Router, type Request, type Response, type NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { createOnSiteOrder } from '../services/onsiteOrderService.js';

const router = Router();

/** POST /api/admin/orders/onsite — create on-site order, returns QR payment URL */
router.post('/orders/onsite', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tableNumber = req.body.tableNumber != null ? Number(req.body.tableNumber) : undefined;
    const zone = req.body.zone as string | null | undefined;
    const sessionId = req.body.sessionId as string | null | undefined;
    const guestCount = req.body.guestCount != null ? Number(req.body.guestCount) : undefined;
    const itemsRaw = req.body.items;
    const items = Array.isArray(itemsRaw)
      ? itemsRaw
          .filter(
            (x: unknown) =>
              x != null &&
              typeof x === 'object' &&
              'menuItemId' in x &&
              'quantity' in x &&
              typeof (x as { menuItemId: unknown }).menuItemId === 'string' &&
              typeof (x as { quantity: unknown }).quantity === 'number'
          )
          .map((x: { menuItemId: string; quantity: number }) => ({
            menuItemId: String((x as { menuItemId: string }).menuItemId).trim(),
            quantity: Math.max(1, Math.min(99, Math.floor((x as { quantity: number }).quantity))),
          }))
      : [];
    const result = await createOnSiteOrder({
      tableNumber: Number.isInteger(tableNumber) ? tableNumber : undefined,
      zone: zone ?? undefined,
      sessionId: sessionId ?? undefined,
      guestCount:
        guestCount != null && Number.isInteger(guestCount) && guestCount >= 1 && guestCount <= 10
          ? guestCount
          : undefined,
      items,
    });
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
});

/** GET /api/admin/orders — list placed orders (read-only). Always returns an array. */
router.get('/orders', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await prisma.order.findMany({
      where: { status: 'placed' },
      orderBy: { createdAt: 'desc' },
      include: {
        items: { include: { menuItem: { include: { restaurant: { select: { id: true, name: true } } } } } },
      },
    });
    const payload = (orders ?? []).map((o) => {
      const items = o.items ?? [];
      const restaurantFromItem = items[0]?.menuItem?.restaurant;
      const total = items.reduce((s, i) => s + Number(i.priceAtOrder) * i.quantity, 0);
      return {
        id: o.id,
        sessionId: o.sessionId,
        tableNumber: o.tableNumber,
        status: o.status,
        paymentStatus: o.paymentStatus ?? null,
        createdAt: o.createdAt,
        restaurant: restaurantFromItem ? { id: restaurantFromItem.id, name: restaurantFromItem.name } : null,
        total,
        items: items.map((i) => ({
          id: i.id,
          menuItemId: i.menuItemId,
          menuItemName: i.menuItem.name,
          quantity: i.quantity,
          priceAtOrder: Number(i.priceAtOrder),
        })),
      };
    });
    res.json(payload);
  } catch (e) {
    next(e);
  }
});

export default router;
