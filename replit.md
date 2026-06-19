# Young Tots Edventures – Summer Safari 2026

A premium marketing + registration web app for a children's 5-day holiday adventure program in Nairobi, Kenya (6th–10th July 2026).

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/summer-safari run dev` — run the frontend (assigned port)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Required env: `SESSION_SECRET` — used as JWT secret for admin auth

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + framer-motion + wouter
- API: Express 5 + JWT auth (jsonwebtoken)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- Frontend: `artifacts/summer-safari/src/`
  - Pages: `src/pages/` — landing, register, admin login, admin dashboard, registration detail
  - Theme: `src/index.css` — safari warm palette (amber, forest green, sky blue)
- API spec: `lib/api-spec/openapi.yaml` — source of truth for all endpoints
- Generated client: `lib/api-client-react/src/generated/`
- Generated Zod schemas: `lib/api-zod/src/generated/`
- DB schema: `lib/db/src/schema/registrations.ts`
- API routes: `artifacts/api-server/src/routes/`
  - `registrations.ts` — public registration + payment proof upload
  - `admin.ts` — admin login, list, get, update status, export, stats

## Architecture decisions

- Contract-first: OpenAPI spec gates codegen which gates the frontend
- Admin auth: JWT tokens stored in localStorage, injected via custom-fetch.ts
- Payment proofs: base64 uploaded → saved to disk at `artifacts/api-server/uploads/`, served at `/api/uploads/`
- Admin credentials: env vars `ADMIN_USERNAME` / `ADMIN_PASSWORD` (default: admin / safari2026admin)
- No external storage (Supabase) — uses Replit's built-in PostgreSQL

## Product

- **Landing page**: Hero, about, 5-day activity schedule with real photo galleries, important info, pricing, contact with WhatsApp links
- **Registration**: 5-step form (parent info, child info, medical, emergency/pickup, consent + M-Pesa payment upload)
- **Admin dashboard**: Stats summary, searchable registrations table, CSV export, payment status management

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Always run `pnpm --filter @workspace/api-spec run codegen` after changing `openapi.yaml`, then `pnpm run typecheck:libs` before checking artifact packages
- Body schema names in openapi.yaml must be entity-shaped (not `<OperationId>Body` or `<OperationId>Response`) to avoid TS2308 collisions
- Admin default login: username=`admin`, password=`safari2026admin` (set via env vars for production)

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
