# Milestone 1 Implementation & Technical Investigation Report

**Milestone**: M1: R1 Fix & R5 Sidebar Labels  
**Explorer Agent**: `explorer_m1_1`  
**Date**: 2026-08-13  
**Working Directory**: `d:/Code/medical store whole sale/Medical Store Phase 2`  

---

## Executive Summary
This report presents a comprehensive read-only analysis and exact step-by-step implementation guide for Milestone 1:
1. **R1: Fix `ReferenceError` Bug in Invoice Modals**: Import `getTaxConfig` from `../../data/mockData` in `A4InvoiceModal.jsx` and `A4InvoicePrintModal.jsx`.
2. **R5: Simplified Sidebar Labels**: Update `NAV_ITEMS` labels in `src/components/layout/Sidebar.jsx` to simplified user-friendly terminology.

---

## Detailed Investigation & Findings

### Requirement 1 (R1): Fix `ReferenceError: getTaxConfig is not defined`

#### 1. Root Cause Analysis
In both `A4InvoiceModal.jsx` and `A4InvoicePrintModal.jsx`, `getTaxConfig()` is invoked in multiple JSX table headers and summary calculations (e.g. line 194: `getTaxConfig().saleTaxName`, line 243: `getTaxConfig().saleTaxName`). However, `getTaxConfig` is NOT imported at line 3 of either file; only `STORE_INFO` is imported.

#### 2. Source Function Location
- **File**: `src/data/mockData.js`
- **Line 3**: `export const getTaxConfig = () => { ... }`

#### 3. Target File 1 Analysis: `src/components/modals/A4InvoiceModal.jsx`
- **Current Line 3**:
  ```javascript
  import { STORE_INFO } from '../../data/mockData';
  ```
- **Invocations of `getTaxConfig`**:
  - Line 194: `{STORE_INFO ? (getTaxConfig().saleTaxName || 'Sale Tax 18%') : 'Sale Tax 18%'}`
  - Line 195: `{STORE_INFO ? (getTaxConfig().adTaxName || 'AdTax 4%') : 'AdTax 4%'}`
  - Line 196: `{STORE_INFO ? (getTaxConfig().advTaxName || 'Adv Tax 0.5%') : 'Adv Tax'}`
  - Line 243: `<span>{getTaxConfig().saleTaxName || 'Sale Tax 18%'}: Rs. {Number(sale.totalSaleTax || 108).toFixed(2)}</span>`
  - Line 244: `<span>{getTaxConfig().adTaxName || 'AdTax 4%'}: Rs. {Number(sale.totalAdTax || 24).toFixed(2)}</span>`
  - Line 245: `<span>{getTaxConfig().advTaxName || 'Adv Tax 0.5%'}: Rs. {Number(sale.totalAdvTax || 3.00).toFixed(2)}</span>`
- **Exact Formulated Fix**:
  Replace line 3 with:
  ```javascript
  import { STORE_INFO, getTaxConfig } from '../../data/mockData';
  ```

#### 4. Target File 2 Analysis: `src/components/modals/A4InvoicePrintModal.jsx`
- **Current Line 3**:
  ```javascript
  import { STORE_INFO } from '../../data/mockData';
  ```
- **Invocations of `getTaxConfig`**:
  - Line 194: `{STORE_INFO ? (getTaxConfig().saleTaxName || 'Sale Tax 18%') : 'Sale Tax 18%'}`
  - Line 195: `{STORE_INFO ? (getTaxConfig().adTaxName || 'AdTax 4%') : 'AdTax 4%'}`
  - Line 196: `{STORE_INFO ? (getTaxConfig().advTaxName || 'Adv Tax 0.5%') : 'Adv Tax'}`
  - Line 243: `<span>{getTaxConfig().saleTaxName || 'Sale Tax 18%'}: Rs. {Number(invoice.totalSaleTax || 108).toFixed(2)}</span>`
  - Line 244: `<span>{getTaxConfig().adTaxName || 'AdTax 4%'}: Rs. {Number(invoice.totalAdTax || 24).toFixed(2)}</span>`
  - Line 245: `<span>{getTaxConfig().advTaxName || 'Adv Tax 0.5%'}: Rs. {Number(invoice.totalAdvTax || 3.00).toFixed(2)}</span>`
- **Exact Formulated Fix**:
  Replace line 3 with:
  ```javascript
  import { STORE_INFO, getTaxConfig } from '../../data/mockData';
  ```

---

### Requirement 5 (R5): Simplified Sidebar Labels

#### 1. File Structure & Relationship Analysis
- `src/components/common/Sidebar.jsx` is a facade re-export file:
  ```javascript
  import Sidebar, { NAV_ITEMS } from '../layout/Sidebar';
  export default Sidebar;
  export { Sidebar, NAV_ITEMS };
  ```
- The master definition of `NAV_ITEMS` and `Sidebar` component logic resides in `src/components/layout/Sidebar.jsx`.

#### 2. Target File Analysis: `src/components/layout/Sidebar.jsx`
- **Target Line Range**: Lines 15–24.
- **Label Mapping Table**:

| Menu ID | Old Label | New Simplified Label (R5 Target) | Icon | Access Control |
|---|---|---|---|---|
| `dashboard` | `Dashboard` | `Home / Overview` | `LayoutDashboard` | Public (RequiresAdmin: false) |
| `pos` | `POS Billing` | `Sales & Billing (POS)` | `ShoppingCart` | Public (RequiresAdmin: false) |
| `inventory` | `Inventory Catalog` | `Medicine Stock` | `Package` | Public (RequiresAdmin: false) |
| `expiry` | `Expiry Radar` | `Expiry Alerts` | `AlertTriangle` | Public (RequiresAdmin: false) |
| `region-ledger` | `Region Delivery Ledger` | `Region Deliveries & Cash` | `MapPin` | Public (RequiresAdmin: false) |
| `suppliers` | `Suppliers & PO` | `Suppliers & Purchases` | `Truck` | Public (RequiresAdmin: false) |
| `analytics` | `Financial Analytics` | `Sales & Profit Reports` | `TrendingUp` | Admin Only (RequiresAdmin: true) |
| `settings` | `Store Settings` | `Store Settings` | `Settings` | Admin Only (RequiresAdmin: true) |

- **Current Code (Lines 15–24)**:
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

- **Exact Formulated Fix (Lines 15–24)**:
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

## Step-by-Step Implementation Guide for Builder Agent

### Step 1: Update `A4InvoiceModal.jsx`
1. Open `src/components/modals/A4InvoiceModal.jsx`.
2. Locate Line 3:
   ```javascript
   import { STORE_INFO } from '../../data/mockData';
   ```
3. Replace Line 3 with:
   ```javascript
   import { STORE_INFO, getTaxConfig } from '../../data/mockData';
   ```

### Step 2: Update `A4InvoicePrintModal.jsx`
1. Open `src/components/modals/A4InvoicePrintModal.jsx`.
2. Locate Line 3:
   ```javascript
   import { STORE_INFO } from '../../data/mockData';
   ```
3. Replace Line 3 with:
   ```javascript
   import { STORE_INFO, getTaxConfig } from '../../data/mockData';
   ```

### Step 3: Update `src/components/layout/Sidebar.jsx`
1. Open `src/components/layout/Sidebar.jsx`.
2. Locate lines 15–24 containing the `NAV_ITEMS` array.
3. Replace lines 15–24 with the new `NAV_ITEMS` definition with updated labels.

### Step 4: Verification
1. Run `npm run build` using PowerShell / command tool to ensure 0 build or lint errors.
2. Confirm both `A4InvoiceModal` and `A4InvoicePrintModal` compile cleanly.
