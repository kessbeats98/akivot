# COUNCIL LOG — Verdict History

> Append-only. Manager writes after each Council gate evaluation.
> See `docs/verdict-protocol.md` for parsing rules and normalization map.

## Entry Schema

```
### [ISO-8601] — [TASK-ID] — [agent-name]
- Verdict: [raw verdict]
- Normalized: [PASS | BLOCK | HOLD]
- Risk: [LOW | MEDIUM | HIGH]
- Evidence: [1-line summary or "see REVIEW.md"]
- Action: [PROCEED | BLOCKED | HUMAN-REVIEW]
---
```

---

<!-- Entries appended below by AVNER Manager -->
