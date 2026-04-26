# Prompt — Codex Plugin Review (from Claude Code)

Use after Claude Code writes its report, when `codex-plugin-cc` or a similar plugin is available.

Rules:

- The plugin is a **pipe**, not authority.
- Claude triggers the review. Claude does not approve itself.
- Codex reviews independently.
- Human/user remains final authority.
- After triggering review, Claude emits `State: WAITING_FOR_REVIEW` and **stops**. No auto-continuation.
- Loop cap applies: max 2 fix passes (max 3 total executions). Iteration 3 review that still requires fixes returns `STOPPED_FOR_HUMAN`.

```
Claude can ring the bell.
Codex decides whether the door opens.
```

Copy-paste (sent to Codex via plugin):

---

Review request from Claude Code. Independent review only.

State: WAITING_FOR_REVIEW
Iteration: <n of max 3>

Required operating context — load before reviewing:

- `AGENTS.md`
- `.agents/skills/akivot-product-enforcer/SKILL.md`
- `.agents/skills/akivot-project-constitution/SKILL.md` (when product context is relevant)
- the approved plan (below)
- Claude's execution report (below)
- the current diff / changed files

If any of the above is missing or unreadable, return:

```
NEEDS HUMAN DECISION
Reason: missing Akivot operating context.
Next state: STOPPED_FOR_HUMAN
```

Do not proceed with the review until the operating context is loaded.

Plan:

```
[paste original plan]
```

Report:

```
[paste Claude's Final Report block + diff summary]
```

Check, in order:

1. Product guardrails.
2. Scope drift — files changed vs allowed files.
3. Acceptance criteria met.
4. Type / build risks.
5. Whether another fix pass is required (only blockers to PASS, not nice-to-haves).

Return one of:

- **PASS** → `Next state: DONE`
- **FIX REQUIRED** → `Next state: FIX_REQUIRED` — list exact fixes
- **SCOPE DRIFT** → `Next state: STOPPED_FOR_HUMAN` — name the drift, halt
- **NEEDS HUMAN DECISION** → `Next state: STOPPED_FOR_HUMAN` — name the open question

If iteration 3 still needs fixes, or the same fix has been requested twice → return `STOPPED_FOR_HUMAN`. No third fix pass.

Do not approve continuation. The human/user does that.
