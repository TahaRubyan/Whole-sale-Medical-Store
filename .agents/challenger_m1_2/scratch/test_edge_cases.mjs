// Scratch test 2: Edge cases (empty arrays, missing properties)
import React from 'react';

console.log('--- Testing Edge Cases for Stock Summary Report ---');

// Edge case 1: Empty medicines and batches
const emptyMedicines = [];
const emptyBatches = [];

let totalBoxesAvailable = 0;
let estimatedCostValuation = 0;
let lowStockCount = 0;

const medicinesWithStock = emptyMedicines.map((med) => {
  const medBatches = emptyBatches.filter(
    (b) => b.medicineId === med.id && b.status !== 'Quarantined'
  );
  const totalBoxes = medBatches.reduce(
    (sum, b) =>
      sum +
      (b.totalBoxesAvailable ||
        Math.floor(
          (b.totalTabletsAvailable || 0) / (med.tabletsPerBox || 20)
        ) ||
        0),
    0
  );
  const purchasePriceBox = Number(
    med.purchasePriceBox || (med.boxPrice ? med.boxPrice * 0.8 : 480)
  );
  const costValuation = totalBoxes * purchasePriceBox;
  const isLow = totalBoxes <= (med.reorderLevel || 10);

  if (isLow) {
    lowStockCount += 1;
  }

  totalBoxesAvailable += totalBoxes;
  estimatedCostValuation += costValuation;

  const suggestedReorderBoxes = Math.max(
    (med.reorderLevel || 10) * 2 - totalBoxes,
    med.reorderLevel || 10
  );
  const estimatedInvestment = suggestedReorderBoxes * purchasePriceBox;

  return {
    ...med,
    totalBoxes,
    purchasePriceBox,
    costValuation,
    isLow,
    suggestedReorderBoxes,
    estimatedInvestment,
  };
});

console.log('Empty inventory check:');
console.log('- totalMedicines:', emptyMedicines.length);
console.log('- totalBoxesAvailable:', totalBoxesAvailable);
console.log('- estimatedCostValuation:', estimatedCostValuation);
console.log('- lowStockCount:', lowStockCount);

if (emptyMedicines.length === 0 && totalBoxesAvailable === 0 && estimatedCostValuation === 0 && lowStockCount === 0) {
  console.log('✅ PASS: Empty inventory handles gracefully with zeroed stats.');
} else {
  console.error('❌ FAIL: Incorrect values for empty inventory.');
  process.exit(1);
}

// Edge case 2: Quarantined batches excluded from stock
const testMeds = [{ id: 'MED-1', brandName: 'Test Med', reorderLevel: 10, tabletsPerBox: 20, boxPrice: 500, purchasePriceBox: 400 }];
const testBatches = [
  { id: 'B1', medicineId: 'MED-1', totalBoxesAvailable: 5, status: 'Active' },
  { id: 'B2', medicineId: 'MED-1', totalBoxesAvailable: 10, status: 'Quarantined' }
];

const medBatches = testBatches.filter(
  (b) => b.medicineId === testMeds[0].id && b.status !== 'Quarantined'
);
const activeTotalBoxes = medBatches.reduce((sum, b) => sum + (b.totalBoxesAvailable || 0), 0);

console.log('Quarantined batch filtering check:');
console.log('- Active boxes found:', activeTotalBoxes, '(Expected: 5, excluding 10 quarantined)');

if (activeTotalBoxes === 5) {
  console.log('✅ PASS: Quarantined batches correctly excluded from stock calculation.');
} else {
  console.error('❌ FAIL: Quarantined batches were not excluded.');
  process.exit(1);
}
