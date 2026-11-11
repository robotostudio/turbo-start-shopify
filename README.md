# Turbo Start Shopify

A production-ready headless commerce starter built with Shopify, Sanity, and Next.js — monorepo architecture with visual editing, type-safe data, and everything you need to ship fast.

Built by [Roboto Studio](https://robotostudio.com/services/shopify) and used in production client builds.

![Turbo Start Shopify](https://raw.githubusercontent.com/robotostudio/turbo-start-shopify/main/turbo-start-shopify-og.jpg)

**[Live demo →](https://turbo-start-shopify-web.vercel.app)**

[![Node.js](https://img.shields.io/badge/node-%3E%3D24.10-brightgreen)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-11.24-orange)](https://pnpm.io/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![Sanity](https://img.shields.io/badge/Sanity-v6-red)](https://www.sanity.io/)
[![Shopify](https://img.shields.io/badge/Shopify-Storefront%20API-green)](https://shopify.dev/docs/api/storefront)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Features

- **Monorepo with Turborepo** — shared packages, fast builds, one `pnpm dev` to run everything
- **Next.js 16 App Router** — React Server Components, React Compiler, Turbopack, dynamic OG images
- **Sanity Studio v6** — visual editing, live preview, page builder, auto-redirects on slug change
- **Shopify Storefront API** — products, collections, cart, checkout, search
- **Type-safe end-to-end** — auto-generated Sanity types, Zod env validation, strict TypeScript
- **Tailwind CSS v4** — CSS-first config, OKLCH color tokens, dark mode, Shadcn components
- **SEO optimized** — dynamic metadata, OG images, sitemaps, JSON-LD structured data

## Architecture

### Data Flow

```txt
Shopify (products, collections, cart)
    ↕ Storefront API
Next.js 16 (App Router, RSC)
    ↕ GROQ queries via sanityFetch()
Sanity CMS (pages, blog, navigation, SEO)
```

### Monorepo Structure

```txt
apps/
  web/              → Next.js 16 frontend
  studio/           → Sanity Studio v6

packages/
  env/              → T3 env validation (Zod)
  sanity/           → Client, GROQ queries, live preview, generated types
  ui/               → Shadcn + Tailwind v4 primitives
  logger/           → Structured logger
  typescript-config/ → Shared TypeScript presets
```

## Prerequisites

- [Node.js](https://nodejs.org/) >= 24.10
- [pnpm](https://pnpm.io/) 11.24+
- A [Shopify Partner](https://www.shopify.com/partners) account
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

> **Warning:** Dev stores are permanent. They cannot be converted to a live store or transferred to a client. Use one for testing only.

1. Create a **Dev** store in the [Dev Dashboard](https://dev.shopify.com/dashboard/) under **Stores > Create store**. Enable generated test data if you want sample products
2. In the store admin, install the [Headless](https://apps.shopify.com/headless) channel, add a storefront, and copy its **public access token**. Under **Storefront API permissions**, turn on **Read product inventory** (`unauthenticated_read_product_inventory`): product pages ask for stock levels, and without it every product page, and so the build, fails
3. Note your **store domain** (e.g. `your-store.myshopify.com`). If you renamed the store, Shopify keeps the original as its _permanent_ domain (**Settings → Domains**). The Storefront API accepts either, but Shopify CLI sign-in only accepts the permanent one
4. (Optional, seed script only) Create an app in the Dev Dashboard with the Admin API scopes `write_products`, `read_products`, `read_locations`, `write_inventory`, `read_publications`, `write_publications`, `write_discounts`, `read_discounts`, install it on your store, then [get a token](https://shopify.dev/docs/apps/build/authentication-authorization/client-credentials-grant) from its Client ID and secret. Tokens last 24 hours. For `pnpm seed:customers` (test orders for [Customer Accounts](#customer-accounts)) also add `read_customers`, `write_customers`, `read_orders`, `write_orders`, `write_merchant_managed_fulfillment_orders` and `write_fulfillments`

### 3. Set up Sanity

1. Create a project at [sanity.io/manage](https://www.sanity.io/manage). If `create-sanity` in step 1 already created one for you, use that project instead
2. Note your **project ID** and **dataset** name (default: `production`)
3. Under **API > Tokens**, create a read token (**Viewer** role) and a write token (**Editor** role)
4. Under **API > CORS origins**, add `http://localhost:3000` with **Allow credentials** checked. Live content updates and draft previews run in the browser and fail without it. Add your production domain the same way when you deploy

### 4. Configure environment variables

Copy the example files and fill in your values:

```bash
cp apps/web/.env.example apps/web/.env
cp apps/studio/.env.example apps/studio/.env
```

See the [Environment Variables Reference](#environment-variables-reference) below for all required values.

### 5. Seed content

Import the included Sanity seed data. **Do not skip this:** the build needs at least one `page` document, and fails on an empty dataset (see [Troubleshooting](#troubleshooting)).

```bash
cd apps/studio
npx sanity login
npx sanity dataset import ./seed-data.tar.gz --dataset <your-dataset> --replace
```

Replace `<your-dataset>` with the dataset name from step 3. `--replace` overwrites any documents with the same IDs, so run it against a new dataset or one you are happy to reset.

This seed has no products. Products come from Shopify. Skip this if you enabled generated test data in step 2, otherwise seed some:

```bash
pnpm seed:shopify
pnpm verify:shopify
```

Each run adds 10 fake products across 5 collections. Details in [`apps/studio/scripts/seed-shopify/README.md`](apps/studio/scripts/seed-shopify/README.md).

### 6. Sync products into Sanity

Products live in Shopify but the site also needs them in Sanity, or product pages return 404. The [Sanity Connect](https://apps.shopify.com/sanity-connect) app copies them across:

1. Install Sanity Connect in your Shopify store admin
2. Point it at your Sanity project and `production` dataset
3. Choose **Start synchronizing now**

Product data is read-only in the Studio. Edit prices and variants in Shopify; edit the surrounding content in Sanity.

### 7. Start development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) for the Next.js app and [http://localhost:3333](http://localhost:3333) for Sanity Studio.

## Environment Variables Reference

### Web App (`apps/web/.env`)

| Variable                             | Required   | Description                                                                                                                                                                    |
| ------------------------------------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`      | Yes        | Your Sanity project ID                                                                                                                                                         |
| `NEXT_PUBLIC_SANITY_DATASET`         | Yes        | Sanity dataset name (e.g. `production`)                                                                                                                                        |
| `NEXT_PUBLIC_SANITY_API_VERSION`     | Yes        | API version date (default: `2025-08-29`)                                                                                                                                       |
| `NEXT_PUBLIC_SANITY_STUDIO_URL`      | Yes        | Studio URL (`http://localhost:3333` for dev)                                                                                                                                   |
| `SANITY_API_READ_TOKEN`              | Yes        | Sanity API token with read access                                                                                                                                              |
| `SANITY_API_WRITE_TOKEN`             | Yes        | Sanity API token with write access                                                                                                                                             |
| `SHOPIFY_STORE_DOMAIN`               | Yes        | Your Shopify store domain (e.g. `your-store.myshopify.com`)                                                                                                                    |
| `SHOPIFY_STOREFRONT_ACCESS_TOKEN`    | Yes        | Shopify Storefront API public access token                                                                                                                                     |
| `SHOPIFY_API_VERSION`                | No         | Storefront API version (default: `2025-01`)                                                                                                                                    |
| `NEXT_PUBLIC_STORE_CURRENCY`         | No         | ISO 4217 code used to format prices (default: `GBP`)                                                                                                                           |
| `SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID` | No         | Customer Account API client id (public client) from the Headless channel. With `CUSTOMER_SESSION_SECRET`, turns on [customer accounts](#customer-accounts)                     |
| `CUSTOMER_SESSION_SECRET`            | No         | 32+ random characters that encrypt the customer session cookie. Rotating it signs every customer out                                                                           |
| `NEXT_PUBLIC_SITE_URL`               | Off Vercel | Canonical origin, no trailing slash (e.g. `https://example.com`). On Vercel it is inferred; anywhere else, canonicals and the sitemap fall back to `localhost:3000` without it |

### Sanity Studio (`apps/studio/.env`)

| Variable                            | Required | Description                                                                              |
| ----------------------------------- | -------- | ---------------------------------------------------------------------------------------- |
| `SANITY_STUDIO_PROJECT_ID`          | Yes      | Same Sanity project ID as web                                                            |
| `SANITY_STUDIO_DATASET`             | Yes      | Same dataset name as web                                                                 |
| `SANITY_STUDIO_TITLE`               | Yes      | Display title for the Studio                                                             |
| `SANITY_STUDIO_PRESENTATION_URL`    | Prod     | Frontend URL for live preview (auto-detects `localhost:3000` in dev)                     |
| `SANITY_STUDIO_PRODUCTION_HOSTNAME` | Deploy   | Hostname for deployed Studio (e.g. `my-project` → `my-project.sanity.studio`)            |
| `SANITY_STUDIO_API_VERSION`         | No       | Sanity API version                                                                       |
| `SHOPIFY_STORE_DOMAIN`              | Seeds    | Your Shopify store domain (for seed scripts)                                             |
| `SHOPIFY_ADMIN_ACCESS_TOKEN`        | Seeds    | 24-hour Admin API token from the client credentials grant in [step 2](#2-set-up-shopify) |

## Available Commands

| Command               | Description                                                                          |
| --------------------- | ------------------------------------------------------------------------------------ |
| `pnpm dev`            | Start all apps (web on :3000, studio on :3333)                                       |
| `pnpm dev:web`        | Start Next.js only                                                                   |
| `pnpm dev:studio`     | Start Sanity Studio only                                                             |
| `pnpm dev:tunnel`     | Next.js behind your ngrok domain, for customer sign-in ([setup](#local-development)) |
| `pnpm build`          | Build all apps                                                                       |
| `pnpm build:web`      | Build Next.js only                                                                   |
| `pnpm build:studio`   | Build Sanity Studio only                                                             |
| `pnpm lint`           | Lint with Biome                                                                      |
| `pnpm format`         | Format with Biome                                                                    |
| `pnpm format:check`   | Check formatting without writing                                                     |
| `pnpm check-types`    | TypeScript type checking across all packages                                         |
| `pnpm seed:shopify`   | Seed Shopify with test products                                                      |
| `pnpm verify:shopify` | Print Shopify store health report                                                    |

## Deployment

### Deploy Next.js to Vercel

1. Push your repo to GitHub
2. Create a new [Vercel](https://vercel.com/) project and connect your repository
3. Set the **Root Directory** to `apps/web`
4. Add all required environment variables from the [web app table](#web-app-appswebenv) above
5. Deploy

### Deploy Sanity Studio

**Automatic (recommended):** The included GitHub Actions workflow (`.github/workflows/deploy-sanity.yml`) deploys your Studio automatically when changes are pushed to `apps/studio/`.

Add these secrets to your GitHub repository settings:

| Secret                              | Description                                                      |
| ----------------------------------- | ---------------------------------------------------------------- |
| `SANITY_DEPLOY_TOKEN`               | Sanity deploy token                                              |
| `SANITY_STUDIO_PROJECT_ID`          | Sanity project ID                                                |
| `SANITY_STUDIO_DATASET`             | Dataset name                                                     |
| `SANITY_STUDIO_TITLE`               | Studio display title                                             |
| `SANITY_STUDIO_PRESENTATION_URL`    | Your deployed frontend URL                                       |
| `SANITY_STUDIO_PRODUCTION_HOSTNAME` | Studio hostname (e.g. `my-project` → `my-project.sanity.studio`) |

PR preview builds are created automatically — each PR gets its own Studio at `<branch-name>-<hostname>.sanity.studio`.

> **Note:** When initializing with the Sanity CLI, the `.github` folder may not be included. If missing, copy the workflows from the [template repository](https://github.com/robotostudio/turbo-start-shopify/tree/main/.github).

**Manual:**

```bash
cd apps/studio
npx sanity deploy
```

### Shopify Configuration

Your live store needs the Headless channel too. Do not install the seed app on it.

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

### Customer Accounts

Sign-in, `/account`, order history with fulfilment and tracking, and profile and address management, all on Shopify's [Customer Account API](https://shopify.dev/docs/api/customer). Shopify hosts the sign-in page (a one-time code by email) and stays the source of truth for customers and orders. The feature is off until both variables below are set; the navbar's Account link appears only then.

Sign-in only works over HTTPS, on a URL registered with Shopify. Locally that is an ngrok domain; in production it is your site's domain. One Customer Account API client holds both.

#### Local development

**1. ngrok, once.** Shopify rejects `http://localhost` callbacks, so the dev server runs behind [ngrok](https://ngrok.com/). Every ngrok account, free included, has a dev domain that stays the same between runs, so everything below is set up once.

```bash
brew install ngrok                    # or https://ngrok.com/download
ngrok config add-authtoken <token>    # https://dashboard.ngrok.com/get-started/your-authtoken
```

**2. Start it.**

```bash
pnpm dev:tunnel
```

This starts ngrok, prints your domain and the three URIs to register, then starts the Next.js dev server with `NEXT_PUBLIC_SITE_URL` set to that domain for this run (your `.env` is not edited). Ctrl-C stops both. It stops with a clear message if ngrok is missing or not logged in, or if port 3000 is taken by another app (`PORT=3001 pnpm dev:tunnel` to use another port).

**3. Register the client, once.** **Shopify admin → Sales channels → Headless → your storefront → Customer Account API.** Choose **Public** client and, under **Application setup**, add the three URIs `dev:tunnel` printed:

| Field             | Value                                     |
| ----------------- | ----------------------------------------- |
| Callback URI      | `https://<your-domain>/account/authorize` |
| JavaScript origin | `https://<your-domain>`                   |
| Logout URI        | `https://<your-domain>/`                  |

**4. Turn the feature on.** Add these to `apps/web/.env`, then restart `pnpm dev:tunnel`:

```bash
SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID=<client id from that page>
CUSTOMER_SESSION_SECRET=<output of: openssl rand -base64 32>
```

**5. Sign in.** Open the ngrok URL, not localhost. The first visit shows ngrok's free-plan warning page; choose **Visit Site**. The Account link is in the header, and Shopify emails a one-time code to the address you sign in with.

From then on, step 2 is the whole routine. `pnpm dev` and `pnpm dev:web` still work for everything except sign-in. A custom or paid ngrok domain works too: set `NGROK_URL=your.domain` in `apps/web/.env`.

#### Production

No tunnel: your site's domain is registered instead.

1. Add the three URIs for your production domain to the same client (step 3 above, with your domain).
2. In the Vercel project's Production environment, set `SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID` and a **new** `CUSTOMER_SESSION_SECRET`. Do not reuse the local secret. Rotating it later signs every customer out.
3. On a custom domain, set `NEXT_PUBLIC_SITE_URL=https://your-domain.com`. Without it, Vercel's production URL is used, and the registered URIs must match that exactly.
4. Redeploy so the variables take effect.

Preview deployments get a new URL per deploy that Shopify does not know, so sign-in fails there. Test sign-in locally or in production, or give previews a fixed branch domain in Vercel and register that too.

#### Test data

```bash
pnpm seed:customers -- --email=you+shop@example.com          # customer, 2 addresses, 5 orders
pnpm seed:customers -- --email=you+shop@example.com --clean  # remove them
```

The five orders cover every state `/account` renders: delivered, in transit, partially fulfilled, unfulfilled and cancelled. Use an inbox you can read, since the sign-in code is emailed there; plus-addressing keeps it apart from real customers.

It needs products from `pnpm seed:shopify` and `SHOPIFY_ADMIN_ACCESS_TOKEN` from the Dev Dashboard app in [step 2](#2-set-up-shopify), with the customer and order scopes listed there. The token must be that app's: Shopify only lets an app's offline token create orders. A token from a Shopify CLI sign-in (`shopify store auth`) creates the customer, but every order is refused with "only accessible to apps authenticated using offline tokens", so the customer ends up with none.

### Shopify Seed Scripts

```bash
pnpm seed:shopify                  # Append 10 test products
pnpm seed:shopify -- --batch=50    # Append 50 test products
pnpm seed:shopify -- --clean       # Delete EVERY product, collection and discount in the store
pnpm verify:shopify                # Print store health report
pnpm seed:customers -- --email=you+shop@example.com          # Test customer + orders
pnpm seed:customers -- --email=you+shop@example.com --clean  # Remove them
```

## Troubleshooting

| Problem                                                    | Solution                                                                                                                                                                                                                                                           |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **"Module not found" errors**                              | Run `pnpm install` from the project root. Check path aliases in `tsconfig.json`.                                                                                                                                                                                   |
| **Sanity types out of date**                               | Run `pnpm --filter studio type` to regenerate.                                                                                                                                                                                                                     |
| **Visual editing not working**                             | Enable third-party cookies in your browser. Verify `SANITY_STUDIO_PRESENTATION_URL` is set.                                                                                                                                                                        |
| **Shopify products not loading**                           | Verify `SHOPIFY_STORE_DOMAIN` and `SHOPIFY_STOREFRONT_ACCESS_TOKEN` are correct.                                                                                                                                                                                   |
| **Seed script fails**                                      | Check that `SHOPIFY_ADMIN_ACCESS_TOKEN` has the required Admin API scopes and has not expired (tokens last 24 hours).                                                                                                                                              |
| **`generateStaticParams` must return at least one result** | A route has nothing to pre-render. The error names it: `[...slug]` or `blog/[slug]` need the seed data ([step 5](#5-seed-content)); `products/[handle]` or `collections/[handle]` need products synced by Sanity Connect ([step 6](#6-sync-products-into-sanity)). |
| **No Account link in the header**                          | Customer accounts are off until `SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID` and `CUSTOMER_SESSION_SECRET` are both set. Restart the dev server after adding them.                                                                                                         |
| **localhost:3000 shows a different site**                  | Another dev server already holds port 3000, and `next dev` moved to the next free port. Its startup line shows the real URL. Stop the other server, or use `pnpm dev:tunnel`, which refuses a taken port.                                                          |
| **Sign-in fails: redirect_uri mismatch**                   | The URL you opened is not the one registered. Locally, open the URL `pnpm dev:tunnel` printed, not localhost; in production, check `NEXT_PUBLIC_SITE_URL` and the three URIs ([Customer Accounts](#customer-accounts)).                                            |
| **Build fails: Access denied for `quantityAvailable`**     | The storefront token lacks **Read product inventory**. Turn it on under the Headless storefront's Storefront API permissions ([step 2](#2-set-up-shopify)); the same token keeps working.                                                                          |
| **Seeded customer has no orders**                          | `SHOPIFY_ADMIN_ACCESS_TOKEN` is not the Dev Dashboard app's token, or lacks the order scopes. Shopify CLI sign-in tokens cannot create orders ([Test data](#test-data)).                                                                                           |
| **Shopify CLI: OAuth callback store does not match**       | The store was renamed. Use its permanent `.myshopify.com` domain (**Settings → Domains**) with `--store`.                                                                                                                                                          |
| **`dev:tunnel`: ERR_NGROK_4018 / authentication failed**   | ngrok is not logged in. Run `ngrok config add-authtoken <token>` with the token from dashboard.ngrok.com.                                                                                                                                                          |
| **Build fails on Vercel**                                  | Ensure all env vars are set and the root directory is `apps/web`.                                                                                                                                                                                                  |
| **Draft mode / live preview issues**                       | Confirm `SANITY_API_READ_TOKEN` is set with correct permissions.                                                                                                                                                                                                   |
| **Tailwind styles not applying**                           | Ensure `@import "tailwindcss"` is in your CSS entry point. Check `@workspace/ui` transpile config.                                                                                                                                                                 |
| **Redirects not working**                                  | Redirects are fetched from Sanity at build time. Redeploy after creating new redirects.                                                                                                                                                                            |

## Tech Stack

| Technology                                                        | Version | Purpose                                      |
| ----------------------------------------------------------------- | ------- | -------------------------------------------- |
| [Next.js](https://nextjs.org/)                                    | 16      | React framework (App Router, RSC, Turbopack) |
| [React](https://react.dev/)                                       | 19      | UI library                                   |
| [Sanity](https://www.sanity.io/)                                  | 6       | Headless CMS with visual editing             |
| [Shopify Storefront API](https://shopify.dev/docs/api/storefront) | 2025-01 | Commerce engine                              |
| [Turborepo](https://turbo.build/)                                 | 2       | Monorepo build orchestration                 |
| [Tailwind CSS](https://tailwindcss.com/)                          | 4       | Utility-first CSS framework                  |
| [Shadcn UI](https://ui.shadcn.com/)                               | —       | Accessible component primitives              |
| [Biome](https://biomejs.dev/)                                     | 2       | Linter and formatter                         |
| [TypeScript](https://www.typescriptlang.org/)                     | 5       | Type safety                                  |
| [Zod](https://zod.dev/)                                           | 4       | Runtime env validation                       |
| [pnpm](https://pnpm.io/)                                          | 11      | Package manager                              |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute to this project.

## License

[MIT](LICENSE) &copy; [Roboto Studio](https://robotostudio.com)
