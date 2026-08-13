import fs from 'fs';
import path from 'path';

const projectRoot = 'd:/Code/medical store whole sale/Medical Store Phase 2';

console.log('--- Empirical Verification for M1 (R1 & R5) ---');

// Check 1: mockData.js export of getTaxConfig
const mockDataPath = path.join(projectRoot, 'src/data/mockData.js');
const mockDataContent = fs.readFileSync(mockDataPath, 'utf-8');
const hasGetTaxConfigExport = /export\s+const\s+getTaxConfig\s*=/.test(mockDataContent);
console.log('[Check 1] mockData.js exports getTaxConfig:', hasGetTaxConfigExport);
if (!hasGetTaxConfigExport) {
  console.error('FAIL: getTaxConfig is not exported in mockData.js');
  process.exit(1);
}

// Check 2: A4InvoiceModal.jsx import and usage of getTaxConfig
const modalPath = path.join(projectRoot, 'src/components/modals/A4InvoiceModal.jsx');
const modalContent = fs.readFileSync(modalPath, 'utf-8');
const modalImportMatch = /import\s+{[^}]*getTaxConfig[^}]*}\s+from\s+['"]\.\.\/\.\.\/data\/mockData['"]/.test(modalContent);
const modalUsageCount = (modalContent.match(/getTaxConfig\(\)/g) || []).length;
console.log('[Check 2a] A4InvoiceModal.jsx imports getTaxConfig:', modalImportMatch);
console.log('[Check 2b] A4InvoiceModal.jsx calls getTaxConfig():', modalUsageCount, 'times');
if (!modalImportMatch || modalUsageCount < 1) {
  console.error('FAIL: A4InvoiceModal.jsx does not correctly import or use getTaxConfig');
  process.exit(1);
}

// Check 3: A4InvoicePrintModal.jsx import and usage of getTaxConfig
const printModalPath = path.join(projectRoot, 'src/components/modals/A4InvoicePrintModal.jsx');
const printModalContent = fs.readFileSync(printModalPath, 'utf-8');
const printModalImportMatch = /import\s+{[^}]*getTaxConfig[^}]*}\s+from\s+['"]\.\.\/\.\.\/data\/mockData['"]/.test(printModalContent);
const printModalUsageCount = (printModalContent.match(/getTaxConfig\(\)/g) || []).length;
console.log('[Check 3a] A4InvoicePrintModal.jsx imports getTaxConfig:', printModalImportMatch);
console.log('[Check 3b] A4InvoicePrintModal.jsx calls getTaxConfig():', printModalUsageCount, 'times');
if (!printModalImportMatch || printModalUsageCount < 1) {
  console.error('FAIL: A4InvoicePrintModal.jsx does not correctly import or use getTaxConfig');
  process.exit(1);
}

// Check 4: Sidebar.jsx labels matching exact requirements
const sidebarPath = path.join(projectRoot, 'src/components/layout/Sidebar.jsx');
const sidebarContent = fs.readFileSync(sidebarPath, 'utf-8');

const expectedLabels = [
  { id: 'dashboard', label: 'Home / Overview' },
  { id: 'pos', label: 'Sales & Billing (POS)' },
  { id: 'inventory', label: 'Medicine Stock' },
  { id: 'expiry', label: 'Expiry Alerts' },
  { id: 'region-ledger', label: 'Region Deliveries & Cash' },
  { id: 'suppliers', label: 'Suppliers & Purchases' },
  { id: 'analytics', label: 'Sales & Profit Reports' },
  { id: 'settings', label: 'Store Settings' }
];

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

let allLabelsMatched = true;
expectedLabels.forEach(item => {
  const escapedLabel = escapeRegExp(item.label);
  const labelRegex = new RegExp(`id:\\s*['"]${item.id}['"],\\s*label:\\s*['"]${escapedLabel}['"]`);
  const matched = labelRegex.test(sidebarContent);
  console.log(`[Check 4] Sidebar item '${item.id}' matching label '${item.label}':`, matched);
  if (!matched) {
    allLabelsMatched = false;
  }
});

if (!allLabelsMatched) {
  console.error('FAIL: Not all Sidebar labels match the requirement exactly');
  process.exit(1);
}

console.log('--- ALL CHECKS PASSED SUCCESSFULLY ---');
