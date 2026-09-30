<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->

## Project rules

- The source of truth is `docs/PLAN.md`. If anything in this file, in the
  Convex guidelines, or in a skill conflicts with the plan, the plan wins.
  Ask before deviating from it.
- Package manager is bun: use `bun install`, `bun add`, `bunx`, and
  `bun run test` (never `npm`/`npx`, and never `bun test`, which is Bun's
  own runner and not Vitest).
- Work one milestone at a time, on its own branch, with atomic
  Conventional Commits in English. Every commit must typecheck on its own.
  Never commit to `main` directly.
- Before finishing a milestone run: `bunx tsc --noEmit`,
  `(cd convex && bunx tsc --noEmit)`, `bunx eslint . --max-warnings 0`
  and `bun run test`.
- Never commit secrets. OpenRouter key, model and webhook secret live only
  in Convex env vars.
- Explain design decisions briefly; the author must be able to defend them
  in a technical interview.
