# Restaurant QR Backend

Node.js + TypeScript + Express + Prisma + JWT. **Production uses PostgreSQL only** (no SQLite).

## Environment variables

Copy `.env.example` to `.env` and set values. **Required:**

- `DATABASE_URL` — PostgreSQL connection string (e.g. from Render Postgres or external provider)
- `JWT_SECRET` — Long random string for JWT signing

**Optional:** `PORT` (default 3001), `NODE_ENV`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `JWT_EXPIRES_IN`.

The server exits with a clear error if `DATABASE_URL` or `JWT_SECRET` is missing.

## Production (Render) build flow

On Render, use this flow so the backend starts with PostgreSQL and runs migrations:

1. **Build command:**
   ```bash
   npm install && npx prisma generate && npx prisma migrate deploy && npm run build
   ```
2. **Start command:** `npm run start`

This installs dependencies, generates the Prisma client, applies migrations to your Postgres database, compiles TypeScript, and starts the server with `node dist/index.js`. The app binds to `process.env.PORT` (Render sets this automatically).

## Local development (PostgreSQL)

You need a local or remote PostgreSQL instance and a `DATABASE_URL` in `.env`.

```bash
cd backend && npm install
cp .env.example .env
# Edit .env: set DATABASE_URL to your Postgres URL (e.g. postgresql://user:pass@localhost:5432/venue)
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

Server runs at the URL shown in the console (port from `PORT` or 3001). Use `GET /health` to confirm.

## Troubleshooting: "Service unavailable" / "Internal server error"

If **Start order** or **Add table** (or seating) shows "Service temporarily unavailable" or "Internal server error", the database usually has no tables yet (migrations not applied).

**Fix:** From the `backend` folder, run migrations against your database once:

```bash
cd backend
npm run db:deploy
```

Or: `npx prisma migrate deploy`. Then restart the backend (`npm run dev` or `npm run start`).

- If the backend runs **on Render**: migrations run automatically every time the service starts (`npm run start` runs `prisma migrate deploy` first). Deploy the backend to Render and the database will be migrated on first start.
- If you run the backend **locally** but use Render PostgreSQL: Render’s internal DB URL is only reachable from Render. Use the **External** database URL in `DATABASE_URL` (from the Render Postgres dashboard), then run `npm run db:deploy` once from your machine.

Check backend logs for `[Prisma]` or `[Prisma/DB]` to see the exact error (e.g. P2021 = table does not exist).

## Run

- **Development:** `npm run dev` (watch mode)
- **Production:** `npm run build` then `npm run start`

## Base APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/sessions/guest` | Create guest session (body: `tableNumber?`, `guestCount?`) |
| GET | `/api/menu/categories` | List menu categories |
| GET | `/api/menu/items` | List menu items (optional `?categoryId=`) |
| GET | `/api/tables` | List tables (id, tableNumber, zone, status) |
| POST | `/api/seating/assign` | Assign table to session (body: `sessionId`, `zone?`, `guestCount?`) |
| POST | `/api/seating/release` | Release table and expire session (body: `sessionId`) |
| POST | `/api/orders/draft` | Create or return draft order (body: `sessionId`) |
| POST | `/api/orders/items` | Add/update item (body: `orderId`, `menuItemId`, `quantity`, `sessionId`) |
| DELETE | `/api/orders/items/:id?sessionId=` | Remove item from cart |
| POST | `/api/orders/place` | Place order (body: `orderId`, `sessionId`) |
| GET | `/api/admin/orders` | List placed orders (read-only) |
| POST | `/api/auth/admin/login` | Admin login (body: `email`, `password`) |

Admin login uses `ADMIN_EMAIL` and `ADMIN_PASSWORD` from env. Seating uses PostgreSQL row locking (`FOR UPDATE SKIP LOCKED`) for concurrency.

## Project structure

```
backend/
  prisma/
    schema.prisma
    migrations/
    seed.ts
  src/
    config/
    lib/
    middleware/
    routes/
    services/
    index.ts
```
