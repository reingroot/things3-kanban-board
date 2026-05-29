// Pure data-transform helpers — browser and Node compatible.
// Used by index.html (via <script src>) and test.js (via require).

// Returns true when a Today task is a ghost recurring instance that things-api
// surfaces spuriously: start=Someday, no modification, no explicit start_date.
function isGhostRecurring(task, col) {
  return col === 'today' &&
    task.start === 'Someday' &&
    task.modified === null &&
    !task.start_date;
}

// Returns true when a task's uuid appears in the logbook set.
// things-api bug: completed recurring instances bleed into /today.
function isLogbookContamination(task, logbookUuids) {
  return logbookUuids.has(task.uuid);
}

// Returns true when a non-Today column contains a task already in Today.
// Today always wins to prevent cross-column duplicates.
function isDuplicatedInToday(task, col, todayUuids) {
  return col !== 'today' && todayUuids.has(task.uuid);
}

// Returns the ISO date string (YYYY-MM-DD) of the Monday starting the ISO week
// that contains `date`. getDay() returns 0 for Sunday, so (day || 7) maps
// Sunday → 7 so the arithmetic lands on the correct Monday.
function getWeekMonday(date) {
  const d = new Date(date);
  d.setDate(d.getDate() - (d.getDay() || 7) + 1);
  d.setHours(0, 0, 0, 0);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Returns true when the stored focus state belongs to a different ISO week
// than today, or when there is no stored state at all.
function focusIsStale(stored) {
  if (!stored || !stored.weekOf) return true;
  return stored.weekOf !== getWeekMonday(new Date());
}

// Stamps first-seen timestamps for all to-do tasks across all columns.
// Column changes reset the timestamp so staleness counts from the move.
// Called on every renderAll() tick with the raw API response object.
function updateStalenessTracking(colData) {
  const stored = JSON.parse(localStorage.getItem('taskFirstSeen') || '{}');
  const now = Date.now();
  const colMap = { inbox: 'inbox', today: 'today', anytime: 'next', someday: 'someday' };
  const allSeen = new Set();

  for (const [apiKey, label] of Object.entries(colMap)) {
    for (const task of (colData[apiKey] || [])) {
      if (task.type !== 'to-do') continue;
      allSeen.add(task.uuid);
      if (!stored[task.uuid] || stored[task.uuid].column !== label) {
        stored[task.uuid] = { column: label, firstSeen: now };
      }
    }
  }

  for (const uuid of Object.keys(stored)) {
    if (!allSeen.has(uuid)) delete stored[uuid];
  }

  localStorage.setItem('taskFirstSeen', JSON.stringify(stored));
}

// Returns days a task has been in its current column.
// Accepts an optional pre-parsed firstSeen object to avoid repeated JSON.parse per card.
function getDaysInColumn(uuid, firstSeen) {
  const stored = firstSeen || JSON.parse(localStorage.getItem('taskFirstSeen') || '{}');
  if (!stored[uuid]) return 0;
  return Math.floor((Date.now() - stored[uuid].firstSeen) / (1000 * 60 * 60 * 24));
}

if (typeof module !== 'undefined') {
  module.exports = { isGhostRecurring, isLogbookContamination, isDuplicatedInToday, getWeekMonday, focusIsStale, updateStalenessTracking, getDaysInColumn };
}
