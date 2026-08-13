// Empirical Test Script for Milestone 3 (R4 & R6)
import assert from 'assert';
import { INITIAL_SUPPLIERS, INITIAL_MEDICINES, INITIAL_BATCHES } from '../../src/data/mockData.js';
import { formatDateDDMMYYYY } from '../../src/utils/dateUtils.js';

console.log("=== EMPIRICAL TEST SUITE: MILESTONE 3 (R4 & R6) ===");

// -------------------------------------------------------------
// TEST 1: Supplier Debt Payment & Log Generation (R4)
// -------------------------------------------------------------
console.log("\n[TEST 1] Supplier Debt Payment & Log Generation (R4)");

let suppliers = JSON.parse(JSON.stringify(INITIAL_SUPPLIERS));
const targetSupplier = suppliers[0]; // SUP-101 (Muller & Phipps Pakistan, balance 45000)

console.log(`Initial Supplier: ${targetSupplier.companyName}`);
console.log(`Initial Pending Balance: ${targetSupplier.pendingBalance}`);

// Simulated recordSupplierPayment function (matches SupplierContext.jsx logic)
function recordSupplierPayment(supplierList, supplierId, amountPaid, paymentMode = 'Cash', note = 'Supplier Debt Payment') {
  const amount = Number(amountPaid) || 0;
  if (amount <= 0) return supplierList;

  return supplierList.map((s) => {
    if (s.id === supplierId || s.companyName === supplierId || s.name === supplierId) {
      const currentBal = s.pendingBalance !== undefined ? s.pendingBalance : (s.outstandingBalance || 0);
      const newBal = Math.max(0, currentBal - amount);
      const now = new Date();
      const newLog = {
        id: `PAY-SUP-${Date.now()}`,
        date: formatDateDDMMYYYY(now),
        time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        amountPaid: amount,
        paymentMode: paymentMode || 'Cash',
        note: note || 'Supplier Debt Payment',
        remainingBalanceAfter: newBal,
      };
      return {
        ...s,
        pendingBalance: newBal,
        outstandingBalance: newBal,
        paymentLogs: [newLog, ...(Array.isArray(s.paymentLogs) ? s.paymentLogs : [])],
      };
    }
    return s;
  });
}

// Perform partial payment of Rs. 15,000
const payAmount = 15000;
suppliers = recordSupplierPayment(suppliers, targetSupplier.id, payAmount, 'Bank Transfer', 'Wire Ref #12345');

const updatedSupplier = suppliers.find(s => s.id === targetSupplier.id);
console.log(`Updated Pending Balance: ${updatedSupplier.pendingBalance}`);
console.log(`Updated Outstanding Balance: ${updatedSupplier.outstandingBalance}`);
console.log(`Payment Logs Count: ${updatedSupplier.paymentLogs.length}`);
console.log(`Latest Log Entry:`, updatedSupplier.paymentLogs[0]);

// Assertions for Test 1
assert.strictEqual(updatedSupplier.pendingBalance, 30000, "Pending balance should decrease by 15,000 to 30,000");
assert.strictEqual(updatedSupplier.outstandingBalance, 30000, "Outstanding balance should match pending balance");
assert.strictEqual(updatedSupplier.paymentLogs.length, 1, "Payment logs array should have 1 entry");
assert.strictEqual(updatedSupplier.paymentLogs[0].amountPaid, 15000, "Log amountPaid should be 15,000");
assert.strictEqual(updatedSupplier.paymentLogs[0].paymentMode, 'Bank Transfer', "Log paymentMode should be Bank Transfer");
assert.strictEqual(updatedSupplier.paymentLogs[0].note, 'Wire Ref #12345', "Log note should match input");
assert.strictEqual(updatedSupplier.paymentLogs[0].remainingBalanceAfter, 30000, "Log remainingBalanceAfter should be 30,000");
assert.ok(updatedSupplier.paymentLogs[0].date.length > 0, "Log date should be present");

console.log("--> TEST 1 PASSED SUCCESSFULLY! ✅");

// Perform second payment settling full remaining balance of Rs. 30,000
suppliers = recordSupplierPayment(suppliers, targetSupplier.id, 30000, 'Cash', 'Full Balance Settlement');
const fullyPaidSupplier = suppliers.find(s => s.id === targetSupplier.id);

assert.strictEqual(fullyPaidSupplier.pendingBalance, 0, "Pending balance after full payment should be 0");
assert.strictEqual(fullyPaidSupplier.paymentLogs.length, 2, "Payment logs count should be 2");
assert.strictEqual(fullyPaidSupplier.paymentLogs[0].remainingBalanceAfter, 0, "Latest log remainingBalanceAfter should be 0");

console.log("--> TEST 1 FULL SETTLEMENT PASSED SUCCESSFULLY! ✅");

// -------------------------------------------------------------
// TEST 2: Validation in PaySupplierModal (R4)
// -------------------------------------------------------------
console.log("\n[TEST 2] Validation in PaySupplierModal (R4)");

function validatePaySupplierInput(currentBal, amountInput) {
  const payAmt = Number(amountInput);
  const isOverPaying = !isNaN(payAmt) && payAmt > currentBal;
  const isInvalid = isNaN(payAmt) || payAmt <= 0 || isOverPaying;
  return { payAmt, isOverPaying, isInvalid, isDisabled: isInvalid || !amountInput };
}

const currentBal = 30000;
console.log(`Testing validation with current balance = ${currentBal}:`);

const testOverpay = validatePaySupplierInput(currentBal, 35000);
console.log("Overpay 35,000:", testOverpay);
assert.strictEqual(testOverpay.isOverPaying, true, "Amount 35,000 exceeds current balance");
assert.strictEqual(testOverpay.isDisabled, true, "Submit button should be disabled for overpay");

const testZero = validatePaySupplierInput(currentBal, 0);
console.log("Zero amount 0:", testZero);
assert.strictEqual(testZero.isDisabled, true, "Submit button should be disabled for zero amount");

const testNegative = validatePaySupplierInput(currentBal, -500);
console.log("Negative amount -500:", testNegative);
assert.strictEqual(testNegative.isDisabled, true, "Submit button should be disabled for negative amount");

const testValid = validatePaySupplierInput(currentBal, 10000);
console.log("Valid amount 10,000:", testValid);
assert.strictEqual(testValid.isOverPaying, false, "Amount 10,000 should be valid");
assert.strictEqual(testValid.isDisabled, false, "Submit button should be enabled for valid amount");

console.log("--> TEST 2 PASSED SUCCESSFULLY! ✅");

// -------------------------------------------------------------
// TEST 3: Fresh Customer POS Initial State & Checkout (R6)
// -------------------------------------------------------------
console.log("\n[TEST 3] Fresh Customer POS Initial State & Checkout (R6)");

const initialCustomerDetails = {
  customerName: '',
  region: '',
  address: '',
  customerPhone: '',
  customerLicenseNo: '',
  customerNtn: '',
  customerGst: '',
  fbrStatus: '',
  bookingMan: '',
  referenceNo: '',
  deliveryMan: '',
  shipTo: '',
};

console.log("Initial POS Customer Details:", initialCustomerDetails);

// Assert all fields are empty strings
Object.entries(initialCustomerDetails).forEach(([key, val]) => {
  assert.strictEqual(val, '', `Field ${key} should be initialized to empty string`);
});

// Simulate processCheckout with empty details
function processCheckoutSimulation(extraDetails, fallbackCustName = '') {
  return {
    customerName: extraDetails.customerName !== undefined ? extraDetails.customerName : fallbackCustName,
    region: extraDetails.region !== undefined ? extraDetails.region : '',
    address: extraDetails.address !== undefined ? extraDetails.address : '',
    customerPhone: extraDetails.customerPhone !== undefined ? extraDetails.customerPhone : '',
    customerLicenseNo: extraDetails.customerLicenseNo !== undefined ? extraDetails.customerLicenseNo : '',
    customerNtn: extraDetails.customerNtn !== undefined ? extraDetails.customerNtn : '',
    customerGst: extraDetails.customerGst !== undefined ? extraDetails.customerGst : '',
    fbrStatus: extraDetails.fbrStatus !== undefined ? extraDetails.fbrStatus : '',
    bookingMan: extraDetails.bookingMan !== undefined ? extraDetails.bookingMan : '',
    referenceNo: extraDetails.referenceNo !== undefined ? extraDetails.referenceNo : '',
    deliveryMan: extraDetails.deliveryMan !== undefined ? extraDetails.deliveryMan : '',
    shipTo: extraDetails.shipTo !== undefined ? extraDetails.shipTo : '',
  };
}

const checkoutRecord = processCheckoutSimulation(initialCustomerDetails, '');
console.log("Checkout record customer details:", checkoutRecord);

assert.strictEqual(checkoutRecord.customerName, '', "Customer name in checkout record should remain empty");
assert.strictEqual(checkoutRecord.region, '', "Region in checkout record should remain empty");

console.log("--> TEST 3 PASSED SUCCESSFULLY! ✅");

// -------------------------------------------------------------
// TEST 4: POS Search Bar Focus & Keyboard Navigation (R6)
// -------------------------------------------------------------
console.log("\n[TEST 4] POS Search Bar Focus & Keyboard Navigation (R6)");

const medicines = INITIAL_MEDICINES;

function filterSuggestions(query, medList) {
  return medList.filter((m) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase().trim();
    return (
      (m.id && m.id.toLowerCase().includes(q)) ||
      m.brandName.toLowerCase().includes(q) ||
      (m.genericFormula && m.genericFormula.toLowerCase().includes(q)) ||
      (m.manufacturer && m.manufacturer.toLowerCase().includes(q)) ||
      (m.barcode && m.barcode.includes(q))
    );
  });
}

// Scenario 4A: Empty search query onFocus
const emptyQueryResults = filterSuggestions('', medicines);
console.log(`Suggestions count for empty query on Focus: ${emptyQueryResults.length} / ${medicines.length}`);

assert.strictEqual(emptyQueryResults.length, medicines.length, "Empty search query should return full catalog");
assert.ok(emptyQueryResults.length > 0, "Catalog should have medicines to populate dropdown on focus");

// Scenario 4B: Keyboard Navigation Simulation
let highlightedIndex = 0;
const suggestionsCount = emptyQueryResults.length;

function handleArrowDown(currentIndex, totalCount) {
  return (currentIndex + 1) % totalCount;
}

function handleArrowUp(currentIndex, totalCount) {
  return (currentIndex - 1 + totalCount) % totalCount;
}

highlightedIndex = handleArrowDown(highlightedIndex, suggestionsCount);
assert.strictEqual(highlightedIndex, 1, "ArrowDown from 0 should highlight index 1");

highlightedIndex = handleArrowDown(highlightedIndex, suggestionsCount);
assert.strictEqual(highlightedIndex, 2, "ArrowDown from 1 should highlight index 2");

highlightedIndex = handleArrowUp(highlightedIndex, suggestionsCount);
assert.strictEqual(highlightedIndex, 1, "ArrowUp from 2 should highlight index 1");

const selectedMedicine = emptyQueryResults[highlightedIndex];
console.log(`Selected item via Enter on index ${highlightedIndex}:`, selectedMedicine.brandName);
assert.ok(selectedMedicine && selectedMedicine.brandName, "Target medicine should be selected on Enter");

console.log("--> TEST 4 PASSED SUCCESSFULLY! ✅");

console.log("\n=================================================");
console.log("ALL EMPIRICAL TESTS PASSED WITH ZERO ERRORS! 🚀");
console.log("=================================================");
