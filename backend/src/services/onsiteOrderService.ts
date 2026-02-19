/**
 * On-site restaurant order flow: admin creates order manually,
 * generates QR payment link. Guest scans QR -> Stripe Checkout -> paid -> rewards.
 */
import { env } from '../config/env.js';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { assignTableToSession } from './seatingService.js';
import { createGuestSession } from './sessionService.js';

const now = () => new Date();

/** Create on-site order: session (table or existing) + draft order + items. Returns QR payment URL. */
export async function createOnSiteOrder(params: {
  tableNumber?: number | null;
  zone?: string | null;
  sessionId?: string | null;
  guestCount?: number;
  items: Array<{ menuItemId: string; quantity: number }>;
}): Promise<{ orderId: string; sessionId: string; qrPaymentUrl: string }> {
  const { tableNumber, zone, sessionId, guestCount, items } = params;

  if (!items || items.length === 0) {
    throw new AppError(400, 'Add at least one item');
  }

  let resolvedSessionId: string;
  let resolvedGuestCount: number;

  if (sessionId && typeof sessionId === 'string' && sessionId.trim()) {
    const session = await prisma.session.findUnique({
      where: { id: sessionId.trim() },
    });
    if (!session) {
      throw new AppError(404, 'Session not found');
    }
    if (session.expiresAt <= now()) {
      throw new AppError(400, 'Session expired');
    }
    if (session.endedAt) {
      throw new AppError(400, 'Session has ended');
    }
    resolvedSessionId = session.id;
    resolvedGuestCount = session.guestCount ?? guestCount ?? 2;
  } else if (
    tableNumber != null &&
    Number.isInteger(tableNumber) &&
    tableNumber >= 1
  ) {
    const count = Math.min(10, Math.max(1, guestCount ?? 2));
    const { session } = await createGuestSession({
      guestCount: count,
    });
    resolvedSessionId = session.id;
    resolvedGuestCount = count;
    await assignTableToSession({
      sessionId: session.id,
      guestCount: count,
      optionalTableNumber: tableNumber,
      optionalZone: zone ?? undefined,
    });
  } else {
    throw new AppError(400, 'Provide tableNumber+zone or sessionId');
  }

  const order = await prisma.order.create({
    data: {
      sessionId: resolvedSessionId,
      status: 'draft',
    },
  });

  for (const { menuItemId, quantity } of items) {
    if (!menuItemId || quantity < 1) continue;
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: menuItemId },
    });
    if (!menuItem || !menuItem.isActive) {
      throw new AppError(400, `Invalid or inactive menu item: ${menuItemId}`);
    }
    await prisma.orderItem.create({
      data: {
        orderId: order.id,
        menuItemId: menuItem.id,
        quantity,
        priceAtOrder: menuItem.price,
      },
    });
  }

  const itemCount = await prisma.orderItem.count({
    where: { orderId: order.id },
  });
  if (itemCount === 0) {
    await prisma.order.delete({ where: { id: order.id } });
    throw new AppError(400, 'Add at least one valid item');
  }

  const base = env.FRONTEND_URL.replace(/\/$/, '');
  const qrPaymentUrl = `${base}/guest/pay?orderId=${encodeURIComponent(order.id)}&sessionId=${encodeURIComponent(resolvedSessionId)}`;

  return {
    orderId: order.id,
    sessionId: resolvedSessionId,
    qrPaymentUrl,
  };
}
