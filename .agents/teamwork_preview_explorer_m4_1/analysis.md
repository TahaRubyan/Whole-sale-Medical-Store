# Detailed Technical Analysis & File-by-File Implementation Plan for Milestone 4

## Executive Summary
Milestone 4 completes the operational core of PharmaLink ERP & POS by implementing:
1. **Screen 6: Prescriptions & Patient Records (`src/pages/PatientsPage.jsx`)** with Patient Registry, Rx Search/Filter, Patient Rx History Side Drawer (`src/components/modals/PatientHistoryDrawer.jsx`), and New Patient Registration Modal (`src/components/modals/NewPatientModal.jsx`).
2. **Screen 7: Financial & Sales Analytics (`src/pages/AnalyticsPage.jsx`)** with Preset/Custom Date Range Pickers, Financial KPI Cards (Gross Sales, COGS, Net Profit, Profit Margin, GST Tax Breakdown), RBAC Masking for Cashiers, Sales Transaction Ledger Table, and Itemized Transaction Detail Modal (`src/components/modals/TransactionDetailModal.jsx`).
3. **Screen 8: Settings & Staff Management (`src/pages/SettingsPage.jsx`)** with Store Profile & Licensing (DL Form 20/21, GSTIN, FSSAI), Thermal Printer Config, Staff RBAC Accounts & Permissions Matrix, and Cashier Read-Only Enforcement.

---

## 1. Existing Architecture & Context Analysis

### 1.1 Auth & RBAC State (`src/context/AuthContext.jsx`)
- Role state: `'Admin'` vs `'Cashier'`.
- Permissions object:
  ```javascript
  permissions = {
    canOverrideStock: isAdmin,
    canViewFinancialProfit: isAdmin,
    canCreatePurchaseOrder: isAdmin,
    canModifyStoreSettings: isAdmin,
  }
  ```
- **Cashier Rule for Analytics**: Cashier (`canViewFinancialProfit === false`) can view **Gross Sales** and **GST Tax Breakdown**, but **COGS Cost**, **Net Profit**, and **Net Profit Margin** must be masked with a lock badge (`🔒 Restricted for Cashier`).
- **Cashier Rule for Settings**: Cashier (`canModifyStoreSettings === false`) sees read-only inputs, disabled save buttons, and a lock banner (`🔒 Restricted for Cashier`).

### 1.2 Patient & Prescription Ledger (`src/context/PatientContext.jsx`)
- State: `patients` (seeded from `MOCK_PATIENTS` or `localStorage['pharmalink_patients']`).
- Existing methods: `addPatient(patientData)`, `addRxLog(patientId, rxRecord)`, `searchPatients(query)`.
- Patient Data Shape:
  ```javascript
  {
    id: "PAT-001",
    name: "Rajesh Kumar",
    phone: "+91 98700 12345",
    gender: "Male",
    age: 54,
    doctorName: "Dr. S. K. Gupta (MD Cardiology)",
    chronicConditions: ["Glycomet SR 500mg", "Pantocid 40mg"],
    rxLogs: [
      {
        id: "RX-1001",
        invoiceNo: "INV-891042",
        date: "2026-07-28",
        doctorName: "Dr. S. K. Gupta",
        doctorRegNo: "MMC-48921",
        medicines: ["Augmentin 625 Duo", "Glycomet SR 500mg"]
      }
    ],
    totalVisits: 14,
    lastVisitDate: "2026-07-28"
  }
  ```

### 1.3 Sales & Ledger History (`src/context/SalesContext.jsx`)
- State: `recentTransactions` and `salesHistory`.
- `recordSale(saleTransaction)` pushes to `recentTransactions` and aggregates into `salesHistory`.
- Transaction object shape:
  ```javascript
  {
    id: "INV-891042",
    invoiceNo: "INV-891042",
    date: "2026-08-01",
    time: "10:30 AM",
    cashier: "Dr. Vikrant Sharma",
    patient: { name: "Rajesh Kumar", phone: "+91 98700 12345" },
    items: [
      {
        productId: "PROD-001",
        name: "Augmentin 625 Duo",
        batchNumber: "BT-2026-08",
        expiryDate: "2026-08-15",
        mrp: 201.50,
        purchasePrice: 145.00,
        quantity: 2,
        gstPercentage: 12
      }
    ],
    subtotal: 403.00,
    discountAmount: 0,
    taxableAmount: 359.82,
    gstTotal: 43.18,
    gstBreakdown: { "12%": { taxable: 359.82, cgst: 21.59, sgst: 21.59, total: 43.18 } },
    grandTotal: 403.00,
    paymentMode: "UPI",
    cashTendered: 403.00,
    changeDue: 0
  }
  ```

---

## 2. Comprehensive File-by-File Implementation Plan

### File 1: `src/data/mockData.js` (Update)
- **Changes**:
  - Export `MOCK_PATIENTS` with expanded initial `rxLogs` arrays so the Patient Rx History drawer has rich initial history.
  - Export `MOCK_SALES_TRANSACTIONS` containing seed transaction objects spanning `Today`, `7 Days`, and `30 Days` (with line items, FEFO batch numbers, MRP vs purchase prices, GST breakdown, cashier names, payment modes) to populate the Analytics Ledger table out-of-the-box.
  - Export `MOCK_STAFF_ACCOUNTS`:
    ```javascript
    export const MOCK_STAFF_ACCOUNTS = [
      { id: "EMP-001", name: "Dr. Vikrant Sharma", role: "Admin", title: "Managing Pharmacist & Admin", phone: "+91 98765 40001", status: "Active" },
      { id: "EMP-004", name: "Rohan Mehta", role: "Cashier", title: "Senior Billing Cashier", phone: "+91 98765 40004", status: "Active" },
      { id: "EMP-005", name: "Pooja Deshmukh", role: "Cashier", title: "Junior Pharmacist & Cashier", phone: "+91 98765 40005", status: "Active" }
    ];
    ```
  - Export `DEFAULT_STORE_SETTINGS`:
    ```javascript
    export const DEFAULT_STORE_SETTINGS = {
      name: "PharmaLink Chemist & Healthcare",
      tagline: "Licensed Pharmacy & Medical Supplies",
      address: "Shop #12, Health Plaza, MG Road, Mumbai 400001",
      phone: "+91 98765 43210",
      email: "contact@pharmalink-mumbai.com",
      pharmacistInCharge: "Dr. Vikrant Sharma (Reg: 45892-A)",
      dlForm20: "DL-20/2024/7890",
      dlForm21: "DL-21/2024/7891",
      gstin: "27AABCP12341ZV",
      fssaiLicense: "11524012000456",
      printerWidth: "80mm", // '80mm' | '58mm'
      headerText: "PharmaLink Chemist & Healthcare\nGSTIN: 27AABCP12341ZV | DL: DL-20/2024/7890",
      footerNote: "Thank you for visiting! Get well soon.",
      autoPrint: true
    };
    ```

### File 2: `src/context/SalesContext.jsx` (Update)
- **Changes**:
  - Seed `recentTransactions` with `MOCK_SALES_TRANSACTIONS` if `localStorage['pharmalink_recent_transactions']` is empty.
  - Expose helper `getTransactionById(id)` to easily retrieve transaction details for `TransactionDetailModal`.

### File 3: `src/components/modals/NewPatientModal.jsx` (New Component)
- **Location**: `src/components/modals/NewPatientModal.jsx`
- **Purpose**: Registration Modal for adding a new patient record.
- **Fields**:
  - Patient Full Name (required text)
  - Phone Number (required tel)
  - Age (number) & Gender (select: Male/Female/Other)
  - Default Prescribing Doctor Name (text)
  - Chronic Conditions / Tag Builder: Input field allowing typing conditions (e.g. "Diabetes", "Hypertension", "Asthma") and pressing Enter or clicking "Add Tag" to build tag list with removable chips.
- **Action**: On submit, calls `addPatient()` from `PatientContext`, triggers notification toast, and closes modal.

### File 4: `src/components/modals/PatientHistoryDrawer.jsx` (New Component)
- **Location**: `src/components/modals/PatientHistoryDrawer.jsx`
- **Purpose**: Side drawer modal showing a selected patient's full prescription purchase log (`rxLogs`).
- **Features**:
  - Header: Patient Name, Phone, Age/Gender, Default Doctor, Chronic Conditions tags.
  - Body: List of `rxLogs` entries. Each log shows:
    - Prescription Date & Invoice # badge.
    - Prescribing Doctor Name & Council Registration Number.
    - Tag list of prescribed medicines dispensed.
    - "View Transaction Invoice" button that opens `TransactionDetailModal` for that invoice #.
  - Empty state when patient has no Rx history logs.

### File 5: `src/pages/PatientsPage.jsx` (Update Screen 6)
- **Location**: `src/pages/PatientsPage.jsx`
- **Features**:
  - Header area: Page title, registered count badge, and "+ New Patient Registration" primary button.
  - Search & Filter bar: Search input field matching Name, Phone, or Patient ID. Filter options for Chronic Conditions.
  - Patient Registry Table:
    - Columns: Patient ID / Name, Phone / Gender / Age, Attending Doctor, Chronic Conditions (badges), Total Visits, Last Visit Date, Action Buttons ("View Rx History", "+ Rx Order").
  - Integrates `NewPatientModal` (controlled by `isNewPatientOpen`) and `PatientHistoryDrawer` (controlled by `selectedPatientForHistory`).

### File 6: `src/components/modals/TransactionDetailModal.jsx` (New Component)
- **Location**: `src/components/modals/TransactionDetailModal.jsx`
- **Purpose**: Itemized receipt detail view for sales transactions from the Analytics ledger table.
- **Features**:
  - Header info: Invoice #, Date & Time, Cashier Name, Payment Mode badge, Customer Name & Phone.
  - Line-by-line itemized table: Product Name, FEFO Batch Number, Expiry Date, MRP, Sale Price, Qty, Line Total, GST Rate %, GST Amount.
  - Summary section: Subtotal, Discount, Taxable Base Amount, CGST/SGST Breakdown per tax rate (5%, 12%, 18%), Grand Total (₹), Tendered / Change Due.
  - Footer buttons: "Thermal Receipt (F9)" trigger, "A4 Tax Invoice (F10)" trigger, "Close".

### File 7: `src/pages/AnalyticsPage.jsx` (Update Screen 7)
- **Location**: `src/pages/AnalyticsPage.jsx`
- **Features**:
  - **Date Range Picker Toolbar**: Preset buttons (`Today`, `7 Days`, `30 Days`, `Custom Range`). In Custom Range mode, displays Start Date & End Date inputs.
  - **Financial KPI Cards**:
    1. Gross Sales (₹) — Visible to all roles.
    2. COGS Cost (₹) — Visible to Admin; masked with lock badge (`🔒 Restricted for Cashier`) when `permissions.canViewFinancialProfit` is false.
    3. Net Profit (₹) — Visible to Admin; masked with lock badge (`🔒 Restricted for Cashier`) when `permissions.canViewFinancialProfit` is false.
    4. Net Profit Margin (%) — Visible to Admin; masked with lock badge (`🔒 Restricted for Cashier`) when `permissions.canViewFinancialProfit` is false.
    5. GST Tax Breakdown — Tax collected per rate bracket (5%, 12%, 18%) & Total Tax collected. Visible to all roles.
  - **RBAC Masking Logic for Cashier**:
    - Instead of locking the entire screen, Cashier accesses Gross Sales, GST Tax breakdown, and transaction ledger. Profit KPIs are masked with lock badges.
  - **Sales Transaction Ledger Table**:
    - Filters transactions based on selected date range.
    - Columns: Invoice #, Date & Time, Customer Name / Patient, Items Count, Total Amount, GST Amount, Payment Mode (Cash / Card / UPI), Cashier Name, Actions ("View Invoice" button opening `TransactionDetailModal`).

### File 8: `src/pages/SettingsPage.jsx` (Update Screen 8)
- **Location**: `src/pages/SettingsPage.jsx`
- **Features**:
  - Tab / Section Navigation:
    1. **Store Profile & Legal Licensing**: Medical Store Name, Tagline, Address, Phone, Email, Pharmacist In-Charge, Drug License Form 20 (`DL-20/2024/7890`), Drug License Form 21 (`DL-21/2024/7891`), GSTIN (`27AABCP12341ZV`), FSSAI License (`11524012000456`), Save Button.
    2. **Thermal Printer & Hardware Config**: Paper Width (80mm Thermal POS / 58mm Mini POS), Print Header Text, Footer Thank You Note, Auto-Print Receipts on Checkout toggle, Barcode Scanner Mode.
    3. **Staff Accounts & RBAC Permissions Matrix**:
       - Staff list table: Staff ID, Name, Role (`Admin` / `Cashier`), Title, Phone, Active Status badge.
       - Visual Permissions Matrix checklist table showing feature permissions:
         - Master Catalog CRUD (Admin: ✅ Allowed, Cashier: ❌ Read-Only)
         - Stock Overrides (Admin: ✅ Allowed, Cashier: 🔒 Locked)
         - Financial Profit Analytics (Admin: ✅ Full Access, Cashier: 🔒 Masked)
         - Supplier PO Inwarding (Admin: ✅ Full Access, Cashier: 🔒 Restricted)
         - Settings & Licensing Editing (Admin: ✅ Full Access, Cashier: 🔒 Read-Only)
  - **RBAC Enforcement for Cashier**:
    - When `permissions.canModifyStoreSettings` is false (Cashier role):
      - All store profile & hardware config inputs are set to `readOnly` or `disabled`.
      - Save button is disabled with lock tooltip.
      - Prominent lock banner at top: `🔒 Cashier Read-Only Mode: Store licensing and hardware settings are read-only for Cashier accounts.`

---

## 3. Verification Plan

1. **Screen 6 (Patients)**:
   - Navigate to `/patients` (or click Patients tab).
   - Test search filter by Patient Name ("Rajesh"), Phone ("98700"), or ID.
   - Click "+ New Patient", register a new patient with chronic condition tags, verify toast and table update.
   - Click "View Rx History" on a patient row, verify drawer opens displaying Rx logs and prescribed medicines.

2. **Screen 7 (Analytics)**:
   - Navigate to `/analytics`.
   - Test Date Range options (`Today`, `7 Days`, `30 Days`, `Custom Range`).
   - Verify KPI calculations: Gross Sales, COGS, Net Profit, Profit Margin, GST Tax breakdown.
   - Switch role to **Cashier**: verify Gross Sales & GST Tax remain visible, while COGS, Net Profit, and Profit Margin cards display `🔒 Restricted for Cashier`.
   - Click "View Invoice" on any ledger row to open `TransactionDetailModal` and inspect line items, batch numbers, MRP vs sale price, GST split, and print triggers.

3. **Screen 8 (Settings)**:
   - Navigate to `/settings`.
   - As **Admin**: test editing Store Profile, Drug License Form 20/21 numbers, GSTIN, thermal printer config, and click "Save Store Settings". Verify success notification.
   - Inspect Staff RBAC table and Permissions Matrix checklist.
   - Switch role to **Cashier**: verify banner `🔒 Cashier Read-Only Mode`, inputs are disabled/read-only, save button is disabled.

4. **Production Build Verification**:
   - Execute `npm run build` to confirm zero JSX syntax or compilation errors.
