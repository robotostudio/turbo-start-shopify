# Turbo Start Shopify

A production-ready headless commerce starter built with Shopify, Sanity, and Next.js 16. Monorepo architecture powered by Turborepo.

[Demo](https://turbo-start-shopify.vercel.app) | [Documentation](#getting-started) | [Report Bug](https://github.com/robotostudio/turbo-start-shopify/issues)

---

## Why This Starter?

Most Shopify starters are either too simple (no CMS, no visual editing) or too opinionated (locked into one way of doing things). This starter gives you:

- **Visual Editing** -- Edit content in Sanity Studio and see changes live in your storefront. No deploy needed.
- **Page Builder** -- Drag-and-drop content blocks (hero, CTA, FAQ, feature cards, newsletter) with real-time preview via `useOptimistic`.
- **Monorepo Architecture** -- Shared packages for UI, env validation, Sanity client, and logging. Scale from one store to many.
- **Modern Stack** -- Next.js 16 with React Compiler, Turbopack, and React Server Components. Biome for formatting and linting.
- **Type Safety Everywhere** -- T3 Env for validated environment variables, auto-generated Sanity types, strict TypeScript across the board.
- **Auto-Redirects** -- Sanity Blueprints automatically create redirect documents when content slugs change. No manual work.
- **Dynamic OG Images** -- Auto-generated Open Graph images for products, collections, and blog posts.
- **Production Infrastructure** -- Security headers, on-demand revalidation, error boundaries, CI/CD pipeline, analytics integration.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack, React Compiler) |
| Commerce | Shopify Storefront API |
| CMS | Sanity v5 (Visual Editing, GROQ, Blueprints) |
| Styling | Tailwind CSS v4 (CSS-first config, OKLCH tokens) |
| UI | shadcn/ui (New York style) |
| Monorepo | Turborepo + pnpm workspaces |
| Type Safety | TypeScript 5, Zod v4, T3 Env |
| Quality | Biome 2.x (lint + format) |

## Architecture

```
apps/
  web/          -- Next.js storefront (port 3000)
  studio/       -- Sanity Studio (port 3333)
packages/
  ui/           -- Shared UI components (shadcn + Tailwind v4)
  sanity/       -- Sanity client, GROQ queries, generated types
  env/          -- T3 validated environment variables
  logger/       -- Structured logging
  typescript-config/ -- Shared tsconfig presets
```

## Getting Started

### Prerequisites

- Node.js >= 22
- pnpm 10.x (`corepack enable && corepack prepare pnpm@latest --activate`)
- A Shopify store with Storefront API access
- A Sanity project ([create one](https://sanity.io/manage))

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

### 2. Configure environment variables

```bash
cp apps/web/.env.example apps/web/.env
cp apps/studio/.env.example apps/studio/.env
```

**Web app** (`apps/web/.env`):

| Variable | Where to find it |
|----------|-----------------|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | [sanity.io/manage](https://sanity.io/manage) -- Project -- Settings |
| `NEXT_PUBLIC_SANITY_DATASET` | Usually `production` |
| `NEXT_PUBLIC_SANITY_API_VERSION` | Default: `2025-08-29` |
| `NEXT_PUBLIC_SANITY_STUDIO_URL` | `http://localhost:3333` for dev |
| `SANITY_API_READ_TOKEN` | sanity.io/manage -- API -- Tokens -- Add token (Viewer) |
| `SANITY_API_WRITE_TOKEN` | sanity.io/manage -- API -- Tokens -- Add token (Editor) |
| `SHOPIFY_STORE_DOMAIN` | `your-store.myshopify.com` |
| `SHOPIFY_STOREFRONT_ACCESS_TOKEN` | Shopify Admin -- Settings -- Apps -- Develop apps -- Storefront API |

**Studio** (`apps/studio/.env`):

| Variable | Value |
|----------|-------|
| `SANITY_STUDIO_PROJECT_ID` | Same Sanity project ID as web |
| `SANITY_STUDIO_DATASET` | Same dataset name as web |
| `SANITY_STUDIO_TITLE` | Display title for the Studio |
| `SANITY_STUDIO_PRESENTATION_URL` | `http://localhost:3000` for dev |
| `SHOPIFY_STORE_DOMAIN` | `your-store.myshopify.com` (for seed scripts) |
| `SHOPIFY_ADMIN_ACCESS_TOKEN` | Shopify Admin -- Settings -- Apps -- Develop apps -- Admin API |

### 3. Seed data (optional)

```bash
cd apps/studio
npx sanity dataset import ./seed-data.tar.gz production --replace
```

### 4. Start development

```bash
pnpm dev
```

- Storefront: http://localhost:3000
- Sanity Studio: http://localhost:3333

### Verify it works

1. Open http://localhost:3000 -- you should see the homepage with the hero section
2. Open http://localhost:3333 -- Sanity Studio should load with your content
3. Edit content in Studio -- changes appear live in the storefront

## Customization

### Adding a New Page Builder Block

1. Create schema in `apps/studio/schemaTypes/blocks/`
2. Register in `apps/studio/schemaTypes/index.ts`
3. Add GROQ fragment in `packages/sanity/src/query.ts`
4. Run `pnpm --filter studio type` to regenerate types
5. Create component in `apps/web/src/components/sections/`
6. Register in `BLOCK_COMPONENTS` in `apps/web/src/components/pagebuilder.tsx`
7. Add type to `PageBuilderBlockTypes` in `apps/web/src/types.ts`

### Theme Customization

Colors use OKLCH tokens defined in `packages/ui/src/styles/globals.css`. Modify the CSS custom properties to change the color scheme.

### Adding Shadcn Components

Components live in `packages/ui/src/components/`. Follow the existing pattern and import via `@workspace/ui/components/<name>`.

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps (web on :3000, studio on :3333) |
| `pnpm dev:web` | Start Next.js only |
| `pnpm dev:studio` | Start Sanity Studio only |
| `pnpm build` | Build all apps |
| `pnpm build:web` | Build Next.js only |
| `pnpm lint` | Lint with Biome |
| `pnpm format` | Format with Biome |
| `pnpm check-types` | TypeScript type checking across all packages |
| `pnpm seed:shopify` | Seed Shopify with test products |
| `pnpm verify:shopify` | Print Shopify store health report |

## Deployment

### Deploy Next.js to Vercel

1. Push your repo to GitHub
2. Create a new [Vercel](https://vercel.com/) project and connect your repository
3. Set the **Root Directory** to `apps/web`
4. Add all required environment variables from the [web app table](#2-configure-environment-variables)
5. Deploy

### Deploy Sanity Studio

The included GitHub Actions workflow (`.github/workflows/deploy-sanity.yml`) deploys your Studio automatically when changes are pushed to `apps/studio/`. PR preview builds are created automatically -- each PR gets its own Studio at `<branch-name>-<hostname>.sanity.studio`.

Or deploy manually:

```bash
cd apps/studio
npx sanity deploy
```

### Deployment Checklist

- [ ] All environment variables set in hosting platform
- [ ] Sanity CORS origins configured for production domain ([sanity.io/manage](https://sanity.io/manage) -- API -- CORS)
- [ ] Sanity Studio deployed (`cd apps/studio && npx sanity deploy`)
- [ ] Shopify webhook configured to point to your domain
- [ ] Custom domain DNS configured
- [ ] Security headers verified (check with [securityheaders.com](https://securityheaders.com))
- [ ] OG images generating correctly (check with [opengraph.xyz](https://opengraph.xyz))

## Project Structure Details

### Data Flow

1. GROQ queries defined in `packages/sanity/src/query.ts` with composable fragments
2. `sanityFetch()` from `packages/sanity/src/live.ts` used in RSC pages with live preview support
3. Page Builder maps `_type` to React components via `BLOCK_COMPONENTS` record
4. Shopify data fetched via Storefront API client

### Key Patterns

- **Env validation** -- `@workspace/env/client` and `@workspace/env/server`, never raw `process.env`
- **SEO** -- `getSEOMetadata()` generates meta tags, dynamic OG images via `/api/og`
- **Visual editing** -- Sanity `VisualEditing` + `createDataAttribute` per block, draft mode via `/api/presentation-draft`
- **Redirects** -- Auto-fetched from Sanity at build time via `queryRedirects`
- **Error tracking** -- Optional Sentry integration (set `SENTRY_DSN` env var)

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Module not found errors | Run `pnpm install` from root. Check path aliases in `tsconfig.json`. |
| Sanity types out of date | Run `pnpm --filter studio type` to regenerate. |
| Visual editing not working | Enable third-party cookies. Verify `SANITY_STUDIO_PRESENTATION_URL`. |
| Shopify products not loading | Verify `SHOPIFY_STORE_DOMAIN` and `SHOPIFY_STOREFRONT_ACCESS_TOKEN`. |
| Build fails on Vercel | Ensure all env vars are set and root directory is `apps/web`. |
| Redirects not working | Redirects are fetched at build time. Redeploy after creating new ones. |

## Contributing

Contributions welcome. Please open an issue first to discuss changes.

## License

[MIT](LICENSE) -- [Roboto Studio](https://roboto.studio/)
