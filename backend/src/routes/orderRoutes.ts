import { Router, type Request, type Response, type NextFunction } from 'express';
import {
  createOrGetDraft,
  addOrUpdateItem,
  removeItem,
  placeOrder,
} from '../services/orderService.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

/** POST /api/orders/draft — create or return existing draft for session */
router.post('/draft', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId = req.body.sessionId as string | undefined;
    if (!sessionId || typeof sessionId !== 'string') {
      return res.status(400).json({ error: 'sessionId is required' });
    }
    const order = await createOrGetDraft(sessionId);
    res.json(formatOrder(order));
  } catch (e) {
    next(e);
  }
});

/** POST /api/orders/items — add or update item in draft */
router.post('/items', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orderId = req.body.orderId as string | undefined;
    const menuItemId = req.body.menuItemId as string | undefined;
    const quantity = req.body.quantity != null ? Number(req.body.quantity) : 1;
    const sessionId = req.body.sessionId as string | undefined;

    if (!orderId || !menuItemId || !sessionId) {
      return res.status(400).json({ error: 'orderId, menuItemId, and sessionId are required' });
    }
    const item = await addOrUpdateItem({
      orderId,
      menuItemId,
      quantity,
      sessionId,
    });
    res.json(formatOrderItem(item));
  } catch (e) {
    next(e);
  }
});

/** DELETE /api/orders/items/:id — remove item from cart */
router.delete('/items/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawOrderItemId = req.params.id;
    const orderItemId = typeof rawOrderItemId === 'string' ? rawOrderItemId : Array.isArray(rawOrderItemId) ? rawOrderItemId[0] : undefined;
    const rawSessionId = req.query.sessionId;
    const sessionIdParam =
      typeof rawSessionId === 'string' ? rawSessionId : Array.isArray(rawSessionId) ? rawSessionId[0] : undefined;
    if (orderItemId == null || typeof orderItemId !== 'string') {
      return res.status(400).json({ error: 'Order item id is required' });
    }
    if (sessionIdParam == null || typeof sessionIdParam !== 'string') {
      return res.status(400).json({ error: 'sessionId query param is required' });
    }
    await removeItem({ orderItemId, sessionId: sessionIdParam });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

/** POST /api/orders/place — place order */
router.post('/place', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orderId = req.body.orderId as string | undefined;
    const sessionId = req.body.sessionId as string | undefined;
    if (!orderId || !sessionId) {
      return res.status(400).json({ error: 'orderId and sessionId are required' });
    }
    const order = await placeOrder({ orderId, sessionId });
    if (!order) {
      return next(new AppError(500, 'Order not found after place'));
    }
    res.json(formatOrder(order));
  } catch (e) {
    next(e);
  }
});

function formatOrderItem(item: { id: string; quantity: number; priceAtOrder: unknown; menuItem: { id: string; name: string; price: unknown } }) {
  return {
    id: item.id,
    menuItemId: item.menuItem.id,
    menuItemName: item.menuItem.name,
    quantity: item.quantity,
    priceAtOrder: Number(item.priceAtOrder),
  };
}

function formatOrder(order: {
  id: string;
  sessionId: string;
  tableNumber: number | null;
  status: string;
  createdAt: Date;
  items: Array<{ id: string; quantity: number; priceAtOrder: unknown; menuItem: { id: string; name: string; price: unknown } }>;
}) {
  return {
    id: order.id,
    sessionId: order.sessionId,
    tableNumber: order.tableNumber,
    status: order.status,
    createdAt: order.createdAt,
    items: order.items.map(formatOrderItem),
  };
}

export default router;
