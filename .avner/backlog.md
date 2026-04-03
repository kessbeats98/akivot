# Backlog — Akivot

Flat task list. CEO CODEX adds tasks. CLAUDE CODE picks from top.
Priority: P0 (critical) > P1 (high) > P2 (medium) > P3 (low).

Format:
```
- [ ] TASK-XX [P0|P1|P2|P3] — [one-line description]
```

---

## REQ-15: Auth UI (Login + Signup Pages)

**What**: Auth UI using Better Auth client SDK — login and signup forms
**R-ids**: R-EML-01, R-EML-02, R-AUTH-01 (implicit: user can authenticate via browser)
**Risk**: LOW (no schema changes, no new API — client UI calling existing /api/auth/[...all])

**Scope**:
1. Auth client instance (createAuthClient)
2. Login form — email/password, error states, link to signup
3. Signup form — name/email/password, redirect to verify-email notice
4. Verify-email page — "check your inbox" message
5. Landing page auth links (כניסה + הרשמה)

**Acceptance Criteria**:
- [ ] `/login` renders form, submits to Better Auth, redirects to dashboard on success
- [ ] `/signup` renders form, creates account, redirects to `/verify-email`
- [ ] `/verify-email` shows "check your inbox" message
- [ ] Landing page has visible כניסה + הרשמה links
- [ ] `npm run build` passes with 0 errors
- [ ] All text in Hebrew, RTL layout

---

- [x] TASK-14 [P2] — API-based globalSetup seed for production smoke
- [x] TASK-13 [P2] — Make qa:smoke target-configurable
- [x] DEPLOY-01 [P1] — Production deploy feat/fp-premium-ui
- [ ] TASK-15 [P0] — Auth UI: login + signup pages using Better Auth client SDK
- [ ] TASK-16 [P1] — Landing page: replace Next.js boilerplate with Akivot branding
- [ ] TASK-17 [P2] — Role-based redirect after login (owner vs walker dashboard)
