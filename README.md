<p align="center">
  <a href="https://www.medusajs.com">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://user-images.githubusercontent.com/59018053/229103275-b5e482bb-4601-46e6-8142-244f531cebdb.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://user-images.githubusercontent.com/59018053/229103726-e5b529a3-9b3f-4970-8a1f-c6af37f087bf.svg">
    <img alt="Medusa logo" src="https://user-images.githubusercontent.com/59018053/229103726-e5b529a3-9b3f-4970-8a1f-c6af37f087bf.svg">
    </picture>
  </a>
</p>
<h1 align="center">
  Medusa
</h1>

<h4 align="center">
  <a href="https://docs.medusajs.com">Documentation</a> |
  <a href="https://www.medusajs.com">Website</a>
</h4>

<p align="center">
  Building blocks for digital commerce
</p>
<p align="center">
  <a href="https://github.com/medusajs/medusa/blob/master/CONTRIBUTING.md">
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat" alt="PRs welcome!" />
  </a>
    <a href="https://www.producthunt.com/posts/medusa"><img src="https://img.shields.io/badge/Product%20Hunt-%231%20Product%20of%20the%20Day-%23DA552E" alt="Product Hunt"></a>
  <a href="https://discord.gg/xpCwq3Kfn8">
    <img src="https://img.shields.io/badge/chat-on%20discord-7289DA.svg" alt="Discord Chat" />
  </a>
  <a href="https://twitter.com/intent/follow?screen_name=medusajs">
    <img src="https://img.shields.io/twitter/follow/medusajs.svg?label=Follow%20@medusajs" alt="Follow @medusajs" />
  </a>
</p>

## Run locally

Requirements: Node.js 20 (`nvm use`; the repo supports `>=18 <25`, Node 25+ is **not** supported because the `SlowBuffer` API used by the `buffer-equal-constant-time` dependency (via `jsonwebtoken`) was removed) and PostgreSQL 14+. Redis is optional.

This repo has no bundled Postgres of its own upstream, so a minimal `docker-compose.yml` is included here for local Postgres; its defaults match `DATABASE_URL` in `.env.example` exactly (db `medusaone`, user/password `postgres`/`postgres`, port 5434 — not 5432, to avoid clashing with any host-level Postgres already using that port).

```shell
nvm use
npm ci                          # installs exactly what package-lock.json pins
cp .env.example .env            # then edit DATABASE_URL, secrets, RESEND_API_KEY
docker compose up -d db         # local Postgres matching .env.example's DATABASE_URL
                                 # (or: createdb medusaone / point DATABASE_URL at any empty database)
npm run build                   # compiles the server and builds the admin UI
npx medusa migrations run       # creates / updates the schema
npm run seed                    # optional: demo data from data/seed.json
npx medusa start                # http://localhost:9000
```

Check it is up:

```shell
curl http://localhost:9000/health        # OK
curl http://localhost:9000/store/regions # JSON
```

Other scripts: `npm run dev` (watch mode with admin dev server), `npm run typecheck`, `npm test` (no tests exist yet).
The admin UI is served at `/app`; create a user with `npx medusa user -e you@example.com -p <password>`.

Notes:

- `RESEND_API_KEY` must be non-empty or the server refuses to boot (see `src/services/resend-notification.ts`).
- Without `REDIS_URL` Medusa uses an in-memory event bus and cache and scheduled jobs are disabled. Set `REDIS_URL` in production.
- Configuration is read from `.env` (or `.env.production` / `.env.staging` / `.env.test` depending on `NODE_ENV`).

## Compatibility

This starter is compatible with versions >= 1.8.0 of `@medusajs/medusa`. 

## Getting Started

Visit the [Quickstart Guide](https://docs.medusajs.com/create-medusa-app) to set up a server.

Visit the [Docs](https://docs.medusajs.com/development/backend/prepare-environment) to learn more about our system requirements.

## What is Medusa

Medusa is a set of commerce modules and tools that allow you to build rich, reliable, and performant commerce applications without reinventing core commerce logic. The modules can be customized and used to build advanced ecommerce stores, marketplaces, or any product that needs foundational commerce primitives. All modules are open-source and freely available on npm.

Learn more about [Medusa’s architecture](https://docs.medusajs.com/development/fundamentals/architecture-overview) and [commerce modules](https://docs.medusajs.com/modules/overview) in the Docs.

## Roadmap, Upgrades & Plugins

You can view the planned, started and completed features in the [Roadmap discussion](https://github.com/medusajs/medusa/discussions/categories/roadmap).

Follow the [Upgrade Guides](https://docs.medusajs.com/upgrade-guides/) to keep your Medusa project up-to-date.

Check out all [available Medusa plugins](https://medusajs.com/plugins/).

## Community & Contributions

The community and core team are available in [GitHub Discussions](https://github.com/medusajs/medusa/discussions), where you can ask for support, discuss roadmap, and share ideas.

Join our [Discord server](https://discord.com/invite/medusajs) to meet other community members.

## Other channels

- [GitHub Issues](https://github.com/medusajs/medusa/issues)
- [Twitter](https://twitter.com/medusajs)
- [LinkedIn](https://www.linkedin.com/company/medusajs)
- [Medusa Blog](https://medusajs.com/blog/)
# finalbackend
# finalbackend
