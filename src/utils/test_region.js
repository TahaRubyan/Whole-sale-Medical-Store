import assert from 'node:assert';

// Extract logic functions under test from RegionLedgerPage.jsx logic:

function extractRegionOptions(invoices) {
  const defaults = ['Karianwala', 'Gujrat', 'Tanda', 'Jalalpur Jattan'];
  const keyToDisplayMap = new Map();

  defaults.forEach((reg) => {
    keyToDisplayMap.set(reg.toLowerCase(), reg);
  });

  invoices.forEach((inv) => {
    const raw = (inv.region || '').trim();
    if (raw.length > 0) {
      const key = raw.toLowerCase();
      if (!keyToDisplayMap.has(key)) {
        keyToDisplayMap.set(key, raw);
      }
    }
  });

  const counts = {};
  invoices.forEach((inv) => {
    const reg = (inv.region || '').trim();
    const key = reg.length > 0 ? reg.toLowerCase() : 'unassigned';
    counts[key] = (counts[key] || 0) + 1;
  });

  const list = [];
  keyToDisplayMap.forEach((displayName, key) => {
    const count = counts[key] || 0;
    list.push({ key, displayName, count });
  });

  list.sort((a, b) => a.displayName.localeCompare(b.displayName));
  const activeCount = list.filter((r) => r.count > 0).length;

  return { regionOptions: list, activeRegionsCount: activeCount, counts };
}

function filterInvoices(invoices, selectedRegion, selectedStatus, searchQuery) {
  return invoices.filter((inv) => {
    // Region Filter
    if (selectedRegion && selectedRegion !== 'All Regions') {
      const invRegion = (inv.region || 'Unassigned').trim().toLowerCase();
      if (invRegion !== selectedRegion.trim().toLowerCase()) {
        return false;
      }
    }

    // Status Filter
    if (selectedStatus && selectedStatus !== 'ALL') {
      const originalNet = Number(inv.netTotal || inv.subtotal || 0);
      const currentDebt = inv.remainingDebt !== undefined ? Number(inv.remainingDebt) : originalNet;
      const isPaid = currentDebt === 0;

      let statusLabel = 'UNPAID_CREDIT';
      if (isPaid) {
        statusLabel = 'PAID';
      } else if (currentDebt < originalNet) {
        statusLabel = 'PARTIAL DEBT';
      }

      if (statusLabel !== selectedStatus) {
        return false;
      }
    }

    // Search Query Filter
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

function calculateKPIs(filteredInvoices) {
  let totalShops = filteredInvoices.length;
  let totalSalesNet = 0;
  let totalOutstandingDebt = 0;
  let totalCashSettledToday = 0;

  const todayStr = new Date().toISOString().split('T')[0];

  filteredInvoices.forEach((inv) => {
    const net = Number(inv.netTotal || inv.subtotal || 0);
    const remaining = inv.remainingDebt !== undefined ? Number(inv.remainingDebt) : net;

    totalSalesNet += net;
    totalOutstandingDebt += remaining;

    const logs = inv.paymentLogs || [];
    logs.forEach((log) => {
      if (log.date === todayStr) {
        totalCashSettledToday += Number(log.amountPaid || 0);
      }
    });
  });

  return { totalShops, totalSalesNet, totalOutstandingDebt, totalCashSettledToday };
}

// ==================== TEST SUITE ====================

console.log('--- RUNNING EMPIRICAL TESTS FOR REGION LEDGER ---');

// Test 1: Dynamic Region Extraction
console.log('\n[TEST 1] Dynamic Region Extraction & Edge Cases...');
const mockInvoices1 = [
  { invoiceNo: 'INV-1', region: 'Karianwala' },
  { invoiceNo: 'INV-2', region: 'karianwala' }, // Mixed case lowercase
  { invoiceNo: 'INV-3', region: '  KARIANWALA  ' }, // Mixed case uppercase with extra spaces
  { invoiceNo: 'INV-4', region: '' }, // Empty string region
  { invoiceNo: 'INV-5', region: null }, // Null region
  { invoiceNo: 'INV-6', region: '   ' }, // Whitespace region
  { invoiceNo: 'INV-7', region: 'Sialkot' }, // New dynamic region not in defaults
  { invoiceNo: 'INV-8', region: 'sialkot' }, // New dynamic region lowercase
];

const { regionOptions, activeRegionsCount, counts } = extractRegionOptions(mockInvoices1);

// Assertions for Test 1
const karianwalaOption = regionOptions.find(r => r.key === 'karianwala');
assert.ok(karianwalaOption, 'Karianwala option should exist');
assert.strictEqual(karianwalaOption.count, 3, 'Karianwala count should be 3 (Karianwala, karianwala,   KARIANWALA  )');
assert.strictEqual(karianwalaOption.displayName, 'Karianwala', 'DisplayName should preserve default titlecase Karianwala');

const sialkotOption = regionOptions.find(r => r.key === 'sialkot');
assert.ok(sialkotOption, 'Sialkot option should exist');
assert.strictEqual(sialkotOption.count, 2, 'Sialkot count should be 2');
assert.strictEqual(sialkotOption.displayName, 'Sialkot', 'DisplayName for Sialkot should be preserved');

assert.strictEqual(counts['unassigned'], 3, 'Unassigned count should be 3 for empty, null, and whitespace regions');
assert.strictEqual(regionOptions.some(r => r.key === 'unassigned'), false, 'Unassigned should not pollute region options dropdown');

console.log('✅ TEST 1 PASSED: Dynamic Region Extraction handles empty, mixed-case, and extra spaces correctly.');

// Test 2: Filter Bar - Search Box Filtering
console.log('\n[TEST 2] Search Box Filtering (Shop Name, Invoice #, Delivery Man, Region, Phone)...');
const mockInvoices2 = [
  { invoiceNo: 'INV-1001', shopName: 'Al-Madina Pharmacy', region: 'Karianwala', deliveryMan: 'Tariq Mahmood', customerPhone: '0300-1111111' },
  { invoiceNo: 'INV-1002', customerName: 'Bismillah Medical', region: 'Gujrat', deliveryMan: 'Usman Ali', customerPhone: '0321-2222222' },
  { invoiceNo: 'INV-1003', shopName: 'Khyber Med Store', region: 'Tanda', deliveryMan: 'Tariq Mahmood', customerPhone: '0333-3333333' },
];

// Search by Shop Name
const resShop = filterInvoices(mockInvoices2, 'All Regions', 'ALL', 'al-madina');
assert.strictEqual(resShop.length, 1);
assert.strictEqual(resShop[0].invoiceNo, 'INV-1001');

// Search by Invoice #
const resInv = filterInvoices(mockInvoices2, 'All Regions', 'ALL', 'inv-1002');
assert.strictEqual(resInv.length, 1);
assert.strictEqual(resInv[0].shopName, 'Bismillah Medical');

// Search by Delivery Man
const resDriver = filterInvoices(mockInvoices2, 'All Regions', 'ALL', 'Tariq');
assert.strictEqual(resDriver.length, 2, 'Tariq matches 2 invoices');

// Search by Region
const resReg = filterInvoices(mockInvoices2, 'All Regions', 'ALL', 'Gujrat');
assert.strictEqual(resReg.length, 1);
assert.strictEqual(resReg[0].invoiceNo, 'INV-1002');

// Search by Phone
const resPhone = filterInvoices(mockInvoices2, 'All Regions', 'ALL', '0333');
assert.strictEqual(resPhone.length, 1);
assert.strictEqual(resPhone[0].invoiceNo, 'INV-1003');

console.log('✅ TEST 2 PASSED: Search box filters accurately by shop name, invoice no, delivery man, region, and phone.');

// Test 3: Region Filter Selection Behavior
console.log('\n[TEST 3] Region Dropdown Selection Filtering...');
const mockInvoices3 = [
  { invoiceNo: 'INV-1', region: 'Karianwala' },
  { invoiceNo: 'INV-2', region: '  karianwala  ' },
  { invoiceNo: 'INV-3', region: 'Gujrat' },
  { invoiceNo: 'INV-4', region: '' },
];

const resRegKarianwala = filterInvoices(mockInvoices3, 'Karianwala', 'ALL', '');
assert.strictEqual(resRegKarianwala.length, 2, 'Should match both Karianwala and   karianwala  ');

const resRegGujrat = filterInvoices(mockInvoices3, 'Gujrat', 'ALL', '');
assert.strictEqual(resRegGujrat.length, 1);

const resRegAll = filterInvoices(mockInvoices3, 'All Regions', 'ALL', '');
assert.strictEqual(resRegAll.length, 4);

console.log('✅ TEST 3 PASSED: Region dropdown filter correctly selects and matches regions case-insensitively with trim.');

// Test 4: Payment Status Filtering & KPI Calculations
console.log('\n[TEST 4] Payment Status Filtering & KPI Calculations...');
const todayStr = new Date().toISOString().split('T')[0];
const mockInvoices4 = [
  { invoiceNo: 'INV-1', netTotal: 10000, remainingDebt: 10000, region: 'Karianwala', paymentLogs: [] }, // UNPAID_CREDIT
  { invoiceNo: 'INV-2', netTotal: 5000, remainingDebt: 2000, region: 'Karianwala', paymentLogs: [{ date: todayStr, amountPaid: 3000 }] }, // PARTIAL DEBT
  { invoiceNo: 'INV-3', netTotal: 4000, remainingDebt: 0, region: 'Gujrat', paymentLogs: [{ date: todayStr, amountPaid: 4000 }] }, // PAID
];

const resUnpaid = filterInvoices(mockInvoices4, 'All Regions', 'UNPAID_CREDIT', '');
assert.strictEqual(resUnpaid.length, 1);
assert.strictEqual(resUnpaid[0].invoiceNo, 'INV-1');

const resPartial = filterInvoices(mockInvoices4, 'All Regions', 'PARTIAL DEBT', '');
assert.strictEqual(resPartial.length, 1);
assert.strictEqual(resPartial[0].invoiceNo, 'INV-2');

const resPaid = filterInvoices(mockInvoices4, 'All Regions', 'PAID', '');
assert.strictEqual(resPaid.length, 1);
assert.strictEqual(resPaid[0].invoiceNo, 'INV-3');

const kpis = calculateKPIs(mockInvoices4);
assert.strictEqual(kpis.totalShops, 3);
assert.strictEqual(kpis.totalSalesNet, 19000);
assert.strictEqual(kpis.totalOutstandingDebt, 12000);
assert.strictEqual(kpis.totalCashSettledToday, 7000);

console.log('✅ TEST 4 PASSED: Payment status filtering and KPI calculations are 100% accurate.');

console.log('\nALL 4 EMPIRICAL VERIFICATION TESTS PASSED SUCCESSFULLY! 🎉');
