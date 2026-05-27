# Changelog

## 2026-05-26 — v1.0

### Features
- **Kanban board** — four-column board (Inbox, Someday, Next, Today) synced live from Things 3
- **Drag between columns** — move a task to Someday, Next, or Today via drag-and-drop; Things 3 updates within seconds via `PUT /todos/{id}`
- **Sidebar project filter** — click any project to focus the board on that project; selection persists across reloads via localStorage
- **Inbox column** — shows Things 3 Inbox items; separators rendered for empty-title tasks used as visual dividers
- **Inbox-to-project assignment** — drag an Inbox card onto a sidebar project to assign project, heading, and when-state; confirmed via toast
- **GTD Morning Briefing** — overlay showing inbox depth, today load, overdue deadlines, stalled projects, and completion velocity; auto-shows on load, dismissed until next calendar day, reopenable via header button
- **Card chips** — start date and deadline shown as colour-coded chips (amber = due soon, red = overdue)

### Infrastructure
- `server.py` proxy — serves the board on port 8080 and proxies all API calls (including Bearer auth) to things-api on port 5225; no browser CORS issues
- `lib.js` — pure data-transform functions (`isGhostRecurring`, `isLogbookContamination`, `isDuplicatedInToday`) shared between the app and the test suite

### Fixes
- Ghost recurring filter: only filters Someday tasks with no `start_date` — intentionally scheduled tasks are kept
- Logbook contamination: completed recurring instances that bleed into `/today` are removed
- Deduplication: tasks in multiple columns are deduplicated, Today takes priority
- Area-less todos routed to Inbox; unresolvable-heading todos grouped by heading title
