# Phase 2 Survey Report — Requirements R2 & R6

**Target Codebase**: `d:/Code/medical store whole sale/Medical Store Phase 2`  
**Explorer**: Explorer 2  
**Date**: 2026-08-13  

---

## 1. Executive Summary

This survey report provides a comprehensive architectural and code-level investigation for **Requirement R2** (6-Month Expiry Rejection & Warning Popups) and **Requirement R6** (Fresh Customer POS Workflow & Search Bar Dropdown Navigation) in the Phase 2 Medical Store ERP & POS codebase.

Key findings:
1. **Requirement R2**:
   - In `POSPage.jsx`, FEFO batch selection currently selects `activeBatches[0]` and calls `addToCart(...)` without validating whether the batch's expiry date is within 6 months of today.
   - In `NewPOModal.jsx`, purchase order inward items in `poItems` are saved directly to inventory without validating whether their expiry date is within 6 months of today.
   - A date parsing and 6-month threshold calculation utility is needed to enforce these checks and trigger warning popups.
2. **Requirement R6**:
   - `customerDetails` in `POSPage.jsx` and `formData` in `CustomerDetailsModal.jsx` are currently hardcoded with default values (`M/S Idrees Pharmacy / 280073`, `Jalapur Jattan`, etc.). Removing default values will make `CustomerDetailsModal.jsx` open with empty inputs and helpful placeholders.
   - The POS search bar in `POSPage.jsx` currently suppresses the inventory dropdown when `searchQuery` is empty (`if (!searchQuery.trim()) return false;` in `filteredSuggestions` and `if (searchQuery.trim().length > 0)` in `onFocus`). Modifying this to return full inventory when empty and triggering `setShowDropdown(true)` on `onFocus` will allow users to navigate full/filtered inventory with `ArrowDown` and `Enter`.

---

## 2. Requirement R2 Investigation: 6-Month Expiry Rejection & Warning Popups

### 2.1 `POSPage.jsx` Item/Batch Selection & Cart Addition

#### Current Code & Behavior
- **File**: `src/pages/POSPage.jsx`
- **Lines 108–123**:
  ```javascript
  const handleAddItemToCart = (med) => {
    const activeBatches = batches.filter(
      (b) => b.medicineId === med.id && b.status !== 'Quarantined'
    ).sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));

    if (activeBatches.length === 0) {
      return;
    }

    addToCart(med, activeBatches[0], 'Box');
    setSearchQuery('');
    setShowDropdown(false);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };
  ```
- **Line 135–141**: `handleKeyDown` calls `handleAddItemToCart(targetMed)` when `Enter` is pressed.
- **Line 281–283**: Dropdown `onClick` calls `handleAddItemToCart(med)`.

#### Expiry Date Storage & Parsing
- In `batches` objects (`InventoryContext`), `expiryDate` is stored as an ISO date string (`YYYY-MM-DD`, e.g., `'2028-12-31'`) or standardized date string.
- To compare an expiry date against 6 months from today:
  ```javascript
  const expDate = new Date(selectedBatch.expiryDate);
  const sixMonthsFromToday = new Date();
  sixMonthsFromToday.setMonth(sixMonthsFromToday.getMonth() + 6);
  ```
- If `expDate <= sixMonthsFromToday`, the item's earliest available batch expires within 6 months.

#### Insertion Location & Popup Display
- **Location**: Inside `handleAddItemToCart(med)` right before `addToCart(med, activeBatches[0], 'Box')`.
- **Validation Logic**:
  ```javascript
  const targetBatch = activeBatches[0];
  const expDate = new Date(targetBatch.expiryDate);
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() + 6);

  if (expDate <= cutoffDate) {
    alert("Cannot Add Item: Expiry Date Exceeded (Expires within 6 Months)");
    return;
  }
  ```
- **Alert Message**: `"Cannot Add Item: Expiry Date Exceeded (Expires within 6 Months)"`.

---

### 2.2 `NewPOModal.jsx` Batch Inward Expiry Check

#### Current Code & Behavior
- **File**: `src/components/modals/NewPOModal.jsx`
- **Lines 22–33**: Initial state of `poItems`:
  ```javascript
  const [poItems, setPoItems] = useState([
    {
      id: 1,
      brandName: 'Panadol Extra',
      genericFormula: 'Paracetamol 500mg + Caffeine 65mg',
      batchNumber: `B26-${Math.floor(1000 + Math.random() * 9000)}`,
      expiryDate: '2028-12-31',
      boxes: 20,
      purchasePriceBox: 480,
      boxPrice: 600,
    }
  ]);
  ```
- **Lines 72–175**: `handleSubmit` loops over `poItems` and calls `setBatches((prev) => [newBatch, ...prev])` and `createPurchaseOrder(poData)`.

#### Insertion Location & Popup Display
- **Location**: Inside `handleSubmit(e)` in `NewPOModal.jsx` before processing the inward line items into context (around Line 74).
- **Validation Logic**:
  ```javascript
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() + 6);

  for (let i = 0; i < poItems.length; i++) {
    const item = poItems[i];
    const expDate = new Date(item.expiryDate);
    if (expDate <= cutoffDate) {
      alert("Cannot Add Batch: Expiry Date Exceeded (Must be > 6 Months)");
      return;
    }
  }
  ```
- **Alert Message**: `"Cannot Add Batch: Expiry Date Exceeded (Must be > 6 Months)"`.

---

## 3. Requirement R6 Investigation: Fresh Customer POS Workflow & Search Dropdown

### 3.1 `POSPage.jsx` & `CustomerDetailsModal.jsx` Customer State Pre-fill Removal

#### Current Code & Behavior
- **File 1**: `src/pages/POSPage.jsx`
- **Lines 45–58**:
  ```javascript
  const [customerDetails, setCustomerDetails] = useState({
    customerName: 'M/S Idrees Pharmacy / 280073',
    region: 'Jalapur Jattan',
    address: 'Main Bazar, Near HBL Bank, Jalal Pur Jattan',
    customerPhone: '053-3724601',
    customerLicenseNo: '09-342-0139-98309',
    customerNtn: '34202-0723603-5',
    customerGst: '34202-0723603-5',
    fbrStatus: 'FILER As Per FBR On 03-11-2025',
    bookingMan: 'Naeem Shah',
    referenceNo: 'Naeem Shah',
    deliveryMan: 'Awais Ijaz',
    shipTo: 'Jalal Pur Jattan',
  });
  ```
- **File 2**: `src/components/modals/CustomerDetailsModal.jsx`
- **Lines 5–18**:
  ```javascript
  const [formData, setFormData] = useState({
    customerName: customerDetails?.customerName || 'M/S Idrees Pharmacy / 280073',
    region: customerDetails?.region || 'Jalapur Jattan',
    ...
  });
  ```

#### How to Ensure Empty Default State
1. **`POSPage.jsx`**: Change initial state of `customerDetails` to empty strings for all fields:
   ```javascript
   const [customerDetails, setCustomerDetails] = useState({
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
   });
   ```
2. **`CustomerDetailsModal.jsx`**: Change fallback values from hardcoded strings to `''`:
   ```javascript
   const [formData, setFormData] = useState({
     customerName: customerDetails?.customerName || '',
     region: customerDetails?.region || '',
     address: customerDetails?.address || '',
     customerPhone: customerDetails?.customerPhone || '',
     customerLicenseNo: customerDetails?.customerLicenseNo || '',
     customerNtn: customerDetails?.customerNtn || '',
     customerGst: customerDetails?.customerGst || '',
     fbrStatus: customerDetails?.fbrStatus || '',
     bookingMan: customerDetails?.bookingMan || '',
     referenceNo: customerDetails?.referenceNo || '',
     deliveryMan: customerDetails?.deliveryMan || '',
     shipTo: customerDetails?.shipTo || '',
   });
   ```
3. **Placeholders**: Ensure inputs have clear placeholder texts (e.g. `placeholder="e.g. M/S Idrees Pharmacy / 280073"`, `placeholder="e.g. Karianwala, Gujrat"`, etc.).
4. **Header Display in POS**: When `customerDetails.customerName` is empty, render `Customer: Not Selected (Click + Add / Select Customer Details)` for clarity.

---

### 3.2 `POSPage.jsx` Search Bar `onFocus` & Inventory Dropdown Navigation

#### Current Code & Behavior
- **File**: `src/pages/POSPage.jsx`
- **Lines 86–96**:
  ```javascript
  const filteredSuggestions = medicines.filter((m) => {
    if (!searchQuery.trim()) return false; // Prevents dropdown from showing when query is empty
    const q = searchQuery.toLowerCase().trim();
    return (
      (m.id && m.id.toLowerCase().includes(q)) ||
      m.brandName.toLowerCase().includes(q) ||
      ...
    );
  });
  ```
- **Lines 101–106**:
  ```javascript
  useEffect(() => {
    setHighlightedIndex(0);
    if (searchQuery.trim().length > 0) {
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  }, [searchQuery]);
  ```
- **Lines 242–244**:
  ```javascript
  onFocus={() => {
    if (searchQuery.trim().length > 0) setShowDropdown(true);
  }}
  ```

#### How to Enable `onFocus` Full/Filtered Inventory Dropdown
1. **Modify `filteredSuggestions`**:
   Return all medicines when `searchQuery` is empty (`!searchQuery.trim()`), allowing full inventory display on focus:
   ```javascript
   const filteredSuggestions = medicines.filter((m) => {
     if (!searchQuery.trim()) return true; // Show full inventory on focus when query is empty
     const q = searchQuery.toLowerCase().trim();
     return (
       (m.id && m.id.toLowerCase().includes(q)) ||
       m.brandName.toLowerCase().includes(q) ||
       (m.genericFormula && m.genericFormula.toLowerCase().includes(q)) ||
       (m.manufacturer && m.manufacturer.toLowerCase().includes(q)) ||
       (m.barcode && m.barcode.includes(q))
     );
   });
   ```
2. **Update `onFocus` handler**:
   Set `setShowDropdown(true)` whenever the search input gains focus:
   ```javascript
   onFocus={() => setShowDropdown(true)}
   ```
3. **Keyboard Navigation Support**:
   The existing `handleKeyDown` (lines 126–144) handles `ArrowDown`, `ArrowUp`, `Enter`, and `Escape`. With `showDropdown` true on focus, `ArrowDown` highlights items and `Enter` selects the highlighted item and adds it to cart via `handleAddItemToCart(targetMed)`.

---

## 4. Summary of Code Locations for Implementation

| Component | Target File | Line Numbers | Purpose |
|-----------|-------------|--------------|---------|
| Expiry Check (Cart) | `src/pages/POSPage.jsx` | 108–123 | Validate batch expiry > 6 months before `addToCart` |
| Expiry Check (PO) | `src/components/modals/NewPOModal.jsx` | 72–76 | Validate inward batch expiry > 6 months before submit |
| Customer Pre-fill | `src/pages/POSPage.jsx` | 45–58 | Reset `customerDetails` default values to `''` |
| Customer Modal | `src/components/modals/CustomerDetailsModal.jsx` | 5–18 | Reset fallback state to `''` and ensure placeholders |
| Search `onFocus` | `src/pages/POSPage.jsx` | 86–96, 242–244 | Allow empty query full inventory display and open dropdown `onFocus` |

---

## 5. Verification Method

1. **R2 POS Cart Addition Verification**:
   - Select or search a medicine with a batch expiring within 6 months.
   - Attempt to add item to cart.
   - Verify alert pop-up: `"Cannot Add Item: Expiry Date Exceeded (Expires within 6 Months)"`.
   - Verify item is NOT added to cart.
2. **R2 Purchase Order Inward Verification**:
   - Open New PO Modal.
   - Enter an inward item with expiry date <= 6 months from current date.
   - Click Save & Confirm.
   - Verify alert pop-up: `"Cannot Add Batch: Expiry Date Exceeded (Must be > 6 Months)"`.
   - Verify batch is NOT inwarded.
3. **R6 Fresh Customer POS Verification**:
   - Open POS Page.
   - Verify customer state is empty/unselected by default.
   - Click "+ Add / Select Customer Details".
   - Verify modal opens with empty input fields and clear placeholders.
4. **R6 Search `onFocus` & Keyboard Navigation Verification**:
   - Click search input field in POS Page without typing.
   - Verify dropdown opens showing full inventory list.
   - Press `ArrowDown` key to highlight items.
   - Press `Enter` key to select highlighted item into cart.
5. **Build Verification**:
   - Run `npm run build` to confirm 0 compilation errors.
