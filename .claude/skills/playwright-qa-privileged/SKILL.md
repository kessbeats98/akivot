---
name: playwright-qa-privileged
description: Manual-only elevated Playwright QA for staging or QA environments when storage inspection, request mocking, or custom code is explicitly required.
argument-hint: [reason]
disable-model-invocation: true
allowed-tools: Bash(playwright-cli *), Bash(npx playwright-cli *)
---

# Playwright QA Privileged

Use this skill only when safe mode is insufficient.

## Escalation requirements
Before any privileged command, write:
- PRIVILEGED JUSTIFICATION: why safe mode is insufficient
- TARGET ENVIRONMENT: exact URL and why it is safe
- COMMAND: exact privileged command
- RISK: what may be exposed or modified

Then wait for user approval.

## Privileged commands
Examples include:
- eval
- run-code
- route / unroute
- cookie-*
- localstorage-*
- sessionstorage-*
- state-save / state-load
- delete-data
- video-start / video-stop

## Restrictions
- Never use on production with real user data.
- Never print secrets into chat.
- Prefer temporary QA accounts and disposable state.
- Return to safe mode immediately after the privileged action is completed.
