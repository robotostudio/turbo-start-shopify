# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Shopify + Sanity headless commerce starter — pnpm monorepo with Turborepo orchestration.

## Commands

```bash
# Development (web :3000, studio :3333)
pnpm dev              # all apps
pnpm dev:web          # Next.js only
pnpm dev:studio       # Sanity Studio only

# Build
pnpm build            # all
pnpm build:web        # web only
pnpm build:studio     # studio only

# Quality
pnpm lint             # biome lint
pnpm format           # biome format --write
pnpm format:check     # biome format (check only)
pnpm check-types      # tsc --noEmit across all packages

# Studio schema tooling (run from apps/studio)
npx sanity schema extract --enforce-required-fields
npx sanity typegen generate
npx sanity deploy

# Seed data (run from apps/studio)
npx sanity dataset import ./seed-data.tar.gz production --replace
```

No test framework is configured.

## Architecture

```
apps/
  web/          → Next.js 16 (App Router, Turbopack, React Compiler, RSC)
  studio/       → Sanity Studio v5 (custom structure, plugins, blueprints)
packages/
  env/          → @workspace/env — T3 env validation (Zod v4), client.ts + server.ts
  sanity/       → @workspace/sanity — Sanity client, GROQ queries, live preview, generated types
  ui/           → @workspace/ui — Shadcn (new-york style) + Tailwind v4 primitives
  logger/       → @workspace/logger — Logger class wrapping console.*
  typescript-config/ → shared tsconfig presets
```

### Data Flow

1. **GROQ queries** defined with `defineQuery` in `packages/sanity/src/query.ts` — composable fragments for images, links, rich text, page builder blocks
2. **`sanityFetch()`** from `packages/sanity/src/live.ts` (via `next-sanity/defineLive`) — used in RSC pages for data fetching with live preview support
3. **Page Builder** (`apps/web/src/components/pagebuilder.tsx`) — client component mapping `_type` → React section component via `BLOCK_COMPONENTS` record. Uses `useOptimistic` from `@sanity/visual-editing` for live editing
4. **Section components** in `apps/web/src/components/sections/` — `hero`, `cta`, `faq-accordion`, `feature-cards-with-icon`, `subscribe-newsletter`, `image-link-cards`
5. **Types** auto-generated: run `pnpm --filter studio type` → outputs to `packages/sanity/src/sanity.types.ts`

### Adding a New Page Builder Block

1. Create Sanity schema in `apps/studio/schemaTypes/blocks/`
2. Register it in `apps/studio/schemaTypes/index.ts`
3. Add GROQ fragment in `packages/sanity/src/query.ts` and include in `pageBuilderFragment`
4. Run `pnpm --filter studio type` to regenerate types
5. Create React component in `apps/web/src/components/sections/`
6. Register in `BLOCK_COMPONENTS` map in `apps/web/src/components/pagebuilder.tsx`
7. Add type to `PageBuilderBlockTypes` union in `apps/web/src/types.ts`

### Sanity Studio Structure

- **Documents**: `blog`, `page`, `faq`, `author`, `product`, `collection`, `productVariant`, `redirect`, `colorTheme`
- **Singletons**: `homePage`, `blogIndex`, `settings`, `footer`, `navbar`
- **Shopify objects**: `shopifyProduct`, `shopifyProductVariant`, `shopifyCollection`, `inventory`, `option`, `priceRange`, etc.
- **Blueprint** (`sanity.blueprint.ts`): auto-redirect function — creates redirect documents on slug change

### Key Patterns

- **Env validation**: `@workspace/env/client` and `@workspace/env/server` — validated imports, never raw `process.env`
- **Path aliases**: `@/*` → `apps/web/src/*`, `@workspace/ui/*` → `packages/ui/src/*`
- **SEO**: `getSEOMetadata()` in `apps/web/src/lib/seo.ts`, OG images via `/api/og` route
- **Visual editing**: `VisualEditing` from `next-sanity` + `createDataAttribute` per block, draft mode via `/api/presentation-draft`
- **Redirects**: fetched from Sanity at Next.js build time via `queryRedirects` in `next.config.ts`

## Tooling

- **Node**: >=22
- **Package manager**: pnpm 10.28.0 (workspace protocol, catalog for shared versions in `pnpm-workspace.yaml`)
- **Formatter/Linter**: Biome 2.3.8 — double quotes, semicolons, 2-space indent, 80 char width, trailing commas es5
- **Import order** (Biome): URL/Node → packages → blank line → aliases/paths
- **TypeScript**: strict, `noUncheckedIndexedAccess`, module NodeNext, target ES2022
- **Tailwind CSS v4**: CSS-first config via `@import "tailwindcss"`, OKLCH color tokens, dark mode via `@custom-variant`
- **React Compiler**: enabled via `babel-plugin-react-compiler` in Next.js config

## Environment Variables

**Web** (`apps/web/.env`):
- `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `NEXT_PUBLIC_SANITY_API_VERSION`, `NEXT_PUBLIC_SANITY_STUDIO_URL`
- `SANITY_API_READ_TOKEN`, `SANITY_API_WRITE_TOKEN`

**Studio** (`apps/studio/.env`):
- `SANITY_STUDIO_PROJECT_ID`, `SANITY_STUDIO_DATASET`, `SANITY_STUDIO_TITLE`, `SANITY_STUDIO_PRESENTATION_URL`
