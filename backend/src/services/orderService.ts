import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';

const now = () => new Date();

async function getActiveSession(sessionId: string) {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });
  if (!session || session.expiresAt <= now()) return null;
  return session;
}

async function getDraftOrder(sessionId: string) {
  return prisma.order.findFirst({
    where: { sessionId, status: 'draft' },
    include: {
      items: { include: { menuItem: true } },
    },
  });
}

export async function createOrGetDraft(sessionId: string) {
  const session = await getActiveSession(sessionId);
  if (!session) {
    throw new AppError(404, 'Session not found or expired');
  }

  let order = await getDraftOrder(sessionId);
  if (order) {
    return order;
  }

  order = await prisma.order.create({
    data: {
      sessionId,
      tableNumber: session.tableNumber,
      status: 'draft',
    },
    include: {
      items: { include: { menuItem: true } },
    },
  });
  return order;
}

export async function addOrUpdateItem(params: {
  orderId: string;
  menuItemId: string;
  quantity: number;
  sessionId: string;
}) {
  const { orderId, menuItemId, quantity, sessionId } = params;

  const session = await getActiveSession(sessionId);
  if (!session) {
    throw new AppError(404, 'Session not found or expired');
  }

  const order = await prisma.order.findFirst({
    where: { id: orderId, sessionId, status: 'draft' },
  });
  if (!order) {
    throw new AppError(400, 'Order not found or already placed');
  }

  const menuItem = await prisma.menuItem.findUnique({
    where: { id: menuItemId, isActive: true },
  });
  if (!menuItem) {
    throw new AppError(400, 'Invalid or inactive menu item');
  }

  if (quantity < 1) {
    throw new AppError(400, 'Quantity must be at least 1');
  }

  const existing = await prisma.orderItem.findFirst({
    where: { orderId, menuItemId },
  });

  const priceAtOrder = menuItem.price;

  if (existing) {
    const item = await prisma.orderItem.update({
      where: { id: existing.id },
      data: { quantity, priceAtOrder },
      include: { menuItem: true },
    });
    return item;
  }

  const item = await prisma.orderItem.create({
    data: {
      orderId,
      menuItemId,
      quantity,
      priceAtOrder,
    },
    include: { menuItem: true },
  });
  return item;
}

export async function removeItem(params: {
  orderItemId: string;
  sessionId: string;
}) {
  const { orderItemId, sessionId } = params;

  const session = await getActiveSession(sessionId);
  if (!session) {
    throw new AppError(404, 'Session not found or expired');
  }

  const item = await prisma.orderItem.findFirst({
    where: {
      id: orderItemId,
      order: { sessionId, status: 'draft' },
    },
  });
  if (!item) {
    throw new AppError(404, 'Item not found or order already placed');
  }

  await prisma.orderItem.delete({ where: { id: orderItemId } });
}

export async function placeOrder(params: { orderId: string; sessionId: string }) {
  const { orderId, sessionId } = params;

  const session = await getActiveSession(sessionId);
  if (!session) {
    throw new AppError(404, 'Session not found or expired');
  }

  if (session.tableNumber == null) {
    throw new AppError(400, 'No table assigned. Complete seating first.');
  }

  const order = await prisma.order.findFirst({
    where: { id: orderId, sessionId },
    include: { items: { include: { menuItem: true } } },
  });
  if (!order) {
    throw new AppError(404, 'Order not found');
  }
  if (order.status !== 'draft') {
    throw new AppError(400, 'Order already placed');
  }
  if (order.items.length === 0) {
    throw new AppError(400, 'Add at least one item to place order');
  }

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: 'placed',
      tableNumber: session.tableNumber,
    },
  });

  return prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { menuItem: true } } },
  });
}
