# Focus View

Focus mode narrows the board to one or two projects for the current week. Instead of seeing all tasks across all projects, you see swimlanes — one per chosen project — each with a Next column and a Today column.

Activate via the **Focus** tab in the header.

## Weekly Focus Selection

When you open Focus for the first time each week (or after clearing a previous selection), a project picker appears:

- Two search boxes, one per focus slot (you can choose 1 or 2 projects)
- Type to filter; click a project name to select it
- At least one project must be selected before the **Start Focus** button enables
- Click **Start Focus** to save the selection and enter swimlane view

The selection is stored in `localStorage` under `focusState`:

```json
{
  "weekOf": "2026-05-25",
  "projects": ["uuid-1", "uuid-2"]
}
```

`weekOf` is the ISO Monday of the current week (`YYYY-MM-DD`). If `weekOf` doesn't match the current week's Monday, the selection is considered stale and discarded — the picker reappears.

## Swimlanes

Each selected project renders as a horizontal swimlane with:

- **Project header** — project name and total open task count (Next + Today combined)
- **Next column** — tasks in the Anytime/Next state for that project
- **Today column** — tasks in the Today state for that project

Tasks within each column are flat (not grouped by heading). Only `to-do` type items are shown; project and heading items are excluded.

## Verdict Panel

Dragging a **Today** card within a Focus swimlane reveals the same verdict panel as the Board view — slides in from the right with **✓ Done** and **✕ Cancel** zones. Releasing on a zone calls `DELETE /todos/{uuid}` and removes the card.

Dragging a **Next** card does not trigger the verdict panel — you can only move it to Today by dropping it on the Today column within the same swimlane, which calls `PUT /todos/{uuid}` with `when: "today"`.

## Focus Banner

When a valid (non-stale) focus selection exists, a banner appears at the top of every view:

> Weekly focus: Project A & Project B

Clicking **Change** opens the focus picker while keeping the current selection visible.

## State and Persistence

| Key | Storage | Contents |
|-----|---------|----------|
| `focusState` | `localStorage` | `{ weekOf, projects: [uuid, ...] }` |

The selection is automatically cleared when the week changes (detected on load and on each `setView` call). There is no manual "clear focus" button — it resets naturally on Monday.

## How to set your weekly focus

1. Click the **Focus** tab
2. If no focus is set (or the previous week's selection expired), the picker appears
3. Type a project name in one or both search boxes and click to select
4. Click **Start Focus**
5. Your swimlanes appear immediately

## How to change your focus mid-week

1. Click **Change** in the focus banner (visible in any view when focus is active)  
   — or switch to the Focus tab and the picker will appear if swimlanes are already shown
2. Update the project selection
3. Click **Start Focus** again

## How to move a Next task to Today in Focus

Drag the card from the Next column and drop it on the Today column within the same swimlane. The card moves immediately; Things 3 reflects the change within seconds.

## How to complete a Today task in Focus

1. Start dragging the card from the Today column in any swimlane
2. The verdict panel slides in from the right
3. Drop on **✓ Done** to complete, or **✕ Cancel** to cancel
4. The card disappears; Things 3 is updated

## Design decisions

**Why only Next and Today, not Someday?** Someday tasks are intentionally parked — they are not actionable this week. Focus mode is about execution, not planning. Showing Someday would add noise and undermine the purpose of the view.

**Why per-ISO-week, not per-day?** A weekly rhythm fits GTD's weekly review cycle. Resetting daily would require choosing focus every morning; resetting weekly gives a stable north star for the whole week and pairs naturally with a Sunday/Monday review habit.

**Why up to 2 projects?** Two is enough to hold a primary focus and a secondary one (e.g., a day job project and a side project). More than two tends to mean "no real focus." The constraint is intentional.
