# BATCH: Language Rewrite + Auto-Redirect (Roadmap Phase 5)

## Context
Returning logged-in users hit the landing page every time and must click "כניסה" manually. No middleware exists, no auth check on `/`. The copy across landing/auth/onboarding is functional Hebrew but reads like SaaS marketing — not warm or trust-oriented. Goal: make it dead easy to get in, and make the product sound human.

---

## Decisions

1. Add auth check to `/` landing page — returning users auto-redirect to dashboard, zero extra clicks.
2. Rewrite all user-facing copy in landing/auth/onboarding to warm, human Hebrew.
3. Do NOT add middleware.ts — check auth in the landing page server component using existing `getRedirectPath`.
4. Do NOT touch dashboard or nav files — scope is strictly landing + auth + onboarding.
5. Two commits: one for redirect logic, one for copy rewrite.

---

## Plan

### Task 1: Auto-redirect returning users (1 file)

**File:** `src/app/page.tsx`

Convert to async server component. Add these imports at the top:
```tsx
import { redirect } from "next/navigation";
import { getRedirectPath } from "@/lib/auth/get-redirect-path-action";
```

Replace `export default function Home()` with:
```tsx
export default async function Home() {
  try {
    const path = await getRedirectPath();
    if (path !== "/login") redirect(path);
  } catch { /* DB down — show landing page normally */ }

  return (
    // ... existing landing JSX stays exactly the same
  );
}
```

Logic: `getRedirectPath` returns `"/login"` when no session → fall through, show landing. Any other path means logged-in user → redirect to their dashboard or onboarding.

**Verify:**
```bash
tsc --noEmit
npm run build
```

**Commit:**
```
feat(landing): auto-redirect returning logged-in users to dashboard
```

---

### Task 2: Warm Hebrew copy rewrite (5 files)

All changes are string replacements only — no logic changes.

#### File 1: `src/app/page.tsx` — Landing

| Line | Current | New |
|------|---------|-----|
| subtitle | `הפלטפורמה לניהול טיולי כלבים — לדוגווקרים ולבעלי כלבים` | `כי הכלב שלך שווה את הטוב ביותר` |
| bullet 1 | `מעקב טיולים בזמן אמת` | `תדעו בדיוק איפה הכלב שלכם מטייל` |
| bullet 2 | `ניהול תשלומים ותקופות חיוב` | `תשלומים ברורים, בלי הפתעות` |
| bullet 3 | `התראות לבעלי כלבים` | `תמיד מעודכנים, תמיד בשליטה` |

#### File 2: `src/app/login/page.tsx`

| Current | New |
|---------|-----|
| `כניסה לעקבות` | `שמחים שחזרת` |
| `placeholder="you@example.com"` | `placeholder="your@email.co.il"` |
| `מתחבר...` | `נכנסים...` |
| `אין לך חשבון?` | `פעם ראשונה כאן?` |

#### File 3: `src/app/signup/page.tsx`

| Current | New |
|---------|-----|
| `הרשמה לעקבות` | `בואו נתחיל` |
| `placeholder="you@example.com"` | `placeholder="your@email.co.il"` |
| `placeholder="ישראל ישראלי"` | `placeholder="איך קוראים לך?"` |
| `placeholder="לפחות 8 תווים"` | `placeholder="8 תווים ומעלה"` |
| `יוצר חשבון...` | `רק רגע...` |

#### File 4: `src/app/verify-email/page.tsx`

| Current | New |
|---------|-----|
| `בדוק את תיבת המייל` | `כמעט שם!` |
| `שלחנו לך מייל אימות. לחץ על הקישור במייל כדי להפעיל את החשבון.` | `שלחנו לך מייל עם קישור קצר — פשוט לחצו עליו ואנחנו מסדרים את השאר.` |
| `חזרה לכניסה` | `לא קיבלתי? חזרה לכניסה` |

#### File 5: `src/app/onboarding/OnboardingWizard.tsx`

| Current | New |
|---------|-----|
| `ברוכים הבאים לעקבות` | `!איזה כיף שהצטרפת` |
| `מה התפקיד שלך?` | `ספרו לנו קצת על עצמכם` |
| `בעל כלב` | `יש לי כלב` |
| `דוגווקר` | `אני דוגווקר` |
| `הוסף את הכלב הראשון` | `ספרו לנו על הכלב שלכם` |
| `יצירת פרופיל דוגווקר` | `איך בעלי הכלבים יכירו אותך?` |
| `השם שיוצג לבעלי הכלבים` | `השם שלך כדוגווקר` |
| `יוצר...` (both owner + walker submit) | `רק רגע...` |

**Verify:**
```bash
tsc --noEmit
npm run build
```

**Commit:**
```
style(copy): warm Hebrew rewrite for landing, auth, and onboarding
```

---

### Task 3: Push + production verify

```bash
git push origin main
```

**Production manual checks (after Vercel READY):**
- V1: Open `/` while logged in → auto-redirects to dashboard (no landing page)
- V2: Open `/` logged out → landing shows "כי הכלב שלך שווה את הטוב ביותר"
- V3: Open `/login` → title says "שמחים שחזרת"
- V4: Open `/signup` → title says "בואו נתחיל"
- V5: Complete signup → verify-email shows "!כמעט שם"

---

## Scope

- **Files:** 5 (`page.tsx`, `login/page.tsx`, `signup/page.tsx`, `verify-email/page.tsx`, `OnboardingWizard.tsx`)
- **Risk:** Low (1 small logic change: auth check on `/`; rest is pure string replacements)
- **Council:** not required
