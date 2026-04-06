# Owner Dashboard Styling — Dry-Run Evaluation

## Observations

- `page.tsx` uses plain Tailwind utility classes; no shadcn Card/Button components.
- `actions.ts` exposes these data shapes:
  - Dog: `{ id, name, breed?, walkers: [{ dogWalkerId, displayName }] }`
  - Walker: `{ id, displayName }`
- `components.json` exists (shadcn/ui configured, aliases set), but `src/components/ui/` does not exist — no shadcn components have been installed yet.
- The project uses Tailwind v4, RTL is not yet applied.

## Pre-requisites (would run first)

```bash
npx shadcn@latest add card button input label select badge separator
```

This creates `src/components/ui/card.tsx`, `button.tsx`, `input.tsx`, `label.tsx`, `select.tsx`, `badge.tsx`, `separator.tsx`.

## Files That Would Change

| File | Action |
|------|--------|
| `src/app/owner/dashboard/page.tsx` | Full rewrite with shadcn components + Hebrew labels + RTL |
| `src/app/globals.css` (or layout) | Add `dir="rtl"` to `<html>` if not already present |

## Proposed `page.tsx`

```tsx
import {
  getOwnerDogsAction,
  createDogAction,
  deactivateDogAction,
  assignWalkerAction,
  setPriceAction,
  getAvailableWalkersAction,
} from "./actions";
import { EnableNotificationsButton } from "@/components/EnableNotificationsButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default async function OwnerDashboardPage() {
  const [dogs, availableWalkers] = await Promise.all([
    getOwnerDogsAction(),
    getAvailableWalkersAction(),
  ]);

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-background px-4 py-6 sm:px-6 md:max-w-2xl md:mx-auto space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-2xl font-bold tracking-tight">הכלבים שלי</h1>
        <EnableNotificationsButton />
      </div>

      {/* Dog Cards */}
      {dogs.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-8">
          עדיין לא נוספו כלבים.
        </p>
      ) : (
        <div className="space-y-4">
          {dogs.map((dog) => (
            <Card key={dog.id} className="shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{dog.name}</CardTitle>
                    {dog.breed && (
                      <Badge variant="secondary" className="text-xs font-normal">
                        {dog.breed}
                      </Badge>
                    )}
                  </div>
                  <form action={deactivateDogAction.bind(null, dog.id)}>
                    <Button
                      type="submit"
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      הסרה
                    </Button>
                  </form>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Existing walkers */}
                {dog.walkers.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">מטיילים מוקצים</p>
                    {dog.walkers.map((walker) => (
                      <div
                        key={walker.dogWalkerId}
                        className="flex items-center gap-3 flex-wrap rounded-md border bg-muted/30 px-3 py-2"
                      >
                        <span className="text-sm flex-1">{walker.displayName}</span>
                        <form
                          action={setPriceAction.bind(null, walker.dogWalkerId)}
                          className="flex gap-2 items-center"
                        >
                          <Input
                            name="price"
                            placeholder="מחיר (₪)"
                            required
                            className="w-28 h-8 text-sm"
                            type="number"
                            min="0"
                            step="1"
                          />
                          <Button type="submit" variant="outline" size="sm">
                            קבע מחיר
                          </Button>
                        </form>
                      </div>
                    ))}
                  </div>
                )}

                <Separator />

                {/* Assign walker */}
                <form
                  action={assignWalkerAction.bind(null, dog.id)}
                  className="flex gap-2 items-center flex-wrap"
                >
                  <Label htmlFor={`walker-${dog.id}`} className="sr-only">
                    בחר מטייל
                  </Label>
                  <select
                    id={`walker-${dog.id}`}
                    name="walkerProfileId"
                    required
                    className="flex h-9 w-full flex-1 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-w-[140px]"
                  >
                    <option value="">בחר מטייל…</option>
                    {availableWalkers.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.displayName}
                      </option>
                    ))}
                  </select>
                  <Button type="submit" variant="outline" size="sm">
                    שיבוץ
                  </Button>
                </form>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Dog Form */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">הוספת כלב</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createDogAction} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="dog-name">שם *</Label>
              <Input id="dog-name" name="name" placeholder="שם הכלב" required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dog-breed">גזע</Label>
              <Input id="dog-breed" name="breed" placeholder="גזע (לא חובה)" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dog-birth">תאריך לידה</Label>
              <Input id="dog-birth" type="date" name="birthDate" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dog-notes">הערות</Label>
              <Input id="dog-notes" name="notes" placeholder="הערות (לא חובה)" />
            </div>

            <Button type="submit" className="w-full sm:w-auto">
              הוסף כלב
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
```

## Key Design Decisions

1. **RTL via `dir="rtl"` on `<main>`** — scoped to this page so it doesn't affect the rest of the app until a global RTL pass is done.
2. **shadcn Card** wraps each dog and the add-dog form, giving consistent elevation, border radius, and padding.
3. **shadcn Button** replaces all raw `<button>` elements; uses `variant="ghost"` with destructive color for the deactivate action (visually softer but clearly dangerous).
4. **shadcn Input + Label** pairs for accessibility — `htmlFor`/`id` wired up.
5. **`<select>` kept as native** — shadcn Select is a controlled component and would require converting this Server Component section to a Client Component. The native `<select>` is styled to match shadcn Input visually using the same Tailwind classes shadcn uses internally.
6. **Mobile-first**: full-width inputs, wrapping flex rows at `flex-wrap`, `min-w` constraints on select.
7. **Hebrew labels**: שם (name), גזע (breed), תאריך לידה (birth date), הערות (notes), הוסף כלב (add dog), הסרה (deactivate), שיבוץ (assign), קבע מחיר (set price), מטיילים מוקצים (assigned walkers).
8. **Empty state** shown with centered muted text when no dogs exist.
9. **Separator** between existing walker list and assign-walker form for visual clarity.

## What Would NOT Change

- `actions.ts` — no changes needed; data shapes are sufficient.
- No new server actions required.
- No global layout changes (RTL scoped to `<main dir="rtl">`).
