# Akivot Prompts — Start Here

Pick the prompt that matches the moment.

| When | Use |
| --- | --- |
| New chat / new session | `01-new-chat.md` |
| Have a product idea | `02-idea-guardrail.md` |
| Idea passed, build a plan | `03-build-executor-plan.md` |
| Real implementation task, safer file-based run | `09-file-based-agent-run.md` |
| Send plan to Claude Code | `04-send-to-claude-code-executor.md` |
| Claude returned a report | `05-review-executor-report.md` |
| Review found fixes | `06-send-review-fixes-to-executor.md` |
| Merged / deployed | `07-post-deploy-trust-check.md` |
| Trigger Codex review via plugin | `08-codex-plugin-review.md` |

## Mental model

```
ChatGPT  = soul (product DNA)
Codex    = map / gate / reviewer / debugger
Claude   = executor
Plugin   = pipe (no authority)
Human    = final authority
```

Idea → enforcer → plan → execute → report → review → trust-check.

Preferred safer path for non-trivial implementation:

```
enforcer -> .agent-runs/current/PLAN.md -> human approval -> Claude executes -> CLAUDE_EXECUTION_REPORT.md -> Codex review -> CODEX_REVIEW.md
```

Keep chat prompts available. Use files as the source of truth when execution risk or context drift matters.
