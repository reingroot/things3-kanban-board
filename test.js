const assert = require('assert');
const { isGhostRecurring, isLogbookContamination, isDuplicatedInToday, getWeekMonday, focusIsStale } = require('./lib.js');

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

// ── Result ───────────────────────────────────────────────────────────────────
console.log(`\n${pass} passed, ${fail} failed\n`);
if (fail > 0) process.exit(1);
