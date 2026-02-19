import { Router, type Request, type Response, type NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { assignTableToSession, releaseTable } from '../services/seatingService.js';

const router = Router();

/** GET /api/seating/status?sessionId= — get table assignment for session */
router.get('/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId = req.query.sessionId as string | undefined;
    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });
    if (!session || session.tableNumber == null) {
      return res.json({ tableNumber: null, zone: null });
    }
    const table = await prisma.restaurantTable.findFirst({
      where: { tableNumber: session.tableNumber },
    });
    res.json({
      tableNumber: session.tableNumber,
      zone: table?.zone ?? null,
    });
  } catch (e) {
    next(e);
  }
});

/** POST /api/seating/assign — assign table to session (optional zone, optional specific table for QR) */
router.post('/assign', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId = req.body.sessionId as string | undefined;
    if (!sessionId || typeof sessionId !== 'string') {
      return res.status(400).json({ error: 'sessionId is required' });
    }
    const zone = req.body.zone as string | undefined | null;
    const guestCount =
      req.body.guestCount != null ? Number(req.body.guestCount) : undefined;
    const optionalTableNumber =
      req.body.optionalTableNumber != null
        ? Number(req.body.optionalTableNumber)
        : undefined;
    const optionalZone = req.body.optionalZone as string | undefined | null;

    const result = await assignTableToSession({
      sessionId,
      zone: zone ?? undefined,
      guestCount,
      optionalTableNumber: Number.isInteger(optionalTableNumber)
        ? optionalTableNumber
        : undefined,
      optionalZone: optionalZone ?? undefined,
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
