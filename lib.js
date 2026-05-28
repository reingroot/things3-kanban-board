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

if (typeof module !== 'undefined') {
  module.exports = { isGhostRecurring, isLogbookContamination, isDuplicatedInToday, getWeekMonday, focusIsStale };
}
