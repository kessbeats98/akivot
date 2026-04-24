# AVNER-Lite — Akivot

## Identity
- Project:  Akivot
- Stack:    Next.js 15 App Router · TypeScript · Tailwind + shadcn/ui · Neon + Drizzle · Better Auth · FCM · Vercel Blob · Dexie/IndexedDB · Service Worker/PWA
- Goal:     Production-ready multi-tenant walking platform with auth, billing, lifecycle, notifications, offline, jobs, and deploy.

## Docs
- `.avner/MEMORY.md`        — permanent memory, identity, non-goals, sensitive areas
- `.avner/REQUIREMENTS.md`  — V1 / V2 / Out-of-Scope with R-ids
- `.avner/STATE.md`         — current tasks, session continuity
- `.avner/ARCHITECTURE.md`  — system shape + stack
- `.avner/APICONTRACTS.md`  — API endpoint contracts
- `.avner/DBSCHEMA.md`      — database schema
- `.avner/RUNBOOK.md`       — deploy procedures, rollback, smoke tests
- `.avner/LESSONS.md`       — lessons learned (all categories)

## The Council (3 agents)
- verify-spec       `.claude/agents/verify-spec.md`       — contract guardian (schema / API / state changes)
- verify-security   `.claude/agents/verify-security.md`   — security veto (sensitive code, /deploy GO/NO-GO)
- verify-ops        `.claude/agents/verify-ops.md`        — operational readiness (/deploy pre-flight)

Most tasks trigger 0–1 agents. All 3 firing = deploy or high-risk change.

## Modes
/core     → schema / API / architecture / global state (elevated scrutiny)
/new      → new feature or file
/fix      → bugfix (3-attempt debug)
/deploy   → ship to production
/research → stop-and-think before building
/sec      → security review or hardening

## Protocol (first match wins)
1. Delete First     → Can this be solved by removing code/complexity? If yes — remove before adding.
2. Finish Warning   → STATE.md has IN PROGRESS task? Warn: "⚠️ TASK-XX still in progress — finish or pause before starting new work." (Not a blocker. P0 bugs, /deploy, and /sec always bypass.)
3. Ambiguity Guard  → Vague intent? HALT. Ask one clarifying question.
4. Safety Interrupt  → Unknown impact? HALT.
5. Security Override → Sensitive areas touched? Escalate to /sec.
6. Architect Trigger → DB / public API / global state touched? Escalate to /core.
7. Efficiency Check  → Overkill detected? Prefer boring, minimal change.
8. Execute           → Run the mode.

## Risk Tiers
- High:   auth, payments, secrets, DB schema, public API, global state, deploy configs, multi-tenant authorization, billing locks, walk lifecycle invariants, background jobs
- Medium: business logic, data transforms, UI state, service integrations, notifications
- Low:    docs, tests-only, comments, formatting, config labels

High-risk → Council mandatory. Medium → Council recommended. Low → skip Council.

## Lifecycle (every /new and /core must produce)
Decisions → Plan → Execute → Verify

## Plan / Execute Split
For non-trivial work (features, schema changes, API changes, risky fixes):
1. **Plan session** — produce Decisions + Plan, save as a plan file in the project (e.g. `plans/TASK-XX-plan.md`).
2. **Execute session** — open a fresh chat, load the plan file, implement task-by-task.
3. **Verify phase** — compare implementation against the saved plan: what completed, what changed, what deferred.

Trivial work (small fixes, config tweaks, docs) can plan and execute in the same session.

## Context Discipline
- Load only the smallest relevant set of files for the current task.
- Do not preload "maybe relevant" files — fetch on demand.
- If the session becomes confused or starts editing wrong files, open a fresh session instead of forcing more compaction.

## Task Isolation
- One task per chat. Do not mix unrelated workstreams.
- Batching is allowed only for closely related work (e.g., two endpoints in the same feature).

## Model Guidance
Default model: Sonnet. Use Opus for /sec and heavyweight reviews (/core Decisions, security audits).

## Commit Format
- One logical change = one commit.
- Format: `type(scope): reason`
- Types: feat / fix / refactor / style / docs / chore / sec
- Trailer (convention, not hook-enforced):
  ```
  Co-Authored-By: Claude <noreply@anthropic.com>
  ```
- Before committing: `git diff --staged` — verify no unintended changes.

## DNA Safety Rule (חוק יסוד)
Claude NEVER modifies these files without explicit user approval + visible diffs:
- CLAUDE.md
- .avner/MEMORY.md
- .avner/STATE.md
- .avner/LESSONS.md

Auto Memory is disabled. Hooks may READ these files. Hooks may REMIND. Hooks NEVER WRITE.

> One rule to keep CLAUDE.md honest:
> "Would removing this line cause mistakes? If not — cut it."
