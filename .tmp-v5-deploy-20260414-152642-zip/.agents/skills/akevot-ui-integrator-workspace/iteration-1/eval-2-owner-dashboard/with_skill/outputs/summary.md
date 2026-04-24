# Owner Dashboard UI — Dry-Run Summary

## Files That Would Be Changed / Created

1. `src/app/globals.css` — update CSS variables to Akivot design system colors, fix Arial font-family bug
2. `src/components/owner/DogCard.tsx` — new presentational component (card + assign walker + set price forms)
3. `src/app/owner/dashboard/page.tsx` — reshaped JSX: Hebrew labels, Card layout, shadcn Button, add-dog form

### Prerequisite (user must run first)
```
npx shadcn add card button input badge
```

---

## Proposed Changes

### 1. `src/app/globals.css` (partial — light-mode variables + body fix)

```css
:root {
  --background: #FAF9F6;
  --foreground: #333333;
  --card: 0 0% 100%;
  --card-foreground: 0 0% 20%;
  --popover: 0 0% 100%;
  --popover-foreground: 0 0% 20%;
  --primary: 174 58% 39%;          /* #2A9D8F teal */
  --primary-foreground: 0 0% 100%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 28 87% 67%;            /* #F4A261 orange */
  --accent-foreground: 0 0% 100%;
  --success: 109 40% 56%;          /* #6BBF59 green */
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 174 58% 39%;
  --radius: 0.75rem;
}

/* body fix — remove Arial override */
body {
  background: var(--background);
  color: var(--foreground);
  /* font-family removed — Geist Sans applied via @theme inline */
}
```

---

### 2. `src/components/owner/DogCard.tsx` (new file)

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Walker {
  dogWalkerId: string;
  displayName: string;
}

interface Dog {
  id: string;
  name: string;
  breed?: string | null;
  walkers: Walker[];
}

interface AvailableWalker {
  id: string;
  displayName: string;
}

interface DogCardProps {
  dog: Dog;
  availableWalkers: AvailableWalker[];
  deactivateAction: (formData: FormData) => Promise<void>;
  setPriceAction: (formData: FormData) => Promise<void>;
  assignWalkerAction: (formData: FormData) => Promise<void>;
}

export function DogCard({
  dog,
  availableWalkers,
  deactivateAction,
  setPriceAction,
  assignWalkerAction,
}: DogCardProps) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-lg font-semibold">{dog.name}</CardTitle>
            {dog.breed && (
              <p className="text-sm text-muted-foreground mt-0.5">{dog.breed}</p>
            )}
          </div>
          <form action={deactivateAction}>
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl"
            >
              השבת
            </Button>
          </form>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Assigned walkers + set price */}
        {dog.walkers.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">מטיילים משויכים</p>
            {dog.walkers.map((walker) => (
              <div key={walker.dogWalkerId} className="flex flex-col gap-2">
                <Badge variant="secondary" className="w-fit rounded-xl">
                  {walker.displayName}
                </Badge>
                <form action={setPriceAction.bind(null, walker.dogWalkerId)} className="flex gap-2">
                  <Input
                    name="price"
                    placeholder="מחיר (₪)"
                    required
                    className="rounded-xl text-base h-10 flex-1"
                  />
                  <Button
                    type="submit"
                    variant="outline"
                    size="sm"
                    className="rounded-xl h-10 whitespace-nowrap"
                  >
                    קבע מחיר
                  </Button>
                </form>
              </div>
            ))}
          </div>
        )}

        {/* Assign walker */}
        <form action={assignWalkerAction} className="flex flex-col gap-2 sm:flex-row">
          <select
            name="walkerProfileId"
            required
            className={cn(
              "flex-1 rounded-xl border border-input bg-background px-3 py-2 text-base",
              "focus:outline-none focus:ring-2 focus:ring-ring",
              "min-h-[44px]"
            )}
          >
            <option value="">בחר מטייל…</option>
            {availableWalkers.map((w) => (
              <option key={w.id} value={w.id}>
                {w.displayName}
              </option>
            ))}
          </select>
          <Button
            type="submit"
            variant="outline"
            className="rounded-xl h-11 sm:w-auto w-full"
          >
            שייך מטייל
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

---

### 3. `src/app/owner/dashboard/page.tsx` (full replacement)

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
import { DogCard } from "@/components/owner/DogCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PawPrint } from "lucide-react";

export default async function OwnerDashboardPage() {
  const [dogs, availableWalkers] = await Promise.all([
    getOwnerDogsAction(),
    getAvailableWalkersAction(),
  ]);

  return (
    <main className="px-4 py-6 max-w-2xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <PawPrint className="w-6 h-6 text-primary" />
          הכלבים שלי
        </h1>
        <EnableNotificationsButton />
      </div>

      {/* Dog list */}
      {dogs.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          עדיין אין כלבים — הוסף כלב למטה.
        </p>
      ) : (
        <ul className="space-y-4">
          {dogs.map((dog) => (
            <li key={dog.id}>
              <DogCard
                dog={dog}
                availableWalkers={availableWalkers}
                deactivateAction={deactivateDogAction.bind(null, dog.id)}
                setPriceAction={setPriceAction}
                assignWalkerAction={assignWalkerAction.bind(null, dog.id)}
              />
            </li>
          ))}
        </ul>
      )}

      {/* Add dog form */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">הוסף כלב</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createDogAction} className="space-y-3">
            <Input
              name="name"
              placeholder="שם *"
              required
              className="rounded-xl text-base h-11"
            />
            <Input
              name="breed"
              placeholder="גזע"
              className="rounded-xl text-base h-11"
            />
            <div className="flex flex-col gap-1">
              <label className="text-sm text-muted-foreground">תאריך לידה</label>
              <Input
                type="date"
                name="birthDate"
                className="rounded-xl text-base h-11"
              />
            </div>
            <Input
              name="notes"
              placeholder="הערות"
              className="rounded-xl text-base h-11"
            />
            <Button
              type="submit"
              className="w-full rounded-xl h-12 text-base font-semibold"
            >
              הוסף כלב
            </Button>
          </form>
        </CardContent>
      </Card>

    </main>
  );
}
```

---

## Design Decisions

- **DogCard is a Server Component** — all action bindings happen in the page (server). `DogCard` receives pre-bound actions as props. No `"use client"` needed for this pass.
- **`setPriceAction` binding** — `setPriceAction` is bound inside `DogCard` (not the page) because the walker id comes from the dog's walker list, which is only available inside the map. This is acceptable: `DogCard` receives the unbound `setPriceAction` and binds it at render time inside `.map()`.
- **No new server action invented** — all data comes from existing `getOwnerDogsAction` and `getAvailableWalkersAction`. No fields were missing.
- **`<select>` kept as native element** — shadcn `Select` requires `"use client"`. Native `<select>` works in Server Components and is accessible on mobile.
- **RTL** — no explicit `dir` overrides. Root `<html dir="rtl">` handles flow. Layout uses `flex` which auto-reverses in RTL.
- **globals.css** — Arial override removed; design system colors applied. Dark mode block left untouched per skill rules.

## Verification Step

After running `npx shadcn add card button input badge`, run:

```
npx tsc --noEmit
```

Expected: 0 errors. Then load `/owner/dashboard` in browser at 375px width and verify RTL card layout, Hebrew labels, teal primary button.
