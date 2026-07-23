# Task Management System Test Plan

Source reviewed: `addooco/qa-technical-assessment-task` README on `main` at commit `a450e46743e41a9ee6cd08b2a22643b46f8c5934`.

## Short Written Summary

I treated the ticket acceptance criteria as the source of truth and designed coverage from the user's main workflow outward: create a task, keep it accurate, then find and order it later. For each ticket I separated the load-bearing scenario from supporting negative, boundary, regression, and exploratory coverage so the highest-value checks are obvious. Where the tickets or API reference are ambiguous, I have called that out rather than silently resolving it, then stated the working assumption I would use until a product owner confirms the intended behaviour.

## Scope

In scope:

- TASK-101: create and view tasks.
- TASK-102: update and delete tasks.
- TASK-103: filter and search tasks.
- TASK-104 bonus: sort tasks by due date and priority.
- Validation, list display, state changes, regression interactions between features, basic security probes, and lightweight accessibility/usability exploration.

Out of scope unless clarified:

- Authentication, authorisation, sharing, notifications, attachments, recurring tasks, audit history, offline-first behaviour, and bulk operations.
- Full performance/load testing. I include a lightweight data-volume exploratory charter because list/search/sort behaviour can degrade quickly.
- Undocumented create/update/delete API endpoint contracts. If those endpoints exist, I would test them; the provided appendix only documents `GET /tasks`.

## Legend And Prioritisation

Case type:

- `H`: happy path.
- `N`: negative.
- `B`: boundary.
- `E`: exploratory/risk probe.
- `R`: cross-ticket regression.

Priority:

- `P0`: must pass before I would recommend release for the ticket.
- `P1`: important supporting coverage for common risks and AC completeness.
- `P2`: exploratory, edge, or lower-frequency behaviour to run when time allows or automate at a lower layer.

## Execution Strategy

1. Run P0 load-bearing tests for TASK-101 through TASK-103 first. These prove the smallest useful release.
2. Run P0/P1 acceptance-criteria coverage for create, edit, delete, filter, and search.
3. Run cross-ticket regression checks around create -> filter/search, edit -> filter/search/sort, and delete -> filter/search/sort.
4. Run TASK-104 bonus sorting coverage if the feature is in scope.
5. Use P2 exploratory sessions for security input handling, concurrency/stale state, network failures, accessibility, mobile/responsive behaviour, and larger data sets.

## Working Assumptions

| Area | Assumption used for test design | Clarify before build/test? |
| --- | --- | --- |
| Platform | Primary target is a responsive web app backed by an API. | Yes, if mobile native is also in scope. |
| Users/data | Single-user task list unless product says otherwise. | Yes, multi-user changes data isolation and permissions coverage. |
| Persistence | Created, edited, and deleted tasks persist after refresh/session restart. | Yes, persistence is implied by the API reference but not explicit. |
| IDs | Each task has a unique stable identifier; duplicate titles are allowed. | Useful for update/delete test data. |
| Title validation | Missing, empty, or whitespace-only title is invalid after trimming. | Yes, only "without a title" is stated. |
| Status | UI exposes only `To Do`, `In Progress`, `Done`; unsupported values should not be accepted if a backend mutation API exists. | Yes for backend/API error behaviour. |
| Priority | UI exposes only `Low`, `Medium`, `High`; unsupported values should not be accepted if a backend mutation API exists. | Yes for backend/API error behaviour. |
| Due date | Optional. Valid dates are accepted; empty due date should not render as `Invalid Date`. | Yes: date-only vs datetime, timezone, past dates, and max range are unspecified. |
| Search | Search is partial, case-insensitive, trims surrounding whitespace, and at least searches title. Description search is a product question. | Yes. |
| Filter combination | Status, priority, and search combine with AND semantics. | Yes. |
| Sort direction | Due date sort means earliest first. Priority sort means High, Medium, Low. | Yes. |
| Undated tasks | When sorting by due date, undated tasks appear after dated tasks. | Yes. |

## Key Ambiguities And Product Questions

| Topic | Why it matters | Proposed question |
| --- | --- | --- |
| API search gap | Appendix lists `status`, `priority`, and `sortBy`, but no search parameter. | Is search client-side over the loaded list, or is the API documentation missing a search query parameter? |
| Search scope | TASK-103 says "search for tasks" but not which fields. | Should search include title only, or title and description? |
| Search matching | Exact, partial, case-sensitive, punctuation handling, and empty query behaviour are unspecified. | Should search be partial, trimmed, and case-insensitive, and should clearing search restore the current filtered list? |
| Filter composition | Separate status and priority filters are listed, but combined behaviour is not. | When status, priority, and search are all applied, should they combine as AND? |
| Sort direction | TASK-104 says sort by due date/priority but not direction or toggling. | Is due date earliest-first by default? Is priority High-to-Low? Can users reverse the order? |
| Priority sort rank | Priority values are strings, so a naive alphabetical sort is plausible but wrong for urgency. | Should priority sort use High, Medium, Low? |
| Null due dates | Optional due dates affect sorting and display. | Should tasks without due dates appear last, first, or in a separate group? |
| Edit validation | TASK-102 says any property can be edited; TASK-101 says title is required. | Does the required-title rule also apply when editing? I assume yes. |
| Delete safety | Delete behaviour does not mention confirmation or undo. | Is delete immediate, confirmed, or undoable? |
| Field limits | No maximum title/description length or allowed character set is defined. | What limits should the frontend and API enforce? |
| Date rules | Past dates, datetime precision, timezone, and locale display are not defined. | Are past due dates valid, and what timezone should date-only values use? |
| Live updates | It is not stated whether active views update after local or cross-tab changes. | Should list views update automatically after create/edit/delete, or is manual refresh acceptable? |

## Test Data

Use deliberately varied tasks so each filter/sort/search test proves both inclusion and exclusion.

| Ref | Title | Description | Status | Priority | Due date |
| --- | --- | --- | --- | --- | --- |
| T1 | Submit expenses | Receipts for client visit | To Do | Medium | 2026-07-30 |
| T2 | Fix production login | Regression after release | In Progress | High | 2026-07-22 |
| T3 | Archive Q2 notes | Documentation cleanup | Done | Low | None |
| T4 | Book travel | Confirm hotel and train | To Do | Low | 2026-08-02 |
| T5 | Refactor billing parser | Reduce flaky import handling | Done | High | 2026-07-25 |
| T6 | Book travel | Duplicate title, different due date | In Progress | Medium | 2026-08-10 |
| T7 | Team meeting | Contains search-only description term: budget | To Do | High | 2026-07-25 |

## Entry And Exit Criteria

Entry criteria:

- Acceptance criteria are reviewed and major product questions have at least a temporary answer.
- Test environment is stable enough to create, edit, delete, filter, search, and sort data.
- Test data can be seeded or reset reliably.
- UI and API versions under test are identifiable.

Exit criteria:

- All P0 tests pass for TASK-101 through TASK-103.
- No open critical/high defects against create, update, delete, filter, or search workflows.
- Known ambiguities are documented with current assumptions.
- Regression checks pass for feature combinations: create -> filter/search, edit -> filter/search/sort, delete -> filter/search/sort.

## Requirements Traceability

| Ticket | Acceptance criterion | Primary tests |
| --- | --- | --- |
| TASK-101 | Create task with required title, optional description, status, priority, optional due date | TC-101-01, TC-101-02, TC-101-06, TC-101-12 |
| TASK-101 | Status defaults to `To Do`; options are To Do, In Progress, Done | TC-101-01, TC-101-03, TC-101-04 |
| TASK-101 | Priority defaults to `Medium`; options are Low, Medium, High | TC-101-01, TC-101-05 |
| TASK-101 | Cannot create without title | TC-101-07, TC-101-08 |
| TASK-101 | Newly created tasks appear in task list | TC-101-01, TC-101-02, TC-101-15, TC-101-16, TC-101-18 |
| TASK-101 | List shows title, status, priority, due date | TC-101-01, TC-101-02, TC-101-06, TC-101-13, TC-101-14 |
| TASK-102 | Edit any property of an existing task | TC-102-01, TC-102-02, TC-102-03, TC-102-04, TC-102-05, TC-102-06 |
| TASK-102 | Delete a task | TC-102-01, TC-102-07, TC-102-11, TC-102-13 |
| TASK-102 | Deleted tasks no longer appear in list | TC-102-01, TC-102-07, TC-102-16 |
| TASK-103 | Filter by status | TC-103-01, TC-103-03, TC-103-06 |
| TASK-103 | Filter by priority | TC-103-02, TC-103-03, TC-103-06 |
| TASK-103 | Search using a search box | TC-103-04, TC-103-05, TC-103-06, TC-103-11, TC-103-12 |
| TASK-104 | Sort by due date | TC-104-01, TC-104-03, TC-104-05, TC-104-08 |
| TASK-104 | Sort by priority | TC-104-02, TC-104-04, TC-104-07, TC-104-08 |

## TASK-101: Create And View Tasks

Load-bearing test: TC-101-01. A user creates a title-only task, sees it in the list, and the system applies the correct defaults. This proves the minimum real-world create workflow and exercises five of the six ACs in one pass: accepted title, default status, default priority, new list entry, and required list fields.

| ID | Priority | Type | AC/risk | Scenario and steps | Expected result |
| --- | --- | --- | --- | --- | --- |
| TC-101-01 | P0 | H/load-bearing | Required title, default status, default priority, list display | Start with a clean list. Create a task with title `Submit expenses` only. Save. View the list. Refresh the page if persistence is in scope. | Task appears once in the list with title `Submit expenses`, status `To Do`, priority `Medium`, and no due date shown as blank/friendly text. It remains after refresh if persistence is intended. |
| TC-101-02 | P0 | H | All supported fields | Create a task with title, description, status `In Progress`, priority `High`, and due date `2026-07-22`. | Task is saved and visible in the list with title, status, priority, and due date. Description is stored and available in the detail/edit view if the list does not show it. |
| TC-101-03 | P1 | H | Explicit status options | Create separate tasks with status `In Progress` and `Done`. | Stored/displayed status matches the selected value and is not silently overridden to the default. |
| TC-101-04 | P1 | B/N | Status options/default | Confirm status control offers only To Do, In Progress, Done. Try an unsupported status such as `Blocked` if a direct mutation API or devtools route exists. | UI prevents unsupported status. If backend mutation is exposed, unsupported status is rejected or handled according to contract, not silently accepted. |
| TC-101-05 | P1 | H/B | Explicit priority options | Create tasks with priority `Low` and `High`. Confirm the control offers only Low, Medium, High. | Stored/displayed priority matches the selected value and is not silently overridden to `Medium`. Unsupported values are prevented or rejected if backend mutation is exposed. |
| TC-101-06 | P1 | H/B | Optional due date display | Create one task with no due date and one with a valid due date. View both in the list. | Both tasks save successfully. Undated task does not show broken date text; dated task displays consistently. |
| TC-101-07 | P0 | N | Empty title | Attempt to create with a missing or empty title. | Save is blocked or request is rejected. Clear validation is shown. No new task is added and entered optional fields are not unexpectedly lost. |
| TC-101-08 | P1 | N/B | Whitespace-only title | Attempt to create with a title containing only spaces. | Assuming titles are trimmed, save is blocked as an empty title. Ambiguity should be confirmed. |
| TC-101-09 | P2 | N | Malformed due date | Submit an invalid date string/format, using API/devtools only if such a route exists. | Invalid date is rejected or gracefully handled. No crash, corrupted record, or `Invalid Date` display. |
| TC-101-10 | P2 | B | Title length limits | Try a long but reasonable title, the agreed max length, and one character over once limits are known. | Boundary value is accepted; over-limit behaviour is explicit and consistent. No silent truncation unless product chooses it. |
| TC-101-11 | P2 | B | Long description | Create or edit a very long description. | Accepted per agreed limit or rejected clearly. List/detail layout remains usable. |
| TC-101-12 | P2 | B | Past and far-future due dates | Create tasks due yesterday and due `2099-12-31`. | Accepted unless product forbids past/far-future dates; displayed consistently if accepted. |
| TC-101-13 | P2 | E/security | Special characters and HTML-like text | Create a task with title/description containing punctuation, non-ASCII characters, and text like `<b>test</b>`. | Stored and rendered as literal text where appropriate. Markup is not interpreted in a way that changes UI or data. |
| TC-101-14 | P2 | E/security | Script injection in title/description | Enter `<script>alert(1)</script>` or similar in title/description. | Script is escaped or rejected. It does not execute in list, detail, edit, search, or exported views. |
| TC-101-15 | P1 | E/R | Double submit | Click Save twice quickly or simulate a slow network and repeated save. | Exactly one task is created, or duplicate prevention/error handling is clear. |
| TC-101-16 | P1 | E | Persistence | Create a task, refresh the page, and reopen the app/session if persistence is in scope. | Task still exists with the same values. |
| TC-101-17 | P2 | E | Network failure during create | Simulate network drop or server error while saving. | Clear error is shown. No ghost task remains once the app is refreshed or reconnected. |
| TC-101-18 | P0 | R | New task is immediately usable elsewhere | Create a task, then edit it, filter/search it, and sort it where applicable. | Task is fully available to TASK-102/103/104 flows after save. |

Exploratory ideas:

- Keyboard-only create flow: tab order, enter/escape behaviour, visible focus, save/cancel behaviour.
- Accessibility of required-field validation: label association, error announcement, contrast.
- Date picker behaviour around month boundaries and locale display.
- Empty-state to first-task transition.
- Responsive layout for long titles and dense lists.
- Duplicate titles: verify users can distinguish tasks by status, priority, due date, or detail view.

## TASK-102: Update And Delete Tasks

Load-bearing test: TC-102-01. A user edits multiple properties of an existing task, verifies the list reflects the update, then deletes that same task and verifies it is gone from both the normal list and any matching filtered/search view. This proves the ticket's full promise: users can keep the list accurate by changing and removing tasks.

| ID | Priority | Type | AC/risk | Scenario and steps | Expected result |
| --- | --- | --- | --- | --- | --- |
| TC-102-01 | P0 | H/R/load-bearing | Edit and delete existing task | Given T1 exists, edit title to `Submit July expenses`, status to `In Progress`, priority to `High`, and due date to `2026-07-31`. Save and verify the list. Then delete the task and search/filter for values that would have matched it. | Updated values appear for the same task, no duplicate is created, delete removes the task, and it does not reappear in unfiltered, filtered, or searched views. |
| TC-102-02 | P1 | H | Edit title | Change title only and save. | List/detail reflect new title without changing other fields. |
| TC-102-03 | P1 | H | Edit description | Change description only and save. | Description persists and is visible wherever descriptions are exposed. |
| TC-102-04 | P1 | H | Edit status through all values | Move a task through To Do -> In Progress -> Done, saving each time. | Each transition persists and displays correctly. If some transitions are not allowed, product rules should define that. |
| TC-102-05 | P1 | H | Edit priority | Change priority across Low, Medium, and High. | New priority persists and is reflected in list and priority filters/sorts. |
| TC-102-06 | P1 | H/B | Add/change/remove due date | Set a due date, change it, then clear it. | Each state persists correctly; clearing returns to no due date, not an error. |
| TC-102-07 | P0 | H | Delete task | Delete T4 from the list or detail view. Refresh if persistence is in scope. | T4 no longer appears in the task list after delete and remains absent after refresh. |
| TC-102-08 | P0 | N/R | Required title still applies on edit | Edit an existing task and remove the title or replace it with whitespace. Attempt to save. | Save is blocked or rejected. Existing valid title remains after cancel/reload; the task is not corrupted. |
| TC-102-09 | P1 | N | Invalid status/priority on edit | Attempt to set an out-of-enum value via edit, direct request, or devtools only if such mutation access exists. | Invalid value is prevented or rejected. Existing task data remains unchanged. |
| TC-102-10 | P2 | N/E | Edit stale or deleted task | Open task for edit in one tab/session; delete it elsewhere; try saving the stale edit. | User sees a recoverable stale/not-found message. The task is not resurrected and no unrelated task changes. |
| TC-102-11 | P2 | N/E | Double delete | Trigger delete twice quickly on the same task. | App handles it gracefully: either second action is a no-op or a handled not-found response. No crash and no wrong task deletion. |
| TC-102-12 | P1 | E | Cancel an in-progress edit | Open edit mode, change fields, then cancel or navigate away without saving according to the UI pattern. | Original task values remain unchanged. No partial update is saved. |
| TC-102-13 | P1 | B/R | Delete duplicate-title task | Given T4 and T6 share title `Book travel`, delete only T4. | Only the selected task is removed. T6 remains visible with its own status, priority, and due date. |
| TC-102-14 | P2 | E | Delete every task | Delete all tasks in the list. | Empty-state UI appears. No crash, stale row, or broken controls. |
| TC-102-15 | P2 | E | Rapid repeated edits | Submit several quick edits to one task in succession. | Final state is consistent with the last accepted save. No lost/interleaved updates. |
| TC-102-16 | P0 | R | Edited/deleted task reflected in filters/search/sort | Change a task's status, priority, due date, and title, then check relevant filters/search/sort. Delete a task that currently matches an active view. | Derived views reflect latest saved state; deleted tasks disappear from active and unfiltered views. |

Exploratory ideas:

- If delete confirmation exists, test confirm, cancel, keyboard interaction, and accidental double-click protection.
- If undo exists, test undo before/after refresh and expiry behaviour.
- Multi-tab stale data: edit in one tab, delete in another.
- Error recovery when save/delete fails due to network or server error.
- Status transition expectations: whether any transition is allowed, e.g. Done back to To Do.

## TASK-103: Filter And Search

Load-bearing test: TC-103-06. A user narrows a realistic list by status, priority, and a partial search term together, then clears the controls. This proves the feature helps users find the right task and protects the highest-risk state-composition behaviour.

| ID | Priority | Type | AC/risk | Scenario and steps | Expected result |
| --- | --- | --- | --- | --- | --- |
| TC-103-01 | P0 | H | Filter by each status value | Seed tasks across To Do, In Progress, and Done. Apply each status filter in turn. | Only tasks with the selected status are shown each time. Clearing the filter restores the broader list. |
| TC-103-02 | P0 | H | Filter by each priority value | Seed Low, Medium, and High tasks. Apply each priority filter in turn. | Only tasks with the selected priority are shown each time. Clearing the filter restores the broader list. |
| TC-103-03 | P1 | H/R | Combine status and priority filters | Apply status `In Progress` and priority `High`. | Results are the intersection of both filters, not the union, assuming AND semantics. Ambiguity should be confirmed. |
| TC-103-04 | P0 | H | Exact title search | Search the full title of an existing task. | Matching task is returned and unrelated tasks are hidden. |
| TC-103-05 | P0 | H/B | Partial and case-insensitive search | Search for `travel`, `TRAVEL`, and a partial term such as `trav`. | Assuming partial case-insensitive title search, matching `Book travel` tasks appear and unrelated tasks do not. |
| TC-103-06 | P0 | H/R/load-bearing | Combined filters/search | Apply status `To Do`, priority `Low`, then search `travel` using T4/T6 test data. Clear each control one at a time. | Results use AND semantics: T4 appears, T6 does not because its status differs. Clearing controls expands results predictably. |
| TC-103-07 | P1 | N | Search with no matches | Search a term matching nothing. | Empty-state shown, not an error. Existing data is not changed. |
| TC-103-08 | P1 | N | Filter combination with no matches | Pick a status/priority pair with zero matching tasks. | Empty-state shown, not an error. Clearing controls restores results. |
| TC-103-09 | P2 | E/security | Injection-style search input | Search for strings like `' OR 1=1--`, `%`, `_`, `?`, and `&`. | Input is treated as literal text. No crash, query parsing issue, or unintended data exposure. |
| TC-103-10 | P1 | B | Empty and whitespace-only search | Submit empty search, spaces-only search, and whitespace-padded terms such as ` meeting `. | Empty/spaces-only search behaves like no search. Padded terms are trimmed and match the same results as the unpadded term, assuming trim behaviour is intended. |
| TC-103-11 | P1 | B | Search field scope | Search a term that only appears in a task description, not title, using T7's `budget` description term. | Behaviour depends on product decision. Result should be documented as title-only or title+description and then tested consistently. |
| TC-103-12 | P1 | E | Clear filters | Apply filters/search, then clear each control and clear all controls. | Full unfiltered list returns, or the current remaining filtered list returns when only one control is cleared. |
| TC-103-13 | P0 | R | Filter/search after create and edit | Create a new High priority Done task. Verify it appears under Done and High filters. Edit it to Low and To Do. | Filter results reflect latest saved values without stale cached membership. |
| TC-103-14 | P0 | R | Filter/search after delete | Delete a task that is visible under active filters/search. | Task disappears immediately and remains absent after clearing/reapplying filters. Empty state displays if no matches remain. |
| TC-103-15 | P2 | E | State on reload/navigation | Apply filters/search, reload the page, navigate away and back, and use browser back/forward if URL state is supported. | State persistence or reset behaviour is consistent and intentional. Shared URLs restore state if the product supports URL-based filters. |
| TC-103-16 | P1 | API/contract | Documented query parameter behaviour | For `/tasks?status=Done`, `/tasks?priority=High`, and `/tasks?status=To%20Do&priority=Low`, verify response bodies. | Each response includes only matching tasks. Unsupported query values should have defined behaviour; expected behaviour needs confirmation because appendix only documents 200 responses. |

Ambiguity of note: the API reference documents `status`, `priority`, and `sortBy` as query parameters on `GET /tasks`, but there is no `search` or `q` parameter despite TASK-103 requiring a search box. I would raise this before automating search: either search is client-side over already-loaded tasks, or the API reference is incomplete.

Exploratory ideas:

- Data volume: verify search/filter responsiveness with 100, 1,000, and 10,000 tasks if realistic.
- Debounce behaviour: no flicker, duplicate requests, or stale results while typing quickly.
- Accessibility: controls have labels, result count changes are understandable, empty state is announced.
- Mobile ergonomics: filter controls remain usable without hiding results or causing layout shifts.

## TASK-104 Bonus: Sort Tasks

Load-bearing test: TC-104-04. Priority sort must reflect true urgency, not alphabetical order. This is a likely implementation mistake because a naive string sort of `High`, `Low`, `Medium` can look plausible at a glance while defeating the ticket's stated purpose of showing what is most urgent.

| ID | Priority | Type | AC/risk | Scenario and steps | Expected result |
| --- | --- | --- | --- | --- | --- |
| TC-104-01 | P0 | H | Sort by due date | Seed tasks with due dates before/after each other and one without due date. Sort by due date. | Assuming earliest-first, dated tasks appear from soonest to latest. Undated tasks appear after dated tasks unless product decides otherwise. |
| TC-104-02 | P0 | H | Sort by priority | Seed High, Medium, and Low tasks. Sort by priority. | Assuming urgent-first, High tasks appear before Medium, which appear before Low. |
| TC-104-03 | P1 | B | Sort direction | Toggle/reverse due-date sort if the UI supports it. | Correct descending order if supported. If not supported, the UI should not imply reversibility. |
| TC-104-04 | P0 | B/load-bearing | Priority sort rank | Verify priority sorting uses explicit severity rank rather than alphabetical order. | Order is High, Medium, Low, not alphabetical High, Low, Medium. |
| TC-104-05 | P1 | B | Null due dates | Sort by due date when some tasks have no due date set. | Defined, consistent placement, assumed last. TASK-101 makes this case unavoidable because due date is optional. |
| TC-104-06 | P1 | B | Tie-breaking | Sort a set with duplicate due dates or duplicate priorities. | Order is stable or uses a documented secondary sort, such as created date or title. No duplicate/lost rows. |
| TC-104-07 | P0 | R | Sort with filters/search | Apply a filter/search, then sort. | Sort applies only to the filtered/searched subset. Filtered-out tasks do not reappear. |
| TC-104-08 | P1 | R | Sort survives create/edit/delete | Sort applied; create a new task, edit a task's due date/priority, and delete a task. | List re-sorts or clearly requires a manual refresh without leaving stale ordering. Deleted tasks remain gone. |
| TC-104-09 | P2 | API/negative | Unsupported sort key | Request `/tasks?sortBy=title` or another unsupported value. | Behaviour should be defined. Since the schema enum only lists `dueDate` and `priority`, expected behaviour is likely a validation error rather than silent mis-sort, but appendix only lists a 200 response. |

Exploratory ideas:

- Discoverability of sort direction and active sort indicator.
- Keyboard/screen-reader support for sortable controls.
- Interaction between sort, pagination/infinite scroll, and result counts if later added.
- Date timezone edge cases around midnight and daylight-saving changes.

## Cross-Ticket Regression Risks

| Risk | Example failure | Coverage |
| --- | --- | --- |
| Defaults affect filtering | A title-only task defaults to To Do/Medium but does not appear under those filters. | TC-101-01, TC-103-01, TC-103-02 |
| Edit rules conflict with create validation | Editing can save a blank title even though create cannot. | TC-102-08 |
| Update does not refresh derived views | Status changes to Done but task remains under To Do filter. | TC-102-01, TC-102-16, TC-103-13 |
| Delete only updates current view | Deleted task disappears under active search but returns when filters clear. | TC-102-01, TC-102-16, TC-103-14 |
| Search/filter/sort state conflicts | Sorting resets filters or search unexpectedly. | TC-103-06, TC-104-07 |
| Duplicate titles cause wrong record mutation | Delete or edit affects both `Book travel` records. | TC-102-13 |
| Optional due date breaks sorting/list display | Undated tasks render as invalid dates or sort inconsistently. | TC-101-06, TC-104-05 |
| Unsafe input reaches list/search views | HTML/script-like input is accepted and later rendered unsafely. | TC-101-13, TC-101-14, TC-103-09 |
| Duplicate create from repeated save | Slow network or double click creates two identical tasks. | TC-101-15 |

## Automation Approach

I would automate at three levels once implementation details exist:

| Layer | Coverage | Tooling | Why |
| --- | --- | --- | --- |
| Unit/component | Form validation, default values, filter predicates, priority/date comparators. | App's native test framework. | Fast feedback on logic and edge cases, especially whitespace titles, search matching, and priority rank. |
| API contract | `/tasks` list/filter/sort query behaviour and response shape. | Playwright API tests or Supertest depending on stack. | The appendix gives API context for TASK-103/104 and these checks are stable and cheap. |
| UI E2E smoke | Load-bearing user workflows for create, edit, delete, filter/search, and sort. | Playwright. | Proves the real user journey across UI and backend. Keep this small to avoid brittle coverage. |

Automation included in this repository:

- [../tests/task-management.api.spec.ts](../tests/task-management.api.spec.ts) sketches API contract coverage for TASK-103 and TASK-104.
- It is gated by `API_BASE_URL` because no live app/API was provided.
- It marks the search case as `fixme` because the ticket requires a search box but the API reference omits a search query parameter.
- It assumes seeded data with multiple statuses, priorities, and due dates so filter/sort tests prove inclusion and exclusion.

Run command once an implementation exists:

```bash
API_BASE_URL=http://localhost:3000 npm run test:api
```

Example future UI smoke tests I would add once selectors/routes exist:

| Candidate E2E test | Why it belongs in E2E |
| --- | --- |
| Create title-only task and verify To Do/Medium defaults in list. | Covers form, API, rendering, and list update together. |
| Edit multiple fields, verify the list, then delete the same task and verify it is gone from filtered/searched views. | Covers the full TASK-102 promise plus a high-risk regression point. |
| Delete one of two duplicate-title tasks and verify only the selected task disappears. | Protects against ID/key mistakes. |
| Search/filter/sort combined flow. | Validates the state-management behaviour users rely on most. |
| Priority sort uses High, Medium, Low rather than alphabetical order. | Catches a likely implementation shortcut. |

## Defect Reporting Expectations

If testing found issues, I would report defects with:

- Ticket and acceptance criterion impacted.
- Environment/version/build.
- Minimal reproducible steps and test data.
- Expected vs actual result.
- Screenshots/video/trace for UI issues, request/response for API issues.
- Severity based on user impact and workaround.

Example severity guide:

| Severity | Example |
| --- | --- |
| Critical | Users cannot create tasks at all. |
| High | Deleted tasks reappear or wrong task is deleted. |
| Medium | Search is case-sensitive when product expected case-insensitive. |
| Low | Sort indicator is unclear but order is correct. |

## Interview Discussion Notes

Decisions and trade-offs I would be ready to discuss:

- I made the load-bearing tests explicit so the release-critical checks are visible.
- I added priority labels so the plan can be executed realistically under time pressure rather than treated as one large checklist.
- I did not turn every input permutation into a separate manual P0/P1 test; I grouped lower-risk permutations into boundary/exploratory coverage and would push them into unit/API automation where possible.
- I treated the API search omission as a real documentation/ticket gap, not as a blocker to testing the UI search requirement.
- I assumed AND semantics for combined filter/search behaviour because it is the least surprising behaviour for this product, but I would confirm it.
- I kept API expectations careful because the appendix only documents `GET /tasks`; create/update/delete API validation belongs in scope only if those mutation endpoints exist.
- I would keep E2E automation small and focused, then cover validation and sorting/filter predicates lower in the test pyramid.
