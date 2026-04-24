# Example PASS report

```json
{
  "scenario": "start-walk-success",
  "result": "PASS",
  "url": "/walker/live",
  "assertions": [
    {"name": "redirect to live", "result": "PASS"},
    {"name": "timer visible", "result": "PASS"}
  ]
}
```

# Example FAIL report

```json
{
  "scenario": "start-walk-offline",
  "result": "FAIL",
  "failureStep": "click start walk",
  "url": "/walker/dashboard?debug=true",
  "assertions": [
    {"name": "offline banner visible", "result": "FAIL"}
  ],
  "artifacts": {
    "screenshot": "qa/artifacts/start-walk-offline-fail.png",
    "snapshot": ".playwright-cli/page-2026-03-23T15-00-00.yml"
  }
}
```
