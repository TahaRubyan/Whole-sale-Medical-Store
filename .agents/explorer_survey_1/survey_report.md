# Explorer 1 Survey Report: Requirements R1, R3, and R5

## Executive Summary
This report provides a detailed, evidence-based investigation of Requirements **R1**, **R3**, and **R5** for the Medical Store Management System (Phase 2). All file locations, missing imports, date formatting patterns, and navigation menu label updates have been identified with exact line numbers and proposed solutions.

---

## 1. Requirement R1: Tax Configuration Reference & Import Bug (`getTaxConfig`)

### 1.1 Observations
* **File 1**: `src/data/mockData.js`
  - Lines 3–18: `getTaxConfig` is defined and exported as a named function:
    ```javascript
    export const getTaxConfig = () => {
      const saved = localStorage.getItem('pharmalink_tax_config');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
      return {
        saleTaxPercent: 18,
        saleTaxName: 'Sale Tax 18%',
        adTaxPercent: 4,
        adTaxName: 'AdTax 4%',
        advTaxPercent: 0.5,
        advTaxName: 'Adv Tax 0.5%',
      };
    };
    ```
* **File 2**: `src/components/modals/A4InvoiceModal.jsx`
  - Line 3: `import { STORE_INFO } from '../../data/mockData';`
  - Lines 194, 195, 196: Invokes `getTaxConfig().saleTaxName`, `getTaxConfig().adTaxName`, `getTaxConfig().advTaxName`.
  - Lines 243, 244, 245: Invokes `getTaxConfig().saleTaxName`, `getTaxConfig().adTaxName`, `getTaxConfig().advTaxName`.
  - **Issue**: `getTaxConfig` is called without being imported, causing `ReferenceError: getTaxConfig is not defined` when opening the modal.
* **File 3**: `src/components/modals/A4InvoicePrintModal.jsx`
  - Line 3: `import { STORE_INFO } from '../../data/mockData';`
  - Lines 194, 195, 196: Invokes `getTaxConfig().saleTaxName`, `getTaxConfig().adTaxName`, `getTaxConfig().advTaxName`.
  - Lines 243, 244, 245: Invokes `getTaxConfig().saleTaxName`, `getTaxConfig().adTaxName`, `getTaxConfig().advTaxName`.
  - **Issue**: `getTaxConfig` is called without being imported, causing `ReferenceError: getTaxConfig is not defined` when rendering print preview.

### 1.2 Required Changes
In both `src/components/modals/A4InvoiceModal.jsx` (Line 3) and `src/components/modals/A4InvoicePrintModal.jsx` (Line 3), update the import line from:
```javascript
import { STORE_INFO } from '../../data/mockData';
```
to:
```javascript
import { STORE_INFO, getTaxConfig } from '../../data/mockData';
```

---

## 2. Requirement R3: Date Formatting & Standardization (DD-MM-YYYY)

### 2.1 Current State Analysis
Across the codebase, dates are currently created and displayed using inconsistent string formats and raw ISO representations:

1. **`CartContext.jsx` & `POSPage.jsx`**:
   - Line 221 in `CartContext.jsx`:
     ```javascript
     const todayFormatted = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
     ```
     Uses slashes (`DD/MM/YYYY`).
2. **`A4InvoiceModal.jsx` & `A4InvoicePrintModal.jsx`**:
   - Line 159: `sale.date || '03/08/2026'` (slash format).
   - Line 221 (Line item expiry): `item.expiryDate || '2028-12-31'` (raw ISO format `YYYY-MM-DD`).
3. **`NewPOModal.jsx`**:
   - Line 19: `const [inwardDate, setInwardDate] = useState(() => new Date().toISOString().split('T')[0]);` (`YYYY-MM-DD`).
   - Line 28: `expiryDate: '2028-12-31'` (`YYYY-MM-DD`).
4. **`RegionLedgerPage.jsx` & `SalesContext.jsx`**:
   - Line 103 in `RegionLedgerPage.jsx`: `const todayStr = new Date().toISOString().split('T')[0];` (`YYYY-MM-DD`).
   - Line 82 in `SalesContext.jsx`: `date: new Date().toISOString().split('T')[0]` (`YYYY-MM-DD`).
5. **`InventoryPage.jsx` & `StockSummaryReportModal.jsx`**:
   - Batch expiry dates displayed as raw ISO strings (`YYYY-MM-DD`).
6. **`AnalyticsPage.jsx` & `ExpiryRadarPage.jsx`**:
   - Standard JS `Date` objects / ISO strings displayed without unified DD-MM-YYYY formatting.

### 2.2 Helper Function Location & Proposed Implementation
No `src/utils` directory currently exists in the project structure. A new utility module `src/utils/dateUtils.js` (or `src/utils/formatters.js`) should be created.

#### Proposed `src/utils/dateUtils.js`:
```javascript
/**
 * Formats any Date object or date string into DD-MM-YYYY format.
 * @param {Date|string} dateInput - Input date object or string (e.g. YYYY-MM-DD or DD/MM/YYYY)
 * @returns {string} Formatted date string (DD-MM-YYYY)
 */
export const formatDateDDMMYYYY = (dateInput) => {
  if (!dateInput) return '-';
  
  if (typeof dateInput === 'string') {
    const trimmed = dateInput.trim();
    // Match YYYY-MM-DD
    const isoMatch = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (isoMatch) {
      const [, year, month, day] = isoMatch;
      return `${day.padStart(2, '0')}-${month.padStart(2, '0')}-${year}`;
    }
    // Match DD/MM/YYYY or DD-MM-YYYY
    const dmyMatch = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
    if (dmyMatch) {
      const [, day, month, year] = dmyMatch;
      return `${day.padStart(2, '0')}-${month.padStart(2, '0')}-${year}`;
    }
  }

  const d = new Date(dateInput);
  if (d instanceof Date && !isNaN(d.getTime())) {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  return String(dateInput);
};

export const formatDate = formatDateDDMMYYYY;
```

---

## 3. Requirement R5: Simplified Navigation Menu Labels in Sidebar

### 3.1 Observations
* **File Locations**:
  - `src/components/layout/Sidebar.jsx` (defines `NAV_ITEMS` array)
  - `src/components/common/Sidebar.jsx` (re-exports `Sidebar` and `NAV_ITEMS` from `layout/Sidebar.jsx`)
* **Current Navigation Items Definition** (`src/components/layout/Sidebar.jsx` lines 15–24):
```javascript
export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, requiresAdmin: false },
  { id: 'pos', label: 'POS Billing', icon: ShoppingCart, requiresAdmin: false },
  { id: 'inventory', label: 'Inventory Catalog', icon: Package, requiresAdmin: false },
  { id: 'expiry', label: 'Expiry Radar', icon: AlertTriangle, requiresAdmin: false },
  { id: 'region-ledger', label: 'Region Delivery Ledger', icon: MapPin, requiresAdmin: false },
  { id: 'suppliers', label: 'Suppliers & PO', icon: Truck, requiresAdmin: false },
  { id: 'analytics', label: 'Financial Analytics', icon: TrendingUp, requiresAdmin: true },
  { id: 'settings', label: 'Store Settings', icon: Settings, requiresAdmin: true },
];
```

### 3.2 Exact Mapping & Required Changes
Modify `NAV_ITEMS` in `src/components/layout/Sidebar.jsx` as follows:

| Menu Item ID | Current Label | Required Simplified Label |
|---|---|---|
| `dashboard` | `Dashboard` | `Home / Overview` |
| `pos` | `POS Billing` | `Sales & Billing (POS)` |
| `inventory` | `Inventory Catalog` | `Medicine Stock` |
| `expiry` | `Expiry Radar` | `Expiry Alerts` |
| `region-ledger` | `Region Delivery Ledger` | `Region Deliveries & Cash` |
| `suppliers` | `Suppliers & PO` | `Suppliers & Purchases` |
| `analytics` | `Financial Analytics` | `Sales & Profit Reports` |
| `settings` | `Store Settings` | `Store Settings` |

#### Code Replacement in `src/components/layout/Sidebar.jsx`:
```javascript
export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Home / Overview', icon: LayoutDashboard, requiresAdmin: false },
  { id: 'pos', label: 'Sales & Billing (POS)', icon: ShoppingCart, requiresAdmin: false },
  { id: 'inventory', label: 'Medicine Stock', icon: Package, requiresAdmin: false },
  { id: 'expiry', label: 'Expiry Alerts', icon: AlertTriangle, requiresAdmin: false },
  { id: 'region-ledger', label: 'Region Deliveries & Cash', icon: MapPin, requiresAdmin: false },
  { id: 'suppliers', label: 'Suppliers & Purchases', icon: Truck, requiresAdmin: false },
  { id: 'analytics', label: 'Sales & Profit Reports', icon: TrendingUp, requiresAdmin: true },
  { id: 'settings', label: 'Store Settings', icon: Settings, requiresAdmin: true },
];
```

---

## 4. Summary Table of Files to Modify

| Requirement | Target File Path | Change Summary |
|---|---|---|
| **R1** | `src/components/modals/A4InvoiceModal.jsx` | Add `getTaxConfig` to named import from `../../data/mockData` (Line 3). |
| **R1** | `src/components/modals/A4InvoicePrintModal.jsx` | Add `getTaxConfig` to named import from `../../data/mockData` (Line 3). |
| **R3** | `src/utils/dateUtils.js` | Create utility module exporting `formatDateDDMMYYYY` helper function. |
| **R3** | `src/pages/POSPage.jsx`, `src/components/modals/A4InvoiceModal.jsx`, `src/components/modals/NewPOModal.jsx`, `src/pages/InventoryPage.jsx`, `src/components/region/RegionLedgerPage.jsx`, `src/pages/AnalyticsPage.jsx`, `src/pages/ExpiryRadarPage.jsx`, `src/components/region/PaymentHistoryModal.jsx` | Import `formatDateDDMMYYYY` and wrap date displays. |
| **R5** | `src/components/layout/Sidebar.jsx` | Update `label` strings in `NAV_ITEMS` array to simplified terms. |
