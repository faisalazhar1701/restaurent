import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../lib/prisma.js';

const JWT_SECRET = env.JWT_SECRET;
const JWT_EXPIRES_IN = env.JWT_EXPIRES_IN;

export type SessionPayload = {
  sessionId: string;
  userId: string;
  role: string;
  tableNumber?: number;
  guestCount?: number;
  exp: number;
};

const signOptions: SignOptions = { expiresIn: JWT_EXPIRES_IN as SignOptions['expiresIn'] };

export function signSession(payload: Omit<SessionPayload, 'exp'>): string {
  return jwt.sign(
    payload as object,
    JWT_SECRET,
    signOptions
  );
}

export function verifyToken(token: string): SessionPayload {
  const decoded = jwt.verify(token, JWT_SECRET);
  if (typeof decoded === 'string' || decoded === null) {
    throw new Error('Invalid token payload');
  }
  return decoded as SessionPayload;
}

export async function createGuestSession(params: {
  tableNumber?: number;
  guestCount?: number;
}) {
  const user = await prisma.user.create({
    data: { role: 'guest' },
  });
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session = await prisma.session.create({
    data: {
      userId: user.id,
      tableNumber: params.tableNumber ?? null,
      guestCount: params.guestCount ?? null,
      expiresAt,
    },
  });
  const token = signSession({
    sessionId: session.id,
    userId: user.id,
    role: 'guest',
    tableNumber: params.tableNumber,
    guestCount: params.guestCount,
  });
  return { token, session, user };
}
