# Design System Setup — Dry Run Summary

## Task
Update `src/app/globals.css` with the Akivot design system color variables and fix the Arial font-family bug.

## Files Changed
- `src/app/globals.css` (only file modified)

## What Changed

### 1. Color variables in `:root`
The following variables were updated or added in the light-mode `:root` block:

| Variable | Old value | New value |
|---|---|---|
| `--background` | `#ffffff` | `#FAF9F6` |
| `--foreground` | `#171717` | `#333333` |
| `--primary` | `222.2 47.4% 11.2%` | `#2A9D8F` |
| `--accent` | `210 40% 96.1%` | `#F4A261` |
| `--success` | _(did not exist)_ | `#6BBF59` _(added)_ |

`--destructive` and all other variables (card, popover, secondary, muted, border, input, ring, radius) were left unchanged.

### 2. Body font-family fix
Removed the explicit `font-family: Arial, Helvetica, sans-serif;` override from the `body` rule, so Geist Sans (loaded via `layout.tsx` and aliased as `--font-sans` in the `@theme inline` block) applies correctly.

## Proposed diff

```diff
--- a/src/app/globals.css
+++ b/src/app/globals.css
@@ -1,27 +1,28 @@
 @import "tailwindcss";

 :root {
-  --background: #ffffff;
-  --foreground: #171717;
+  --background: #FAF9F6;
+  --foreground: #333333;
   --card: 0 0% 100%;
   --card-foreground: 222.2 84% 4.9%;
   --popover: 0 0% 100%;
   --popover-foreground: 222.2 84% 4.9%;
-  --primary: 222.2 47.4% 11.2%;
+  --primary: #2A9D8F;
   --primary-foreground: 210 40% 98%;
   --secondary: 210 40% 96.1%;
   --secondary-foreground: 222.2 47.4% 11.2%;
   --muted: 210 40% 96.1%;
   --muted-foreground: 215.4 16.3% 46.9%;
-  --accent: 210 40% 96.1%;
+  --accent: #F4A261;
   --accent-foreground: 222.2 47.4% 11.2%;
   --destructive: 0 84.2% 60.2%;
   --destructive-foreground: 210 40% 98%;
   --border: 214.3 31.8% 91.4%;
   --input: 214.3 31.8% 91.4%;
   --ring: 222.2 84% 4.9%;
   --radius: 0.5rem;
+  --success: #6BBF59;
 }

@@ -57,5 +58,4 @@
 body {
   background: var(--background);
   color: var(--foreground);
-  font-family: Arial, Helvetica, sans-serif;
 }
```

## Verification step
```
npx tsc --noEmit && npm run build
```
Expected: build exits 0, no TypeScript errors. Visual check: background should appear warm off-white (#FAF9F6), headings/body text dark gray (#333333), primary interactive elements teal (#2A9D8F).

## Notes
- Dark mode block left untouched per SKILL.md instruction ("Do not modify dark-mode CSS variables").
- No backend files touched. Change is purely presentational CSS.
