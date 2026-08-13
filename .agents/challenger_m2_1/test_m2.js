import { formatDateDDMMYYYY, isWithinSixMonths } from '../../src/utils/dateUtils.js';

console.log("=== TESTING formatDateDDMMYYYY ===");

const formatDateTests = [
  { input: null, expected: '' },
  { input: undefined, expected: '' },
  { input: '', expected: '' },
  { input: '   ', expected: '' },
  { input: 0, expected: '' },
  { input: false, expected: '' },
  { input: '2026-08-25', expected: '25-08-2026' },
  { input: '25/08/2026', expected: '25-08-2026' },
  { input: '25-08-2026', expected: '25-08-2026' },
  { input: '2026/08/25', expected: '25-08-2026' },
  { input: '2026-08', expected: '01-08-2026' },
  { input: '2026-08-25T00:00:00.000Z', expected: '25-08-2026' },
  { input: '2026-08-25T14:30:00.000Z', expected: '25-08-2026' },
  { input: new Date(2026, 7, 25), expected: '25-08-2026' },
  { input: new Date('Invalid Date'), expected: '' },
  { input: 'invalid-date-string', expected: 'invalid-date-string' },
  { input: '99-99-9999', expected: '99-99-9999' },
  { input: '31/02/2026', expected: '31-02-2026' },
];

let passCount = 0;
let failCount = 0;

for (const t of formatDateTests) {
  const result = formatDateDDMMYYYY(t.input);
  const pass = result === t.expected;
  if (pass) {
    passCount++;
  } else {
    failCount++;
    console.log(`[FAIL] formatDateDDMMYYYY(${JSON.stringify(t.input)}): expected "${t.expected}", got "${result}"`);
  }
}
console.log(`formatDateDDMMYYYY results: ${passCount} passed, ${failCount} failed.`);

console.log("\n=== TESTING isWithinSixMonths ===");

// Assume Today is 2026-08-13
const today = new Date();
console.log("Current test run date:", today.toISOString().split('T')[0]);

// Calculate cutoff for comparison
const expectedCutoff = new Date(today.getFullYear(), today.getMonth() + 6, today.getDate());
console.log("Calculated 6-month cutoff date:", expectedCutoff.toISOString().split('T')[0]);

const expiryTests = [
  { input: null, expected: false },
  { input: undefined, expected: false },
  { input: '', expected: false },
  // Past date (expired) -> should be true
  { input: '2025-12-31', expected: true },
  { input: '2026-01-01', expected: true },
  { input: '2026-08-12', expected: true },
  // Today -> should be true
  { input: today.toISOString().split('T')[0], expected: true },
  // 1 month from now -> should be true
  { input: new Date(today.getFullYear(), today.getMonth() + 1, today.getDate()).toISOString().split('T')[0], expected: true },
  // 5 months from now -> should be true
  { input: new Date(today.getFullYear(), today.getMonth() + 5, today.getDate()).toISOString().split('T')[0], expected: true },
  // Exactly cutoff date -> should be true
  { input: expectedCutoff.toISOString().split('T')[0], expected: true },
  // Day after cutoff -> should be false
  { input: new Date(expectedCutoff.getTime() + 86400000 * 2).toISOString().split('T')[0], expected: false },
  // 1 year from now -> should be false
  { input: new Date(today.getFullYear() + 1, today.getMonth(), today.getDate()).toISOString().split('T')[0], expected: false },
  // Formats test (using a date > 6 months, e.g. 2028-12-31)
  { input: '2028-12-31', expected: false },
  { input: '31-12-2028', expected: false },
  { input: '31/12/2028', expected: false },
  { input: new Date(2028, 11, 31), expected: false },
  // Formats test (using a date <= 6 months, e.g. 2026-09-15)
  { input: '2026-09-15', expected: true },
  { input: '15-09-2026', expected: true },
  { input: '15/09/2026', expected: true },
];

let expPass = 0;
let expFail = 0;

for (const t of expiryTests) {
  const result = isWithinSixMonths(t.input);
  const pass = result === t.expected;
  if (pass) {
    expPass++;
  } else {
    expFail++;
    console.log(`[FAIL] isWithinSixMonths(${JSON.stringify(t.input)}): expected ${t.expected}, got ${result}`);
  }
}
console.log(`isWithinSixMonths results: ${expPass} passed, ${expFail} failed.`);
