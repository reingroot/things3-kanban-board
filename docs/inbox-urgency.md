# Inbox Urgency

The Inbox column uses a compound visual system to signal how much attention the inbox needs. As the item count grows, multiple visual properties change simultaneously — no single signal is relied on alone.

## The four tiers

| Tier | Item count | Badge label | Indicator dot | Count colour |
|---|---|---|---|---|
| Quiet | 0–2 | quiet | Dark grey `#3a3a3c` | Dark grey |
| Filling | 3–5 | unprocessed | Mid grey `#636366` | Mid grey |
| Heavy | 6–9 | filling up | Amber `#ff9f0a` | Amber |
| Full | 10+ | needs attention | Red `#ff453a` | Red |

## Compound signals

Each tier changes five properties at once:

**Width** — the column grows wider as the inbox fills (140px → 190px → 230px → 270px). A wide inbox takes up more visual real-estate, making it hard to ignore.

**Depth** — at Quiet, the inbox sits visually "behind" the main columns: it is shifted down 12px and dimmed to 80% brightness. As the inbox fills, it rises up to the same plane as the other columns (0px shift, 100% brightness). The spatial metaphor is that unprocessed items are in a tray below the work surface; a full inbox has spilled up onto it.

**Indicator dot** — the small circle in the column header changes from dark grey (Quiet) through amber (Heavy) to red (Full), matching the conventional traffic-light scale.

**Count badge** — the item count grows in font size and weight (11px/600 → 14px/700) and changes colour to match the indicator dot. A large red number at Full is hard to miss.

**Badge label** — the small "unprocessed" tag in the header changes its text: quiet / unprocessed / filling up / needs attention.

## Why compound signals

A single signal (width alone, or colour alone) is easy to habituate to — you stop seeing it. Changing five properties together means the inbox looks qualitatively different at each tier, not just quantitatively. The depth inversion is the most spatially distinctive: the inbox at Full looks like it is on the same layer as your work, not tucked behind it.

## CSS transitions

All property changes animate over `400ms cubic-bezier(0.25, 0, 0, 1)`. The easing is fast-out-slow-end, which makes the growth feel purposeful rather than mechanical.

## Configuration

The tier thresholds and visual values are defined in `INBOX_URGENCY` in `index.html`:

```js
const INBOX_URGENCY = [
  { max: 2,        width: '140px', brightness: 0.80, ty: '12px', dot: '#3a3a3c', ... badge: 'quiet'           },
  { max: 5,        width: '190px', brightness: 0.88, ty: '8px',  dot: '#636366', ... badge: 'unprocessed'     },
  { max: 9,        width: '230px', brightness: 0.95, ty: '4px',  dot: '#ff9f0a', ... badge: 'filling up'      },
  { max: Infinity, width: '270px', brightness: 1.00, ty: '0px',  dot: '#ff453a', ... badge: 'needs attention' },
];
```

To change thresholds, update the `max` values. To change colours or sizes, update the corresponding properties in each tier object.
