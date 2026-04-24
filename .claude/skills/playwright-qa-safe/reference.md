# Scenario execution reference

## Scenario file shape
Each scenario JSON contains:
- `name`
- `baseUrl`
- `tags`
- `setup`
- `steps`
- `assertions`
- `artifacts`

## Step types
- `goto`
- `click`
- `dblclick`
- `fill`
- `type`
- `press`
- `hover`
- `select`
- `check`
- `uncheck`
- `drag`
- `snapshot`
- `screenshot`
- `console`
- `network`
- `tracing-start`
- `tracing-stop`

## Assertion types
- `url-includes`
- `text-visible`
- `text-not-visible`
- `ref-exists`
- `title-includes`
- `console-clean`

## Execution rules
- Run `snapshot` after every `goto`, `click`, `fill`, `select`, `check`, `uncheck`, `drag`, and `press` when navigation or mutation is expected.
- Treat missing assertions as a scenario design error and mark the run BLOCKED.
- Prefer stable refs from snapshots instead of brittle selectors.
- If the scenario requests a debug-panel action, execute it exactly as written and verify the expected failure state.
