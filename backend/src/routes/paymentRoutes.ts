import { Router, type Request, type Response, type NextFunction } from 'express';
import {
  createCheckoutSession,
  confirmPayment,
  isStripeEnabled,
} from '../services/paymentService.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

/** POST /api/payment/create-checkout — create Stripe Checkout session */
router.post('/create-checkout', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orderId = req.body.orderId as string | undefined;
    const sessionId = req.body.sessionId as string | undefined;
    const guestCount = req.body.guestCount != null ? Number(req.body.guestCount) : 2;
    const zone = req.body.zone as string | null | undefined;
    const optionalTableNumber =
      req.body.optionalTableNumber != null ? Number(req.body.optionalTableNumber) : undefined;
    const optionalZone = req.body.optionalZone as string | null | undefined;

    if (!orderId || !sessionId) {
      return res.status(400).json({ error: 'orderId and sessionId are required' });
    }

    const { checkoutUrl } = await createCheckoutSession({
      orderId,
      sessionId,
      guestCount,
      zone,
      optionalTableNumber: Number.isInteger(optionalTableNumber) ? optionalTableNumber : undefined,
      optionalZone: optionalZone ?? undefined,
    });
    res.json({ checkoutUrl });
  } catch (e) {
    next(e);
  }
});

/** POST /api/payment/confirm — confirm payment after Stripe redirect (idempotent) */
router.post('/confirm', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stripeSessionId = req.body.stripe_session_id as string | undefined;
    if (!stripeSessionId) {
      return res.status(400).json({ error: 'stripe_session_id is required' });
    }
    await confirmPayment(stripeSessionId);
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
});

/** GET /api/payment/enabled — check if Stripe is configured */
router.get('/enabled', (_req: Request, res: Response) => {
  res.json({ enabled: isStripeEnabled() });
});

/** GET /api/payment/qr-url?orderId=&sessionId= — get checkout URL for unpaid order (QR flow) */
router.get('/qr-url', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orderId = req.query.orderId as string | undefined;
    const sessionId = req.query.sessionId as string | undefined;
    if (!orderId || !sessionId) {
      return res.status(400).json({ error: 'orderId and sessionId are required' });
    }
    const { prisma } = await import('../lib/prisma.js');
    const session = await prisma.session.findUnique({ where: { id: sessionId } });
    const guestCount = session?.guestCount != null ? session.guestCount : 2;
    const { checkoutUrl } = await createCheckoutSession({ orderId, sessionId, guestCount });
    res.json({ checkoutUrl });
  } catch (e) {
    next(e);
  }
});

export default router;
