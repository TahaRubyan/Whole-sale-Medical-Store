# Detailed Technical Analysis & Implementation Plan for Milestone 2: POS & FEFO Billing Checkout + Modals

## Executive Summary
This document defines the complete technical design, data structures, state management architecture, component layout, and file-by-file implementation plan for **Milestone 2 (POS & FEFO Billing Checkout + Modals)** of the PharmaLink ERP & POS application.

---

## 1. Codebase Architecture & Baseline Analysis

### 1.1 Baseline System State (Post-Milestone 1)
- **Framework & Styling**: Vite + React 18 (JSX), Vanilla CSS with custom CSS variables (`theme.css`, `global.css`).
- **Design Tokens**: Ocean Blue palette (`#0284C7` primary, `#F7F4EF` canvas background, `#E0F2FE` ice blue tint, `#0F172A` text main).
- **Existing Files in `src/`**:
  - `src/App.jsx`: Root component currently providing `AuthProvider` and rendering active screen.
  - `src/context/AuthContext.jsx`: Manages RBAC role state (`Admin` ↔ `Cashier`).
  - `src/data/mockData.js`: Central mock seed database containing `STORE_INFO`, `MOCK_PRODUCTS`, `MOCK_SUPPLIERS`, `MOCK_PATIENTS`, `MOCK_SALES_HISTORY`, and FEFO helper functions (`getFEFOBatch`, `getNearExpiryBatches`).
  - `src/hooks/useHotkeys.js`: Global keyboard listener handling `F1`-`F4` screen navigation, `F9` (Thermal Receipt), `F10` (A4 Tax Invoice).
  - `src/components/layout/`: `Layout.jsx`, `Sidebar.jsx`, `Topbar.jsx`. Currently `Layout.jsx` contains static prototype modals for F9 and F10.
  - `src/pages/POSPage.jsx`: Currently contains placeholder UI card.

---

## 2. Milestone 2 Target Component Architecture

### 2.1 Directory Layout for M2 Artifacts
```
src/
├── context/
│   ├── AuthContext.jsx          (Existing - M1)
│   ├── InventoryContext.jsx     (NEW - Live stock & batch management)
│   ├── PatientContext.jsx       (NEW - Patient registry & Rx history)
│   ├── SalesContext.jsx         (NEW - Transaction ledger & sales history)
│   └── CartContext.jsx          (NEW - Cart state, FEFO auto-assign, checkout)
├── components/
│   ├── common/                  (NEW Directory)
│   │   ├── Modal.jsx            (NEW - Generic accessible modal wrapper)
│   │   ├── Badge.jsx            (NEW - Reusable status/Rx/Rack badges)
│   │   └── NotificationToast.jsx(NEW - POS feedback toasts)
│   └── modals/                  (NEW Directory)
│       ├── ThermalReceiptModal.jsx (NEW - 80mm POS receipt preview & print)
│       ├── A4InvoiceModal.jsx      (NEW - Full A4 GST Tax Invoice preview & print)
│       └── PatientRxDrawer.jsx     (NEW - Schedule H prescription collector)
└── pages/
    └── POSPage.jsx              (REWRITE - Full interactive POS & Billing interface)
```

---

## 3. Data Structures & Context State Contracts

### 3.1 `InventoryContext.jsx` State & API
- **State**: `products` (initialized from `MOCK_PRODUCTS` with `localStorage` persistence under key `pharmalink_inventory`).
- **Methods**:
  - `deductStock(cartItems)`: For each item in cart, locates product by `productId` and batch by `batchNumber`, and subtracts `item.quantity` from `batch.quantity`. Clamps minimum quantity to `0`.
  - `updateStockBatch(productId, batchNumber, newQty)`: Administrative stock modification.
  - `getFEFOBatch(product)`: Returns batch object with earliest `expiryDate` where `quantity > 0`.

### 3.2 `PatientContext.jsx` State & API
- **State**: `patients` (initialized from `MOCK_PATIENTS` with `localStorage` persistence under key `pharmalink_patients`).
- **Methods**:
  - `addPatient(patientData)`: Appends new patient record `{ id: 'PAT-xxx', name, phone, doctorName, chronicMedicines: [], totalVisits: 1, lastVisitDate: '2026-08-01' }`.
  - `searchPatients(query)`: Case-insensitive search by patient name or phone number.
  - `updatePatientVisit(patientId, doctorName)`: Increments `totalVisits` and updates `lastVisitDate`.

### 3.3 `SalesContext.jsx` State & API
- **State**: `recentTransactions` (list of completed invoices) and `salesHistory` (daily totals seeded from `MOCK_SALES_HISTORY`).
- **Methods**:
  - `recordSale(saleRecord)`: Appends full transaction details to `recentTransactions` and updates today's total sales and order count in `salesHistory`.

### 3.4 `CartContext.jsx` State & API
- **State**:
  - `cart`: Array of item objects:
    ```javascript
    {
      productId: 'PROD-001',
      name: 'Augmentin 625 Duo',
      genericName: 'Amoxicillin (500mg) + Clavulanic Acid (125mg)',
      category: 'Antibiotics',
      isScheduleH: true,
      hsnCode: '3004',
      gstPercentage: 12,
      location: 'Rack A-01 / Shelf 2',
      batchNumber: 'BT-2026-08',
      expiryDate: '2026-08-15',
      mrp: 201.50,
      purchasePrice: 145.00,
      quantity: 1,
      availableStock: 45,
      allBatches: [ /* Array of all batches for batch selector */ ]
    }
    ```
  - `rxPatient`: `{ name: '', phone: '', doctorName: '', rxDate: '2026-08-01', isExisting: false }` (or `null`).
  - `discount`: `{ type: 'percentage', value: 0 }`.
  - `paymentMode`: `'Cash'` | `'Card'` | `'UPI'`.
  - `cashTendered`: `0.00`.
  - `lastCompletedSale`: Completed invoice object for printing (or `null`).
  - `activeModal`: `'thermal'` | `'a4'` | `'rx_drawer'` | `null`.

- **Calculated Properties**:
  - `subtotal`: $\sum (\text{item.mrp} \times \text{item.quantity})$
  - `discountAmount`: If `percentage`, $\text{subtotal} \times (\text{value} / 100)$; if `amount`, $\text{value}$.
  - `netSubtotal`: $\text{subtotal} - \text{discountAmount}$.
  - `taxableAmount`: $\sum \left( \frac{\text{itemNetTotal}}{1 + \text{item.gstPercentage} / 100} \right)$
  - `gstTotal`: $\text{netSubtotal} - \text{taxableAmount}$.
  - `grandTotal`: Math.round($\text{netSubtotal}$).
  - `changeDue`: Math.max(0, `cashTendered` - `grandTotal`).
  - `hasScheduleHItems`: `cart.some(item => item.isScheduleH)`.
  - `isRxComplete`: `Boolean(rxPatient?.name && rxPatient?.phone && rxPatient?.doctorName)`.

- **Key Operations**:
  - `addToCart(product, selectedBatch = null)`:
    1. If `selectedBatch` is provided, use it. Else, compute FEFO batch: find active batches where `quantity > 0` sorted by `expiryDate` ascending.
    2. If no batch available with stock > 0, display toast notification "Product Out of Stock".
    3. Check if exact `(productId, batchNumber)` combination already exists in `cart`.
    4. If exists, increment `quantity` up to `availableStock`.
    5. If new, push new item with `quantity: 1`.
  - `switchBatch(productId, oldBatchNumber, newBatch)`: Replaces specified item's batch details (batchNumber, expiryDate, mrp, availableStock) with `newBatch`.
  - `updateQuantity(productId, batchNumber, newQty)`: Clamps quantity between `1` and `availableStock`.
  - `removeFromCart(productId, batchNumber)`: Removes matching item from cart.
  - `processCheckout()`:
    1. Validate `cart.length > 0`.
    2. If `hasScheduleHItems` is true and `!isRxComplete`, set `activeModal = 'rx_drawer'` and return `false`.
    3. Create transaction record:
       ```javascript
       const invoiceNo = `INV-${Date.now().toString().slice(-6)}`;
       const saleRecord = {
         id: invoiceNo,
         date: new Date().toISOString().split('T')[0],
         time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
         cashier: user.name,
         patient: rxPatient || { name: 'Walk-in Cash Patient', phone: '-' },
         items: [...cart],
         subtotal,
         discountAmount,
         taxableAmount,
         gstTotal,
         grandTotal,
         paymentMode,
         cashTendered,
         changeDue
       };
       ```
    4. Execute `inventoryContext.deductStock(cart)`.
    5. Execute `salesContext.recordSale(saleRecord)`.
    6. If `rxPatient?.name`, execute `patientContext.addPatient(rxPatient)`.
    7. Set `lastCompletedSale = saleRecord`.
    8. Clear `cart`, reset `rxPatient`, reset `discount`.
    9. Set `activeModal = 'thermal'`.
    10. Return `true`.

---

## 4. UI & Modal Requirements Specification

### 4.1 POS Omni-Search & Product Catalog Grid (`POSPage.jsx`)
- **Omni-Search Bar**:
  - Live query filtering across 4 attributes:
    1. Product Barcode / ID (`PROD-001`)
    2. Product Name (`Augmentin 625 Duo`)
    3. Generic Composition (`Amoxicillin`)
    4. HSN Code (`3004`)
  - Auto-focus hotkey listener (`F2` shortcut key moves cursor to search bar).
  - Barcode Scanner Integration: Pressing `Enter` in the search field when an exact barcode or ID match exists immediately invokes `addToCart(matchedProduct)` and clears the search input.
- **Category Filter Pills**:
  - Buttons: `All`, `Schedule H (Rx)`, `OTC`, `First Aid`, `Supplements`.
  - Clicking filter pill dynamically filters product list.
- **Product Item Card / Row**:
  - Displays: Medicine Name, Generic composition, HSN code, Schedule H badge (`Rx` red pill), Rack/Shelf bin location (`Rack A-01 / Shelf 2`), FEFO batch number (`BT-2026-08`), expiry date badge (red highlight if expiring within 90 days), total stock count.
  - "Add to Cart" button: Triggers FEFO auto-selection. Disabled if total stock is 0.

### 4.2 Cart Summary & Billing Panel (`POSPage.jsx`)
- **Schedule H Alert Banner**: Appears at top of cart when Schedule H items are present. Shows Rx status badge (`Rx Patient Info Missing - Action Required` or `Rx Captured: Patient Name`).
- **Itemized Cart Table**:
  - Columns: Item Details (Name + Generic), Batch & Expiry (with Batch Selector dropdown), Location Badge, Quantity (`-` input `+`), Unit MRP, Line Total, Delete action.
- **Calculation Panel**:
  - Subtotal, Discount Input (`%` / `₹` toggle), Taxable Base, GST Breakdown (CGST 6% + SGST 6%), Round Off, Net Payable Total.
- **Payment Method Selector**:
  - Option tiles: `Cash`, `Card`, `UPI / QR Code`.
  - Cash tendered input field with instant change calculation.
- **Primary Checkout Button**:
  - "Complete Checkout & Print (Enter / F2)" button. Large, styled in Ocean Blue (`#0284C7`).

### 4.3 Schedule H Rx Patient Drawer Modal (`PatientRxDrawer.jsx`)
- **Header**: Red Rx symbol + "Schedule H Drug Control - Prescription & Patient Registration".
- **Patient Lookup**: Autocomplete input searching existing patients in `PatientContext`. Selecting a patient pre-fills Name and Phone.
- **Form Inputs**:
  - Patient Full Name (Text, required)
  - Patient Phone Number (Tel, required)
  - Prescribing Doctor Name & Reg. No. (Text, required, e.g., `Dr. S. K. Gupta (MD)`)
  - Prescription Date (Date picker, default `2026-08-01`)
- **Actions**: "Save Prescription Details" button and "Cancel" button.

### 4.4 80mm POS Thermal Receipt Modal (`ThermalReceiptModal.jsx`)
- **Trigger**: F9 hotkey, Topbar button, or automatic pop-up post checkout.
- **Design**:
  - 80mm POS slip format (~360px width, centered receipt paper box, dashed divider lines, monospace font).
- **Sections**:
  - Store Header: `PharmaLink Chemist & Healthcare`, License Numbers (`DL-20/2024/7890`), GSTIN, Address, Phone.
  - Receipt Metadata: Invoice #, Date & Time, Cashier Name.
  - Patient & Doctor Info (if Rx captured).
  - Item List: `[Name / Batch | Qty | Rate | Amount]`
  - Summary: Subtotal, Discount, Taxable Amt, CGST (6%), SGST (6%), Total Paid, Payment Mode.
  - Barcode & Footer: SVG Barcode + Statutory Disclaimer ("Schedule H drugs dispensed under prescription of registered medical practitioner").
- **Actions**: "Print Receipt" (triggers browser print / notification) and "Close (Esc)".

### 4.5 A4 GST Tax Invoice Modal (`A4InvoiceModal.jsx`)
- **Trigger**: F10 hotkey or Topbar button.
- **Design**: Full A4 printable GST Tax Invoice layout (~780px preview container).
- **Sections**:
  - Official Header: Store logo, name, full address, DL Form 20/21 numbers, GSTIN.
  - Bill To & Invoice Info: Billed patient name, phone, doctor name, invoice #, date, place of supply.
  - Itemized Table: `#`, `Item Description`, `HSN`, `Batch`, `Expiry`, `Qty`, `MRP`, `Rate`, `GST %`, `Taxable Value`, `Total`.
  - GST Tax Breakdown Table: HSN-wise tax summary table (Taxable Value, CGST %, CGST Amt, SGST %, SGST Amt, Total Tax).
  - Financial Totals & Words: Total in numbers (`₹262.50`) and Total in Words ("Two Hundred Sixty Two Rupees and Fifty Paise Only").
  - Terms & Signatures: Terms & Conditions + Authorized Pharmacist Signatory box.
- **Actions**: "Print A4 Invoice" and "Close (Esc)".

---

## 5. Concrete Execution & File-by-File Plan

| Step | Target File | Action / Description |
|------|-------------|----------------------|
| 1 | `src/context/InventoryContext.jsx` | Create new context for inventory & stock batch deduction |
| 2 | `src/context/PatientContext.jsx` | Create new context for patient registry & Rx history |
| 3 | `src/context/SalesContext.jsx` | Create new context for transaction ledger |
| 4 | `src/context/CartContext.jsx` | Create new context for cart, FEFO auto-assign, calculations, checkout |
| 5 | `src/App.jsx` | Wrap application with Inventory, Patient, Sales, and Cart Context Providers |
| 6 | `src/components/common/Badge.jsx` | Create reusable status, Schedule H Rx, and rack location badge component |
| 7 | `src/components/common/Modal.jsx` | Create reusable modal overlay shell component |
| 8 | `src/components/common/NotificationToast.jsx` | Create POS notification toast component |
| 9 | `src/components/modals/PatientRxDrawer.jsx` | Create Schedule H patient & prescribing doctor drawer modal |
| 10 | `src/components/modals/ThermalReceiptModal.jsx` | Create 80mm POS style thermal receipt modal |
| 11 | `src/components/modals/A4InvoiceModal.jsx` | Create full A4 GST Tax Invoice preview & print modal |
| 12 | `src/pages/POSPage.jsx` | Implement full interactive POS billing page with Omni-Search, FEFO badges, cart, batch switching, calculations, and checkout |
| 13 | `src/components/layout/Layout.jsx` | Connect global F9 / F10 hotkeys and Topbar triggers to `CartContext` active modal state |
