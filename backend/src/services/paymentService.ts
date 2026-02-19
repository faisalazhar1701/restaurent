import Stripe from 'stripe';
import { env } from '../config/env.js';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { assignTableToSession } from './seatingService.js';

const stripe =
  env.STRIPE_SECRET_KEY && env.STRIPE_SECRET_KEY.length > 0
    ? new Stripe(env.STRIPE_SECRET_KEY)
    : null;

export function isStripeEnabled(): boolean {
  return stripe !== null;
}

export async function createCheckoutSession(params: {
  orderId: string;
  sessionId: string;
  guestCount: number;
  zone?: string | null;
  optionalTableNumber?: number | null;
  optionalZone?: string | null;
}): Promise<{ checkoutUrl: string }> {
  if (!stripe) {
    throw new AppError(503, 'Payment is not configured');
  }

  const order = await prisma.order.findFirst({
    where: { id: params.orderId, sessionId: params.sessionId, status: 'draft' },
    include: { items: { include: { menuItem: true } } },
  });
  if (!order) {
    throw new AppError(404, 'Order not found');
  }
  if (order.items.length === 0) {
    throw new AppError(400, 'Add at least one item before paying');
  }

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = order.items.map((item) => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: item.menuItem.name,
        description: item.menuItem.description ?? undefined,
      },
      unit_amount: Math.round(Number(item.priceAtOrder) * 100),
    },
    quantity: item.quantity,
  }));

  const base = env.FRONTEND_URL.replace(/\/$/, '');
  const metadata: Record<string, string> = {
    orderId: params.orderId,
    sessionId: params.sessionId,
  };
  if (
    params.optionalTableNumber != null &&
    Number.isInteger(params.optionalTableNumber)
  ) {
    metadata.optionalTableNumber = String(params.optionalTableNumber);
  }
  if (params.optionalZone != null && params.optionalZone !== '') {
    metadata.optionalZone = String(params.optionalZone);
  }
  // Include sessionId in success_url for on-site flow (guest may not have session in storage)
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: lineItems,
    metadata,
    success_url: `${base}/guest/seating?payment=success&stripe_session_id={CHECKOUT_SESSION_ID}&sessionId=${encodeURIComponent(params.sessionId)}`,
    cancel_url: `${base}/guest/seating?payment=cancelled`,
  });

  await prisma.order.update({
    where: { id: params.orderId },
    data: {
      paymentStatus: 'pending',
      stripeCheckoutSessionId: session.id,
    },
  });

  if (!session.url) {
    throw new AppError(500, 'Could not create checkout URL');
  }
  return { checkoutUrl: session.url };
}

export async function confirmPayment(stripeSessionId: string): Promise<void> {
  if (!stripe) {
    throw new AppError(503, 'Payment is not configured');
  }

  const session = await stripe.checkout.sessions.retrieve(stripeSessionId);
  if (session.payment_status !== 'paid') {
    throw new AppError(400, 'Payment not completed');
  }

  const orderId = session.metadata?.orderId as string | undefined;
  const sessionId = session.metadata?.sessionId as string | undefined;
  if (!orderId || !sessionId) {
    throw new AppError(400, 'Invalid session metadata');
  }
  const optionalTableNumberRaw = session.metadata?.optionalTableNumber;
  const optionalTableNumber =
    optionalTableNumberRaw != null
      ? parseInt(optionalTableNumberRaw, 10)
      : undefined;
  const optionalZone = session.metadata?.optionalZone as string | undefined;

  await finalizePaidOrder({
    orderId,
    sessionId,
    optionalTableNumber: Number.isInteger(optionalTableNumber)
      ? optionalTableNumber
      : undefined,
    optionalZone: optionalZone ?? undefined,
  });
}

async function finalizePaidOrder(params: {
  orderId: string;
  sessionId: string;
  optionalTableNumber?: number;
  optionalZone?: string | null;
}): Promise<void> {
  const order = await prisma.order.findFirst({
    where: { id: params.orderId, sessionId: params.sessionId },
    include: { session: true, items: true },
  });
  if (!order) {
    throw new AppError(404, 'Order not found');
  }
  if (order.status === 'placed' && order.paymentStatus === 'paid') {
    return;
  }

  const session = order.session;
  if (session.expiresAt <= new Date()) {
    throw new AppError(404, 'Session expired');
  }
  if (session.endedAt) {
    throw new AppError(400, 'Session has ended');
  }

  const guestCount = session.guestCount ?? 2;
  const result = await assignTableToSession({
    sessionId: params.sessionId,
    guestCount,
    optionalTableNumber: params.optionalTableNumber,
    optionalZone: params.optionalZone,
  });

  await prisma.order.update({
    where: { id: params.orderId },
    data: {
      status: 'placed',
      paymentStatus: 'paid',
      tableNumber: result.tableNumber,
      stripePaymentIntentId: undefined,
    },
  });

  await prisma.session.update({
    where: { id: params.sessionId },
    data: { paymentCompletedAt: new Date() },
  });
}

export async function handleWebhook(payload: string | Buffer, signature: string): Promise<void> {
  if (!stripe || !env.STRIPE_WEBHOOK_SECRET) {
    throw new AppError(503, 'Webhook not configured');
  }

  const event = stripe.webhooks.constructEvent(
    payload,
    signature,
    env.STRIPE_WEBHOOK_SECRET
  );

  if (event.type === 'checkout.session.completed') {
    const stripeSession = event.data.object as Stripe.Checkout.Session;
    if (stripeSession.payment_status === 'paid') {
      const orderId = stripeSession.metadata?.orderId as string | undefined;
      const sessionId = stripeSession.metadata?.sessionId as string | undefined;
      if (orderId && sessionId) {
        const optTbl = stripeSession.metadata?.optionalTableNumber;
        const optionalTableNumber =
          optTbl != null ? parseInt(String(optTbl), 10) : undefined;
        const optionalZone = stripeSession.metadata?.optionalZone as
          | string
          | undefined;
        await finalizePaidOrder({
          orderId,
          sessionId,
          optionalTableNumber: Number.isInteger(optionalTableNumber)
            ? optionalTableNumber
            : undefined,
          optionalZone: optionalZone ?? undefined,
        }).catch((e) => {
          console.error('[payment webhook] finalizePaidOrder failed:', e);
        });
      }
    }
  }
}
