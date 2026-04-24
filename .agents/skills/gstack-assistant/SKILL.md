---
name: gstack-assistant
version: 1.0.1
description: |
  Router and orchestrator for the local gstack skill suite in this repository.
  Analyze a task, decide which gstack skill or sequence fits best, and either
  produce an exact execution recipe or hand off into the first selected gstack
  skill. Use when the user asks what workflow to use, which gstack skill to run,
  wants a multi-step task handled through gstack, or explicitly asks for
  gstack-assistant. For Akivot, respect AKIVOT-CONTEXT-PACK and the local
  operating plan before choosing a workflow.
allowed-tools:
  - Bash
  - Read
  - Grep
  - Glob
  - Edit
  - Write
  - AskUserQuestion
---

# gstack-assistant

You are the local router for the repo-scoped `gstack-*` skills.

Your job is to:

1. understand the task
2. choose the right gstack skill or skill sequence
3. decide whether to plan only or route and continue
4. make the next action explicit and correct

Do not improvise a generic workflow when a gstack workflow fits better.

## First Checks

Run these checks before routing:

```bash
_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
GSTACK_SKILLS_DIR="$HOME/.codex/skills"
[ -d "$_ROOT/.agents/skills" ] && GSTACK_SKILLS_DIR="$_ROOT/.agents/skills"
GSTACK_ROOT="$HOME/.codex/skills/gstack"
[ -d "$_ROOT/.agents/skills/gstack" ] && GSTACK_ROOT="$_ROOT/.agents/skills/gstack"
_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
echo "ROOT=$_ROOT"
echo "BRANCH=$_BRANCH"
echo "GSTACK_SKILLS_DIR=$GSTACK_SKILLS_DIR"
echo "GSTACK_ROOT=$GSTACK_ROOT"
git status --short 2>/dev/null || true
```

If this repo contains `AKIVOT-CONTEXT-PACK`, treat it as product authority.
Read only the minimum relevant files, but prefer this order when routing is
ambiguous:

1. `AKIVOT-CONTEXT-PACK/CONTEXT.MD`
2. `AKIVOT-CONTEXT-PACK/04-CURRENT-PROJECT-STATE.md`
3. `AKIVOT-CONTEXT-PACK/09-OPEN-PRODUCT-QUESTIONS.md`
4. `plans/AKIVOT-gstack-operating-plan.md` if present

If repo reality and handoff docs conflict, note it explicitly and prefer current
repo state for execution.

## Operating Modes

Use exactly one of these modes:

### `plan-only`
Use when the user is asking:

- what should we do
- which gstack skill fits
- what is the correct workflow
- to prepare a sequence before execution

In this mode, do not hand off into another skill. Produce the routing recipe only.

### `route-and-run`
Use when the user is asking:

- continue
- start now
- do it
- handle this through gstack
- run the correct workflow

In this mode, choose the first skill and continue under that workflow.

If the host supports explicit skill invocation, invoke the chosen skill first.
Otherwise, read the target skill directly from:

`$GSTACK_SKILLS_DIR/<skill-name>/SKILL.md`

and continue under that skill's workflow.

## Hard Rules

- Never recommend `gstack-ship` before `gstack-review` and `gstack-qa`.
- Never recommend `gstack-qa` as the first step for a bug whose root cause is still unknown.
- Use `gstack-browse` or `gstack-open-gstack-browser` only when visual or interactive browser evidence matters.
- If the user already asked for a single explicit gstack skill and the task is clear, do not wrap it in extra routing.
- Prefer `gstack-office-hours` before planning when the request is still a product idea, wedge, or framing problem.
- Prefer `gstack-autoplan` when the work is non-trivial and needs multiple plan reviews, not just one.
- For report-only testing, use `gstack-qa-only`, not `gstack-qa`.
- For shipping requests, inspect current branch and worktree first. If the repo is on the base branch, the PR source branch is unclear, or unrelated dirty state would contaminate ship, ask one concise clarifying question and return `STATUS: AMBIGUOUS`.
- For docs-only post-ship work, route directly to `gstack-document-release` unless the user explicitly asks for broader release work.
- For Akivot, do not reopen locked product principles unless the task is clearly product-direction work.

## Routing Map

| Task shape | Primary route | Notes |
|---|---|---|
| New product idea, wedge, "is this worth building" | `gstack-office-hours` -> `gstack-autoplan` | Start with framing, not implementation |
| Architecture-only planning | `gstack-plan-eng-review` | Use when the product is already defined |
| Full reviewed plan | `gstack-autoplan` | Use for multi-file features or risky work |
| Bug, failure, regression, 500 | `gstack-investigate` | Add `gstack-browse` if browser evidence matters |
| UI bug or browser-only bug | `gstack-investigate` -> `gstack-browse` | Then `gstack-review` -> `gstack-qa` |
| Code review | `gstack-review` | Use before ship or after implementation |
| Test-only / find bugs | `gstack-qa` | Use `gstack-qa-only` if no code changes wanted |
| Shipping or PR creation | `gstack-review` -> `gstack-qa` -> `gstack-ship` | Add `gstack-land-and-deploy` only if merge/deploy is requested |
| Security review | `gstack-cso` | May be followed by `gstack-review` |
| Performance baseline | `gstack-benchmark` | Use for perf investigations and before/after checks |
| Design system or brand direction | `gstack-design-consultation` | Use before implementation polish |
| Visual exploration | `gstack-design-shotgun` -> `gstack-design-html` | Use when the user wants options first |
| Visual polish on existing UI | `gstack-design-review` | Often followed by `gstack-qa` |
| Developer onboarding / DX | `gstack-plan-devex-review` or `gstack-devex-review` | Plan vs live audit |
| Docs update after shipped change | `gstack-document-release` | Prefer after implementation stabilizes |
| Retro / learnings | `gstack-retro` or `gstack-learn` | Use for reflection and memory |
| Safety constraints | `gstack-careful`, `gstack-freeze`, `gstack-guard`, `gstack-unfreeze` | Use around risky edits |
| Shared browser with another agent | `gstack-pair-agent` | Use only when browser collaboration is the task |
| gstack maintenance | `gstack-upgrade` | Use for gstack install/update work |

## Output Format

### If mode is `plan-only`

Use this exact structure:

```text
TASK: <one-line summary>
TYPE: <feature | bug | review | QA | ship | design | docs | security | other>
MODE: plan-only

EXECUTION PLAN:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Step 1 — <skill-name>
  Why: <one sentence>
  Run: <skill-name>
  Verify: <what success looks like>

Step 2 — <skill-name>
  Why: <one sentence>
  Run: <skill-name>
  Verify: <what success looks like>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EXPECTED OUTCOME: <done definition>
RISKS: <main risks or "none significant">
STATUS: <PLAN_READY | NEEDS_CONTEXT | AMBIGUOUS>
```

If the task is ambiguous, ask one concise clarifying question and set `STATUS: AMBIGUOUS`.

### If mode is `route-and-run`

Use this exact structure before continuing:

```text
TASK: <one-line summary>
TYPE: <feature | bug | review | QA | ship | design | docs | security | other>
MODE: route-and-run
CHOSEN SKILL: <skill-name>
WHY: <one sentence>
NEXT ACTION: Load <skill path> and continue under that workflow.
```

Then continue under the chosen skill instead of re-planning.

## Browse Notes

When a routed plan includes browser work, prefer these local paths:

```bash
GSTACK_ROOT="$HOME/.codex/skills/gstack"
_ROOT=$(git rev-parse --show-toplevel 2>/dev/null)
[ -n "$_ROOT" ] && [ -d "$_ROOT/.agents/skills/gstack" ] && GSTACK_ROOT="$_ROOT/.agents/skills/gstack"
GSTACK_BROWSE="$GSTACK_ROOT/browse/dist"
```

Use `gstack-open-gstack-browser` when:

- the user needs a visible browser
- authenticated browsing is required
- multi-agent browser work is likely

Use `gstack-browse` when:

- headless evidence is enough
- snapshots, console, network, responsive checks, or screenshots are the goal

## Akivot Bias

Inside this repo, default to these preferences:

- product ambiguity -> `gstack-office-hours` or `gstack-autoplan`
- implementation ambiguity -> `gstack-plan-eng-review` or `gstack-autoplan`
- defect or validation drift -> `gstack-investigate`
- pre-landing diff check -> `gstack-review`
- browser and flow validation -> `gstack-qa`

Do not recommend feature expansion when the current task is clearly validation or hardening.
