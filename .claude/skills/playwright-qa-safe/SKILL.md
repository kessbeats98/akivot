---
name: playwright-qa-safe
description: Repeatable QA for SaaS web apps using safe Playwright CLI actions, mandatory assertions, screenshots, snapshots, and traces. Use for smoke, core, and full product flows.
argument-hint: [scenario-name | smoke | core | full]
disable-model-invocation: true
allowed-tools: Bash(bash ${CLAUDE_SKILL_DIR}/scripts/qa-browser.sh *), Read, Grep, Glob
---

# Playwright QA Safe

Use this skill for product QA of approved SaaS environments.

## Purpose
Run repeatable end-to-end browser checks with assertions and evidence.

## Allowed environments
- localhost
- preview deployments
- staging
- dedicated QA environments

Never use this skill on production environments with real user data unless the user explicitly says the target is approved and safe for QA.

## Operating rules
1. Start by reading `qa/policy.md`, `qa/report-schema.json`, and the requested file under `qa/scenarios/`.
2. Use only the wrapper script in `scripts/qa-browser.sh`.
3. After every navigation or state-changing action, capture a snapshot.
4. After every important action, verify the expected UI state.
5. Never assume success from a click alone.
6. On failure, capture screenshot, current URL, last snapshot path, and trace if active.
7. Report result as PASS, FAIL, or BLOCKED using `qa/report-schema.json`.
8. Prefer approved test accounts and seeded data.
9. Never read or export cookies, localStorage, sessionStorage, or auth state.
10. Never execute arbitrary page code.

## Command policy
The wrapper allows only these Playwright CLI commands:
- open, goto, go-back, go-forward, reload
- click, dblclick, fill, type, press, hover, drag, select, check, uncheck
- tab-new, tab-list, tab-select, tab-close
- snapshot, screenshot, tracing-start, tracing-stop
- console, network, resize, close, close-all

## Default workflow
1. Resolve requested scenario from `qa/scenarios/`.
2. Open browser and navigate to the initial URL.
3. Execute steps in order.
4. After each step, validate assertions for that step.
5. Stop immediately on critical failure.
6. Write a structured report in `qa/reports/<scenario>-<timestamp>.json`.

## Invocation examples
- `/playwright-qa-safe smoke`
- `/playwright-qa-safe core`
- `/playwright-qa-safe start-walk-success`

## Supporting files
- `reference.md` explains how to map scenario JSON into actions.
- `examples.md` shows PASS and FAIL outputs.
- `scripts/qa-browser.sh` enforces safe command allowlisting.
