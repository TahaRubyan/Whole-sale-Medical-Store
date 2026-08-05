# Project Plan: PharmaLink ERP & POS

## Architecture & Design
- **Framework**: Vite + React SPA (JavaScript / JSX)
- **Styling**: Vanilla CSS with CSS Custom Properties / Modules (Ocean Blue theme: `#0284C7` Ocean Blue primary, `#F7F4EF` Warm Off-White Canvas background, `#E0F2FE` Ice Blue tint, Plus Jakarta Sans font)
- **Icons**: Lucide React / SVG Icon Set
- **State Management**: React Context + Custom Hooks with localStorage persistence and rich mock database seed data
- **Keyboard Engine**: Custom global key listener for hotkeys (F1: Dashboard, F2: POS Checkout, F3: Inventory, F4: Expiry Radar, F9: Thermal Receipt Modal, F10: A4 Tax Invoice Modal)

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Infra & Foundation Setup | Vite + React scaffold, CSS custom properties (Ocean Blue theme), mock database engine, global context stores, Navigation Sidebar, Top-Bar RBAC switcher, Hotkey engine | None | DONE |
| M2 | POS & FEFO Billing Checkout + Modals | POS Omni-search, FEFO batch auto-assignment, Rack/Shelf badges, Schedule H Rx Patient drawer, Cart checkout, Thermal Receipt (F9) and A4 Invoice (F10) modals | M1 | DONE |
| M3 | Inventory, Expiry Radar & Supplier Management | Inventory catalog table, multi-batch side drawer, Admin stock override modal, Expiry Radar (30/60/90 days, loss calc, supplier return notes), Supplier Directory & PO inward stock builder | M1 | DONE |
| M4 | Patient Logs, Financial Analytics & Settings | Patient registry & Rx history, Financial Analytics (date picker, KPIs, ledger, Cashier restriction), Settings (Drug License Form 20/21, GSTIN, thermal printer config, RBAC staff manager) | M1 | DONE |
| M5 | E2E Verification & Build Hardening | Comprehensive cross-screen verification, RBAC lockout verification, Hotkeys test, production `npm run build` verification | M1, M2, M3, M4 | DONE |

## Code Layout
```
d:/Code/Medical Store/
├── package.json
├── vite.config.js
├── index.html
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── styles/
│   │   ├── theme.css
│   │   └── global.css
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   ├── InventoryContext.jsx
│   │   ├── CartContext.jsx
│   │   ├── PatientContext.jsx
│   │   ├── SupplierContext.jsx
│   │   └── SalesContext.jsx
│   ├── data/
│   │   └── mockData.js
│   ├── hooks/
│   │   └── useHotkeys.js
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Topbar.jsx
│   │   │   └── Layout.jsx
│   │   ├── common/
│   │   │   ├── Modal.jsx
│   │   │   ├── Badge.jsx
│   │   │   └── NotificationToast.jsx
│   │   └── modals/
│   │       ├── ThermalReceiptModal.jsx
│   │       ├── A4InvoiceModal.jsx
│   │       ├── StockOverrideModal.jsx
│   │       ├── PatientRxDrawer.jsx
│   │       └── ReturnNoteModal.jsx
│   └── pages/
│       ├── DashboardPage.jsx
│       ├── POSPage.jsx
│       ├── InventoryPage.jsx
│       ├── ExpiryRadarPage.jsx
│       ├── SuppliersPage.jsx
│       ├── PatientsPage.jsx
│       ├── AnalyticsPage.jsx
│       └── SettingsPage.jsx
```

## Interface Contracts & RBAC Rules
- **Role Switcher**: Admin vs Cashier state in `AuthContext`.
- **Cashier Locks**:
  - InventoryPage: Stock override button disabled/hidden, Master add/edit disabled.
  - AnalyticsPage: Profit KPIs (Gross Margin, Net Profit, COGS) hidden/locked.
  - SuppliersPage: Create PO button disabled/hidden.
  - SettingsPage: Access restricted or read-only view of license info with profile change disabled.
- **FEFO Rule**: When adding item to cart in POS, automatically select batch with earliest `expiryDate` where `quantity > 0`.
- **Print Hotkeys**: F9 opens Thermal Receipt modal for current/last sale; F10 opens A4 Tax Invoice modal for current/last sale.
