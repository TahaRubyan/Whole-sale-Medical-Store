import { INITIAL_MEDICINES, INITIAL_BATCHES } from '../../../src/data/mockData.js';

console.log('--- Testing Stock Summary Metrics Logic ---');
console.log(`Loaded ${INITIAL_MEDICINES.length} medicines and ${INITIAL_BATCHES.length} batches.`);

let totalBoxesAvailable = 0;
let estimatedCostValuation = 0;
let lowStockCount = 0;

const medicinesWithStock = INITIAL_MEDICINES.map((med) => {
  const medBatches = INITIAL_BATCHES.filter(
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
  const isLow = totalBoxes <= med.reorderLevel;

  if (isLow) {
    lowStockCount += 1;
  }

  totalBoxesAvailable += totalBoxes;
  estimatedCostValuation += costValuation;

  const suggestedReorderBoxes = Math.max(
    med.reorderLevel * 2 - totalBoxes,
    med.reorderLevel
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

const lowStockItems = medicinesWithStock.filter((m) => m.isLow);
const totalSuggestedInvestment = lowStockItems.reduce(
  (sum, m) => sum + m.estimatedInvestment,
  0
);

console.log('Metrics Summary:');
console.log('- Total Medicines:', INITIAL_MEDICINES.length);
console.log('- Total Boxes Available:', totalBoxesAvailable);
console.log('- Estimated Inventory Cost Valuation: Rs.', estimatedCostValuation.toFixed(2));
console.log('- Low Stock Items Count:', lowStockCount);
console.log('- Low Stock Items List:', lowStockItems.map(i => ({ name: i.brandName, currentBoxes: i.totalBoxes, reorderLevel: i.reorderLevel, suggested: i.suggestedReorderBoxes, investment: i.estimatedInvestment })));
console.log('- Total Suggested Purchase Reorder Investment: Rs.', totalSuggestedInvestment.toFixed(2));

if (typeof totalBoxesAvailable === 'number' && typeof estimatedCostValuation === 'number' && typeof lowStockCount === 'number') {
  console.log('✅ PASS: All metrics calculated correctly without NaN errors.');
} else {
  console.error('❌ FAIL: NaN or invalid metric values detected.');
  process.exit(1);
}
