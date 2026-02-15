# QR Restaurant Ordering (Frontend)

Mobile-first, frontend-only web app for a QR-based restaurant ordering system. No backend, database, or APIs — dummy data only. Built for visual feedback and UX clarity.

## Tech stack

- **React** (latest) + **TypeScript**
- **Vite**
- **Tailwind CSS**
- **React Router**

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Routes

- **/** — Home (choose Guest or Admin)
- **/guest** — Entry (QR landing), then:
  - **/guest/menu** — Menu with category tabs, add-to-cart (UI only)
  - **/guest/people** — Dine-in option + guest count (1–10)
  - **/guest/order-path** — Order Now / Order Later
  - **/guest/seating** — Table assignment confirmation
  - **/guest/rewards** — Rewards balance and list (UI only)
- **/admin** — Dashboard with sidebar:
  - **/admin** — Overview (Orders, Guests, Revenue cards)
  - **/admin/seating** — Table cards (Available / Occupied)
  - **/admin/analytics** — Stats + chart placeholder

## Project structure

```
src/
  data/constants.ts   # Dummy data (replace with API later)
  pages/
    HomePage.tsx
    guest/           # Entry, Menu, People, OrderPath, Seating, Rewards
    admin/           # AdminLayout, Dashboard, Seating, Analytics
  App.tsx            # Router setup
```

All data lives in `src/data/constants.ts`. Swap for API calls when you add a backend.
