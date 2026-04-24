# BATCH: Icon Rendering Fix

**Problem:** Material Symbols icon labels (e.g. `settings`, `arrow_forward`, `pets`) render as raw text instead of icons on production.

**Root cause (probable):** The Google Fonts CSS2 API URL in `src/app/layout.tsx:44` has axes in wrong order:
```
Current:  Material+Symbols+Rounded:wght,FILL@100..700,0..1
Correct:  Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200
```
The CSS2 API requires axes in **alphabetical order**. `wght,FILL` is wrong — `FILL` comes before `wght`. This may cause the API to return empty/broken CSS, so the `.material-symbols-rounded` class never gets its `font-family` definition.

**Alternative root cause:** Next.js might strip or defer the external `<link>` in a way that breaks font loading. If the URL fix alone doesn't resolve it, add a local CSS class as fallback.

---

## Decisions

1. Fix the Google Fonts URL axis order first — simplest possible fix.
2. If that's not enough, add a minimal `.material-symbols-rounded` class in `globals.css` as belt-and-suspenders.
3. Do NOT switch to a self-hosted font or npm package — the CDN approach is fine once the URL works.
4. Do NOT touch any component files — they all use the correct class name already.

---

## Plan

### Task 1: Fix Google Fonts URL (1 file)

**File:** `src/app/layout.tsx`

**Change:** Replace the `<link>` href with the correct axis-ordered URL:
```
https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap
```

This is the canonical URL from Google's Material Symbols documentation. It includes all 4 variable axes in alphabetical order: `FILL`, `GRAD`, `opsz`, `wght`.

**Verify:**
```bash
tsc --noEmit
npm run build
```
Expected: both pass, no regressions.

### Task 2: Add CSS fallback (1 file)

**File:** `src/app/globals.css`

**Change:** Add at the end of the file:
```css
.material-symbols-rounded {
  font-family: 'Material Symbols Rounded';
  font-weight: normal;
  font-style: normal;
  font-size: 24px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  font-feature-settings: 'liga';
}
```

This ensures the class is always defined locally, even if the Google Fonts CSS takes time to load or gets deferred.

**Verify:**
```bash
tsc --noEmit
npm run build
```

### Task 3: Deploy + production verify

```bash
git add src/app/layout.tsx src/app/globals.css
git commit -m "fix(icons): correct Material Symbols font URL axis order + CSS fallback"
git push origin main
```

**Production verify (manual):**
- V1: Walker dashboard — gear icon renders as icon, not "settings" text
- V2: Walker dogs list — `pets`, `person`, `call` icons render correctly
- V3: Owner dashboard — `person_add`, `payments`, `chevron_left` icons render correctly
- V4: Any `arrow_forward` or `chevron_right` in billing/calendar surfaces renders as icon

---

## Scope

- **Files touched:** 2 (`layout.tsx`, `globals.css`)
- **Risk tier:** Low (styling/font loading only)
- **Council:** not required
