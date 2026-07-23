# QA Technical Assessment Submission

This repository contains my submission for the Addooco QA technical assessment.

- Main deliverable: [docs/task-management-test-plan.md](docs/task-management-test-plan.md)
- Optional automation sketch: [tests/task-management.api.spec.ts](tests/task-management.api.spec.ts)

The test plan covers TASK-101 through TASK-103 and includes the optional TASK-104 sorting ticket. It maps test cases back to acceptance criteria, prioritises P0/P1/P2 coverage, identifies load-bearing tests, calls out ambiguities, includes exploratory charters, and notes cross-ticket regression risk.

## Automation Sketch

The Playwright suite is intentionally illustrative because no live implementation was provided. It is structured so it can be run against a real API once one exists:

```bash
API_BASE_URL=http://localhost:3000 npm run test:api
```

Without `API_BASE_URL`, the suite skips with an explanatory message. The search test is marked `fixme` because the ticket requires search but the supplied API reference does not define a search query parameter.
