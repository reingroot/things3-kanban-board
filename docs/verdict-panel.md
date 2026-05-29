# Verdict Panel

The verdict panel lets you complete or cancel a Today task by dragging it to the right edge of the Today column.

## How to use

1. Start dragging any card in the **Today** column.
2. Drag toward the right edge of the column — a panel slides in from the right with two zones:
   - **Done** (green, top half) — marks the task complete in Things 3
   - **Cancel** (red, bottom half) — cancels the task in Things 3
3. Hover over the target zone — it highlights and the other zone dims.
4. Release the card over the zone.

The card disappears immediately and Things 3 updates within seconds.

To abort, drag back into the column body and release, or press Escape before releasing.

## What "complete" and "cancel" mean in Things 3

- **Complete** (`status=completed`): the task moves to the Logbook. It counts toward your completion velocity in the GTD Briefing.
- **Cancel** (`status=cancelled`): the task is removed without counting as done. Use this for tasks you have decided not to do.

## Implementation details

The verdict panel is a 90px-wide `<div>` positioned absolutely at the right edge of the Today column (`position: absolute; right: 0`). It is hidden by default (`transform: translateX(90px)`) and slides in when a drag starts (`transform: translateX(0)`), using a 180ms ease-out transition.

The HTML5 `dragstart` event on any Today card triggers `showVerdictPanel()`. The `dragend` event (fired whether or not a drop occurred) calls `hideVerdictPanel()`, ensuring the panel always closes when the drag ends.

Drop commits call `PUT /todos/{id}` with `status=completed` or `status=cancelled`. The card is removed from the DOM optimistically before the response arrives.

## Why only Today cards

Cards in Someday and Next are not yet scheduled for action — completing them from the board would be premature. The verdict pattern is intentionally restricted to Today, matching Things 3's own convention that the Today list is your committed work for the day.
