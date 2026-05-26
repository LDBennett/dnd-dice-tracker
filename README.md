# D&D Dice Tracker

A mobile-first app for logging physical dice rolls during tabletop RPG sessions. Roll real dice, then log the result — the app tracks your history and stats over time.

## Features

- **Dice logger** — tap a die (d4 through d100), slide to your rolled value, add an optional note, and confirm
- **Session saving** — group rolls into a named session before committing to the database
- **Roll history** — view and edit past session names and per-roll notes
- **Stats dashboard** — total rolls, average value, natural 20s, and natural 1s
- **Per-die history** — see past rolls for a specific die type while you're rolling it
- **Auth** — email/password login via Better Auth; all data is scoped to your account

## Stack

| Layer | Technology |
|---|---|
| Framework | SvelteKit 2 + Svelte 5 (runes) |
| Styling | Tailwind CSS 4 |
| Auth | Better Auth 1.4 (email/password) |
| ORM | Drizzle ORM |
| Database | Neon (serverless PostgreSQL) |
| Deployment | Vercel |

## Getting started

### 1. Install dependencies

```sh
pnpm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env` and fill in your values:

```sh
cp .env.example .env
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Random secret (32+ characters) |
| `ORIGIN` | App origin, e.g. `http://localhost:5173` |

### 3. Push the database schema

```sh
pnpm db:push
```

### 4. Generate Better Auth tables (first time only)

```sh
pnpm auth:schema
pnpm db:push
```

### 5. Run the dev server

```sh
pnpm dev
```

## Database commands

```sh
pnpm db:push      # Sync schema to Neon (no migration files)
pnpm db:generate  # Generate Drizzle migration files
pnpm db:studio    # Open Drizzle Studio (database GUI)
```
