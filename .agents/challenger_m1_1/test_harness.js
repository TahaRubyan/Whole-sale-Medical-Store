const { INITIAL_MEDICINES, INITIAL_BATCHES } = require('../../src/data/mockData.js');

function calculateInventoryStats(medicines, batches) {
  let totalBoxesAvailable = 0;
  let estimatedCostValuation = 0;
  let lowStockCount = 0;

  const medicinesWithStock = medicines.map((med) => {
    const medBatches = batches.filter(
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

  return {
    totalMedicines: medicines.length,
    totalBoxesAvailable,
    estimatedCostValuation,
    lowStockCount,
    medicinesWithStock,
    lowStockItems,
    totalSuggestedInvestment,
  };
}

console.log('=== TEST 1: PRE-SEEDED MOCK DATA ===');
const stats1 = calculateInventoryStats(INITIAL_MEDICINES, INITIAL_BATCHES);
console.log('Total Medicines:', stats1.totalMedicines);
console.log('Total Boxes Available:', stats1.totalBoxesAvailable);
console.log('Estimated Cost Valuation: Rs.', stats1.estimatedCostValuation);
console.log('Low Stock Count:', stats1.lowStockCount);
console.log('Low Stock Items:', stats1.lowStockItems.map(i => ({ id: i.id, brand: i.brandName, boxes: i.totalBoxes, reorderLevel: i.reorderLevel, isLow: i.isLow, suggestedReorder: i.suggestedReorderBoxes, estInvestment: i.estimatedInvestment })));
console.log('Total Suggested Investment: Rs.', stats1.totalSuggestedInvestment);

console.log('\n=== TEST 2: REPRODUCING STALE totalBoxesAvailable BUG ===');
let medCopy = JSON.parse(JSON.stringify(INITIAL_MEDICINES));
let batchCopy = JSON.parse(JSON.stringify(INITIAL_BATCHES));

// Add a batch with totalBoxesAvailable = 50, as created by NewPOModal
batchCopy.push({
  id: 'BAT-PO-999',
  medicineId: 'MED-101',
  batchNumber: 'B26-PO-999',
  mfgDate: '2026-01-01',
  expiryDate: '2027-12-31',
  totalBoxesAvailable: 50,
  totalTabletsAvailable: 10000,
  boxPrice: 600,
  pricePerTablet: 3,
  purchasePriceBox: 480,
  distributorName: 'Test Supplier',
  status: 'In Stock'
});

console.log('Before Sale - Total Boxes for MED-101:', calculateInventoryStats(medCopy, batchCopy).medicinesWithStock.find(m => m.id === 'MED-101').totalBoxes);

// Simulate POS Sale deducting all 10,000 tablets from B26-PO-999
const targetBatch = batchCopy.find(b => b.batchNumber === 'B26-PO-999');
targetBatch.totalTabletsAvailable = 0; // POS deductStock sets totalTabletsAvailable to 0

const statsAfterSale = calculateInventoryStats(medCopy, batchCopy);
const med101AfterSale = statsAfterSale.medicinesWithStock.find(m => m.id === 'MED-101');
console.log('After Sale (totalTabletsAvailable = 0):');
console.log('  Calculated totalBoxes for MED-101:', med101AfterSale.totalBoxes, '(EXPECTED: 4, ACTUAL: 54 due to stale totalBoxesAvailable)');
console.log('  Is MED-101 flagged as Low Stock?:', med101AfterSale.isLow, '(reorderLevel is 50, so 4 <= 50 should be TRUE, but 54 <= 50 is FALSE!)');
