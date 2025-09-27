# Lunchmate 🍱

“Familiar, Fresh, or Mixed” lunch picks with cuisine/tags filters.
Built with **Next.js 14 + TypeScript + Tailwind + shadcn/ui + Prisma**.

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

## How do I use it?

### Home

1. **Mode**
   - **Familiar** – only your list (from _Manage_).
   - **Fresh** – nearby places from a provider (OSM by default, Google optional).
   - **Mixed** – a blend of Familiar + Fresh.
2. **Cuisine (single)** and **Filters (multi-select)** – narrow to what you want.
3. **Find a place** – opens _Suggest_.
   - **Open in Google Maps** – navigate.
   - **Reroll** – reshuffle.
   - **I went (rate)** – record a visit (0–4).

### Manage

- **Import my places**

  - **CSV** (recommended) with header:

    ```
    name,cuisine,address,lat,lng,price_level,tags,source,place_id
    ```

    Example row:

    ```
    Sakura Bento,japanese,12 Sushi St,35.68,139.76,2,"quick;spicy",manual,
    ```

  - **JSON array** example:
    ```json
    [
      {
        "name": "Sakura Bento",
        "address": "12 Sushi St",
        "price_level": 2,
        "tags": "quick;spicy",
        "lat": 35.7,
        "lng": 139.7,
        "source": "manual"
      },
      {
        "name": "Western Deli",
        "address": "9 Baker Rd",
        "lat": 35.7,
        "lng": 139.7,
        "source": "manual"
      }
    ]
    ```
  - **Notes**
    - `name` and `address` are **required**.
    - `tags` can be comma or semicolon separated (`quick;spicy`).
    - `source` is `manual`|`google`|`mock` (default: `manual`).
    - If you have a Google `place_id`, include it in `place_id`.

- **My list (manual)** – shows items you added or imported; you can delete.

### History

- Shows your recorded **visits** with ratings and notes.

---

## Quickstart (dev)

```bash
pnpm install
cp .env.example

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
