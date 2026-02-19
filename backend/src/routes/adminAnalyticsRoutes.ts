import { Router, type Request, type Response, type NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';

const router = Router();

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

/** GET /api/admin/analytics — MVP analytics (revenue, tables, orders) */
router.get('/analytics', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const todayStart = startOfToday();

    const ordersToday = await prisma.order.count({
      where: { status: 'placed', paymentStatus: 'paid', createdAt: { gte: todayStart } },
    });

    const revenueResult = await prisma.orderItem.aggregate({
      where: {
        order: { status: 'placed', paymentStatus: 'paid', createdAt: { gte: todayStart } },
      },
      _sum: { priceAtOrder: true },
      _count: true,
    });
    const totalRevenueToday = Number(revenueResult._sum.priceAtOrder ?? 0);

    const tablesTotal = await prisma.restaurantTable.count();
    const activeTablesResult = await prisma.restaurantTable.groupBy({
      by: ['status'],
      _count: { id: true },
    });
    const occupiedCount =
      activeTablesResult.find((r) => r.status === 'occupied')?._count.id ?? 0;
    const utilizationPercent =
      tablesTotal > 0 ? Math.round((occupiedCount / tablesTotal) * 100) : 0;

    const now = new Date();
    const activeSessionsToday = await prisma.session.count({
      where: {
        endedAt: null,
        expiresAt: { gt: now },
        createdAt: { gte: todayStart },
        tableNumber: { not: null },
      },
    });
    const completedSessionsToday = await prisma.session.count({
      where: {
        endedAt: { not: null, gte: todayStart },
      },
    });
    const completedWithDuration = await prisma.session.findMany({
      where: {
        endedAt: { not: null, gte: todayStart },
      },
      select: {
        createdAt: true,
        endedAt: true,
      },
    });
    const totalMs = completedWithDuration.reduce((s, x) => {
      const end = x.endedAt ? x.endedAt.getTime() : 0;
      return s + (end - x.createdAt.getTime());
    }, 0);
    const avgSessionDurationMinutes =
      completedWithDuration.length > 0
        ? Math.round(totalMs / completedWithDuration.length / 60000)
        : 0;

    res.json({
      totalRevenueToday,
      ordersToday,
      tablesTotal,
      activeTablesCount: occupiedCount,
      utilizationPercent,
      activeSessionsToday,
      completedSessionsToday,
      avgSessionDurationMinutes,
    });
  } catch (e) {
    next(e);
  }
});

export default router;
