# Architecture

## Stack

```
Browser (localhost:8080)
    │
    │  HTTP GET /today, /inbox, /anytime, /someday
    │  HTTP PUT /todos/{id}
    ▼
server.py (Python, localhost:8080)
    │  Injects Authorization: Bearer <token>
    │  Serves index.html, lib.js
    │
    │  Proxies to →
    ▼
things-api (localhost:5225)
    │  GET endpoints: reads Things 3 SQLite directly
    │  PUT /todos/{id}: executes things:/// URL scheme
    ▼
Things 3 (macOS native app)
    ├── SQLite database (~/.local/share/com.culturedcode.ThingsMac/)
    └── URL scheme handler (things:///update?...)
```

## Data flow

### Reading tasks

things-api reads the Things 3 SQLite database directly. This means reads are fast and do not require Things 3 to be the active window — the database is always accessible on disk.

### Writing tasks

Writes use the Things 3 URL scheme (`things:///update?id=...&when=...`). things-api constructs the URL and triggers it via `open`. Things 3 processes the URL and updates its own database, then signals the change. The board polls every 30 seconds; a successful drag-and-drop also triggers an immediate re-fetch.

## Authentication

things-api requires a bearer token that is stored in `~/.config/things-api/config`. The browser never sees this token. server.py reads it at startup and injects it as an `Authorization` header on every proxied request.

This means the board works over a plain HTTP connection in the browser without exposing the token in browser network logs or localStorage.

## Column → Things 3 state mapping

| Board column | Things 3 state | things-api endpoint |
|---|---|---|
| Inbox | Inbox (no project, no when) | `GET /inbox` |
| Someday | Someday | `GET /someday` |
| Next | Anytime | `GET /anytime` |
| Today | Today | `GET /today` |

"Anytime" is Things 3's internal name for what the UI calls "Next". The board relabels it.

## Inbox write restriction

The Things 3 URL scheme does not support `when=inbox`. There is no way to move a task back to the Inbox via the URL scheme. As a result, the Inbox column rejects all incoming drops — the browser shows a forbidden cursor when dragging over it. This is a deliberate design decision, not a missing feature.

## Data deduplication

`lib.js` exports five helpers used by both the browser and `test.js`:

| Function | Purpose |
|---|---|
| `isGhostRecurring(task)` | Filters out recurring task placeholders that have no real content |
| `isLogbookContamination(task)` | Filters completed tasks that briefly appear in non-logbook endpoints |
| `isDuplicatedInToday(task, todayIds)` | Today always wins; this removes a task from other columns if it is also in Today |
| `getWeekMonday(date)` | Returns the ISO Monday for any date — used to detect week boundaries |
| `focusIsStale(storedMonday)` | Returns true if the stored focus week is not the current ISO week |

`isDuplicatedInToday` is the most important: without it, a task scheduled for Today would appear in both the Next/Someday column (where the API also returns it) and the Today column simultaneously.

## Optimistic UI

When a card is dropped on a verdict zone or a column, the card is removed or repositioned immediately in the DOM. The `PUT` request fires asynchronously. If the request fails, the next 30-second poll will re-render the board from source-of-truth data, correcting the optimistic state.
