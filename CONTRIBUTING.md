# Contributing to Turbo Start Shopify

Thanks for your interest in contributing! This guide covers everything you need to get started.

## Development Setup

Follow the [Getting Started](README.md#getting-started) guide in the README to set up your local environment. Once running, you should have:

- Next.js on [http://localhost:3000](http://localhost:3000)
- Sanity Studio on [http://localhost:3333](http://localhost:3333)

## Code Style

This project uses [Biome](https://biomejs.dev/) for linting and formatting. The rules are pre-configured — just run:

```bash
pnpm format      # Auto-format all files
pnpm lint        # Lint all files
```

Key conventions:

- Double quotes, semicolons, 2-space indent
- Trailing commas (ES5 style)
- Import order is auto-sorted by Biome — don't fight it

## TypeScript

Strict mode is enabled across all packages. Before submitting a PR, run:

```bash
pnpm check-types
```

If you change Sanity schemas, regenerate types:

```bash
pnpm --filter studio type
```

## Commit Conventions

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add wishlist page
fix: resolve cart quantity sync issue
refactor: simplify product variant selection
docs: update deployment guide
chore: bump dependencies
```

Keep commit messages concise and focused on the "why" rather than the "what".

## Pull Request Process

1. **Branch from `main`** using a descriptive name:
   - `feat/wishlist-page`
   - `fix/cart-quantity-sync`
   - `docs/deployment-guide`

2. **Keep PRs focused** — one feature or fix per PR. Smaller PRs get reviewed faster.

3. **Before opening a PR**, make sure:
   ```bash
   pnpm format:check   # Formatting passes
   pnpm lint            # No lint errors
   pnpm check-types     # No type errors
   pnpm build           # Build succeeds
   ```

4. **Write a clear PR description** with:
   - What changed and why
   - How to test the changes
   - Screenshots for UI changes

5. **Address review feedback** promptly. If a suggestion doesn't apply, explain why.

## Project Structure

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

## Adding New Features

For common extension patterns (page builder blocks, Sanity schemas, Shadcn components), see the [Customization](README.md#customization) section in the README.

## Reporting Bugs

Open a [GitHub issue](https://github.com/robotostudio/turbo-start-shopify/issues) with:

- A clear title describing the problem
- Steps to reproduce
- Expected vs. actual behavior
- Environment details (Node version, OS, browser)
- Error messages or screenshots if applicable

## Questions?

If you're unsure about something, open an issue and we'll point you in the right direction.
