import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';

const now = () => new Date();

/** Session is active if it exists, expiresAt > now, and endedAt is null */
async function getActiveSession(sessionId: string) {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });
  if (!session) return null;
  if (session.expiresAt <= now()) return null;
  if (session.endedAt != null) return null;
  return session;
}

/** Normalize zone for DB lookup: 'main' means null in DB */
function normalizeZone(zone: string | null | undefined): string | null {
  if (zone == null || zone === '') return null;
  const z = String(zone).trim();
  return z === 'main' ? null : z;
}

/**
 * Assign a table to the session.
 * - If optionalTableNumber + optionalZone provided (table QR): assign that specific table if available and has capacity.
 * - Else: find first available table with capacity >= guestCount, ordered by capacity ASC, tableNumber ASC.
 * Only tables with status='available' can be assigned. Disabled tables are never assigned.
 * @throws AppError 404 - Session not found or expired
 * @throws AppError 409 - NO_TABLE_AVAILABLE (no suitable table found)
 * @throws AppError 410 - TABLE_NOT_AVAILABLE (requested table unavailable or too small)
 */
export async function assignTableToSession(params: {
  sessionId: string;
  zone?: string | null;
  guestCount?: number | null;
  optionalTableNumber?: number | null;
  optionalZone?: string | null;
}): Promise<{ tableNumber: number; zone: string | null; status: string }> {
  const {
    sessionId,
    zone,
    guestCount,
    optionalTableNumber,
    optionalZone,
  } = params;

  const session = await getActiveSession(sessionId);
  if (!session) {
    throw new AppError(404, 'Session not found or expired');
  }

  if (session.tableNumber != null) {
    const existing = await prisma.restaurantTable.findFirst({
      where: { tableNumber: session.tableNumber },
    });
    if (existing && existing.status !== 'disabled')
      return {
        tableNumber: existing.tableNumber,
        zone: existing.zone,
        status: existing.status,
      };
  }

  const minCapacity =
    guestCount != null && guestCount >= 1 && guestCount <= 10 ? guestCount : 1;

  // Table QR: request specific table
  if (
    optionalTableNumber != null &&
    Number.isInteger(optionalTableNumber) &&
    optionalTableNumber >= 1
  ) {
    const lookupZone = normalizeZone(optionalZone);
    const table = await prisma.restaurantTable.findFirst({
      where: {
        tableNumber: optionalTableNumber,
        zone: lookupZone,
      },
    });
    if (!table) {
      throw new AppError(410, 'This table is not available. Please contact staff.');
    }
    if (table.status !== 'available') {
      throw new AppError(410, 'This table is not available. Please contact staff.');
    }
    if (table.capacity < minCapacity) {
      throw new AppError(410, 'This table is not available. Please contact staff.');
    }

    await prisma.$transaction(async (tx) => {
      await tx.restaurantTable.update({
        where: { id: table.id },
        data: { status: 'occupied' },
      });
    await tx.session.update({
      where: { id: sessionId },
      data: {
        tableNumber: table.tableNumber,
        seatedAt: now(),
        ...(guestCount != null && guestCount >= 1 && guestCount <= 10
          ? { guestCount }
          : {}),
      },
    });
  });

    return {
      tableNumber: table.tableNumber,
      zone: table.zone,
      status: 'occupied',
    };
  }

  // Auto-assign: find lowest-capacity available table
  const result = await prisma.$transaction(async (tx) => {
    let zoneCondition = Prisma.empty;
    if (zone != null && zone !== '') {
      if (String(zone).trim() === 'main') {
        zoneCondition = Prisma.sql`AND "zone" IS NULL`;
      } else {
        zoneCondition = Prisma.sql`AND "zone" = ${zone}`;
      }
    }
    const rows = await tx.$queryRaw<
      Array<{
        id: string;
        tableNumber: number;
        zone: string | null;
        capacity: number;
        status: string;
      }>
    >(
      Prisma.sql`
      SELECT id, "tableNumber", "zone", capacity, status
      FROM "RestaurantTable"
      WHERE status = 'available'
      AND capacity >= ${minCapacity}
      ${zoneCondition}
      ORDER BY capacity ASC, "tableNumber" ASC
      LIMIT 1
      FOR UPDATE SKIP LOCKED
    `
    );
    const table = rows[0];
    if (!table)
      throw new AppError(
        409,
        'All tables suitable for your group are currently occupied. Please wait.'
      );

    await tx.restaurantTable.update({
      where: { id: table.id },
      data: { status: 'occupied' },
    });

    await tx.session.update({
      where: { id: sessionId },
      data: {
        tableNumber: table.tableNumber,
        seatedAt: now(),
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
 * Does not change tables that are disabled (admin-set).
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
    // Only set to available if currently occupied (do not override disabled)
    await tx.restaurantTable.updateMany({
      where: {
        tableNumber: session!.tableNumber!,
        status: 'occupied',
      },
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
