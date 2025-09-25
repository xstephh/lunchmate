# Lunchmate 🍱

Suggests what to eat for lunch — mix your favorites with fresh nearby picks.  
Built with **Next.js 14 + TypeScript + Tailwind + shadcn/ui + Prisma**.

- **Modes**: Familiar (your DB), Fresh (nearby, public ratings), Mixed
- **Feedback**: log visits with rating/notes/tags
- **Privacy**: geolocation requested client-side only
- **$0 by default**: mock provider; no external API calls

---

## Tech

- Next.js App Router, React 18, TypeScript
- UI: Tailwind + shadcn/ui, Recharts (client-only)
- ORM: Prisma
- DB: SQLite (dev) → Supabase Postgres (prod)
- Tests: Vitest + React Testing Library
- Lint/Format: ESLint + Prettier
- Deploy: Vercel + Supabase (free tiers)

---

## Quickstart (dev)

```bash
pnpm install
cp .env.example .env
cp .env.example .env.local

# DB
pnpm db:generate
pnpm db:push
pnpm db:seed

# QA
pnpm typecheck
pnpm lint
pnpm test

# Run
pnpm dev
```
