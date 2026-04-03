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
- [x] TASK-15 [P0] — Auth UI: login + signup pages using Better Auth client SDK
- [ ] TASK-16 [P1] — Landing page: replace Next.js boilerplate with Akivot branding
- [x] TASK-17 [P2] — Role-based redirect after login (owner vs walker dashboard)
- [ ] TASK-18 [P0] — Real onboarding flow: profile creation wizard (owner + walker)
- [ ] TASK-19 [P3] — Role guards on dashboard pages (redirect if user lacks that role)

---

## REQ-17: Role-Based Redirect After Login

**What**: After signIn() succeeds, route user to correct dashboard based on their role
**R-ids**: R-AUTH-02 (implicit: authenticated user lands on appropriate dashboard)
**Risk**: LOW (no schema changes — reads existing walkerProfiles + dogOwners tables)

**Context**:
- No `role` column on `users` table. Roles are implicit:
  - Has `walkerProfiles` row → walker
  - Has `dogOwners` row → owner
  - A user can be both
  - A fresh user has neither → needs onboarding
- Currently login hardcodes redirect to `/walker/dashboard`

**Scope**:
1. getUserRole(userId) — query walkerProfiles + dogOwners → `"walker" | "owner" | "both" | "none"`
2. getRedirectPath() server action — gets session, calls getUserRole, returns path
3. Update login page — call getRedirectPath() after signIn, router.push(path)
4. /onboarding placeholder — two buttons, no logic
5. Build check

**Decisions**:
- "both" → walker priority, no chooser page
- /onboarding → placeholder only (two buttons, no logic)
- Role guards on dashboards → TASK-19, out of scope

**Acceptance Criteria**:
- [ ] User with walkerProfile → redirects to `/walker/dashboard` after login
- [ ] User with dogOwners → redirects to `/owner/dashboard` after login
- [ ] User with both → redirects to `/walker/dashboard` (walker priority)
- [ ] User with neither → redirects to `/onboarding`
- [ ] `npm run build` passes with 0 errors
- [ ] All new text in Hebrew
