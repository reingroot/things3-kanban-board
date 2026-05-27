const assert = require('assert');
const { isGhostRecurring, isLogbookContamination, isDuplicatedInToday } = require('./lib.js');

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

// ── Result ───────────────────────────────────────────────────────────────────
console.log(`\n${pass} passed, ${fail} failed\n`);
if (fail > 0) process.exit(1);
