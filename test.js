const assert = require('assert');
const { isGhostRecurring, isLogbookContamination, isDuplicatedInToday, getWeekMonday, focusIsStale, updateStalenessTracking, getDaysInColumn } = require('./lib.js');

// ── localStorage mock (Node doesn't have it; lib.js functions use it at call time) ──
const _lsStore = {};
if (typeof localStorage === 'undefined') {
  global.localStorage = {
    getItem:    k     => Object.prototype.hasOwnProperty.call(_lsStore, k) ? _lsStore[k] : null,
    setItem:    (k,v) => { _lsStore[k] = String(v); },
    removeItem: k     => { delete _lsStore[k]; },
  };
}
function clearLs() { for (const k of Object.keys(_lsStore)) delete _lsStore[k]; }

let pass = 0, fail = 0;
function test(name, fn) {
  try { fn(); console.log(`  ✓  ${name}`); pass++; }
  catch (e) { console.error(`  ✗  ${name}\n     ${e.message}`); fail++; }
}

// ── isGhostRecurring ─────────────────────────────────────────────────────────
console.log('\nisGhostRecurring');

test('filters: start=Someday, modified=null, no start_date, col=today', () => {
  assert.strictEqual(isGhostRecurring({ start: 'Someday', modified: null, start_date: null }, 'today'), true);
});
test('keeps: has start_date (intentionally scheduled Someday task)', () => {
  assert.strictEqual(isGhostRecurring({ start: 'Someday', modified: null, start_date: '2026-05-20' }, 'today'), false);
});
test('keeps: task has been modified', () => {
  assert.strictEqual(isGhostRecurring({ start: 'Someday', modified: '2026-05-01', start_date: null }, 'today'), false);
});
test('keeps: col is not today', () => {
  assert.strictEqual(isGhostRecurring({ start: 'Someday', modified: null, start_date: null }, 'anytime'), false);
});
test('keeps: start is not Someday', () => {
  assert.strictEqual(isGhostRecurring({ start: 'Anytime', modified: null, start_date: null }, 'today'), false);
});
test('keeps: start=Someday but undefined start_date field (not null)', () => {
  assert.strictEqual(isGhostRecurring({ start: 'Someday', modified: null }, 'today'), true);
});

// ── isLogbookContamination ───────────────────────────────────────────────────
console.log('\nisLogbookContamination');

test('filters: uuid is in logbook', () => {
  assert.strictEqual(isLogbookContamination({ uuid: 'abc' }, new Set(['abc', 'def'])), true);
});
test('keeps: uuid not in logbook', () => {
  assert.strictEqual(isLogbookContamination({ uuid: 'xyz' }, new Set(['abc', 'def'])), false);
});
test('keeps: logbook is empty', () => {
  assert.strictEqual(isLogbookContamination({ uuid: 'abc' }, new Set()), false);
});

// ── isDuplicatedInToday ──────────────────────────────────────────────────────
console.log('\nisDuplicatedInToday');

test('filters: anytime task already in todayUuids', () => {
  assert.strictEqual(isDuplicatedInToday({ uuid: 'abc' }, 'anytime', new Set(['abc'])), true);
});
test('filters: someday task already in todayUuids', () => {
  assert.strictEqual(isDuplicatedInToday({ uuid: 'abc' }, 'someday', new Set(['abc'])), true);
});
test('keeps: today col is never filtered (today owns its tasks)', () => {
  assert.strictEqual(isDuplicatedInToday({ uuid: 'abc' }, 'today', new Set(['abc'])), false);
});
test('keeps: uuid not in todayUuids', () => {
  assert.strictEqual(isDuplicatedInToday({ uuid: 'xyz' }, 'anytime', new Set(['abc'])), false);
});

// ── getWeekMonday ─────────────────────────────────────────────────────────────
console.log('\ngetWeekMonday');

test('Monday returns itself', () => {
  assert.strictEqual(getWeekMonday(new Date(2026, 4, 25)), '2026-05-25');
});
test('Wednesday returns Monday of same ISO week', () => {
  assert.strictEqual(getWeekMonday(new Date(2026, 4, 27)), '2026-05-25');
});
test('Sunday returns Monday of same ISO week (not next week)', () => {
  assert.strictEqual(getWeekMonday(new Date(2026, 4, 31)), '2026-05-25');
});
test('Saturday returns Monday of same ISO week', () => {
  assert.strictEqual(getWeekMonday(new Date(2026, 4, 30)), '2026-05-25');
});

// ── focusIsStale ──────────────────────────────────────────────────────────────
console.log('\nfocusIsStale');

test('stale: stored is null', () => {
  assert.strictEqual(focusIsStale(null), true);
});
test('stale: stored has no weekOf field', () => {
  assert.strictEqual(focusIsStale({}), true);
});
test('stale: weekOf is a past week', () => {
  assert.strictEqual(focusIsStale({ weekOf: '2020-01-06' }), true);
});
test('fresh: weekOf matches current week Monday', () => {
  assert.strictEqual(focusIsStale({ weekOf: getWeekMonday(new Date()) }), false);
});
test('fresh: extra fields alongside weekOf do not affect result', () => {
  assert.strictEqual(focusIsStale({ weekOf: getWeekMonday(new Date()), projects: ['abc'] }), false);
});

// ── updateStalenessTracking ──────────────────────────────────────────────────
console.log('\nupdateStalenessTracking');

test('stamps new task with current time and correct column', () => {
  clearLs();
  const before = Date.now();
  updateStalenessTracking({ today: [{ uuid: 'a', type: 'to-do' }], inbox: [], anytime: [], someday: [] });
  const stored = JSON.parse(localStorage.getItem('taskFirstSeen'));
  assert.ok(stored['a'], 'task should be tracked');
  assert.strictEqual(stored['a'].column, 'today');
  assert.ok(stored['a'].firstSeen >= before);
});

test('does not re-stamp task that stays in same column', () => {
  clearLs();
  const t0 = Date.now() - 5000;
  localStorage.setItem('taskFirstSeen', JSON.stringify({ a: { column: 'today', firstSeen: t0 } }));
  updateStalenessTracking({ today: [{ uuid: 'a', type: 'to-do' }], inbox: [], anytime: [], someday: [] });
  const stored = JSON.parse(localStorage.getItem('taskFirstSeen'));
  assert.strictEqual(stored['a'].firstSeen, t0, 'firstSeen should be unchanged');
});

test('re-stamps task that moves to a different column', () => {
  clearLs();
  const t0 = Date.now() - 5000;
  const before = Date.now();
  localStorage.setItem('taskFirstSeen', JSON.stringify({ a: { column: 'today', firstSeen: t0 } }));
  updateStalenessTracking({ anytime: [{ uuid: 'a', type: 'to-do' }], inbox: [], today: [], someday: [] });
  const stored = JSON.parse(localStorage.getItem('taskFirstSeen'));
  assert.strictEqual(stored['a'].column, 'next');
  assert.ok(stored['a'].firstSeen >= before, 'firstSeen should reset on column change');
});

test('prunes task that disappears from all columns', () => {
  clearLs();
  localStorage.setItem('taskFirstSeen', JSON.stringify({ gone: { column: 'today', firstSeen: Date.now() - 1000 } }));
  updateStalenessTracking({ today: [], inbox: [], anytime: [], someday: [] });
  const stored = JSON.parse(localStorage.getItem('taskFirstSeen'));
  assert.ok(!stored['gone'], 'completed/deleted task should be pruned');
});

test('ignores non-todo tasks (headings, projects)', () => {
  clearLs();
  updateStalenessTracking({ today: [{ uuid: 'h', type: 'heading' }], inbox: [], anytime: [], someday: [] });
  const stored = JSON.parse(localStorage.getItem('taskFirstSeen'));
  assert.ok(!stored['h'], 'heading type should not be tracked');
});

test('tracks inbox tasks with column label inbox', () => {
  clearLs();
  updateStalenessTracking({ inbox: [{ uuid: 'i', type: 'to-do' }], today: [], anytime: [], someday: [] });
  const stored = JSON.parse(localStorage.getItem('taskFirstSeen'));
  assert.strictEqual(stored['i'].column, 'inbox');
});

// ── getDaysInColumn ──────────────────────────────────────────────────────────
console.log('\ngetDaysInColumn');

test('returns 0 for unknown uuid', () => {
  clearLs();
  assert.strictEqual(getDaysInColumn('unknown'), 0);
});

test('returns correct days for a tracked task', () => {
  clearLs();
  const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
  localStorage.setItem('taskFirstSeen', JSON.stringify({ x: { column: 'today', firstSeen: threeDaysAgo } }));
  assert.strictEqual(getDaysInColumn('x'), 3);
});

// ── Result ───────────────────────────────────────────────────────────────────
console.log(`\n${pass} passed, ${fail} failed\n`);
if (fail > 0) process.exit(1);
