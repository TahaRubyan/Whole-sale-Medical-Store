import { INITIAL_INVOICES } from '../../src/data/mockData.js';

// Helper function to simulate recordDebtPayment logic from SalesContext.jsx
function recordDebtPayment(invoices, invoiceNo, amountPaid, paymentMode = 'Cash', note = '') {
  return invoices.map((inv) => {
    if (inv.invoiceNo === invoiceNo || inv.id === invoiceNo) {
      const originalNet = Number(inv.netTotal || inv.subtotal || 0);
      const currentDebt = inv.remainingDebt !== undefined ? Number(inv.remainingDebt) : originalNet;
      const paidNum = Number(amountPaid) || 0;
      const newRemaining = Math.max(0, currentDebt - paidNum);
      const isFullyCleared = newRemaining <= 0;

      const paymentEntry = {
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        amountPaid: paidNum,
        paymentMode,
        note: note || `Cash Settlement (Rs. ${paidNum})`,
        remainingDebtAfter: newRemaining,
      };

      return {
        ...inv,
        paymentStatus: isFullyCleared ? 'PAID' : (newRemaining < originalNet ? 'PARTIAL DEBT' : 'UNPAID_CREDIT'),
        remainingDebt: newRemaining,
        paymentLogs: [...(inv.paymentLogs || []), paymentEntry],
      };
    }
    return inv;
  });
}

// Helper to simulate handleSettleCash validation logic from RegionLedgerPage.jsx
function simulateSettleCash(invoices, invoiceNo, rawVal, setInputsCallback) {
  const inv = invoices.find((i) => i.invoiceNo === invoiceNo || i.id === invoiceNo);
  if (!inv) return { success: false, error: 'Invoice not found' };

  const cashAmount = Number(rawVal);
  const originalNet = Number(inv.netTotal || inv.subtotal || 0);
  const currentDebt = inv.remainingDebt !== undefined ? Number(inv.remainingDebt) : originalNet;

  if (!rawVal || isNaN(cashAmount) || cashAmount <= 0) {
    return { success: false, error: 'Please enter a valid cash amount greater than Rs. 0' };
  }

  if (cashAmount > currentDebt) {
    return {
      success: false,
      error: `Entered amount (Rs. ${cashAmount}) exceeds remaining debt (Rs. ${currentDebt})`,
    };
  }

  const updatedInvoices = recordDebtPayment(
    invoices,
    inv.invoiceNo,
    cashAmount,
    'Cash',
    `Regional Delivery Settlement (${inv.region || 'Region'})`
  );

  return { success: true, updatedInvoices, settledAmount: cashAmount };
}

// Helper to simulate handleSettleAllRegionCash batch logic from RegionLedgerPage.jsx
function simulateSettleAllRegionCash(invoices, filteredInvoices, cashInputs) {
  let settledCount = 0;
  let totalSettledAmount = 0;
  let currentInvoices = [...invoices];

  filteredInvoices.forEach((inv) => {
    const rawVal = cashInputs[inv.invoiceNo];
    const cashAmount = Number(rawVal);
    const originalNet = Number(inv.netTotal || inv.subtotal || 0);
    const currentDebt = inv.remainingDebt !== undefined ? Number(inv.remainingDebt) : originalNet;

    if (rawVal && !isNaN(cashAmount) && cashAmount > 0 && cashAmount <= currentDebt) {
      currentInvoices = recordDebtPayment(
        currentInvoices,
        inv.invoiceNo,
        cashAmount,
        'Cash',
        `Batch Regional Settlement (${inv.region || 'Region'})`
      );
      settledCount += 1;
      totalSettledAmount += cashAmount;
    }
  });

  if (settledCount === 0) {
    return {
      success: false,
      error: 'No valid cash amounts (> 0) entered in the input fields for this region.',
    };
  }

  return {
    success: true,
    updatedInvoices: currentInvoices,
    settledCount,
    totalSettledAmount,
  };
}

// Helper to extract available regions dynamically
function extractAvailableRegions(invoices) {
  const regionSet = new Set();
  const defaults = ['Karianwala', 'Gujrat', 'Tanda', 'Jalalpur Jattan'];

  invoices.forEach((inv) => {
    if (inv.region && typeof inv.region === 'string' && inv.region.trim().length > 0) {
      regionSet.add(inv.region.trim());
    }
  });

  defaults.forEach((reg) => regionSet.add(reg));
  return ['All Regions', ...Array.from(regionSet).sort()];
}

// Helper to filter invoices by region and search query
function filterInvoices(invoices, selectedRegion, searchQuery) {
  return invoices.filter((inv) => {
    if (selectedRegion && selectedRegion !== 'All Regions') {
      const invRegion = (inv.region || 'Unassigned').trim();
      if (invRegion.toLowerCase() !== selectedRegion.trim().toLowerCase()) {
        return false;
      }
    }

    if (searchQuery && searchQuery.trim().length > 0) {
      const q = searchQuery.trim().toLowerCase();
      const shopName = (inv.shopName || inv.customerName || '').toLowerCase();
      const invoiceNo = (inv.invoiceNo || '').toLowerCase();
      const region = (inv.region || '').toLowerCase();
      const deliveryMan = (inv.deliveryMan || '').toLowerCase();
      const phone = (inv.customerPhone || '').toLowerCase();

      return (
        shopName.includes(q) ||
        invoiceNo.includes(q) ||
        region.includes(q) ||
        deliveryMan.includes(q) ||
        phone.includes(q)
      );
    }

    return true;
  });
}

// RUN EMPIRICAL TEST SUITE
console.log('====================================================');
console.log('    EMPIRICAL STRESS TEST SUITE: M2 & M3');
console.log('====================================================\n');

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`[FAIL] ${message}`);
    failedTests++;
  }
}

// TEST 1: Initial Invoices Setup
assert(Array.isArray(INITIAL_INVOICES) && INITIAL_INVOICES.length >= 4, 'Initial Invoices pre-seeded with 4+ records');
const karianwalaInv = INITIAL_INVOICES.find((inv) => inv.region === 'Karianwala');
assert(karianwalaInv !== undefined, 'Pre-seeded invoice for region Karianwala exists');

// TEST 2: Partial Cash Payment Settlement
let stateInvoices = JSON.parse(JSON.stringify(INITIAL_INVOICES));
let targetInv = stateInvoices.find((i) => i.invoiceNo === 'INV-20260812-101');
const initialDebt = targetInv.remainingDebt; // 20000

let res1 = simulateSettleCash(stateInvoices, 'INV-20260812-101', '5000');
assert(res1.success === true, 'Partial cash settlement (Rs. 5000) accepted');
stateInvoices = res1.updatedInvoices;
let updatedInv1 = stateInvoices.find((i) => i.invoiceNo === 'INV-20260812-101');
assert(updatedInv1.remainingDebt === initialDebt - 5000, `Remaining debt correctly reduced from ${initialDebt} to ${initialDebt - 5000}`);
assert(updatedInv1.paymentStatus === 'PARTIAL DEBT', 'Payment status is PARTIAL DEBT');

// TEST 3: Timestamp Format Verification in paymentLogs
const latestLog = updatedInv1.paymentLogs[updatedInv1.paymentLogs.length - 1];
assert(latestLog !== undefined, 'Payment log entry appended to paymentLogs array');
assert(typeof latestLog.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(latestLog.date), `Date format is valid YYYY-MM-DD ("${latestLog.date}")`);
assert(typeof latestLog.time === 'string' && latestLog.time.length > 0, `Time format is valid non-empty string ("${latestLog.time}")`);
assert(latestLog.amountPaid === 5000, 'Log amountPaid is 5000');
assert(latestLog.remainingDebtAfter === 15000, 'Log remainingDebtAfter is 15000');

// TEST 4: Exact Payment Settlement (Paying Exact Due)
let res2 = simulateSettleCash(stateInvoices, 'INV-20260812-101', '15000');
assert(res2.success === true, 'Exact cash settlement (Rs. 15000) accepted');
stateInvoices = res2.updatedInvoices;
let updatedInv2 = stateInvoices.find((i) => i.invoiceNo === 'INV-20260812-101');
assert(updatedInv2.remainingDebt === 0, 'Remaining debt is 0 after exact payment');
assert(updatedInv2.paymentStatus === 'PAID', 'Payment status updated to PAID');
const finalLog = updatedInv2.paymentLogs[updatedInv2.paymentLogs.length - 1];
assert(finalLog.remainingDebtAfter === 0, 'Final log remainingDebtAfter is 0');

// TEST 5: Overpayment Protection (Paying More Than Due)
let unpaidTarget = stateInvoices.find((i) => i.invoiceNo === 'INV-20260812-103'); // remainingDebt: 15000
let resOver = simulateSettleCash(stateInvoices, 'INV-20260812-103', '20000');
assert(resOver.success === false, 'Overpayment (Rs. 20000 on Rs. 15000 due) blocked by settlement handler');
assert(resOver.error.includes('exceeds remaining debt'), 'Overpayment error message mentions debt limit');

// Direct recordDebtPayment overpayment fallback check
let directOverResult = recordDebtPayment(stateInvoices, 'INV-20260812-103', 25000);
let directInv = directOverResult.find((i) => i.invoiceNo === 'INV-20260812-103');
assert(directInv.remainingDebt === 0, 'Context recordDebtPayment Math.max(0, ...) prevents negative debt');
assert(directInv.paymentStatus === 'PAID', 'Context sets paymentStatus to PAID when cleared');

// TEST 6: Zero & Negative & Invalid Input Cash Settlement
let resZero = simulateSettleCash(stateInvoices, 'INV-20260812-103', '0');
assert(resZero.success === false, '0 cash input settlement rejected');
assert(resZero.error.includes('greater than Rs. 0'), '0 cash error message is descriptive');

let resNeg = simulateSettleCash(stateInvoices, 'INV-20260812-103', '-500');
assert(resNeg.success === false, 'Negative cash input settlement rejected');

let resEmpty = simulateSettleCash(stateInvoices, 'INV-20260812-103', '');
assert(resEmpty.success === false, 'Empty string cash input settlement rejected');

let resNaN = simulateSettleCash(stateInvoices, 'INV-20260812-103', 'abc');
assert(resNaN.success === false, 'NaN string cash input settlement rejected');

// TEST 7: Settle All Region Cash Batch Processing
let batchInvoices = JSON.parse(JSON.stringify(INITIAL_INVOICES));
let filteredKarianwala = filterInvoices(batchInvoices, 'Karianwala', '');
assert(filteredKarianwala.length >= 1, 'Filtered region Karianwala has invoices');

// Test batch with no cash inputs
let resBatchEmpty = simulateSettleAllRegionCash(batchInvoices, filteredKarianwala, {});
assert(resBatchEmpty.success === false, 'Batch settlement with 0 inputs rejected');

// Test batch with valid cash inputs
let inputs = {
  'INV-20260812-101': '10000', // valid partial payment
};
let resBatchValid = simulateSettleAllRegionCash(batchInvoices, filteredKarianwala, inputs);
assert(resBatchValid.success === true, 'Batch settlement with valid inputs succeeded');
assert(resBatchValid.settledCount === 1, 'Batch settled 1 shop invoice');
assert(resBatchValid.totalSettledAmount === 10000, 'Batch total settled amount is 10000');

let batchSettledInv = resBatchValid.updatedInvoices.find((i) => i.invoiceNo === 'INV-20260812-101');
assert(batchSettledInv.remainingDebt === 10000, 'Batch settlement updated remaining debt to 10000');

// TEST 8: Plain-Text Region Inputs & Dynamic Region Filtering
let newCustomRegionInvoice = {
  invoiceNo: 'INV-20260812-999',
  shopName: 'Custom Shop Karianwala Extra',
  region: 'Karianwala Custom Sector',
  deliveryMan: 'Awais Ijaz',
  netTotal: 10000,
  remainingDebt: 10000,
  paymentStatus: 'UNPAID_CREDIT',
};
let testRegionInvoices = [...INITIAL_INVOICES, newCustomRegionInvoice];

let regionsList = extractAvailableRegions(testRegionInvoices);
assert(regionsList.includes('Karianwala Custom Sector'), 'Dynamic region extraction includes custom typed region name "Karianwala Custom Sector"');
assert(regionsList.includes('Karianwala'), 'Preset region Karianwala is present in available regions');

// Test region filtering
let filterCustom = filterInvoices(testRegionInvoices, 'Karianwala Custom Sector', '');
assert(filterCustom.length === 1 && filterCustom[0].invoiceNo === 'INV-20260812-999', 'Filtering by custom region returns exact matching shop invoice');

let filterCaseInsensitive = filterInvoices(testRegionInvoices, 'karianwala custom sector', '');
assert(filterCaseInsensitive.length === 1, 'Region filtering is case-insensitive');

let searchByRegionText = filterInvoices(testRegionInvoices, 'All Regions', 'Karianwala Custom');
assert(searchByRegionText.length === 1, 'Text search filter matches custom region string');

console.log('\n====================================================');
console.log(`  RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
console.log('====================================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
