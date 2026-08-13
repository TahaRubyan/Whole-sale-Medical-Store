# Milestone 2 Exploration & Technical Analysis Report
**Explorer Agent**: `explorer_m2_1`  
**Milestone**: M2 (R2: 6-Month Expiry Rejection & Warning Popups, R3: Date Standardization DD-MM-YYYY)  
**Target Directory**: `d:/Code/medical store whole sale/Medical Store Phase 2`  
**Timestamp**: 2026-08-13T01:02:00Z  

---

## 1. Observation

Direct observations from codebase inspection across `src/`:

### R2: 6-Month Expiry Rejection
1. **`src/pages/POSPage.jsx`**:
   - In `handleAddItemToCart(med)` (lines 108–123), active batches are filtered and sorted by `expiryDate`:
     ```javascript
     const activeBatches = batches.filter(
       (b) => b.medicineId === med.id && b.status !== 'Quarantined'
     ).sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
     ```
   - In `INITIAL_BATCHES` (`src/data/mockData.js`), batch expiry dates are stored as ISO/date strings formatted as `"YYYY-MM-DD"` (e.g., `"2027-06-30"`, `"2026-08-25"`).
   - Currently, `POSPage.jsx` adds `activeBatches[0]` directly to cart without checking whether the expiry date is within 6 months of today.
   - Required behavior: Parse the batch's `expiryDate`, compare against today + 6 months. If `expiryDate` <= 6 months from today, block addition and trigger:
     `alert("Cannot Add Item: Expiry Date Exceeded (Expires within 6 Months)");`

2. **`src/components/modals/NewPOModal.jsx`**:
   - In `NewPOModal.jsx` (lines 72–175), `handleSubmit(e)` processes `poItems` containing `<input type="date">` fields (`item.expiryDate` formatted as `"YYYY-MM-DD"`).
   - Currently, `handleSubmit` processes all `poItems` into `SupplierContext` and `InventoryContext` without validating batch expiry dates against a 6-month threshold.
   - Required behavior: Prior to saving/confirming the PO in `handleSubmit`, validate each line item's `expiryDate`. If any item's `expiryDate` is <= 6 months from today, block submission and trigger:
     `alert("Cannot Add Batch: Expiry Date Exceeded (Must be > 6 Months)");`

### R3: Date Standardization (`DD-MM-YYYY`)
1. **Utility Creation**:
   - `src/utils/dateUtils.js` does not exist yet and must be created.
   - Must export `formatDateDDMMYYYY(dateInput)`.
   - Must handle ISO strings (`YYYY-MM-DDTHH:mm:ss`), `YYYY-MM-DD`, `DD/MM/YYYY`, `YYYY-MM`, Date objects, empty/null values, returning `DD-MM-YYYY` (e.g., `13-08-2026`).

2. **Date Rendering Locations Identified Across 8 Target Areas**:
   - **`src/pages/POSPage.jsx`**:
     - Line 381: `{ci.expiryDate}` in cart line items table.
   - **`src/components/modals/A4InvoiceModal.jsx`**:
     - Line 159: `Invoice Date:` `{sale.date || '03/08/2026'}`
     - Line 161: `Due Date:` `{sale.dueDate || sale.date || '03/08/2026'}`
     - Line 221: Item table Expiry Date column `{item.expiryDate || '2028-12-31'}`
   - **`src/components/modals/A4InvoicePrintModal.jsx`**:
     - Line 159: `Invoice Date:` `{invoice.date || '03/08/2026'}`
     - Line 161: `Due Date:` `{invoice.dueDate || invoice.date || '03/08/2026'}`
     - Line 221: Item table Expiry Date column `{item.expiryDate || '2028-12-31'}`
   - **`src/components/modals/NewPOModal.jsx`**:
     - Keeps `<input type="date">` values formatted as `YYYY-MM-DD` for native browser HTML5 input compliance, but uses `formatDateDDMMYYYY` for any rendered text summaries/labels.
   - **`src/pages/InventoryPage.jsx` & `StockSummaryReportModal.jsx`**:
     - `StockSummaryReportModal.jsx` Line 435: `Report Generated On: {currentDateStr}`
   - **`src/pages/RegionLedgerPage.jsx` & `src/components/region/`**:
     - `PaymentHistoryModal.jsx` Line 180: Payment log timestamp date `<span>{log.date}</span>`
     - `RegionalDeliveryManifestModal.jsx` Line 276: `Manifest Date: {currentDateStr}`
   - **`src/pages/AnalyticsPage.jsx` (Financial Reports / Analytics)**:
     - Line 398: Daily sales summary date `{day.date}`
     - Line 455: Detailed transactions log date `{inv.date}`
     - `AnalyticsReportPrintModal.jsx` Line 214: PDF transaction audit log date `{inv.date}`
     - `AnalyticsReportPrintModal.jsx` Line 240: PDF Report Generated On `{currentDateStr}`
   - **`src/pages/ExpiryRadarPage.jsx`**:
     - Line 129: Batch Expiry Date column `{item.expiryDate}`
   - **`src/pages/SuppliersPage.jsx`**:
     - Line 173: Inward Purchase Orders log date column `{po.inwardDate || po.date}`

---

## 2. Logic Chain

1. **Date Parsing & Calculation for 6 Months**:
   - `expiryDate` strings in the application are primarily formatted as `YYYY-MM-DD` (e.g. `"2026-08-25"` or `"2027-06-30"`).
   - In JavaScript, `new Date("YYYY-MM-DD")` parses to UTC midnight.
   - To calculate the 6-month threshold from today:
     ```javascript
     const today = new Date();
     // Set cutoff to exactly 6 calendar months in the future
     const sixMonthsCutoff = new Date(today.getFullYear(), today.getMonth() + 6, today.getDate());
     ```
     Alternatively, using 180 days:
     `const sixMonthsCutoff = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000);`
     Using 6 calendar months (`sixMonthsCutoff.setMonth(today.getMonth() + 6)`) is standard and handles variable month lengths gracefully.
   - Any batch with `new Date(batch.expiryDate) <= sixMonthsCutoff` fails the 6-month requirement.

2. **R2 Check Placement**:
   - In `POSPage.jsx` -> `handleAddItemToCart`:
     Check `activeBatches[0]`. If `new Date(activeBatches[0].expiryDate) <= sixMonthsCutoff`, show exact alert: `"Cannot Add Item: Expiry Date Exceeded (Expires within 6 Months)"` and `return`.
   - In `NewPOModal.jsx` -> `handleSubmit`:
     Iterate through `poItems`. If any `item` has `new Date(item.expiryDate) <= sixMonthsCutoff`, show exact alert: `"Cannot Add Batch: Expiry Date Exceeded (Must be > 6 Months)"` and `return` (preventing form submission).

3. **R3 Utility Design (`src/utils/dateUtils.js`)**:
   - The utility function `formatDateDDMMYYYY(dateInput)` must handle:
     - Null / undefined / empty string -> return `''`
     - `Date` instances -> format `DD-MM-YYYY`
     - Strings matching `YYYY-MM-DD` -> split by `-` and return `DD-MM-YYYY`
     - Strings matching `DD/MM/YYYY` -> split by `/` and return `DD-MM-YYYY`
     - Strings matching `YYYY-MM` -> split by `-` and return `01-MM-YYYY`
     - Strings matching `DD-MM-YYYY` -> return directly
     - ISO strings / generic dates -> `new Date(dateInput)` and format `DD-MM-YYYY`

---

## 3. Caveats

- **Native `<input type="date">` Compatibility**: HTML5 `<input type="date">` elements require values in `YYYY-MM-DD` format. Standardizing displayed text dates to `DD-MM-YYYY` must not break `<input type="date">` `value` bindings in forms (such as in `NewPOModal.jsx` and `AnalyticsPage.jsx` custom date pickers).
- **Date String Separators**: Some mock data or user inputs contain dates formatted as `DD/MM/YYYY` (slashes) vs `YYYY-MM-DD` (dashes). `dateUtils.js` must safely handle both separators without NaN outputs.

---

## 4. Conclusion

Milestone 2 implementation is straightforward and well-contained:
1. `src/utils/dateUtils.js` can be implemented as a zero-dependency helper module.
2. `POSPage.jsx` and `NewPOModal.jsx` require simple date validation checks before cart/PO operations.
3. Import `formatDateDDMMYYYY` across all 8 designated target components to standardize date formatting.

---

## 5. Step-by-Step Implementation Guide & Verification Method

### Step 1: Create `src/utils/dateUtils.js`
Write the following content to `src/utils/dateUtils.js`:

```javascript
/**
 * Date Standardization Utility for Wholesale Medical Store ERP
 * Formats any valid date input into DD-MM-YYYY string format.
 * 
 * @param {string|Date|null|undefined} dateInput 
 * @returns {string} Formatted date string in DD-MM-YYYY or empty string if invalid
 */
export const formatDateDDMMYYYY = (dateInput) => {
  if (!dateInput) return '';

  if (dateInput instanceof Date) {
    if (isNaN(dateInput.getTime())) return '';
    const day = String(dateInput.getDate()).padStart(2, '0');
    const month = String(dateInput.getMonth() + 1).padStart(2, '0');
    const year = dateInput.getFullYear();
    return `${day}-${month}-${year}`;
  }

  if (typeof dateInput === 'string') {
    const str = dateInput.trim();
    if (!str) return '';

    // Already DD-MM-YYYY
    if (/^\d{2}-\d{2}-\d{4}$/.test(str)) {
      return str;
    }

    // DD/MM/YYYY format
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
      const [d, m, y] = str.split('/');
      return `${d.padStart(2, '0')}-${m.padStart(2, '0')}-${y}`;
    }

    // YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      const [y, m, d] = str.split('-');
      return `${d.padStart(2, '0')}-${m.padStart(2, '0')}-${y}`;
    }

    // YYYY-MM format
    if (/^\d{4}-\d{2}$/.test(str)) {
      const [y, m] = str.split('-');
      return `01-${m.padStart(2, '0')}-${y}`;
    }

    // Generic date or ISO string parsing
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    }
  }

  return String(dateInput);
};

/**
 * Check if a date string or Date object is within 6 months from today.
 * 
 * @param {string|Date} dateInput 
 * @returns {boolean} True if date is <= 6 months from today (or already expired)
 */
export const isWithinSixMonths = (dateInput) => {
  if (!dateInput) return false;
  const expDate = new Date(dateInput);
  if (isNaN(expDate.getTime())) return false;

  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() + 6);

  return expDate <= cutoff;
};
```

---

### Step 2: Implement 6-Month Expiry Rejection (R2)

1. **In `src/pages/POSPage.jsx`**:
   - Import `isWithinSixMonths` and `formatDateDDMMYYYY` from `../utils/dateUtils`.
   - Update `handleAddItemToCart`:
     ```javascript
     const handleAddItemToCart = (med) => {
       const activeBatches = batches.filter(
         (b) => b.medicineId === med.id && b.status !== 'Quarantined'
       ).sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));

       if (activeBatches.length === 0) {
         return;
       }

       const targetBatch = activeBatches[0];
       if (isWithinSixMonths(targetBatch.expiryDate)) {
         alert("Cannot Add Item: Expiry Date Exceeded (Expires within 6 Months)");
         return;
       }

       addToCart(med, targetBatch, 'Box');
       setSearchQuery('');
       setShowDropdown(false);
       if (searchInputRef.current) {
         searchInputRef.current.focus();
       }
     };
     ```

2. **In `src/components/modals/NewPOModal.jsx`**:
   - Import `isWithinSixMonths` from `../../utils/dateUtils`.
   - Update `handleSubmit(e)`:
     ```javascript
     const handleSubmit = (e) => {
       e.preventDefault();

       for (const item of poItems) {
         if (isWithinSixMonths(item.expiryDate)) {
           alert("Cannot Add Batch: Expiry Date Exceeded (Must be > 6 Months)");
           return;
         }
       }
       // ... proceed with PO creation ...
     };
     ```

---

### Step 3: Apply `formatDateDDMMYYYY` Across Target Date Rendering Locations (R3)

1. `src/pages/POSPage.jsx`:
   - Line 381: `{formatDateDDMMYYYY(ci.expiryDate)}`

2. `src/components/modals/A4InvoiceModal.jsx`:
   - Line 159: `{formatDateDDMMYYYY(sale.date || '03/08/2026')}`
   - Line 161: `{formatDateDDMMYYYY(sale.dueDate || sale.date || '03/08/2026')}`
   - Line 221: `{formatDateDDMMYYYY(item.expiryDate || '2028-12-31')}`

3. `src/components/modals/A4InvoicePrintModal.jsx`:
   - Line 159: `{formatDateDDMMYYYY(invoice.date || '03/08/2026')}`
   - Line 161: `{formatDateDDMMYYYY(invoice.dueDate || invoice.date || '03/08/2026')}`
   - Line 221: `{formatDateDDMMYYYY(item.expiryDate || '2028-12-31')}`

4. `src/components/inventory/StockSummaryReportModal.jsx` (under `InventoryPage`):
   - Line 435: `Report Generated On: {formatDateDDMMYYYY(new Date())}`

5. `src/components/region/PaymentHistoryModal.jsx` (under `RegionLedgerPage`):
   - Line 180: `{formatDateDDMMYYYY(log.date)}`

6. `src/components/region/RegionalDeliveryManifestModal.jsx` (under `RegionLedgerPage`):
   - Line 276: `Manifest Date: {formatDateDDMMYYYY(new Date())}`

7. `src/pages/AnalyticsPage.jsx` & `AnalyticsReportPrintModal.jsx`:
   - `AnalyticsPage.jsx` Line 398: `{formatDateDDMMYYYY(day.date)}`
   - `AnalyticsPage.jsx` Line 455: `{formatDateDDMMYYYY(inv.date)}`
   - `AnalyticsReportPrintModal.jsx` Line 214: `{formatDateDDMMYYYY(inv.date)}`
   - `AnalyticsReportPrintModal.jsx` Line 240: `{formatDateDDMMYYYY(new Date())}`

8. `src/pages/ExpiryRadarPage.jsx`:
   - Line 129: `{formatDateDDMMYYYY(item.expiryDate)}`

9. `src/pages/SuppliersPage.jsx`:
   - Line 173: `{formatDateDDMMYYYY(po.inwardDate || po.date)}`

---

## 6. Verification Method

Run the following commands in `d:/Code/medical store whole sale/Medical Store Phase 2`:

1. **Build Verification**:
   ```powershell
   npm run build
   ```
   Must exit with code 0 and 0 errors.

2. **Automated Unit Verification**:
   Run node test on `dateUtils.js`:
   ```powershell
   node -e "const { formatDateDDMMYYYY, isWithinSixMonths } = require('./src/utils/dateUtils.js'); console.log(formatDateDDMMYYYY('2026-08-13'), isWithinSixMonths('2026-09-01'));"
   ```

3. **Manual Verification Steps**:
   - Open POS Page: Select medicine with batch expiry <= 6 months (e.g., `BAT-RIS-2026B` with expiry `2026-08-25`). Confirm alert `"Cannot Add Item: Expiry Date Exceeded (Expires within 6 Months)"` appears and item is NOT added to cart.
   - Open New PO Modal: Enter batch with expiry date <= 6 months from today. Click Save & Confirm. Confirm alert `"Cannot Add Batch: Expiry Date Exceeded (Must be > 6 Months)"` appears and PO is NOT saved.
   - Verify Date Format: Check dates across POS cart, A4 Invoices, Inventory reports, Region Ledger payment logs, Analytics reports, Expiry Radar, and Suppliers PO table. Confirm all display in `DD-MM-YYYY` format.
