# Codex + Claude Code + GStack Structured Execution Protocol

## Decision

Adopt a single-control-plane execution model:

- Codex owns workflow routing, architecture, review, and debug direction.
- GStack is used by Codex as the workflow system of record.
- Claude Code is the primary executor for code changes, terminal commands, and local validation.
- Transport between Codex and Claude must be structured through task/result artifacts, not free-form stdout alone.

This protocol extends existing repo direction. It does not replace it.

## Why This Exists

The team wants three things at the same time:

1. low friction
2. high execution quality
3. low context drift

A pure chat handoff is too loose. A pure stdout pipe is too brittle. A dual-orchestrator model is worse, because both Codex and Claude start interpreting workflow on their own.

The answer is one workflow authority plus one executor, with a structured contract between them.

## What Already Exists

This plan reuses existing repo discipline instead of inventing a new system.

- [AKIVOT-CONTEXT-PACK/11-V11-EXECUTION-PLAN.md](F:/ak/avner-lite/AKIVOT-CONTEXT-PACK/11-V11-EXECUTION-PLAN.md)
  Already defines the role split:
  Codex directs, critiques, and validates direction.
  Claude executes and reports results.
- [plans/AKIVOT-gstack-operating-plan.md](F:/ak/avner-lite/plans/AKIVOT-gstack-operating-plan.md)
  Already makes GStack the default workflow engine for this repo.
- [.agents/skills/gstack-assistant/SKILL.md](F:/ak/avner-lite/.agents/skills/gstack-assistant/SKILL.md)
  Already routes tasks to the correct local `gstack-*` workflow.

This protocol should wrap those three pieces, not rebuild them.

Related execution-channel policy:

- [plans/CODEX-CLAUDE-MODE-SWITCH-POLICY.md](F:/ak/avner-lite/plans/CODEX-CLAUDE-MODE-SWITCH-POLICY.md)

## Goals

- Keep GStack routing in one place, Codex.
- Let Claude execute with minimal ceremony once a task is scoped.
- Make every execution auditable.
- Make partial success, failure, and blocked states machine-readable.
- Prevent scope drift and accidental workflow changes.

## Not In Scope

- Letting Claude choose GStack workflows on its own
- Live bidirectional agent chat streams
- Replacing Git, tests, or existing repo workflows
- Editing protected process files automatically
- Multi-repo orchestration
- Long-running daemon infrastructure on the first pass

## Architecture

### Control Plane

Codex runs the workflow logic:

- read task context
- choose the right `gstack-*` workflow
- write the execution contract
- approve or reject Claude's preflight response when needed
- review the execution result
- decide the next step

### Executor Plane

Claude Code runs the task:

- read the task contract
- inspect the repo locally
- optionally return a preflight plan
- implement changes
- run requested commands and validation
- write the result contract

### Transport Layer

The transport is a thin wrapper, planned here as `run_claude.py`.

Its job is narrow:

- receive a task id or task file path
- invoke Claude Code CLI with that task
- wait for completion
- verify a result artifact was produced
- return a concise status summary to Codex

The transport layer is not allowed to invent workflow, rewrite scope, or interpret product decisions.

### Source Of Truth

For each run, the durable source of truth is:

1. the task contract
2. the Claude result contract
3. the actual git diff and command output

Never treat raw terminal prose as the only record of what happened.

## Filesystem Layout

Planned repo-local structure:

```text
.orchestrator/
  tasks/
    TASK-0001.md
  results/
    TASK-0001.preflight.json
    TASK-0001.json
  archive/
  templates/
    preflight-template.json
    task-template.md
    result-template.json
```

Planned implementation location for the transport wrapper:

```text
tools/orchestrator/run_claude.py
```

Why split it this way:

- `.orchestrator/` holds run artifacts and templates
- `tools/orchestrator/` holds executable code
- process artifacts stay out of runtime application code

## Workflow Ownership Rules

### Codex May Use GStack For

- `gstack-assistant`
- `gstack-office-hours`
- `gstack-autoplan`
- `gstack-plan-*`
- `gstack-investigate`
- `gstack-review`
- `gstack-cso`
- `gstack-benchmark`

### Claude May Use GStack Only If Explicitly Allowed In The Task Contract

- `gstack-qa`
- `gstack-qa-only`
- `gstack-browse`
- `gstack-ship`
- `gstack-document-release`
- `gstack-setup-deploy`

Default rule:

- Claude does not choose workflow
- Claude executes a workflow already chosen by Codex

## Execution Modes

To reduce friction, the protocol has two modes.

### Mode A: Direct Execute

Use for:

- single-file work
- bounded bug fixes
- docs updates
- test-only tasks

Flow:

1. Codex writes a task contract marked `task_size: tiny`.
2. Claude executes immediately.
3. Claude writes result contract.
4. Codex reviews result and diff.

### Mode B: Preflight Then Execute

Use for:

- multi-file changes
- schema changes
- auth, billing, lifecycle, notification work
- any task where the executor may discover hidden complexity

Flow:

1. Codex writes a task contract that is either:
   - `requires_preflight: true`, or
   - any task not marked `task_size: tiny`
2. Claude first returns a preflight response:
   - files to touch
   - commands to run
   - detected risks
   - proposed validation
3. Codex reviews the plan before execution.
4. If the plan is not good enough, Codex sends correction feedback and Claude revises the preflight.
5. This correction loop is capped at 2 revision rounds to avoid infinite loops.
6. Once the plan is good enough, Codex approves execution.
7. Claude executes.
8. Claude writes result contract.
9. Codex reviews result and diff.

This is the default mode for risky work.
For this repo, this is now the preferred mode for all non-trivial Claude execution tasks.

## Task Contract

Task contracts are markdown files with YAML frontmatter and explicit sections.

Required frontmatter fields:

```yaml
id: TASK-0001
title: Short task title
created_by: codex
workflow: gstack-review
mode: direct_execute
task_size: standard
claude_execution_mode: auto
requires_preflight: false
branch: main
base_commit: abc1234
status: ready_for_executor
priority: normal
```

Required task sections:

1. `Goal`
   One paragraph, what success means.
2. `Context`
   Only the minimum repo and product context needed.
3. `Scope`
   What Claude is allowed to touch.
4. `Out Of Scope`
   What Claude must not widen into.
5. `Allowed Files`
   Directory or file allowlist.
6. `Blocked Files`
   Explicit no-touch list.
7. `Execution Instructions`
   Concrete implementation guidance.
8. `Validation`
   Exact commands or checks to run.
9. `Expected Deliverables`
   What artifacts must exist at the end.
10. `Result Contract Path`
    Exact output file Claude must write.

Recommended extra fields:

- `allowed_gstack_skills`
- `forbidden_actions`
- `success_criteria`
- `expected_risks`
- `notes_for_reviewer`

`task_size` rules:

- `tiny` allows direct execute when Codex intentionally wants to skip preflight
- `standard` and `large` enforce preflight by default
- `requires_preflight: true` always enforces preflight regardless of `task_size`

`claude_execution_mode` rules:

- `auto` follows the mode-switch policy
- `headless` forces ephemeral `claude -p` execution
- `session` forces persisted task-session execution

## Result Contract

Result contracts are valid JSON files.

Required fields:

```json
{
  "id": "TASK-0001",
  "status": "success",
  "phase": "execution_complete",
  "summary": "Short summary of what happened",
  "files_changed": [],
  "commands_run": [],
  "tests_run": [],
  "tests_passed": [],
  "tests_failed": [],
  "blockers": [],
  "scope_deviations": [],
  "follow_up_recommendation": ""
}
```

Status values:

- `success`
- `partial`
- `blocked`
- `failed`

Optional fields:

- `preflight`
- `artifacts`
- `warnings`
- `needs_human_decision`
- `git_diff_summary`
- `stdout_excerpt`

Rules:

- `files_changed` must list repo-relative paths only
- `tests_failed` must never be omitted if any validation failed
- `scope_deviations` must be explicit, never hidden in prose

## Execution Lifecycle

```text
User task
  -> Codex reads context
  -> Codex routes via GStack
  -> Codex writes task contract
  -> Claude reads task
  -> preflight back to Codex for all non-tiny tasks
  -> Claude executes
  -> Claude writes result contract
  -> Codex reviews result + diff
  -> Codex chooses next GStack step
```

## Approval Gates

Codex must explicitly approve before Claude executes when any of these are true:

- `requires_preflight: true`
- task is not marked `task_size: tiny`
- blocked files would need edits
- branch/worktree state is unsafe
- Claude proposes scope expansion
- validation plan differs from the task contract

Codex may skip explicit approval only for small direct-execute tasks with bounded scope.

## Failure Modes

### 1. Claude Changes Unexpected Files

- Test coverage: should be caught by comparing `files_changed` against `Allowed Files`
- Error handling: task marked `partial` or `failed`
- User impact if missed: hidden scope drift

Critical if no allowlist comparison exists.

### 2. Claude Finishes Without Writing Result JSON

- Test coverage: transport wrapper must verify result file exists
- Error handling: treat run as `failed`
- User impact if missed: Codex cannot trust the run

Critical if transport relies only on stdout.

### 3. Claude Returns Success But Tests Were Not Run

- Test coverage: transport and reviewer must check `tests_run`
- Error handling: downgrade to `partial`
- User impact if missed: false sign-off

### 4. Claude Expands Scope Quietly

- Test coverage: compare `Scope`, `Out Of Scope`, and `scope_deviations`
- Error handling: Codex review blocks completion
- User impact if missed: line drift away from Akivot direction

### 5. Concurrent Runs Overwrite Each Other

- Test coverage: future wrapper should use per-task ids and lock files
- Error handling: reject duplicate active task ids
- User impact if missed: corrupted artifacts and mixed execution history

### 6. Claude Uses GStack Autonomously

- Test coverage: allowlist `allowed_gstack_skills`
- Error handling: mark as protocol violation
- User impact if missed: dual orchestration, extra friction, context drift

## Testing Strategy For The Future Implementation

Before the transport layer is trusted, validate these scenarios:

1. No-op dry run
   Claude reads a task and writes a valid result without changing files.
2. Happy-path direct execute
   One small file change, one validation command, one success result.
3. Preflight flow
   Claude writes preflight first, Codex approves, then Claude executes.
4. Blocked file violation
   Claude attempts a forbidden edit and the run is rejected.
5. Missing result file
   Wrapper fails the run.
6. Partial success
   Code changed, tests failed, result status is `partial`.
7. Concurrent run collision
   Same task id cannot run twice.

## Wrapper Usage

For explicit direct execute, mark the task as `task_size: tiny` and use:

```bash
python tools/orchestrator/run_claude.py --task .orchestrator/tasks/TASK-0001.md
```

For any standard or large task, or any task with `requires_preflight: true`, first generate the plan:

```bash
python tools/orchestrator/run_claude.py --task .orchestrator/tasks/TASK-0001.md
```

Then inspect `.orchestrator/results/TASK-0001.preflight.json` and approve execution explicitly:

```bash
python tools/orchestrator/run_claude.py --task .orchestrator/tasks/TASK-0001.md --approve-preflight
```

Optional:

```bash
python tools/orchestrator/run_claude.py --task .orchestrator/tasks/TASK-0001.md --approve-preflight --approval-note "Scope and validation look correct"
```

## Review Protocol

After every Claude run, Codex must review:

1. result contract validity
2. diff versus requested scope
3. test evidence
4. workflow compliance
5. whether next action is:
   - done
   - debug
   - rerun
   - escalate
   - route to next GStack skill

Codex should not trust "looks done" prose without:

- result contract
- diff
- validation evidence

## Recommended Next-Step Routing

Use this after Claude execution:

- implementation complete, needs code sanity check -> `gstack-review`
- browser behavior changed, needs user-flow validation -> `gstack-qa`
- failure is nondeterministic or contradictory -> `gstack-investigate`
- docs-only follow-up -> `gstack-document-release`
- ready for landing -> `gstack-review` then `gstack-qa` then `gstack-ship`

## Parallelization Strategy

For the future implementation of this protocol itself:

| Step | Modules touched | Depends on |
|------|-----------------|------------|
| Write protocol spec | `plans/`, `.orchestrator/templates/` | - |
| Build transport wrapper | `tools/orchestrator/` | protocol spec |
| Add validation tooling | `tools/orchestrator/`, `.orchestrator/templates/` | transport wrapper |

Parallel lanes:

- Lane A: protocol spec and templates
- Lane B: transport wrapper, after Lane A
- Lane C: validation tooling, after Lane B

Execution order:

- Complete Lane A first.
- Then build Lane B.
- Then build Lane C.

Sequential implementation, no useful parallelization on the immediate planning step.

## Recommended First Implementation Slice

Do not build the full system in one pass.

Slice 1:

1. create `.orchestrator/templates/task-template.md`
2. create `.orchestrator/templates/result-template.json`
3. implement `tools/orchestrator/run_claude.py`
4. support direct-execute only
5. require result JSON output
6. print a concise summary back to Codex

Do not add preflight mode, locking, or multi-run history until Slice 1 works.

## Verdict

This protocol stays on the line we already established:

- Codex keeps product and workflow truth
- Claude remains the primary executor
- GStack stays centralized
- friction is reduced by removing copy/paste
- drift is reduced by using explicit contracts

This is the right next operating model if the team wants Claude execution without losing Codex control.
