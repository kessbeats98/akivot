# Lessons — Akivot

## Format
Each entry: date, title, optional tag, insight, impact.
Tags: `[vision]` `[arch]` `[contracts]` `[ops]`

## [2026-03-08] — create-next-app on non-empty dir [ops]
- Insight: `create-next-app` refuses to init in a directory with existing files (`.avner/`, `.claude/`, `CLAUDE.md`). Had to create in temp dir and merge.
- Impact:  Use a template repo (`degit`) for future projects. Or init in empty dir first, then copy governance files in.

## [2026-03-08] — Route groups don't create unique URLs [arch]
- Insight: `app/(walker)/dashboard` and `app/(owner)/dashboard` resolve to the same `/dashboard` URL. Route groups are organizational, not URL-creating.
- Impact:  Use flat paths (`/walker/dashboard`, `/owner/dashboard`) instead of route groups for distinct URLs.

## [2026-03-09] — Eager process.env breaks build [arch]
- Insight: Top-level `const db = drizzle(process.env.DATABASE_URL!)` fails at build time when env vars aren't set. Build must pass with zero env vars.
- Impact:  All env access must be lazy (inside functions). Factory pattern like `getDb()` is mandatory. Added to Hard Guardrails.

## [2026-03-09] — STATE.md backlog collapsed during update [ops]
- Insight: When updating STATE.md after TASK-01, the agent replaced the entire file content, deleting the planned backlog for TASK-02 through TASK-09.
- Impact:  STATE.md updates must only modify the current task entry and mini-handoff. Never overwrite full file. Added to Hard Guardrails rule #6.

## [2026-03-10] — DATABASE_URL with spaces from copy-paste [ops]
- Insight: Copy-pasting DATABASE_URL from Neon dashboard introduced trailing spaces. `npx drizzle-kit migrate` failed with a cryptic connection error.
- Impact:  Always trim/validate connection strings. When debugging connection failures, check for whitespace first.

## [2026-03-10] — Vercel Hobby plan cron frequency limit [ops]
- Insight: Vercel Hobby plan rejects cron schedules more frequent than once per hour. `vercel.json` had `*/5 * * * *` (every 5 min), blocking deployment entirely.
- Impact:  Check platform plan limits during the Decisions phase, before configuring features. Emptied `crons` array as workaround; TASK-09 will re-enable on Pro plan.

## Incidents
- [2026-03-10] — Staging deploy blocked by cron config — `vercel.json` had cron schedule incompatible with Hobby plan — emptied `crons` array — verify plan limits in Decisions phase before configuring
