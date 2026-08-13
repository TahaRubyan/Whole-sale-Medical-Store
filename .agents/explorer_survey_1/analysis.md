# Codebase Architecture & Navigation Analysis Report

**Project**: PharmaLink ERP & POS - Phase 2  
**Specialist**: Explorer 1 (Codebase Architecture & Navigation Specialist)  
**Date**: 2026-08-12  

---

## Executive Summary

This report presents a comprehensive investigation of the project structure, build configuration, styling design system, routing mechanism, navigation structure, inventory modal registration pattern, icon library usage, and state management setup for **PharmaLink ERP & POS Phase 2**.

The codebase is built on **React 18 + Vite 5** with **Vanilla CSS (CSS Custom Properties)** adhering to the **Ocean Blue ERP theme**. Routing is state-driven inside `App.jsx`, managed in sync with `Sidebar.jsx` navigation items. All state contexts (`AuthContext`, `InventoryContext`, `SalesContext`, `CartContext`, `SupplierContext`, `PatientContext`) persist data cleanly via `localStorage`.

`npm run build` executes cleanly with **0 errors**, compiling into static bundles in `dist/`.

---

## 1. Project & Build Configuration

### 1.1 `package.json`
- **Location**: `d:/Code/medical store whole sale/Medical Store Phase 2/package.json`
- **Lines 1–20**:
```json
{
  "name": "pharmalink-erp-pos",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "lucide-react": "^0.344.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.1.4"
  }
}
```
- **Dependencies**: React 18, Lucide React (`lucide-react@^0.344.0`) for icons.
- **Build Scripts**: `npm run build` executes `vite build`.

### 1.2 `vite.config.js`
- **Location**: `d:/Code/medical store whole sale/Medical Store Phase 2/vite.config.js`
- **Lines 1–11**:
```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  }
});
```

---

## 2. CSS Architecture & Theme Tokens

### 2.1 CSS File Structure
- `src/index.css`: Imports `./styles/theme.css` and `./styles/global.css`.
- `src/styles/theme.css`: Defines Ocean Blue theme CSS custom properties on `:root`.
- `src/styles/global.css`: Provides global CSS resets, scrollbar styling, layout containers, and UI utility classes.

### 2.2 Ocean Blue Theme Tokens (`src/styles/theme.css`, lines 1–67)
- **Primary Accent / Ocean Blue**: `--color-primary: #0284C7`, `--color-primary-hover: #0369A1`, `--color-primary-dark: #075985`
- **Ice Blue Tint / Light Subtles**: `--color-primary-light: #E0F2FE`, `--color-primary-subtle: #F0F9FF`
- **Warm Canvas & Surface**: `--color-canvas: #F7F4EF`, `--color-surface: #FFFFFF`
- **Typography & Status Colors**: `--font-sans: 'Plus Jakarta Sans', system-ui...`, `--color-success: #10B981`, `--color-danger: #EF4444`, `--color-warning: #F59E0B`
- **Elevation / Radii**: `--shadow-sm` through `--shadow-xl`, `--radius-sm` through `--radius-full`

### 2.3 Global Utilities (`src/styles/global.css`)
- Layout containers: `.app-container` (flex row layout), `.main-viewport` (flex column viewport), `.content-area` (main padding)
- Cards & Grids: `.card`, `.grid-2`, `.grid-3`, `.grid-4`
- Buttons & Badges: `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-outline`, `.btn-danger`, `.badge`, `.badge-primary`, `.badge-success`, `.badge-danger`, `.badge-rx`, `.hotkey-pill`
- Tables: `.table-container`, `.table`

---

## 3. Navigation & Routing System

### 3.1 Routing in `App.jsx` (`src/App.jsx`)
- State-driven screen switching:
```jsx
export function App() {
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard': return <DashboardPage onNavigate={setCurrentScreen} />;
      case 'pos': return <POSPage />;
      case 'inventory': return <InventoryPage />;
      case 'expiry': return <ExpiryRadarPage />;
      case 'suppliers': return <SuppliersPage />;
      case 'analytics': return <AnalyticsPage />;
      case 'settings': return <SettingsPage />;
      default: return <DashboardPage onNavigate={setCurrentScreen} />;
    }
  };
```
- Wrapped inside context hierarchy: `ErrorBoundary` -> `AuthProvider` -> `PatientProvider` -> `InventoryProvider` -> `SupplierProvider` -> `SalesProvider` -> `CartProvider` -> `Layout`.

### 3.2 Navigation Sidebar (`src/components/layout/Sidebar.jsx`)
- `NAV_ITEMS` array (lines 14–22):
```js
export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, requiresAdmin: false },
  { id: 'pos', label: 'POS Billing', icon: ShoppingCart, requiresAdmin: false },
  { id: 'inventory', label: 'Inventory Catalog', icon: Package, requiresAdmin: false },
  { id: 'expiry', label: 'Expiry Radar', icon: AlertTriangle, requiresAdmin: false },
  { id: 'suppliers', label: 'Suppliers & PO', icon: Truck, requiresAdmin: false },
  { id: 'analytics', label: 'Financial Analytics', icon: TrendingUp, requiresAdmin: true },
  { id: 'settings', label: 'Store Settings', icon: Settings, requiresAdmin: true },
];
```
- Role-based filtering: hides `requiresAdmin` items when `isCashier` is `true`.

---

## 4. Inventory Page & Modal Registration

### 4.1 `InventoryPage.jsx` (`src/pages/InventoryPage.jsx`)
- Context access: `useInventory()` provides `medicines`, `batches`, `deleteMedicine`. `useAuth()` provides `isCashier`.
- Local modal state (lines 17–20):
  - `editingMedicine` -> renders `EditMedicineModal`
  - `deletingMedicine` -> renders `DeleteConfirmModal`
- Current toolbar layout (lines 56–90): Search input, Category dropdown, and Total Items count badge.
- **Phase 2 Gap**: Needs a button (e.g. `Stock Summary & Reorder Report`) to open `StockSummaryReportModal.jsx`.

---

## 5. Component Patterns, Icon Library & State Management

### 5.1 Icon Library
- `lucide-react` is used throughout the project (`Search`, `Edit3`, `Trash2`, `Package`, `Printer`, `X`, `FileText`, `Download`, `UserCheck`, `Plus`, `Minus`, `RotateCcw`, `CheckCircle`, `LayoutDashboard`, `ShoppingCart`, `AlertTriangle`, `Truck`, `TrendingUp`, `Settings`, `Pill`, `UserCheck`, etc.).

### 5.2 UI Modal Patterns
1. **Generic Dialog Modal (`src/components/common/Modal.jsx`)**:
   - Accepts `isOpen`, `onClose`, `title`, `subtitle`, `icon`, `maxWidth`, `children`.
   - Handles Escape key listener and backdrop click.
2. **Printable / PDF Preview Modals (`src/components/modals/A4InvoiceModal.jsx`, `AnalyticsReportPrintModal.jsx`)**:
   - Incorporates `@media print` style blocks.
   - Triggers browser PDF print dialog using `window.print()`.

### 5.3 State Management Setup (`src/context/`)
- `AuthContext.jsx`: Manages `isCashier` role switching (Admin vs Cashier).
- `InventoryContext.jsx`: Manages `medicines`, `batches`, `auditLogs`, stock deductions, restorations, overrides, with `localStorage` keys `pharmalink_pk_medicines`, `pharmalink_pk_batches`, `pharmalink_pk_audit_logs`.
- `SalesContext.jsx`: Manages `invoices` and `returns`, with `localStorage` key `pharmalink_pk_invoices`, providing `recordSale`, `recordDebtPayment`, `markInvoiceAsPaid`. `recordDebtPayment` logs timestamped payments into `paymentLogs`.
- `CartContext.jsx`: Manages live POS cart state, discount types, tax calculation, and checkout processing.

---

## 6. Build Verification

- **Command**: `npm run build`
- **Result**: Passed cleanly (exit code 0).
- **Build Output**:
  - `dist/index.html` (0.80 kB)
  - `dist/assets/index-Chgzj4aR.css` (5.59 kB)
  - `dist/assets/index-kSNKnbcI.js` (459.24 kB)
  - Built in 16.84s with 1502 modules transformed.

---

## 7. Recommendations for Phase 2 Implementation

1. **Add `StockSummaryReportModal.jsx`**:
   - Create in `src/components/modals/StockSummaryReportModal.jsx`.
   - Add trigger button in `InventoryPage.jsx` next to the Total Items badge.
   - Render overall stock valuation metrics, low stock reorder table, and A4 PDF printable report using `@media print` + `window.print()`.

2. **Add `RegionLedgerPage.jsx`**:
   - Create page in `src/pages/RegionLedgerPage.jsx`.
   - Update `NAV_ITEMS` in `Sidebar.jsx` (add `{ id: 'region-ledger', label: 'Region Delivery Ledger', icon: Truck/MapPin, requiresAdmin: false }`).
   - Update `App.jsx` to handle `case 'region-ledger': return <RegionLedgerPage />;`.
   - Implement region filtering, inline cash received input, "Settle Cash" / "Settle All Region Cash" buttons calling `recordDebtPayment`, and payment log history drawer.
   - Include A4 Regional Delivery Manifest & Settlement PDF export modal.

3. **Plain-Text Region Inputs**:
   - Verify plain text input field in `CustomerDetailsModal.jsx` and POS checkout panel.
