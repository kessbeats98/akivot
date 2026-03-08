# API Contracts — Akivot

## Conventions
- Base URL: `/api/`
- Auth: Better Auth session cookies
- Content-Type: `application/json`
- Error shape: `{ error: string, code?: string }`

## Endpoints

### [GROUP] — [Description]

#### `METHOD /api/path`
- **Auth**: required / public
- **Request**: `{ field: type }`
- **Response 200**: `{ field: type }`
- **Response 4xx**: `{ error: string }`
- **Notes**: [any important behavior]
