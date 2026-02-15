# Venue Seat — Mall & Food Court SaaS (Phase 1)

Phase 1 frontend only: mobile-first UI for guest and mall admin. No backend or real APIs.

## Tech stack

- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Entry points

- **/** — Choose Guest or Mall Admin
- **/guest** — Guest entry (QR-style landing)
- **/admin** — Mall Admin dashboard

## Guest flow (UI only)

1. **Entry** (`/guest`) — Welcome, “Get started”
2. **Dine-in** (`/guest/dine-in`) — Dine in vs take away
3. **People** (`/guest/people`) — Number of people
4. **Order path** (`/guest/order-path`) — Order online vs order at counter + QR
5. **Menu** (`/guest/menu`) — Browse menu (if “order online”)
6. **Seating** (`/guest/seating`) — Table assigned confirmation
7. **Rewards** (`/guest/rewards`) — Rewards tier and benefits (static)

## Admin (UI only)

- **Dashboard** (`/admin`) — Occupancy, tables, orders, wait time
- **Seating** (`/admin/seating`) — Zones and occupancy bars; floor plan placeholder
- **Analytics** (`/admin/analytics`) — Dummy weekly visits bar chart + placeholders

## Design

- Mobile-first, responsive (tablet/desktop)
- Primary: navy (`venue-primary`), accent: gold (`venue-accent`)
- Reusable: `Button`, `Card`, `PageContainer`, `BottomBar`
- Dummy data in `lib/dummy-data.ts`

## Folder structure

```
app/
  page.tsx          # Home: Guest | Admin
  guest/            # Guest pages
  admin/            # Admin pages + layout
components/
  ui/               # Button, Card
  guest/            # PageContainer, BottomBar
  admin/            # AdminNav
lib/
  dummy-data.ts     # All dummy data
```

Phase 1 is complete when the UI is visually complete and ready for client feedback.

---

## Production deployment (Render)

Deploy frontend and backend as separate Web Services. Set environment variables in the Render dashboard; do not commit secrets.

### Backend (Render)

- **Service type:** Web Service
- **Build command:**
  ```bash
  npm install && npx prisma generate && npx prisma migrate deploy && npm run build
  ```
- **Start command:** `npm run start`
- **Environment variables:** Add in Render dashboard (see `backend/.env.example`). Required: `DATABASE_URL` (PostgreSQL), `JWT_SECRET`. Optional: `PORT`, `NODE_ENV`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.
- Use a Render PostgreSQL database or an external Postgres URL for `DATABASE_URL`.

### Frontend (Render)

- **Service type:** Web Service
- **Build command:**
  ```bash
  npm install && npm run build
  ```
- **Start command:** `npm run start`
- **Environment variables:** Add in Render dashboard. Required: `NEXT_PUBLIC_API_BASE_URL` (your backend URL, e.g. `https://your-backend.onrender.com`). Optional: `NODE_ENV`.
- After deploy, set `NEXT_PUBLIC_API_BASE_URL` to your backend service URL so the frontend can call the API.
