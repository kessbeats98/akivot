# Rule 01 — AVNER-Lite Protocol

## Delete First (Principle)
Before adding code or complexity, ask: can this be solved by removing an existing obstacle?
If yes — remove first. This applies to every mode, not just dedicated deletion work.

---

## Lifecycle Loop
Every /new and /core must produce four output sections:
1. Decisions — what was decided and why, before touching code.
2. Plan      — atomic task list (see Atomic Tasks below).
3. Execute   — what was actually done, task by task.
4. Verify    — evidence of correctness (see Verification Artifact below).

---

## Plan / Execute Split
For non-trivial work (features, refactors, schema/API changes, risky fixes):
1. **Plan first:** produce Decisions + Plan and save as a plan file in the project
   (e.g. `plans/TASK-XX-plan.md`). This can happen in a dedicated planning session.
2. **Execute from plan:** open a fresh session, load only the plan file + the files it
   references, implement task-by-task.
3. Trivial changes (small fixes, config, docs) may plan and execute in the same session.

---

## Plan Reconciliation
The Verify phase must compare implementation against the saved plan:
- What was completed as planned?
- What deviated from the plan (and why)?
- What was deferred to a follow-up task?

Record this comparison in the Verification Artifact or as a comment in the plan file.

---

## Task Isolation
- One task per chat. Do not mix unrelated workstreams in the same session.
- Batching is allowed only for closely related work within the same feature.
- If a new unrelated issue surfaces during work → note it in STATE.md, do not context-switch.

---

## Context Hygiene
- Load only the smallest relevant set of files for the current task.
- Mode-specific loading: /fix loads repro path + test; /new loads plan + touched files; /deploy loads RUNBOOK + env.
- Do not preload "maybe relevant" files.
- If the session becomes confused, starts editing wrong files, or context is exhausted:
  prefer a fresh session over repeated compaction.

---

## Modularity (Soft Rule)
If a file becomes too large to navigate reliably (>400 lines of logic, or the model
consistently misses sections), split it before adding more complexity.

---

## Atomic Tasks
Each task must:
- /new and /core: touch ≤ 5 files.
- /fix:           touch ≤ 3 files (escape hatch requires justification in Decisions).
- Have one concrete, runnable verify step: command + expected output.
- Be completable and committable independently.

Limits:
- /new and /core: max 7 tasks per plan. If more → split into Plan A + Plan B.
- /fix: max 3 tasks per plan. If more → the bug is a /core problem.

---

## Verification Artifact
- /fix and /deploy: MUST always end with this block — no exceptions.
- /new, /sec, /core: SHOULD include when non-trivial.

  Commands run:    [exact commands executed]
  Expected result: [what passing looks like]
  Observed result: [what actually happened]
  Remaining risk:  [known open gaps + why accepted]

---

## Commit Discipline
- One logical change = one commit.
- Format: type(scope): reason
- Types: feat / fix / refactor / style / docs / chore / sec
- Never mix feat + fix + refactor in one commit.
- /fix: one fix = one commit, after verification passes.
- /new: one task = one commit, after its verify step passes.
- Commit after each completed atomic task before starting the next.
- Before committing: run `git diff --staged` and verify no unintended changes.
- Co-Authored-By trailer is convention (see CLAUDE.md), not hook-enforced.

---

## Checkpoints (Council Gates)

- G1 Gate (Contracts) — before merging changes that touch contracts:
  - Run verify-spec if: DB schema / public API / global state touched.
  - HALT if verify-spec returns FAIL or ESCALATE-TO-CORE.

- M Gate (Release) — before /deploy completes:
  - Run verify-ops AND verify-security.
  - Proceed only if both return GO.
  - verify-ops CONDITIONAL-GO: acceptable only with explicit human confirmation.
  - verify-security NO-GO: hard stop. No exceptions.

---

## ER-Ribosome Loop (3-Attempt Debug)
- /fix iterates up to 3 times on the same root cause.
- Each failed iteration must produce new evidence before the next attempt.
- After 3 failures → HALT → escalate to /core.
- If /core also fails → document in LESSONS.md → HALT for human.

---

## Risk Tiers by Path

Classify every change by the risk tier of the files it touches.
Use the highest tier of any file in scope as the overall change risk.

- **High risk**: auth, sessions, tokens, secrets, env vars, payment/billing logic,
  DB schema/migrations, public API signatures, global/shared state, deploy configs,
  CI/CD workflows, middleware, CORS, RBAC/ACL, multi-tenant authorization,
  billing locks, walk lifecycle invariants, background jobs/retries.
- **Medium risk**: business logic, data transforms, UI state management,
  service integrations, notifications, internal API clients, non-trivial test changes.
- **Low risk**: docs, comments, formatting, log messages, config labels,
  dead code removal, test-only additions, style changes.

Review depth by tier:
- High → Council is mandatory (verify-security + relevant gate). Full verification artifact.
- Medium → Council is recommended. Verification artifact SHOULD be included.
- Low → Council may be skipped. Lightweight checks sufficient.

When uncertain, classify as higher risk.

---

## Architecture Boundary Contract

Apply when /new or /core adds, modifies, or connects modules:

1. Extend capabilities by adding to existing patterns first.
   Do not cross-module rewrite for isolated features.
2. Dependency direction flows inward to contracts:
   concrete implementations depend on shared types/contracts, not on each other.
3. Keep module responsibilities single-purpose:
   UI in components, logic in services/actions, data in schema/models, config in env/config.
4. Do not introduce shared abstractions prematurely.
   Only extract when the same pattern appears ≥ 3 times (rule-of-three).
5. For config/schema changes: treat keys as public contract.
   Document defaults, compatibility impact, and migration/rollback path.

---

## Validation Matrix

Run these checks before committing, matched to what's available in the project:

```
tsc --noEmit              # TypeScript type check
eslint .                  # Lint
npm test                  # Unit tests
npm run build             # Build check (for /deploy and /core)
npx drizzle-kit generate  # Schema sync (if schema changed)
git diff --staged         # Review staged changes
```

Mode-specific minimum:
- /fix:    reproduce command + regression test + lint
- /new:    lint + type check + task verify step
- /core:   full build + all tests + verify-spec
- /deploy: full build + all tests + verify-ops + verify-security
- /sec:    lint + type check + verify-security
- /research: no validation needed (output is recommendations)

If full checks are impractical (context pressure, missing tooling):
run the most relevant subset and document what was skipped and why in the Verification Artifact.

---

## Anti-Patterns (Do Not)

These are hard failures. If Claude catches itself doing any of these → stop and correct.

- Do not add dependencies for minor convenience. Prefer boring stdlib solutions.
- Do not silently weaken security policy, access constraints, or permission boundaries.
- Do not add speculative config keys, feature flags, or "future-proof" abstractions without a current caller.
- Do not mix formatting-only changes with functional changes in one commit.
- Do not modify files outside the current task scope ("while I'm here" syndrome).
- Do not bypass failing checks without explicit explanation in Decisions.
- Do not hide behavior-changing side effects in refactor commits.
- Do not expand scope during /fix. Missing feature? → HALT → /new.
- Do not auto-write to DNA files (CLAUDE.md, MEMORY.md, STATE.md, LESSONS.md).
- Do not guess. If uncertain → HALT → ask one clarifying question.

---

## Hard Rules
- /core required for: DB schema, public API signatures, global state contracts.
- Sensitive areas (auth, payments, secrets, multi-tenant, billing) must go through /sec.
- If any Council member returns HALT / FAIL / NO-GO → do not proceed.
- Missing feature discovered during /fix → HALT → escalate to /new.

---

## MCP-First Research
Before implementing any SDK/library integration (Firebase, Better Auth, Drizzle, Vercel Blob, etc.):
1. **Context7 MCP** → get latest official docs for the library.
2. **Exa AI Search** → find real production examples and latest API changes.
3. Only then write code. Never rely on training data alone for SDK specifics.
4. Pin exact versions (e.g., firebase-messaging-compat v12.10.0) — do not write approximate versions.

See `CLAUDE.md` → MCP Delegation for the full tool list (Context7, Neon, Vercel, Firebase, Exa, GitHub CLI).

---

## Mini-Handoff (STATE.md)
Every task completion or session end must propose a STATE.md update with:
- Stopped at:        [exact point — file, function, or decision pending]
- Next action:       [first command or step to run next]
- Open questions:    [unresolved decisions needing input]
- Last commands run: [relevant terminal commands from this session]
- Tried already:     [for bug sessions — what was attempted and what evidence was collected]

---

## DNA Safety Rule (enforced across all modes)
Claude NEVER edits CLAUDE.md, MEMORY.md, STATE.md, or LESSONS.md
without explicit user approval and visible diffs shown in-chat.
Read-only access and reminders are always allowed.

---

## Parsing Rules (STATE.md) — Canonical Reference
All skills reference this section for STATE.md parsing.

When reading `.avner/STATE.md`, extract tasks from `###` headers:

**Regex:** `^###\s+(~~)?((TASK|BUG|FEAT)-\d+)(~~)?:\s*(.+?)\s*\(([^)]+)\)`

**Status normalization:**
- Contains "DONE", "✅", or has strikethrough → `DONE`
- Contains "IN PROGRESS" → `IN PROGRESS`
- Contains "REVIEW" → `REVIEW`
- Contains "PAUSED" → `PAUSED`
- Otherwise → `PLANNED`

**Priority:** Look for `**Priority**: P0-P3` below the header. Default P2.
