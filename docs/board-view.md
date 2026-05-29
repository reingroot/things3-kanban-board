# Board View

The board is the default view. It mirrors Things 3's four lists as Kanban columns and lets you reschedule tasks, assign inbox items to projects, and complete or cancel Today tasks — all written back to Things 3 in real time.

## Columns

| Column | Things 3 list | API endpoint | Internal key |
|--------|--------------|--------------|--------------|
| Inbox | Inbox | `GET /inbox` | `inbox` |
| Someday | Someday | `GET /someday` | `someday` |
| Next | Anytime / Next | `GET /anytime` | `anytime` |
| Today | Today | `GET /today` | `today` |

Each column header shows a live task count. The Inbox column count also drives the urgency system (see [inbox-urgency.md](inbox-urgency.md)).

## Cards

Each card shows:
- **Title** — the task name
- **Project · Heading** — shown in muted text below the title when set
- **Chips** — start date and deadline, colour-coded: amber = due soon, red = overdue

Cards with a `—` (separator) title render as a thin visual divider — they are empty-title to-dos used to organise the inbox without headings.

## Sidebar

The left sidebar lists every project that has at least one open task in any column. Projects are grouped by their Things 3 area. Clicking a project filters all four columns to show only that project's tasks, grouped by heading. Clicking **All** clears the filter.

- **Task count** — shown to the right of each project name; total across all columns
- **Focus dot** — a small green dot appears next to projects currently selected as your weekly focus (see [focus-view.md](focus-view.md))
- **Filter persists** — the selected project is stored in `localStorage` and restored on reload

### Assigning from Inbox

Drag an Inbox card onto a project row in the sidebar. An assignment panel slides open beneath the project name:

1. Choose a heading (or leave at top-level)
2. Choose a when-state: Someday / Next / Today
3. Click **Assign** — the task moves to the chosen project and column in Things 3

## Drag to Reschedule

Drag any card from one column and drop it on another. The board calls `PUT /todos/{uuid}` with the target `when` value and reloads 800 ms later.

| Drop target | `when` sent to API |
|-------------|-------------------|
| Someday | `someday` |
| Next | `anytime` |
| Today | `today` |

**Notes:**
- Polling is paused for 2 seconds after any drop to prevent a race condition where the next tick overwrites the optimistic UI
- Today takes priority: if a task appears in both Today and another column, only the Today entry is shown

## Verdict Panel (Today → Done / Cancel)

Drag a **Today** card toward the right edge of the screen. A panel slides in from the right with two zones:

- **✓ Done** (green, top) — sends `DELETE /todos/{uuid}` with no body; Things 3 marks it complete
- **✕ Cancel** (red, bottom) — sends `DELETE /todos/{uuid}` with `{ "action": "cancel" }`; Things 3 cancels it

The card fades and slides out on drop. The board reloads 800 ms later. Releasing the drag anywhere else cancels the action and hides the panel.

See [verdict-panel.md](verdict-panel.md) for full details.

## Data Filtering

The board silently drops three categories of noise from the API responses before rendering:

| Filter | Condition | Why |
|--------|-----------|-----|
| Ghost recurring | Today + `start=Someday` + no modification + no start date | things-api spuriously surfaces these |
| Logbook contamination | UUID in logbook set | Completed recurring instances bleed into `/today` |
| Cross-column duplicate | Non-Today task already in Today | Today always wins; prevents double rendering |

## Polling

The board re-fetches all four columns every 30 seconds (`POLL_MS = 30_000`). Polling is skipped while a drag is in flight (`dragActive = true`) and for 2 seconds after any drop (`DROP_BUFFER_MS = 2000`).

## How to filter to a single project

1. Click the project name in the sidebar
2. All four columns now show only tasks belonging to that project, grouped by heading
3. Click **All** to clear the filter

The filter is stored in `localStorage` under `selectedProject` and survives page reloads.

## How to move a task to Today

Drag the card from Someday or Next and drop it on the Today column. The card moves immediately; Things 3 reflects the change within seconds.

## How to complete or cancel a Today task

1. Start dragging the card from the Today column
2. The verdict panel slides in from the right
3. Drag the card onto **✓ Done** or **✕ Cancel** and release
4. The card disappears; the task is updated in Things 3

## How to assign an Inbox item to a project

1. Drag the card from the Inbox column
2. Drag it onto a project name in the sidebar (the row highlights)
3. An assignment panel opens below the project
4. Select a heading (optional) and a when-state
5. Click **Assign**

## Design decisions

**Why does Today deduplicate against other columns?** Things 3 can return a task in both `/today` and `/anytime` if it has `when=today` but was fetched in an overlapping time window. Showing it twice would be confusing. Today always wins.

**Why a 2-second drop buffer?** The 30-second poll runs on a fixed interval. Without the buffer, a drop at second 29 triggers an immediate re-fetch that may return the old state before Things 3 has committed the write. The buffer absorbs this race.
