# Backend — TOP 100 PERFORMERS MTD (Java 21 / Spring Boot 3.3 / Maven)

## Prerequisites
- Java 21 (`java -version`)
- Maven 3.9+
- A Supabase Postgres database

## 1. Database
Run `supabase_init.sql` in the Supabase SQL editor to create `action_etf`.

## 2. Environment
Copy `.env.example` and export the variables:

```bash
cp .env.example .env
set -a && source .env && set +a
```

| Variable | Description |
| --- | --- |
| `SUPABASE_DB_URL` | `jdbc:postgresql://db.xxx.supabase.co:5432/postgres` |
| `SUPABASE_DB_USER` | `postgres` |
| `SUPABASE_DB_PASSWORD` | database password |
| `MARKET_DATA_API_KEY` | TwelveData key. Empty = deterministic mock mode |

## 3. Run

```bash
cd backend && mvn spring-boot:run
```

API on http://localhost:8080

## Endpoints

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/top-performers` | Today's top 100. Creates the daily snapshot on first call. |
| GET | `/api/top-performers?date=2026-09-21` | Historical snapshot for a date |
| GET | `/api/top-performers/history?symbol=AAPL` | One symbol across all snapshots |
| POST | `/api/snapshot/force` | Force a refetch and overwrite today's snapshot |
| GET | `/api/health` | Status, snapshot counts, LIVE/MOCK mode |

## Daily snapshot rule
`GET /api/top-performers` checks `count(snapshot_date = today)`. If it is 100 the rows
are returned straight from Postgres. Otherwise `MarketDataService.fetchTop100()` fetches
the universe, computes `perf = (priceNow - priceMonthStart) / priceMonthStart * 100`,
sorts desc, keeps 100, persists them with `snapshot_date = today`, then returns them.
Idempotent and synchronized.

## Structure
```
src/main/java/com/topperformers
├── TopPerformersApplication.java
├── config/CorsConfig.java
├── controller/{TopPerformersController,HealthController}.java
├── dto/MarketQuote.java
├── model/ActionEtf.java
├── repository/ActionEtfRepository.java
└── service/{MarketDataService,SnapshotService,Universe}.java
```
