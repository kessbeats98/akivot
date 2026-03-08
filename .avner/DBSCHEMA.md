# DB Schema — Akivot

## ORM
Drizzle ORM with Neon Serverless Postgres.

## Tables

### [table_name]
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id     | uuid | PK, default gen | |
| ...    |      |             | |

### Relations
- [table_a].field → [table_b].field (FK)

## Migration Policy
- All migrations via `npx drizzle-kit generate` + `npx drizzle-kit push`.
- Destructive migrations (column drop, table drop, data truncation) require /core + verify-ops approval.
- Every migration must be non-destructive by default. Document rollback path.
