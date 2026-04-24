# Codex / Claude Mode Switch Policy

## Purpose

Choose the right Claude execution channel per task without turning every run into a custom decision.

The goal is:

- keep small work deterministic
- keep large work context-aware
- preserve the structured task/preflight/result protocol
- make session use explicit instead of accidental

## The Two Channels

### Headless

Use Claude as an ephemeral executor:

- `claude -p`
- `--no-session-persistence`
- full context injected through the task contract and prompt

Properties:

- deterministic
- easy to audit
- ideal for automation
- not meant to create a visible long-lived Claude thread

### Session

Use Claude as a persisted task session:

- `claude -p`
- no `--no-session-persistence`
- fixed `--session-id` derived from task id
- same task keeps reusing the same Claude session across preflight, revision rounds, and execution

Properties:

- better for ambiguity and evolving discovery
- easier to resume in Claude later
- keeps more conversational context across rounds
- less deterministic than pure headless mode

## Default Policy

### `task_size: tiny`

Default channel: `headless`

Use for:

- bounded bug fixes
- docs-only changes
- smoke tasks
- contract/protocol checks
- simple code review follow-ups

### `task_size: standard`

Default channel: `headless`

Use for:

- most normal implementation slices
- clear multi-file patches with bounded scope
- preflight-first tasks where the plan is still concrete

Reason:

- preflight already gives enough discipline
- session memory is usually not needed

### `task_size: large`

Default channel: `session`

Use for:

- exploratory refactors
- architecture-sensitive changes
- contradictory or investigative debugging
- features where Claude is likely to discover relevant context mid-task

Reason:

- the task is big enough that persistent context is useful

## Explicit Overrides

Task contracts may set:

```yaml
claude_execution_mode: auto
```

Valid values:

- `auto`
- `headless`
- `session`

Use an explicit override when the default from `task_size` is wrong for the specific task.

Examples:

- `standard` task but lots of ambiguity -> set `session`
- `large` task but strict deterministic automation is required -> set `headless`

## Selection Matrix

| Task shape | Recommended channel |
|------------|---------------------|
| Smoke test | `headless` |
| Small bug fix | `headless` |
| Tight implementation slice | `headless` |
| Code review / patch follow-up | `headless` |
| CI / automation | `headless` |
| Large feature exploration | `session` |
| Big refactor | `session` |
| Investigation with evolving understanding | `session` |
| Architecture discovery | `session` |

## What Does Not Change

The channel changes transport behavior, not workflow authority.

These stay the same:

- Codex owns routing and approval
- GStack stays under Codex control
- preflight is still required for non-tiny tasks by default
- result contracts remain mandatory
- file allowlists and blocked files still apply

## Runner Behavior

`run_claude.py` should resolve the execution channel like this:

1. CLI override if supplied
2. task contract `claude_execution_mode` if explicit
3. otherwise:
   - `large` -> `session`
   - everything else -> `headless`

### Headless command shape

```text
claude -p ... --no-session-persistence
```

### Session command shape

```text
claude -p ... --session-id <uuid> --name <task-id>
```

The session id must be deterministic from the task id so the same task can be resumed consistently.

## Visibility Expectation

Headless runs are artifact-first:

- task contract
- preflight/result contract
- live log

Session runs are still artifact-first, but they also create a resumable Claude session that may be visible through Claude resume flows.

Do not treat Claude chat visibility as the source of truth. The source of truth remains the orchestrator artifacts.

## Recommendation For Akivot

Keep `headless` as the default operating mode.

Use `session` only when:

- the task is genuinely large
- Claude is likely to learn important context mid-run
- back-and-forth inside the same Claude task will materially improve results

This keeps Akivot on the same line:

- low friction
- strong audit trail
- minimal context drift
- session power only where it earns its complexity
