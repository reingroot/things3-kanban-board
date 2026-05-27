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

if (typeof module !== 'undefined') {
  module.exports = { isGhostRecurring, isLogbookContamination, isDuplicatedInToday };
}
