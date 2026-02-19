import { Router, type Request, type Response, type NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { releaseTable } from '../services/seatingService.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();
const now = () => new Date();

/** GET /api/admin/sessions — list active sessions (not ended, not expired) */
router.get('/sessions', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const sessions = await prisma.session.findMany({
      where: {
        endedAt: null,
        expiresAt: { gt: now() },
        tableNumber: { not: null },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(
      sessions.map((s) => ({
        id: s.id,
        tableNumber: s.tableNumber,
        guestCount: s.guestCount,
        createdAt: s.createdAt,
      }))
    );
  } catch (e) {
    next(e);
  }
});

/** POST /api/admin/sessions/:id/end — end a seating session */
router.post('/sessions/:id/end', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) throw new AppError(400, 'Session id is required');
    await releaseTable(id);
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;
