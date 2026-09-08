# Diggle Coding Club

An interactive, game-like website for teaching Python to a class of 9–11 year olds
over 8 weekly 45-minute sessions. Students join with a class code, pick a name and
avatar, follow the lesson the teacher projects, run Python in the browser, and level
up as they get things right.

See [PLAN.md](./PLAN.md) for the full design and curriculum.

## Stack

- Next.js 16 (App Router) on Vercel
- Neon Postgres + Drizzle ORM
- Pyodide (in-browser Python) — added in Phase 4
- Tailwind CSS 4

## Local setup

```bash
npm install
cp .env.example .env.local   # then fill in DATABASE_URL from your Neon project
npm run db:push              # apply schema to the database
npm run db:seed              # insert demo class + lesson 1 + badges
npm run dev
```

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run db:generate` | Generate a SQL migration from `src/db/schema.ts` |
| `npm run db:migrate` | Apply generated migrations |
| `npm run db:push` | Push schema straight to the DB (dev convenience) |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run db:seed` | Seed demo data |

## Deploy

Push to GitHub, import the repo in Vercel, add `DATABASE_URL`, `TEACHER_PASSWORD`
and `SESSION_SECRET` as environment variables. Neon has a native Vercel
integration that wires `DATABASE_URL` automatically.

## Build progress

- [x] Phase 1 — scaffold, Tailwind, Drizzle + Neon wiring, stub screens
- [ ] Phase 2 — schema migrations + seed against a real Neon DB
- [ ] Phase 3 — join flow (class code, avatar grid, cookie session)
- [ ] Phase 4 — Pyodide worker + CodeMirror editor + symbol bar
- [ ] Phase 5 — lesson player + MDX steps + progress autosave
- [ ] Phase 6 — gamification (XP, levels, badges, class thermometer)
- [ ] Phase 7 — projector screen + live teacher dashboard
- [ ] Phase 8 — author all 8 weeks of content
- [ ] Phase 9 — offline resilience, CSV export, certificates
