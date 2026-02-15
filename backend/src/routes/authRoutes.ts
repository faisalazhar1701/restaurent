import { Router, type Request, type Response, type NextFunction } from 'express';
import { signSession } from '../services/sessionService.js';
import { env } from '../config/env.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

/** POST /api/auth/admin/login — check env credentials, issue token (no DB admin user required) */
router.post('/admin/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawEmail = req.body.email as string | undefined;
    const password = req.body.password as string | undefined;
    if (!rawEmail || !password) {
      throw new AppError(400, 'Email and password required');
    }
    const email = String(rawEmail).trim().toLowerCase();
    const envEmail = (env.ADMIN_EMAIL || '').trim().toLowerCase();
    if (email !== envEmail || password !== env.ADMIN_PASSWORD) {
      throw new AppError(401, 'Invalid credentials');
    }
    const token = signSession({
      sessionId: 'admin-session',
      userId: 'admin',
      role: 'admin',
    });
    res.json({
      token,
      user: { id: 'admin', role: 'admin' },
    });
  } catch (e) {
    next(e);
  }
});

export default router;
