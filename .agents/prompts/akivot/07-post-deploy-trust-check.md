# Prompt — Post-Deploy Trust Check

Use after merge or deploy.

Copy-paste:

---

Verify the production deploy. Do not change code.

Check:

1. Production availability — site loads.
2. Protected route behavior — auth gate behaves as expected.
3. Authenticated smoke — if a session/token is available, exercise the changed surface.
4. Logs — check error logs if accessible.
5. Note limitations — if a token or session is unavailable, say so explicitly.

Output:

```
Production availability: PASS / PARTIAL / FAIL
Product trust smoke:     PASS / PARTIAL / FAIL
Blockers:
Next step:
```

PARTIAL is not PASS. State exactly what was not verified and why.
