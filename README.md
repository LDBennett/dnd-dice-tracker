# D&D Dice Tracker

A mobile-first web app for logging, tracking, and analyzing dice rolls in tabletop RPG sessions. Built with SvelteKit, Drizzle ORM, and Neon PostgreSQL.

## Features

- **Dice Rolling** — Log individual or batch rolls for d4, d6, d8, d10, d12, d20, and d100
- **Session Management** — Group rolls into named sessions with optional notes and modifiers
- **Statistics Dashboard** — Track total rolls, averages, natural 20s/1s, and per-die breakdowns
- **Roll History** — View and edit past rolling sessions
- **Guest Mode** — Browse aggregated public stats without an account
- **Handedness Toggle** — Switch between left- and right-handed UI layouts

## Tech Stack

| Layer      | Technology                        |
| ---------- | --------------------------------- |
| Framework  | SvelteKit 2 + Svelte 5 (runes)    |
| Styling    | Tailwind CSS v4                   |
| Database   | Neon (PostgreSQL) via Drizzle ORM |
| Auth       | better-auth (email/password)      |
| Deployment | Vercel                            |

## Architecture

The project follows Domain-Driven Design (DDD) with a strict separation between domain logic, application services, and infrastructure.

```
src/lib/backend/dice_rolling/
├── domain/
│   ├── models/
│   │   ├── RollSession.ts      # Rolling session aggregate
│   │   └── PlayerStats.ts      # Incremental stats ledger
│   └── services/
└── infrastructure/
    └── repositories/
        ├── PostgresRollRepository.ts
        └── PostgresStatsRepository.ts
```

Domain models have zero external dependencies — all infrastructure concerns (database, auth, framework) are kept strictly outside of `domain/`.

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm
- A [Neon](https://neon.tech) PostgreSQL database

### Setup

1. Clone the repository and install dependencies:

```bash
git clone <repo-url>
cd dnd-dice-tracker
pnpm install
```

2. Copy the example environment file and fill in your Neon connection string:

```bash
cp .env.example .env
```

3. Push the database schema to Neon:

```bash
pnpm db:push
```

4. Start the development server:

```bash
pnpm dev
```

## Available Scripts

| Command            | Description                         |
| ------------------ | ----------------------------------- |
| `pnpm dev`         | Start local development server      |
| `pnpm build`       | Build for production                |
| `pnpm check`       | Type-check with svelte-check        |
| `pnpm lint`        | Run Prettier and ESLint checks      |
| `pnpm format`      | Auto-format all source files        |
| `pnpm test`        | Run unit tests with Vitest          |
| `pnpm db:push`     | Sync schema to Neon (no migrations) |
| `pnpm db:studio`   | Open Drizzle Studio GUI             |
| `pnpm auth:schema` | Regenerate better-auth schema       |

## Documentation

| Doc                                      | Contents                                                   |
| ---------------------------------------- | ---------------------------------------------------------- |
| [`docs/faq.md`](docs/faq.md)             | Gotchas, non-obvious decisions, common patterns            |
| [`docs/blueprint.md`](docs/blueprint.md) | Core code examples (DDD models, repositories, app service) |
| [`docs/roadmap.md`](docs/roadmap.md)     | Architecture plans and future work                         |
| [`docs/progress.md`](docs/progress.md)   | Per-session change log                                     |

## License

[MIT](LICENSE)
