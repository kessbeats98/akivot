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
- [x] TASK-18 [P0] — Real onboarding flow: profile creation wizard (owner + walker)
- [x] BUG-02 [P1] — Confirm button enabled with no dog selected (WalkerDashboardClient)
- [x] TASK-19 [P3] — Role guards on dashboard pages (redirect if user lacks that role)
- [x] TASK-21 [P2] — Empty states for owner + walker dashboards (inline add-dog form, informational walker state)

---

## REQ-19: Role Guards on Dashboard Pages

**What**: Server-side route protection for /walker/* and /owner/* routes
**R-ids**: R-AUTH-03 (implicit: users without matching profile cannot access role-specific dashboards)
**Risk**: LOW — no schema changes, no new API, read-only profile checks

**Context**:
- `getCurrentUser()` returns session user or null (no role info)
- `getUserRole(userId)` already exists — returns "walker"|"owner"|"both"|"none"
- Walker/owner layouts (`layout.tsx`) have zero auth logic today
- Dashboard pages call `getCurrentUser()` but never check role
- An owner can navigate to `/walker/dashboard` and hit broken state

**Scope**:
1. Walker routes: unauthenticated → /login, no walker profile → /onboarding
2. Owner routes: unauthenticated → /login, no owner profile → /onboarding
3. Users with matching role pass through normally
4. Reuse existing `getCurrentUser()` + `getUserRole()`
5. No schema changes, no new flows, no UI changes

**Acceptance Criteria**:
- [ ] Unauthenticated → /walker/dashboard → redirect /login
- [ ] Unauthenticated → /owner/dashboard → redirect /login
- [ ] Owner-only → /walker/dashboard → redirect /onboarding
- [ ] Walker-only → /owner/dashboard → redirect /onboarding
- [ ] Valid walker → /walker/dashboard → no redirect
- [ ] Valid owner → /owner/dashboard → no redirect
- [ ] `npm run build` passes
- [ ] `qa:smoke` still passes

**Out of Scope**: empty states, landing page, onboarding changes, visual redesign

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

---

## REQ-21: Empty States for Owner + Walker Dashboards

**What**: Replace weak zero-data dashboard states — owner gets inline add-dog form, walker gets informational "waiting for assignment" message
**R-ids**: R-OWN-EMPTY-01, R-WLK-EMPTY-01
**Risk**: MEDIUM — wires existing `createDogAction` into owner empty state UI. No auth/role/onboarding changes.

**Scope**:
1. Owner empty state — inline add-dog form (name input + submit) using existing `createDogAction`
2. Walker empty state — icon + "ממתינים לשיוך כלב" headline + explanation (no CTA)
3. Visual consistency across both empty states

**Acceptance Criteria**:
- [x] Owner 0-dogs state: icon + headline + inline add-dog form with name input + submit
- [x] Submitting form calls `createDogAction`, revalidates, empty state disappears
- [x] No second "add another dog" UX outside empty state
- [x] Walker 0-dogs state: icon + "ממתינים לשיוך כלב" + explanation
- [x] Walker empty state has no primary CTA
- [x] Walker `data-testid="empty-state"` preserved
- [x] `npm run build` passes
