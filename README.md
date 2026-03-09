# Turbo Start Shopify

A production-ready headless commerce starter built with Shopify, Sanity, and Next.js — monorepo architecture with visual editing, type-safe data, and everything you need to ship fast.

![Turbo Start Shopify](https://raw.githubusercontent.com/robotostudio/turbo-start-shopify/main/turbo-start-sanity-og.png)

[![Node.js](https://img.shields.io/badge/node-%3E%3D22-brightgreen)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-10.28-orange)](https://pnpm.io/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![Sanity](https://img.shields.io/badge/Sanity-v5-red)](https://www.sanity.io/)
[![Shopify](https://img.shields.io/badge/Shopify-Storefront%20API-green)](https://shopify.dev/docs/api/storefront)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Features

- **Monorepo with Turborepo** — shared packages, fast builds, one `pnpm dev` to run everything
- **Next.js 16 App Router** — React Server Components, React Compiler, Turbopack, dynamic OG images
- **Sanity Studio v5** — visual editing, live preview, page builder, auto-redirects on slug change
- **Shopify Storefront API** — products, collections, cart, checkout, search
- **Type-safe end-to-end** — auto-generated Sanity types, Zod env validation, strict TypeScript
- **Tailwind CSS v4** — CSS-first config, OKLCH color tokens, dark mode, Shadcn components
- **SEO optimized** — dynamic metadata, OG images, sitemaps, JSON-LD structured data

## Architecture

### Data Flow

```
Shopify (products, collections, cart)
    ↕ Storefront API
Next.js 16 (App Router, RSC)
    ↕ GROQ queries via sanityFetch()
Sanity CMS (pages, blog, navigation, SEO)
```

### Monorepo Structure

```
apps/
  web/              → Next.js 16 frontend
  studio/           → Sanity Studio v5

packages/
  env/              → T3 env validation (Zod)
  sanity/           → Client, GROQ queries, live preview, generated types
  ui/               → Shadcn + Tailwind v4 primitives
  logger/           → Structured logger
  typescript-config/ → Shared TypeScript presets
```

## Prerequisites

- [Node.js](https://nodejs.org/) >= 22
- [pnpm](https://pnpm.io/) 10.28+
- A [Shopify Partner](https://www.shopify.com/partners) account with a development store
- A [Sanity](https://www.sanity.io/) account

## Getting Started

### 1. Clone and install

```bash
npx create-sanity@latest -- --template robotostudio/turbo-start-shopify
```

Or clone manually:

```bash
git clone https://github.com/robotostudio/turbo-start-shopify.git
cd turbo-start-shopify
pnpm install
```

### 2. Set up Shopify

1. Create a [development store](https://help.shopify.com/en/partners/dashboard/managing-stores/development-stores) in your Shopify Partner dashboard
2. In the store admin, go to **Settings > Apps and sales channels > Develop apps**
3. Create a custom app with **Storefront API** access scopes
4. Copy the **Storefront access token** and your **store domain** (e.g. `your-store.myshopify.com`)
5. (Optional) Enable **Admin API** access if you plan to use the seed scripts

### 3. Set up Sanity

1. Create a project at [sanity.io/manage](https://www.sanity.io/manage)
2. Note your **project ID** and **dataset** name (default: `production`)
3. Under **API > Tokens**, create a read token and a write token

### 4. Configure environment variables

Copy the example files and fill in your values:

```bash
cp apps/web/.env.example apps/web/.env
cp apps/studio/.env.example apps/studio/.env
```

See the [Environment Variables Reference](#environment-variables-reference) below for all required values.

### 5. Seed content

Import the included Sanity seed data:

```bash
cd apps/studio
npx sanity dataset import ./seed-data.tar.gz production --replace
```

Optionally seed Shopify with test products (requires Admin API token):

```bash
pnpm seed:shopify
pnpm verify:shopify
```

### 6. Start development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) for the Next.js app and [http://localhost:3333](http://localhost:3333) for Sanity Studio.

## Environment Variables Reference

### Web App (`apps/web/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Yes | Your Sanity project ID |
| `NEXT_PUBLIC_SANITY_DATASET` | Yes | Sanity dataset name (e.g. `production`) |
| `NEXT_PUBLIC_SANITY_API_VERSION` | Yes | API version date (default: `2025-08-29`) |
| `NEXT_PUBLIC_SANITY_STUDIO_URL` | Yes | Studio URL (`http://localhost:3333` for dev) |
| `SANITY_API_READ_TOKEN` | Yes | Sanity API token with read access |
| `SANITY_API_WRITE_TOKEN` | Yes | Sanity API token with write access |
| `SHOPIFY_STORE_DOMAIN` | Yes | Your Shopify store domain (e.g. `your-store.myshopify.com`) |
| `SHOPIFY_STOREFRONT_ACCESS_TOKEN` | Yes | Shopify Storefront API public access token |
| `SHOPIFY_API_VERSION` | No | Storefront API version (default: `2025-01`) |

### Sanity Studio (`apps/studio/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `SANITY_STUDIO_PROJECT_ID` | Yes | Same Sanity project ID as web |
| `SANITY_STUDIO_DATASET` | Yes | Same dataset name as web |
| `SANITY_STUDIO_TITLE` | Yes | Display title for the Studio |
| `SANITY_STUDIO_PRESENTATION_URL` | Prod | Frontend URL for live preview (auto-detects `localhost:3000` in dev) |
| `SANITY_STUDIO_PRODUCTION_HOSTNAME` | Deploy | Hostname for deployed Studio (e.g. `my-project` → `my-project.sanity.studio`) |
| `SANITY_STUDIO_API_VERSION` | No | Sanity API version |
| `SHOPIFY_STORE_DOMAIN` | Seeds | Your Shopify store domain (for seed scripts) |
| `SHOPIFY_ADMIN_ACCESS_TOKEN` | Seeds | Shopify Admin API token (for seed scripts) |

## Available Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps (web on :3000, studio on :3333) |
| `pnpm dev:web` | Start Next.js only |
| `pnpm dev:studio` | Start Sanity Studio only |
| `pnpm build` | Build all apps |
| `pnpm build:web` | Build Next.js only |
| `pnpm build:studio` | Build Sanity Studio only |
| `pnpm lint` | Lint with Biome |
| `pnpm format` | Format with Biome |
| `pnpm format:check` | Check formatting without writing |
| `pnpm check-types` | TypeScript type checking across all packages |
| `pnpm seed:shopify` | Seed Shopify with test products |
| `pnpm verify:shopify` | Print Shopify store health report |

## Deployment

### Deploy Next.js to Vercel

1. Push your repo to GitHub
2. Create a new [Vercel](https://vercel.com/) project and connect your repository
3. Set the **Root Directory** to `apps/web`
4. Add all required environment variables from the [web app table](#web-app-appsweb-env) above
5. Deploy

### Deploy Sanity Studio

**Automatic (recommended):** The included GitHub Actions workflow (`.github/workflows/deploy-sanity.yml`) deploys your Studio automatically when changes are pushed to `apps/studio/`.

Add these secrets to your GitHub repository settings:

| Secret | Description |
|--------|-------------|
| `SANITY_DEPLOY_TOKEN` | Sanity deploy token |
| `SANITY_STUDIO_PROJECT_ID` | Sanity project ID |
| `SANITY_STUDIO_DATASET` | Dataset name |
| `SANITY_STUDIO_TITLE` | Studio display title |
| `SANITY_STUDIO_PRESENTATION_URL` | Your deployed frontend URL |
| `SANITY_STUDIO_PRODUCTION_HOSTNAME` | Studio hostname (e.g. `my-project` → `my-project.sanity.studio`) |

PR preview builds are created automatically — each PR gets its own Studio at `<branch-name>-<hostname>.sanity.studio`.

> **Note:** When initializing with the Sanity CLI, the `.github` folder may not be included. If missing, copy the workflows from the [template repository](https://github.com/robotostudio/turbo-start-shopify/tree/main/.github).

**Manual:**

```bash
cd apps/studio
npx sanity deploy
```

### Shopify Configuration

Ensure your Storefront API custom app has the necessary access scopes for products, collections, and cart operations.

## Customization

### Adding a New Page Builder Block

1. Create a Sanity schema in `apps/studio/schemaTypes/blocks/`
2. Register it in `apps/studio/schemaTypes/blocks/index.ts`
3. Add a GROQ fragment in `packages/sanity/src/query.ts` and include it in `pageBuilderFragment`
4. Regenerate types: `pnpm --filter studio type`
5. Create a React component in `apps/web/src/components/sections/`
6. Register it in `BLOCK_COMPONENTS` in `apps/web/src/components/pagebuilder.tsx`
7. Add the type to `PageBuilderBlockTypes` in `apps/web/src/types.ts`

### Extending Sanity Schemas

- **Document types:** `apps/studio/schemaTypes/documents/`
- **Object types:** `apps/studio/schemaTypes/objects/`
- Register new types in `apps/studio/schemaTypes/index.ts`
- Always run `pnpm --filter studio type` after schema changes to regenerate types

### Adding Shadcn Components

Components live in `packages/ui/src/components/`. Follow the existing Radix + CVA pattern and import via `@workspace/ui/components/<component-name>`.

### Shopify Seed Scripts

```bash
pnpm seed:shopify                  # Append 10 test products
pnpm seed:shopify -- --batch=50    # Append 50 test products
pnpm seed:shopify -- --clean       # Remove all test products
pnpm verify:shopify                # Print store health report
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| **"Module not found" errors** | Run `pnpm install` from the project root. Check path aliases in `tsconfig.json`. |
| **Sanity types out of date** | Run `pnpm --filter studio type` to regenerate. |
| **Visual editing not working** | Enable third-party cookies in your browser. Verify `SANITY_STUDIO_PRESENTATION_URL` is set. |
| **Shopify products not loading** | Verify `SHOPIFY_STORE_DOMAIN` and `SHOPIFY_STOREFRONT_ACCESS_TOKEN` are correct. |
| **Seed script fails** | Check that `SHOPIFY_ADMIN_ACCESS_TOKEN` has the required Admin API scopes. |
| **Build fails on Vercel** | Ensure all env vars are set and the root directory is `apps/web`. |
| **Draft mode / live preview issues** | Confirm `SANITY_API_READ_TOKEN` is set with correct permissions. |
| **Tailwind styles not applying** | Ensure `@import "tailwindcss"` is in your CSS entry point. Check `@workspace/ui` transpile config. |
| **Redirects not working** | Redirects are fetched from Sanity at build time. Redeploy after creating new redirects. |

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| [Next.js](https://nextjs.org/) | 16 | React framework (App Router, RSC, Turbopack) |
| [React](https://react.dev/) | 19 | UI library |
| [Sanity](https://www.sanity.io/) | 5 | Headless CMS with visual editing |
| [Shopify Storefront API](https://shopify.dev/docs/api/storefront) | 2025-01 | Commerce engine |
| [Turborepo](https://turbo.build/) | 2 | Monorepo build orchestration |
| [Tailwind CSS](https://tailwindcss.com/) | 4 | Utility-first CSS framework |
| [Shadcn UI](https://ui.shadcn.com/) | — | Accessible component primitives |
| [Biome](https://biomejs.dev/) | 2 | Linter and formatter |
| [TypeScript](https://www.typescriptlang.org/) | 5 | Type safety |
| [Zod](https://zod.dev/) | 4 | Runtime env validation |
| [pnpm](https://pnpm.io/) | 10 | Package manager |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute to this project.

## License

[MIT](LICENSE) &copy; [Roboto Studio](https://roboto.studio/)
