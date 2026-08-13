# Region Delivery Ledger & Payment Settlement Analysis Report

## Executive Summary
This report provides a detailed investigation of customer/shop invoices, region data, checkout, and payment settlement structures in `d:/Code/medical store whole sale/Medical Store Phase 2`.
It establishes exact specifications and implementation blueprints for:
1. **R2. Region-Based Delivery & Settlement Ledger Page** (`RegionLedgerPage.jsx` at `/region-ledger`), including region filtering, interactive inline cash settlement table, "Settle Cash" per shop, "Settle All Region Cash", timestamped payment log history, payment history modal, and A4 Regional Delivery Manifest & Settlement PDF export.
2. **R3. Plain-Text Region Inputs**, verifying that region data is plain text in `CustomerDetailsModal.jsx` and POS checkout panel so cashiers and admins can type any region name (e.g. Karianwala, Gujrat, Tanda, Jalalpur Jattan).

---

## 1. Inspection of Customer Details, POS Checkout & Region Data

### 1.1 CustomerDetailsModal.jsx
- **File Location**: `d:/Code/medical store whole sale/Medical Store Phase 2/src/components/modals/CustomerDetailsModal.jsx`
- **Initial State**: Line 7: `region: customerDetails?.region || 'Jalapur Jattan'`
- **Form Field**: Lines 70–80
```jsx
<div>
  <label style={{ fontSize: '0.775rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>
    Region / Territory:
  </label>
  <input
    type="text"
    name="region"
    value={formData.region}
    onChange={handleChange}
    placeholder="e.g. Jalapur Jattan"
    style={{ width: '100%', padding: '0.45rem', fontSize: '0.85rem', borderRadius: '4px', border: '1px solid #CBD5E1' }}
  />
</div>
```
- **Evidence Verification**: The region field in `CustomerDetailsModal.jsx` is ALREADY a plain text `<input type="text" name="region" />`. Cashiers and admins can freely type any region name (e.g., Karianwala, Gujrat, Tanda).

### 1.2 POS Checkout Panel & Invoice Metadata Flow
- **File Location**: `d:/Code/medical store whole sale/Medical Store Phase 2/src/pages/POSPage.jsx`
- **State Initialization**: Lines 45–58
```jsx
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
- **Checkout Trigger**: Lines 159–171
```jsx
const handleCheckoutClick = () => {
  const extraDetails = {
    ...customerDetails,
    paymentStatus,
    includeDrugActWarranty,
    includeDrapWarranty
  };

  const saleRecord = processCheckout(extraDetails);
  if (saleRecord) {
    setShowA4Modal(true);
  }
};
```
- **Cart Context Processing**: `src/context/CartContext.jsx`, Lines 231–258:
```jsx
const saleRecord = {
  invoiceNo,
  saleOrderNo,
  dssId,
  date: todayFormatted,
  time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  saleOrderType: 'REGULAR',
  cashierName: 'Husnain Ali',
  customerName: extraDetails.customerName || customerName || 'M/S Idrees Pharmacy / 280073',
  region: extraDetails.region || 'Jalapur Jattan',
  customerPhone: extraDetails.customerPhone || '053-3724601',
  customerAddress: extraDetails.address || 'Main Bazar, Near HBL Bank, Jalal Pur Jattan',
  customerLicenseNo: extraDetails.customerLicenseNo || '09-342-0139-98309',
  customerNtn: extraDetails.customerNtn || '34202-0723603-5',
  customerGst: extraDetails.customerGst || '34202-0723603-5',
  fbrStatus: extraDetails.fbrStatus || 'FILER As Per FBR On 03-11-2025',
  bookingMan: extraDetails.bookingMan || 'Naeem Shah',
  referenceNo: extraDetails.referenceNo || 'Naeem Shah',
  deliveryMan: extraDetails.deliveryMan || 'Awais Ijaz',
  shipTo: extraDetails.shipTo || 'Jalal Pur Jattan',
  paymentStatus: extraDetails.paymentStatus || 'PAID',
  ...
};
recordSale(saleRecord);
```
- **Observation**: When a sale is processed, all customer metadata including plain-text `region` and `deliveryMan` is bundled into the sale invoice object and passed directly to `recordSale` in `SalesContext.jsx`.

---

## 2. Representation of Invoices, Debt, Payment Status & Payment Logs

### 2.1 Persistent State in `SalesContext.jsx`
- **File Location**: `d:/Code/medical store whole sale/Medical Store Phase 2/src/context/SalesContext.jsx`
- **Persistence Storage Key**: `localStorage.getItem('pharmalink_pk_invoices')` (Line 8).
- **Invoice Structure**:
  - `invoiceNo`: Unique String (e.g., `INV-20260801-001` or `DJ-8263263`)
  - `customerName`: Business / Shop Name (e.g., `M/S Idrees Pharmacy / 280073`, `Karianwala Medicos`, `Gujrat Medical Store`)
  - `region`: Plain-text region string (e.g., `Karianwala`, `Gujrat`, `Tanda`, `Jalalpur Jattan`)
  - `deliveryMan`: Delivery Representative Name (e.g., `Awais Ijaz`)
  - `paymentStatus`: Status string (`PAID`, `PARTIAL DEBT`, or `UNPAID_CREDIT`)
  - `netTotal`: Total invoice amount in PKR (number)
  - `remainingDebt`: Current unpaid balance (number; defaults to `netTotal` if undefined on unpaid invoices)
  - `paymentLogs`: Array of timestamped payment entries:
    ```js
    [
      {
        date: "2026-08-12",
        time: "08:15 PM",
        amountPaid: 5000,
        paymentMode: "Cash",
        note: "Partial cash settlement",
        remainingDebtAfter: 15000
      }
    ]
    ```

### 2.2 Payment Settlement Method in `SalesContext.jsx`
- Lines 71–100 in `SalesContext.jsx`:
```js
const recordDebtPayment = (invoiceNo, amountPaid, paymentMode = 'Cash', note = '') => {
  setInvoices((prevInvoices) => {
    return prevInvoices.map((inv) => {
      if (inv.invoiceNo === invoiceNo) {
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
          note,
          remainingDebtAfter: newRemaining,
        };

        return {
          ...inv,
          paymentStatus: isFullyCleared ? 'PAID' : 'PARTIAL DEBT',
          remainingDebt: newRemaining,
          paymentLogs: [...(inv.paymentLogs || []), paymentEntry],
        };
      }
      return inv;
    });
  });
};
```
- **Note on Status Value**: Currently, line 92 in `SalesContext.jsx` sets `'PARTIAL_CREDIT'`. To align 100% with Requirement R2 & Acceptance Criteria, line 92 will be updated to set `'PARTIAL DEBT'` when `newRemaining > 0`.

---

## 3. Exact Requirements & Design Specification for Region Ledger (R2 & R3)

### 3.1 Sidebar & Navigation Setup
- **File**: `src/components/layout/Sidebar.jsx`
- Add to `NAV_ITEMS`:
  ```jsx
  { id: 'region-ledger', label: 'Region Delivery Ledger', icon: MapPin, requiresAdmin: false }
  ```
- **File**: `src/App.jsx`
- Import `RegionLedgerPage` from `./pages/RegionLedgerPage`
- Add case in `renderScreen`:
  ```jsx
  case 'region-ledger':
    return <RegionLedgerPage />;
  ```

### 3.2 Pre-Seeded Wholesale Region Invoices in `mockData.js`
In order for `RegionLedgerPage` to show rich initial data across multiple regions, `INITIAL_INVOICES` in `mockData.js` should include pre-seeded shop invoices with distinct regions:
- Region: `Karianwala` (Shops: `Karianwala Medicos`, `Al-Razi Pharmacy Karianwala`)
- Region: `Gujrat` (Shops: `Shaheen Chemist Gujrat`, `Chenab Medical Complex`)
- Region: `Tanda` (Shops: `Tanda Pharmacy`, `Bismillah Medicos Tanda`)
- Region: `Jalalpur Jattan` (Shops: `M/S Idrees Pharmacy`, `City Medical Store JPJ`)

### 3.3 Page Component: `RegionLedgerPage.jsx`
- **Location**: `src/pages/RegionLedgerPage.jsx`
- **Key Features**:
  1. **Region Filter & Search Bar**:
     - Region Filter Selector / Plain-Text Search Input: Allows selecting pre-defined regions ("Karianwala", "Gujrat", "Tanda", "Jalalpur Jattan") or typing any custom region.
     - "All Regions" default view option.
     - Search filter by Shop Name or Delivery Man.
  2. **Regional Metrics KPI Cards**:
     - `Total Regional Net Sales`: Sum of `netTotal` for filtered invoices.
     - `Total Outstanding Debt`: Sum of `remainingDebt` for filtered invoices.
     - `Total Cash Collected Today`: Sum of `amountPaid` across all payment logs today for filtered invoices.
     - `Active Delivery Shops Count`.
  3. **Inline Settlement Table**:
     - Columns:
       - `Shop / Business Name`
       - `Region`
       - `Delivery Man`
       - `Payment Status` (`PAID` [Green Badge], `PARTIAL DEBT` [Amber Badge], `UNPAID DEBT` [Red Badge])
       - `Net Total (Rs.)`
       - `Current Due / Debt (Rs.)`
       - `Cash Received Today (Rs.)` (Interactive numeric input field per row)
       - `Actions` ("Settle Cash" primary button, "Payment History" icon button)
  4. **Action Handlers**:
     - **Inline "Settle Cash" Button (Per Shop)**:
       - Reads the value entered in that shop's `Cash Received Today` input field.
       - Calls `recordDebtPayment(invoice.invoiceNo, cashAmount, 'Cash', 'Region Delivery Settlement')`.
       - Resets the row input field to `""` or `0`.
       - Shows success feedback toast.
     - **"Settle All Region Cash" Button (Top Toolbar)**:
       - Iterates through all displayed shop rows that have a positive `Cash Received Today` value entered (or outstanding debt).
       - Calls `recordDebtPayment` for each invoice.
       - Displays summary notification of total region cash settled.
  5. **Payment History Log Modal (`PaymentHistoryModal.jsx`)**:
     - Triggered by clicking "History Log" icon button on any shop row.
     - Displays:
       - Shop Name, Region, Invoice #, Original Net Total, Current Due.
       - Full timestamped log table: `Date`, `Time`, `Amount Paid (Rs.)`, `Remaining Debt After (Rs.)`, `Payment Mode`, `Reference Note`.
  6. **A4 Regional Delivery Manifest & Settlement PDF Export Modal (`RegionalDeliveryManifestModal.jsx`)**:
     - Triggered by "Export A4 Regional Delivery Manifest PDF" button.
     - Provides A4 portrait print/PDF view using `@media print` CSS.
     - Content includes:
       - Store Header: `Idrees Medical Store` & DSL/STN/NTN credentials.
       - Title: `A4 REGIONAL DELIVERY MANIFEST & PAYMENT SETTLEMENT LEDGER`.
       - Region Name, Date, Delivery Man Name.
       - Detailed Manifest Table of Shops: Shop Name, Invoice #, Net Total, Cash Collected Today, Remaining Debt.
       - Summary Box: Total Orders Value, Total Cash Collected, Total Outstanding Balance.
       - Signatures Block: Delivery Representative Signature & Store Manager Signature.

---

## 4. Summary of Verification & Build Readiness
- Existing build command `npm run build` operates using Vite.
- Code architecture strictly follows Vanilla CSS and Ocean Blue design token standards (`#0284C7`, `#F7F4EF`, `#E0F2FE`).
- All state changes persist cleanly to `localStorage` via React context providers.
