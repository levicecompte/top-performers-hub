# TOP 100 PERFORMERS MTD — monorepo

Month-to-date ranking of the 100 best performing stocks and ETFs, snapshotted once per day.

```
/            React frontend (Lovable app: src/, runs on the Lovable preview / vite dev)
/backend     Java 21 + Maven + Spring Boot 3.3 RESTful API (port 8080)
```

The frontend never talks to the database. It only calls the Java API.

## Frontend

```bash
bun install
bun run dev
```

Point it at another API host with `VITE_API_BASE_URL` (default `http://localhost:8080`).

Design: dark premium B2B — base `#0A0A0A`, ink `#F5F5F3`, single magenta accent `#FF2E6A`,
Inter display type, infinite marquee header, Recharts sparklines.

## Backend

See [`backend/README.md`](backend/README.md).

```bash
cd backend && mvn spring-boot:run
```

Database schema: [`backend/supabase_init.sql`](backend/supabase_init.sql).
Environment template: [`backend/.env.example`](backend/.env.example).

## Daily snapshot rule

`GET /api/top-performers` checks whether 100 rows exist for `snapshot_date = today`.
If not, it fetches the market data, computes `(priceNow - priceMonthStart) / priceMonthStart * 100`,
keeps the best 100 and persists them. The frontend simply calls this endpoint on mount,
so the first consultation of the day creates the snapshot. Idempotent.
