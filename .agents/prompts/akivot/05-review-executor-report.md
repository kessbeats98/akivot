# Prompt — Review Executor Report (Codex)

Use after Claude Code returns a report and diff.

Copy-paste:

---

Load `.agents/skills/akivot-product-enforcer/SKILL.md`.

State: WAITING_FOR_REVIEW
Iteration: <n of max 3>

Review the report and diff against the original plan.

Check, in order:

1. Product guardrails — anything blocked by the enforcer?
2. Scope drift — did changed files exceed the allowed list?
3. Acceptance criteria — met?
4. Verification — actually run, or skipped/blocked?
5. Hidden complexity — new tabs, dashboards, exposed backend concepts, baseline shifts?
6. Fixes required? (Only blockers to PASS. No nice-to-haves.)

Return one of:

- **PASS** → `Next state: DONE`
- **FIX REQUIRED** → `Next state: FIX_REQUIRED` — list the exact fixes
- **SCOPE DRIFT** → `Next state: STOPPED_FOR_HUMAN` — name the drift, halt
- **NEEDS HUMAN DECISION** → `Next state: STOPPED_FOR_HUMAN` — name the open question

Loop control:

- Max fix passes = 2 (max 3 total executions).
- If this is the review of iteration 3 and the result is still FIX REQUIRED → return **STOPPED_FOR_HUMAN** instead. No third fix pass.
- If the same fix has already been requested in a prior iteration and is still not done → return **STOPPED_FOR_HUMAN** (non-converging).

After returning a verdict, **stop**. Do not invoke the next prompt automatically.

If FIX REQUIRED and within the loop cap, the next prompt is `06-send-review-fixes-to-executor.md`.
