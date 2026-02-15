import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';

const now = () => new Date();

/** Session is active if it exists and expiresAt > now */
async function getActiveSession(sessionId: string) {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });
  if (!session) return null;
  if (session.expiresAt <= now()) return null;
  return session;
}

/**
 * Assign the lowest-numbered available table (in optional zone) to the session.
 * Atomic: lock row with FOR UPDATE SKIP LOCKED, then update table + session.
 */
export async function assignTableToSession(params: {
  sessionId: string;
  zone?: string | null;
  guestCount?: number | null;
}): Promise<{ tableNumber: number; zone: string | null; status: string }> {
  const { sessionId, zone, guestCount } = params;

  const session = await getActiveSession(sessionId);
  if (!session) {
    throw new AppError(404, 'Session not found or expired');
  }

  if (session.tableNumber != null) {
    const existing = await prisma.restaurantTable.findFirst({
      where: { tableNumber: session.tableNumber },
    });
    if (existing)
      return {
        tableNumber: existing.tableNumber,
        zone: existing.zone,
        status: existing.status,
      };
  }

  const minCapacity = guestCount != null && guestCount >= 1 && guestCount <= 10 ? guestCount : 1;

  const result = await prisma.$transaction(async (tx) => {
    const zoneCondition =
      zone === undefined || zone === null
        ? Prisma.empty
        : Prisma.sql`AND "zone" = ${zone}`;
    const rows = await tx.$queryRaw<
      Array<{ id: string; tableNumber: number; zone: string | null; capacity: number; status: string }>
    >(
      Prisma.sql`
      SELECT id, "tableNumber", "zone", capacity, status
      FROM "RestaurantTable"
      WHERE status = 'available'
      AND capacity >= ${minCapacity}
      ${zoneCondition}
      ORDER BY "tableNumber" ASC
      LIMIT 1
      FOR UPDATE SKIP LOCKED
    `
    );
    const table = rows[0];
    if (!table) throw new AppError(409, 'No table available');

    await tx.restaurantTable.update({
      where: { id: table.id },
      data: { status: 'occupied' },
    });

    await tx.session.update({
      where: { id: sessionId },
      data: {
        tableNumber: table.tableNumber,
        ...(guestCount != null && guestCount >= 1 && guestCount <= 10
          ? { guestCount }
          : {}),
      },
    });

    return table;
  });

  return {
    tableNumber: result.tableNumber,
    zone: result.zone,
    status: result.status,
  };
}

/**
 * Release the table assigned to the session and mark session as expired.
 * Atomic: update table status to available and clear session assignment.
 */
export async function releaseTable(sessionId: string): Promise<void> {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    throw new AppError(404, 'Session not found');
  }

  if (session.tableNumber == null) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.restaurantTable.updateMany({
      where: { tableNumber: session!.tableNumber! },
      data: { status: 'available' },
    });
    await tx.session.update({
      where: { id: sessionId },
      data: {
        tableNumber: null,
        guestCount: null,
        expiresAt: now(),
      },
    });
  });
}
