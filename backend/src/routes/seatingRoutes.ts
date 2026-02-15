import { Router, type Request, type Response, type NextFunction } from 'express';
import { assignTableToSession, releaseTable } from '../services/seatingService.js';

const router = Router();

/** POST /api/seating/assign — assign lowest available table (optional zone) to session */
router.post('/assign', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId = req.body.sessionId as string | undefined;
    if (!sessionId || typeof sessionId !== 'string') {
      return res.status(400).json({ error: 'sessionId is required' });
    }
    const zone = req.body.zone as string | undefined | null;
    const guestCount =
      req.body.guestCount != null ? Number(req.body.guestCount) : undefined;

    const result = await assignTableToSession({
      sessionId,
      zone: zone ?? undefined,
      guestCount,
    });

    res.status(200).json({
      tableNumber: result.tableNumber,
      zone: result.zone,
      status: result.status,
    });
  } catch (e) {
    next(e);
  }
});

/** POST /api/seating/release — release table and expire session */
router.post('/release', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId = req.body.sessionId as string | undefined;
    if (!sessionId || typeof sessionId !== 'string') {
      return res.status(400).json({ error: 'sessionId is required' });
    }

    await releaseTable(sessionId);
    res.status(200).json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;
