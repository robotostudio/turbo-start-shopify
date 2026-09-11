# CLAUDE.md

Guidance for Claude Code (claude.ai/code) when working in this repository.

**Conventions, architecture rules and data flow live in [`AGENTS.md`](./AGENTS.md).** Read that first — it is the single source for how to write code here, and it is shared with Cursor and Codex. This file covers only what's specific to running the repo.

## Project Overview

Shopify + Sanity headless commerce starter — pnpm monorepo with Turborepo orchestration.

```text
apps/
  web/          → Next.js 16 (App Router, Turbopack, React Compiler, RSC)
  studio/       → Sanity Studio v6 (custom structure, plugins, blueprints)
packages/
  env/          → @workspace/env — T3 env validation (Zod v4), client.ts + server.ts
  sanity/       → @workspace/sanity — Sanity client, GROQ queries, live preview, generated types
  ui/           → @workspace/ui — Shadcn (new-york style) + Tailwind v4 primitives
  logger/       → @workspace/logger — Logger class wrapping console.*
  typescript-config/ → shared tsconfig presets
```

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
pnpm test             # vitest, via turbo

# Studio schema tooling
pnpm --filter studio type          # schema extract + typegen → packages/sanity/src/sanity.types.ts
pnpm --filter studio extract       # schema extract only
pnpm --filter studio run deploy    # publish the Studio

# Seed data
pnpm seed:shopify     # faker products → Shopify Admin API (needs SHOPIFY_ADMIN_ACCESS_TOKEN)
pnpm verify:shopify   # check store state
pnpm --filter studio exec sanity dataset import ./seed-data.tar.gz production --replace
```

`schema extract` runs with `--force` — it refuses to overwrite an existing `schema.json` without it. `pnpm --filter studio type` also runs a Biome pass over `packages/sanity` as its third step, so expect a formatting diff alongside the regenerated types.

Tests are Vitest, scoped to `apps/web`, and run from the root through Turbo (`pnpm test`) or directly (`pnpm --filter web test`). Specs live in `__tests__/` directories and are `.test.ts` — components are exercised with `createElement` + `renderToStaticMarkup`, not JSX, because the config's include glob matches `.ts` only.

## Skills

`.claude/skills/` holds tested playbooks. Prefer them over improvising:

| Skill | Use for |
|---|---|
| `add-pagebuilder-block` | Adding a block to the Sanity page builder |
| `enable-ai-assistant` | Adding the turbo-start-aisle AI shopping assistant |
| `generate-thumbnails-agentic` | Page builder block thumbnails via Playwright MCP |

## Sanity Studio

- **Documents**: `blog`, `page`, `faq`, `author`, `category`, `product`, `collection`, `productVariant`, `redirect`
- **Singletons**: `homePage`, `blogIndex`, `collectionsIndex`, `settings`, `footer`, `navbar`, `promoBanner` — the `singletons` array in `apps/studio/schemaTypes/documents/index.ts` is the list. `sanity.config.ts` keeps a *second*, hardcoded list in `document.newDocumentOptions`; the two have already drifted, so a new singleton needs both
- **Page builder blocks**: defined in `apps/studio/schemaTypes/blocks/`, registered in `blocks/index.ts` — **the Studio-side registry, and the list to read before assuming which blocks exist**. Rendering needs two more registrations to agree: the GROQ fragment in `packages/sanity/src/query.ts` and `BLOCK_COMPONENTS` in `apps/web/src/components/pagebuilder.tsx`. A block present in one but not the others fails distinctly — see the `add-pagebuilder-block` skill
- **Shopify objects** (`apps/studio/schemaTypes/objects/shopify/`): synced read-only by Sanity Connect; never write to `store.*`
- **Blueprint** (`sanity.blueprint.ts`): auto-redirect function creating `redirect` documents on slug change
- **Structure**: `apps/studio/structure.ts`; presentation URL resolution in `apps/studio/location.ts`
- **Dependency pins**: `sanity`, `@sanity/vision` and the seven plugins in `apps/studio/package.json` are pinned to exact versions, not ranges. The Studio is held on the `@sanity/ui` v3 line and every package crosses to v4 at a patch bump, so a caret or tilde would put a second `@sanity/ui` in the tree. What pins the whole line is `sanity-plugin-lucide-icon-picker`: 1.0.3 is its latest and last release, and it imports `Popover`/`Menu` from the `@sanity/ui` root and `TrashIcon`/`SyncIcon`/`EllipsisHorizontalIcon` from the `@sanity/icons` root — all moved to subpaths in `@sanity/ui` v4 / `@sanity/icons` v5, so `sanity build` fails with `MISSING_EXPORT` the moment the Studio crosses. Crossing means replacing that plugin (it backs the `lucide-icon` field type used by navbar, footer and the icon cards). That migration has no ticket yet — raise one and record its ROB id here and in `.github/renovate.json` so the freeze has an owner. Do not loosen them or bump a Sanity plugin to `latest` without reading the comment in `pnpm-workspace.yaml` first; after any install, `pnpm --filter studio why @sanity/ui` must show 3.x only

## Other

- **SEO**: `getSEOMetadata()` in `apps/web/src/lib/seo.ts`, OG images via `/api/og`
- **AI agent surfaces**: content negotiation serves Markdown to agents (`apps/web/src/proxy.ts`, `apps/web/src/app/api/markdown/route.ts`), plus `apps/web/src/app/llms.txt/route.ts`
- **Visual editing**: `VisualEditingLayer` (`VisualEditing` from `next-sanity/visual-editing` plus this app's overlay components) in the root layout, draft mode only; `createDataAttribute` per block; draft mode via `/api/presentation-draft`
- **Redirects**: fetched from Sanity at Next.js build time via `queryRedirects` in `next.config.ts`
- **Node** >=24.10, **pnpm** 11.24.0 (workspace protocol, catalog in `pnpm-workspace.yaml`)
- **CI** (`.github/workflows/ci.yml`): lint, format:check, check-types, `test:coverage`, a SonarQube Cloud scan, then a Studio build against `apps/studio/.env.example` — Vercel builds `apps/web` on every PR but not `apps/studio`, so that last step is the only thing catching a dependency that breaks `sanity build`

### Double-click to type (custom Presentation overlay)

`apps/web/src/components/overlay-components.tsx` is the resolver handed to
`<VisualEditing components={...} />` through `visual-editing-layer.tsx` (its own
client component, because a function cannot cross the server/client boundary).
It returns `InlineText` when `isInlineEditable` in `inline-text.tsx` allows it:
the element holds a single text node, sits outside any link, button, summary
or label (the click capture would swallow their handlers), and either

- **Plain strings**: carries the bare `data-inline-edit` flag over a `string` field. Never flag a multi-line `text` field: nothing at runtime can tell the two apart, Enter saves, and a paste collapses newlines. The page builder sections in `apps/web/src/components/sections/` flag their plain-string eyebrows, titles, headings and card titles. Opt-in, because the resolver also sees every nav link, button label and badge. Never flag commerce data — `store.*` fields (product and collection titles, prices) are synced read-only from Shopify, and anything fetched from the Storefront API carries no stega
- **Rich text**: has a Portable Text span path (`…children[_key=="s"].text`). The words in a one-span paragraph, or in the bold/italic run inside one, can be typed over. Plain runs in a paragraph that also has marks, and marks, links and new paragraphs themselves, stay in the Studio form

`inline-text.tsx` makes the element `contentEditable="plaintext-only"` on
double-click and saves once on blur through `useDocuments()`, to the overlay
node's own `id` and `path`. Sanity ships nothing official for inline typing;
this is custom on that documented API. The rules that keep typing and page
updates from trampling each other (strip stega first, save only on blur, put
typed text back over a render, rewrite React's text node in place, restore on
cancel, empty or a locally rejected patch (the Studio's own write is
fire-and-forget, so a server rejection is not reported back), end without
saving if React restructures the text mid-edit, clean up if the element is
removed) live as comments in `inline-text.tsx`. No real click on an editable
element reaches the overlay: a click opening the field makes the Studio focus
its input, which ends an edit mid-word. A single click is replayed after the
double-click window, and Enter opens the field with the saved value. Saving is
last-write-wins, as in the Studio form. Inline editing is on only when the
preview's perspective is drafts: the root layout resolves it with
`resolvePerspectiveFromCookies` (the same call `sanityFetch` makes in draft
mode) and passes that to `VisualEditingLayer`, because saves always write
`drafts.<id>`, which a published or release preview never shows. In a drafts
preview, text from the published document stays editable, because a page with
no draft renders from it and the first save creates the draft.

Visitors never mount any of it: `VisualEditingLayer` renders only in draft
mode, and the `data-inline-edit` attribute is inert outside Presentation.

## Environment Variables

**Web** (`apps/web/.env`) — see `apps/web/.env.example`; all of these are validated in `packages/env/src/{client,server}.ts`, so a missing one fails the build rather than the request:

- `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `NEXT_PUBLIC_SANITY_API_VERSION`, `NEXT_PUBLIC_SANITY_STUDIO_URL`
- `SANITY_API_READ_TOKEN`, `SANITY_API_WRITE_TOKEN`
- `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_ACCESS_TOKEN` — required; `SHOPIFY_API_VERSION` defaults to `2025-01`
- `NEXT_PUBLIC_STORE_CURRENCY` — ISO 4217, defaults to `GBP`
- `NEXT_PUBLIC_SITE_URL` — canonical origin, no trailing slash. Checked _before_ the Vercel vars, so it also overrides the generated `*.vercel.app` URL. Required off Vercel: `getBaseUrl()` otherwise falls back to `localhost:3000` and every canonical, OG URL and sitemap entry ships pointing there

**Studio** (`apps/studio/.env`): `SANITY_STUDIO_PROJECT_ID`, `SANITY_STUDIO_DATASET`, `SANITY_STUDIO_TITLE`, `SANITY_STUDIO_PRESENTATION_URL`, `SHOPIFY_ADMIN_ACCESS_TOKEN` (seed scripts only)

**Web** variables are validated via `@workspace/env` — see AGENTS.md for where a new variable must be registered.

**Studio variables are not.** `apps/studio` reads `process.env` directly in `sanity.config.ts`, `sanity.cli.ts`, `utils/helper.ts` and the scripts, with no schema validation — only a non-fatal `logger.warn` in `sanity.cli.ts` when `SANITY_STUDIO_PROJECT_ID` or `SANITY_STUDIO_DATASET` is unset. Everything else surfaces late. Add guards at the point of use, and give them a message that says which variable is missing.

The Sanity CLI loads both `.env` and `.env.local` into `process.env` before it evaluates `sanity.cli.ts`, and **`.env.local` takes precedence** — the same ranking Next.js uses on the web side. (The `import "dotenv/config"` in `sanity.cli.ts` reads `.env` only, but it is redundant under a `sanity` command for that reason.) Either file works; having both is the hazard, since `.env.local` silently wins.
