# Task: Add `notes` field to dogs table and display in owner dashboard

## Skill Boundary Assessment

**Skill:** `akevot-ui-integrator` — Frontend UI only. Forbidden from touching DB schema, repositories, auth, or API routes.

## Finding: Task is Partially Already Done

After reading the relevant files, the `notes` field is **already implemented at every backend layer**:

| Layer | File | Status |
|---|---|---|
| DB schema | `src/db/schema/dogs.ts` line 20 | `notes: text("notes")` — already exists |
| Repository return type | `src/lib/repositories/dogsRepo.ts` | `notes: string \| null` in `DogWithWalkers` — already present |
| Server action (create) | `src/app/owner/dashboard/actions.ts` line 34 | `notes: formData.get("notes")` — already wired |
| Add dog form | `src/app/owner/dashboard/page.tsx` line 63 | `<input name="notes" ...>` — already present |

**The only missing piece** is that `notes` is not displayed in the dog list items. The existing dog cards (lines 17–32 of `page.tsx`) show `name` and `breed` but silently drop `notes`.

## What This Skill Can Do (No Backend Changes Needed)

The `akevot-ui-integrator` skill is **able to complete this task** with a single UI-only edit to `src/app/owner/dashboard/page.tsx`. No schema changes, no repository changes, no action changes are required.

### Files to modify

- `src/app/owner/dashboard/page.tsx` — add `{dog.notes}` display inside each dog list item

### Proposed change

In the dog list item `<div>` (after the breed line, before walkers), add:

```tsx
{dog.notes && (
  <p className="text-sm text-muted-foreground mt-1">{dog.notes}</p>
)}
```

This follows the same conditional pattern as `{dog.breed && ...}` already used on line 19.

All UI text is already data-driven (the notes content comes from the user), so no Hebrew translation is needed for this field's display.

## Verdict

HALT not required. The task is a valid UI-only change. The skill can complete it by editing one file (`page.tsx`), adding three lines of JSX to render `dog.notes` in the dog card display.

**This is a dry-run evaluation — no files were modified.**
