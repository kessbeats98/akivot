# Hindsight — Akivot

Patterns and antipatterns discovered during development.
CEO CODEX maintains this file after each task completion.
Max 50 entries. Remove entries >30 days old or tagged [RESOLVED].

Format: `- [YYYY-MM-DD] [TASK-ID] PATTERN|ANTIPATTERN|FIX: [one line]`

---

- [2026-03-08] [TASK-01] ANTIPATTERN: create-next-app refuses non-empty dirs — use template repo or init empty first
- [2026-03-08] [TASK-01] PATTERN: route groups don't create unique URLs — use flat paths for distinct URLs
- [2026-03-09] [TASK-02] ANTIPATTERN: eager process.env breaks build — all env access must be lazy (factory pattern)
- [2026-03-09] [TASK-04] ANTIPATTERN: STATE.md overwrite lost backlog — only modify current task entry, never full file
- [2026-03-10] [TASK-06a] FIX: DATABASE_URL copy-paste trailing spaces — trim/validate connection strings
- [2026-03-10] [TASK-09] ANTIPATTERN: Vercel Hobby plan rejects frequent crons — check plan limits in Decisions phase
- [2026-03-10] [TASK-09] FIX: staging deploy blocked by cron config — empty crons array as Hobby workaround
- [2026-04-03] [TASK-15] FIX: better-auth client import is `better-auth/react` not `better-auth/client/react` — Turbopack resolves package.json exports
- [2026-04-03] [TASK-18] PATTERN: reuse existing repo functions (createDog) for onboarding — avoids duplicating tx logic
