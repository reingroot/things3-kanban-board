# Review View (Inbox Triage)

The Review tab opens an Inbox Triage board — a dedicated session for processing everything in your inbox. It shows your current inbox items and lets you drag them to Someday, Next, or Today, firing the API immediately on each move.

Activate via the **Review** tab in the header.

## Review Badge

The Review tab shows a badge that signals whether a review is overdue:

- **Red dot** — no review in the past 7 days (or never reviewed)
- **Green dot** — reviewed within the last 7 days

The badge is updated each time you leave the Review view (clicking **Done** or switching tabs). The timestamp is stored in `localStorage` under `lastReviewTimestamp`.

## Triage Board Layout

The triage board has four columns:

| Column | Purpose |
|--------|---------|
| **Inbox** | Seeded from your current Things 3 inbox on view open |
| **Someday** | Drop here to defer; calls `PUT /todos/{uuid}` with `when: "someday"` |
| **Next** | Drop here to activate; calls `PUT /todos/{uuid}` with `when: "anytime"` |
| **Today** | Drop here to schedule today; calls `PUT /todos/{uuid}` with `when: "today"` |

Dropping a card on Someday, Next, or Today is **immediately written to Things 3** — no confirmation step.

Moving a card back to the Inbox column does not call the API (inbox has no `when` state in Things 3).

## State Reset

The triage board is **transient** — it resets every time you open the Review tab. The inbox column is re-seeded from the live Things 3 inbox at that moment. Any items you moved to Someday/Next/Today in a previous session are already gone from the inbox; they won't reappear.

The Someday, Next, and Today columns always start empty.

## Project Chip

Cards on non-Inbox columns that have no project assigned show a **+ project** chip on hover. Clicking it opens a two-panel project picker:

- **Left panel** — list of projects, searchable; hover to preview headings
- **Right panel** — headings for the hovered project; click to assign

On assignment, the card's metadata updates to show the project and heading. The chip disappears. The assignment is written to Things 3 via `PUT /todos/{uuid}` with `list_id` and optionally `heading_id`.

## How to run an inbox triage

1. Click the **Review** tab
2. Your current inbox items appear in the Inbox column
3. For each card, drag it to the appropriate column:
   - **Someday** — not actionable now, but worth keeping
   - **Next** — actionable but not urgent
   - **Today** — needs to happen today
   - Leave in **Inbox** if you want to decide later (no API call)
4. Optionally assign a project to unassigned cards using the **+ project** chip
5. Click **Done** when finished — the review badge turns green

## How to assign a project during triage

1. Move the card out of Inbox first (drag to Someday, Next, or Today)
2. Hover the card — a **+ project** chip appears on the right
3. Click the chip to open the project picker
4. Type to search, hover a project to see its headings
5. Click a heading (or "— Top of project" for no heading) to assign
6. The card updates immediately; the chip disappears

## Design decisions

**Why does the state reset on every visit?** The triage board represents a point-in-time snapshot of your inbox. Persisting state between sessions would show stale data — items already processed would appear to still be in the inbox column. A fresh start each time ensures you're always working from the real current state.

**Why no verdict panel in Review?** The triage board is for routing, not completion. Completing tasks during triage is out of scope — use the Board or Focus view's Today column for that. Keeping the two actions separate avoids accidental deletions during a triage session where you're quickly moving many cards.

**Why does moving back to Inbox not call the API?** Things 3 has no "move to inbox without a project" API call that cleanly un-schedules a task. If the task already has a project, moving it back to inbox would be ambiguous. The in-session Inbox column is a staging area, not a target state.
