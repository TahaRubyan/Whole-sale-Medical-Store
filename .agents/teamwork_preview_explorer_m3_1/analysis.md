# Detailed Architecture & Implementation Plan: Milestone 3
## PharmaLink ERP & POS — Inventory, Expiry Radar & Supplier Management

---

## 1. Executive Summary

Milestone 3 focuses on delivering core back-office supply chain management features for PharmaLink ERP & POS:
- **Screen 3 (`src/pages/InventoryPage.jsx`)**: Master Inventory Catalog table with search, category/Schedule H/Low Stock filters, multi-batch side drawer (`BatchDetailDrawer.jsx`), and RBAC-controlled Admin Stock Override modal (`StockOverrideModal.jsx`).
- **Screen 4 (`src/pages/ExpiryRadarPage.jsx`)**: FEFO Expiry Radar and Quarantine Dashboard with 30/60/90-day timeline tabs, dynamic risk KPI summary cards (Batches at risk, Risk units, Estimated value loss in ₹), and one-click Supplier Return Note modal (`ReturnNoteModal.jsx`) generating printable Debit Notes.
- **Screen 5 (`src/pages/SuppliersPage.jsx`)**: Supplier Directory with distributor contact cards, GSTIN validation, active purchase order metrics, and an Inward Stock / New PO builder modal (`NewPOModal.jsx`) connected to a new `SupplierContext.jsx` that updates `InventoryContext.jsx` in real time.

---

## 2. Architecture & Data Flow Diagram

```
+-----------------------------------------------------------------------------------+
|                                   App.jsx                                         |
|  <AuthProvider>                                                                  |
|    <InventoryProvider>                                                            |
|      <SupplierProvider>  <-- NEW CONTEXT PROVIDER                                 |
|        <PatientProvider>                                                          |
|          <SalesProvider>                                                          |
|            <CartProvider>                                                         |
|              <Layout>                                                             |
|                InventoryPage | ExpiryRadarPage | SuppliersPage                    |
+-----------------------------------------------------------------------------------+
                                   |
   +-------------------------------+-------------------------------+
   |                               |                               |
   v                               v                               v
[InventoryPage]           [ExpiryRadarPage]                 [SuppliersPage]
   |  |                            |                               |
   |  +--> BatchDetailDrawer       +--> ReturnNoteModal            +--> NewPOModal
   |                                     (Debit Note)                   |
   +-----> StockOverrideModal                                           |
                |                                                       v
                +-------------------> [InventoryContext] <--------------+
                                            ^
                                            | updates batch stock / creates batches
                                  [localStorage persistence]
```

---

## 3. File-by-File Implementation Plan

### 3.1. `src/context/SupplierContext.jsx` (New File)
- **Purpose**: Manages supplier directory records and purchase order inward stock history.
- **State**:
  - `suppliers`: Initialized from `MOCK_SUPPLIERS` in `src/data/mockData.js`, stored in `localStorage` under `pharmalink_suppliers`.
  - `purchaseOrders`: Initialized with seed PO records or empty array `[]`, stored in `localStorage` under `pharmalink_purchase_orders`.
- **Functions Provided**:
  - `addSupplier(supplierData)`: Adds a new distributor profile.
  - `updateSupplier(supplierId, updatedFields)`: Modifies supplier details or outstanding balance.
  - `createPurchaseOrder({ supplierId, poNumber, date, items, totalAmount })`: Adds a new PO entry into `purchaseOrders` state and increments active order counts.
- **Context API Hook**: `useSupplier()`.

### 3.2. `src/context/InventoryContext.jsx` (Modifications)
- **Current State**: Manages `products` from `MOCK_PRODUCTS` with `deductStock` and `updateBatchStock`.
- **Required Modifications**:
  - Add `addOrUpdateBatch(productId, batchData)`:
    - Finds target product by `productId`.
    - If `batchData.batchNumber` already exists in `product.batches`, updates batch quantity (`quantity = batch.quantity + batchData.quantity`), purchase price, MRP, and expiry date.
    - If `batchData.batchNumber` is new, appends the batch to `product.batches`.
    - If `productId` is not found (e.g. brand new medicine), appends a new product object to `products`.
  - Ensure `updateBatchStock(productId, batchNo, newQty)` triggers state updates and saves to `localStorage`.

### 3.3. `src/App.jsx` (Modifications)
- **Required Modifications**:
  - Import `SupplierProvider` from `./context/SupplierContext`.
  - Wrap `<SupplierProvider>` inside `<InventoryProvider>` and around `<PatientProvider>`.

---

### 3.4. Screen 3: Master Inventory & Batch Manager (`src/pages/InventoryPage.jsx`)
- **Location**: `src/pages/InventoryPage.jsx`
- **UI Structure**:
  1. **Header Section**: Page title, subtitle, seed product counter badge, and RBAC lock notification banner for Cashier role.
  2. **Search & Filter Bar**:
     - Text search input: Filters by `name`, `genericName`, or `hsnCode`.
     - Category dropdown: Options (`All`, `Antibiotics`, `Analgesics / Antipyretic`, `Cough & Cold`, `Gastroenterology`, `Antidiabetic`, `Pain Relief Topicals`, `Medical Devices`).
     - Schedule H Toggle Button / Pill: Filter between `All`, `Rx Only` (`isScheduleH === true`), or `OTC Only` (`isScheduleH === false`).
     - Low Stock Toggle Button / Pill: Filters items where total stock across all batches <= `minStockLevel`.
  3. **Master Catalog Table**:
     - Columns:
       1. **Product & Generic Name**: Name (bold) + Generic Name (subtext).
       2. **Category & HSN**: Category badge + HSN Code pill.
       3. **Rack / Bin Location**: Monospace hotkey-pill with location (e.g. `Rack A-01 / Shelf 2`).
       4. **Schedule H**: `Rx Schedule H` badge or `OTC` text badge.
       5. **Total Stock**: Sum of quantities across all batches. Highlighted orange/red if low stock or out of stock.
       6. **Active Batches**: Count of batches with `quantity > 0` (e.g. `2 Batches`).
       7. **Actions**:
          - `View Batches` button: Opens `BatchDetailDrawer` for the selected product.
          - `Stock Override` button: Disabled/hidden for Cashier. Opens `StockOverrideModal` for Admin.

---

### 3.5. Component: Multi-Batch Side Drawer (`src/components/modals/BatchDetailDrawer.jsx`)
- **Location**: `src/components/modals/BatchDetailDrawer.jsx`
- **Type**: Side drawer / Modal overlay (`maxWidth: '700px'`).
- **Props**: `isOpen`, `onClose`, `product` (selected product object), `onOpenOverride(product, batch)`.
- **UI & Functionality**:
  - Header: Product Name, Generic Name, Category, HSN Code, Schedule H badge, and Rack Location.
  - Summary bar: Total Stock, Min Stock Level, Active Batch Count.
  - **Batch Detail Table**:
    - Columns: `Batch #`, `Expiry Date`, `Days Remaining & Status`, `MRP (₹)`, `Purchase Price (₹)`, `Stock Qty`, `Location`, `Action`.
    - Expiry Status Badge: Uses `Badge` component with `type="expiry"` displaying color-coded status (Expired, Near Expiry, Valid).
    - Purchase Price Visibility: Visible for Admin; masked/hidden for Cashier (`🔒 Locked`).
    - Action: `Override Stock` button (Admin only) that invokes `onOpenOverride(product, batch)`.

---

### 3.6. Component: Admin Stock Override Modal (`src/components/modals/StockOverrideModal.jsx`)
- **Location**: `src/components/modals/StockOverrideModal.jsx`
- **Props**: `isOpen`, `onClose`, `product`, `batch`.
- **RBAC Rule**: Uses `useAuth().permissions.canOverrideStock`. If `canOverrideStock === false`, returns access denied message.
- **Form Controls**:
  - Target Product & Batch read-only display.
  - Current Quantity read-only field.
  - New Stock Quantity input field (number, min: 0).
  - Override Reason select/input: ("Physical Stock Count Adjustment", "Damaged / Broken Vials", "Expired Goods Removal", "Supplier Return Inward", "Other").
  - Notes / Audit Memo text area.
- **Action**: On submit, calls `InventoryContext.updateBatchStock(productId, batchNumber, newQty)` and shows a notification toast.

---

### 3.7. Screen 4: Expiry Radar & Quarantine (`src/pages/ExpiryRadarPage.jsx`)
- **Location**: `src/pages/ExpiryRadarPage.jsx`
- **UI Structure**:
  1. **Header Section**: Radar title, FEFO audit badge, and explanation text.
  2. **Timeline Filter Tabs**:
     - `Expired` (`daysRemaining <= 0`)
     - `30 Days` (`0 < daysRemaining <= 30`)
     - `60 Days` (`0 < daysRemaining <= 60`)
     - `90 Days` (`0 < daysRemaining <= 90`)
     - `All Near Expiry` (`daysRemaining <= 90`) (Default selected).
  3. **Expiry Risk KPI Summary Cards** (Grid of 3 Cards):
     - **Card 1: Batches at Risk**: Count of matching batches.
     - **Card 2: Total Risk Units**: Sum of batch stock quantities.
     - **Card 3: Estimated Value Loss**: Dynamic ₹ calculation (`Σ (batch.quantity × batch.purchasePrice)` for cost loss, with MRP total retail value loss shown as subtitle).
  4. **Expiry Radar Table**:
     - Columns:
       1. `Medicine Name & Generic`: Name + Generic info.
       2. `Batch #`: Monospace batch pill.
       3. `Rack / Shelf Location`: Monospace location tag.
       4. `Expiry Date`: Full ISO date (`YYYY-MM-DD`).
       5. `Days Remaining`: Color-coded badge (`badge-danger` if <= 30 days or expired, `badge-warning` if <= 90 days).
       6. `Stock Quantity`: Available units.
       7. `Est. Cost Loss (₹)`: `(quantity × purchasePrice).toFixed(2)` (locked/hidden for Cashier).
       8. `Action`: "Generate Return Note" button -> opens `ReturnNoteModal`.

---

### 3.8. Component: One-Click Supplier Return Note Modal (`src/components/modals/ReturnNoteModal.jsx`)
- **Location**: `src/components/modals/ReturnNoteModal.jsx`
- **Props**: `isOpen`, `onClose`, `item` (near expiry batch details object).
- **UI & Functionality**:
  - Mode 1: Edit & Confirm Return Details:
    - Supplier selection (pre-selected from `item.supplier` or dropdown from `MOCK_SUPPLIERS`).
    - Product & Batch info (read-only).
    - Return Quantity (pre-populated with batch quantity, editable).
    - Reason: Pre-filled with `"Near Expiry Quarantine & Return"`.
    - Value Loss Calculation: Dynamic preview (`Return Qty × Purchase Price`).
  - Mode 2: Printable Return Debit Note Preview:
    - Styled formal Debit Note layout.
    - Header: PharmaLink Store Info & DL Numbers.
    - Supplier Info & GSTIN.
    - Debit Note # (e.g. `DN-2026-089`), Date, Reason.
    - Itemized Table: Medicine, Batch #, Expiry Date, Quantity, Rate, Total Amount.
    - Authorized Signatory line.
    - Action buttons: "Print Debit Note", "Close".

---

### 3.9. Screen 5: Supplier & Purchase Orders (`src/pages/SuppliersPage.jsx`)
- **Location**: `src/pages/SuppliersPage.jsx`
- **UI Structure**:
  1. **Header Section**: Supplier Directory title, active supplier count, and "+ New PO / Inward Stock" button (disabled for Cashier via `permissions.canCreatePurchaseOrder`).
  2. **Supplier Directory Table**:
     - Columns:
       1. `Distributor Name`: Supplier Name & ID.
       2. `Contact Person`: Name.
       3. `Phone & Email`: Phone + Email.
       4. `GSTIN`: GSTIN pill.
       5. `Address`: Warehouse address.
       6. `Outstanding Balance`: Styled red if `> 0`, green if `0.00`.
       7. `Active Orders`: Count of POs created for this supplier.
       8. `Actions`: "+ New PO" button (opens `NewPOModal` with supplier pre-selected).

---

### 3.10. Component: New PO / Inward Stock Builder Modal (`src/components/modals/NewPOModal.jsx`)
- **Location**: `src/components/modals/NewPOModal.jsx`
- **Props**: `isOpen`, `onClose`, `initialSupplierId`.
- **UI & Functionality**:
  - Step 1: Header & Supplier Selection (Dropdown of suppliers from `SupplierContext`).
  - Step 2: PO Reference Info (Auto-generated PO # e.g. `PO-2026-004`, Invoice Date).
  - Step 3: Dynamic Item Builder Table:
    - Allows adding multiple product lines to the inward purchase order.
    - For each line item:
      - Select Existing Medicine (dropdown from `InventoryContext.products`) or enter custom name.
      - Batch Number (`batchNumber`).
      - Expiry Date (`expiryDate` input type="date").
      - Purchase Price (`purchasePrice` input type="number").
      - MRP (`mrp` input type="number").
      - Inward Quantity (`quantity` input type="number").
      - Bin / Location (`location` input text, e.g. `Rack A-03 / Shelf 1`).
      - Line Total calculation (`quantity × purchasePrice`).
  - Action buttons: "+ Add Another Item", "Submit Inward PO".
  - On Submission:
    1. Creates PO record in `SupplierContext`.
    2. Calls `InventoryContext.addOrUpdateBatch` for each item, adding stock directly into active inventory.
    3. Triggers success toast and closes modal.

---

## 4. RBAC & Permissions Lockout Matrix

| Feature / Screen | Component / Action | Admin Role | Cashier Role | Permission Key |
|------------------|-------------------|------------|--------------|----------------|
| InventoryPage | Stock Override Button | Enabled | Disabled / Hidden | `permissions.canOverrideStock` |
| InventoryPage | Master Purchase Cost View | Visible | Masked (`🔒 Locked`) | `isAdmin` |
| BatchDetailDrawer | Batch Stock Override | Enabled | Disabled / Hidden | `permissions.canOverrideStock` |
| StockOverrideModal| Modal Submission | Full Access | Blocked / Access Denied | `permissions.canOverrideStock` |
| ExpiryRadarPage | Purchase Cost Loss Calculation | Visible | MRP Retail Loss Only | `isAdmin` |
| SuppliersPage | "+ New PO" Button | Enabled | Disabled / Hidden | `permissions.canCreatePurchaseOrder` |
| NewPOModal | Inward Stock Submission | Full Access | Blocked / Access Denied | `permissions.canCreatePurchaseOrder` |

---

## 5. File Creation & Modification Checklist

- [ ] `src/context/SupplierContext.jsx` (New)
- [ ] `src/context/InventoryContext.jsx` (Modify: Add `addOrUpdateBatch`)
- [ ] `src/App.jsx` (Modify: Add `SupplierProvider`)
- [ ] `src/pages/InventoryPage.jsx` (Modify: Implement search, filters, drawer integration, override modal integration)
- [ ] `src/components/modals/BatchDetailDrawer.jsx` (New)
- [ ] `src/components/modals/StockOverrideModal.jsx` (New)
- [ ] `src/pages/ExpiryRadarPage.jsx` (Modify: Implement timeline tabs, risk KPI cards, return note integration)
- [ ] `src/components/modals/ReturnNoteModal.jsx` (New)
- [ ] `src/pages/SuppliersPage.jsx` (Modify: Implement supplier directory, active order metrics, new PO trigger)
- [ ] `src/components/modals/NewPOModal.jsx` (New)

---
