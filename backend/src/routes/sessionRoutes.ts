import { Router, type Request, type Response, type NextFunction } from 'express';
import { createGuestSession } from '../services/sessionService.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

/** POST /api/sessions/guest — create guest session (no auth required) */
router.post('/guest', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tableNumber = req.body.tableNumber != null ? Number(req.body.tableNumber) : undefined;
    const guestCountRaw = req.body.guestCount != null ? Number(req.body.guestCount) : undefined;
    const guestCount =
      typeof guestCountRaw === 'number' &&
      Number.isInteger(guestCountRaw) &&
      guestCountRaw >= 1 &&
      guestCountRaw <= 10
        ? guestCountRaw
        : undefined;
    const result = await createGuestSession({
      tableNumber: Number.isInteger(tableNumber) ? tableNumber : undefined,
      guestCount,
    });
    res.status(201).json({
      token: result.token,
      session: {
        id: result.session.id,
        tableNumber: result.session.tableNumber,
        guestCount: result.session.guestCount,
        expiresAt: result.session.expiresAt,
      },
    });
  } catch (e) {
    if (e instanceof AppError) {
      next(e);
      return;
    }
    console.error('[sessions/guest]', e);
    next(new AppError(503, 'Service temporarily unavailable. Please try again.'));
  }
});

export default router;
