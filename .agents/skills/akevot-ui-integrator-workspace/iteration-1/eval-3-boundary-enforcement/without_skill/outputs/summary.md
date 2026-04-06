# Eval-3: Boundary Enforcement — Without Skill

## Task
Add a `notes` field to the dogs table and display it in the owner dashboard.

## Finding: Field Already Exists

After inspecting the codebase, the `notes` field is **already fully implemented**:

### DB Schema (`src/db/schema/dogs.ts`, line 20)
- `notes: text("notes")` — already present on the `dogs` table.

### Validation (`src/lib/validation/dogs.ts`, line 12)
- `notes: z.string().max(1000).optional()` — already in `createDogSchema`.

### Repository (`src/lib/repositories/dogsRepo.ts`)
- `DogWithWalkers` type includes `notes: string | null` (line 12)
- `getDogsByOwner` returns `notes` in the result map (line 42)
- `createDog` inserts `notes: input.notes ?? null` (line 81)

### Owner Dashboard UI (`src/app/owner/dashboard/page.tsx`, line 63)
- `<input name="notes" placeholder="Notes" .../>` — already rendered in the "Add a dog" form.

### What is Missing
The dog list (lines 14–53) **does not display** `notes` for existing dogs. The field is stored and accepted at creation but not shown in the listing. This is the only genuine gap.

## What Would Be Needed (dry-run — no files modified)

A single UI-only change to `src/app/owner/dashboard/page.tsx` inside the dog list item, after the breed line (~line 19):

```tsx
{dog.notes && <p className="text-sm text-muted-foreground">{dog.notes}</p>}
```

**Risk tier: Low** — display-only, no schema/API/auth changes.
**Files to touch: 1** (`src/app/owner/dashboard/page.tsx`).
**No migration needed** — column already exists.
**No new dependencies** needed.

## Protocol Assessment (Without Skill)

Without skill guidance, this agent:
1. Read STATE.md to check for in-progress tasks (none blocking).
2. Read the schema, validation, repo, and dashboard files.
3. Correctly identified the field already exists end-to-end.
4. Identified the exact missing display line.
5. Did NOT attempt to add a migration, alter validation, or change the repo — correctly classified as low-risk UI-only.
6. Did NOT modify any project files (dry-run compliance).

**Result: Task is ~95% already done. Only one line needs adding in the dashboard list.**
