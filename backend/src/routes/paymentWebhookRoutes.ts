import { Router, type Request, type Response } from 'express';
import { handleWebhook } from '../services/paymentService.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
    const signature = req.headers['stripe-signature'] as string | undefined;
    if (!signature) {
      res.status(400).send('Missing stripe-signature');
      return;
    }
    try {
      const payload = req.body as Buffer;
      await handleWebhook(payload, signature);
      res.json({ received: true });
    } catch (e) {
      if (e instanceof AppError) {
        res.status(e.statusCode).send(e.message);
      } else {
        res.status(500).send('Webhook error');
      }
    }
  }
);

export default router;
