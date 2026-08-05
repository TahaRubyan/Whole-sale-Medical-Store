# Milestone 1: Infra & Foundation Setup — Technical Analysis & Implementation Plan

## Executive Summary
This document defines the complete architectural blueprint and file-by-file implementation plan for **Milestone 1: Infra & Foundation Setup** of the **PharmaLink ERP & POS** application.

PharmaLink is a specialized retail pharmacy ERP designed for Indian chemists and medical stores. It features strict FEFO (First-Expiry-First-Out) batch management, Rack/Shelf location tracking, Schedule H drug prescription compliance, real-time keyboard hotkeys, and role-based access control (Admin vs. Cashier).

---

## Workspace & Target File Structure

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
│   │   └── AuthContext.jsx
│   ├── data/
│   │   └── mockData.js
│   ├── hooks/
│   │   └── useHotkeys.js
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Topbar.jsx
│   │   │   └── Layout.jsx
│   │   └── common/
│   │       ├── Modal.jsx
│   │       ├── Badge.jsx
│   │       └── KPICard.jsx
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

---

## Comprehensive File-by-File Blueprint

### 1. Scaffold & Configuration Files

#### `package.json`
- **Purpose**: Defines dependencies, scripts, and package metadata.
- **Dependencies**: `react`, `react-dom`, `lucide-react` (for icons).
- **DevDependencies**: `@vitejs/plugin-react`, `vite`.
- **Scripts**:
  - `dev`: `vite`
  - `build`: `vite build`
  - `preview`: `vite preview`

#### `vite.config.js`
- **Purpose**: Vite build tool configuration.
- **Plugins**: `@vitejs/plugin-react`
- **Server options**: Port `3000`, open automatically.

#### `index.html`
- **Purpose**: Main HTML template.
- **Features**:
  - Import Google Font: `Plus Jakarta Sans` (weights 400, 500, 600, 700).
  - Webpage Title: `PharmaLink ERP & POS - Medical Store Management`.
  - Viewport setup for responsive desktop ERP rendering.

#### `src/main.jsx`
- **Purpose**: React application mount point.
- **Behavior**: Mounts `<App />` into `#root` element wrapped in `React.StrictMode`.

#### `src/index.css`
- **Purpose**: Entry CSS importing theme and global stylesheets.
- **Imports**: `@import './styles/theme.css';` & `@import './styles/global.css';`.

---

### 2. Styling & Theme System

#### `src/styles/theme.css`
- **Palette**: Ocean Blue ERP Theme
  - Primary `#0284C7` (`--color-primary`)
  - Primary Hover `#0369A1` (`--color-primary-hover`)
  - Ice Blue Tint `#E0F2FE` (`--color-primary-light`)
  - Canvas Background `#F7F4EF` (`--color-canvas`)
  - Surface Background `#FFFFFF` (`--color-surface`)
  - Text Primary `#0F172A` (`--color-text-main`)
  - Text Muted `#64748B` (`--color-text-muted`)
  - Border `#E2E8F0` (`--color-border`)
  - Success `#10B981` (`--color-success`), Light `#D1FAE5`
  - Warning `#F59E0B` (`--color-warning`), Light `#FEF3C7`
  - Danger `#EF4444` (`--color-danger`), Light `#FEE2E2`
  - Accent / Purple `#8B5CF6` (`--color-accent`), Light `#EDE9FE`
- **Typography**: `--font-sans`: `'Plus Jakarta Sans', system-ui, sans-serif`.
- **Elevation / Shadows**:
  - `--shadow-sm`: `0 1px 2px 0 rgba(0, 0, 0, 0.05)`
  - `--shadow-md`: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)`
  - `--shadow-lg`: `0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)`
- **Radii**: `--radius-sm`: `4px`, `--radius-md`: `8px`, `--radius-lg`: `12px`, `--radius-full`: `9999px`.

#### `src/styles/global.css`
- **Reset**: Modern CSS reset (`box-sizing: border-box`, standard margin/padding clear).
- **Body**: Background `--color-canvas`, typography `--font-sans`, color `--color-text-main`.
- **Layout primitives**: `.container`, `.grid-2`, `.grid-3`, `.grid-4`, `.flex-between`, `.flex-center`, `.badge`, `.btn-primary`, `.btn-secondary`, `.btn-danger`, `.btn-warning`, `.card`, `.table-container`.
- **Custom Scrollbar**: Ocean blue styled scrollbars for smooth table and navigation scrolling.

---

### 3. Data Layer (`src/data/mockData.js`)

Provides rich, realistic pharmaceutical seed data:
- **Store Information**:
  - `name`: "PharmaLink Chemist & Healthcare"
  - `dlNumber`: "DL-20/2024/7890 & DL-21/2024/7891"
  - `gstin`: "27AABCP12341ZV"
  - `address`: "Shop #12, Health Plaza, MG Road, Mumbai 400001"
  - `phone`: "+91 98765 43210"
- **Products Dataset** (8+ comprehensive items with multi-batch FEFO dates):
  1. *Augmentin 625 Duo* (Tablet, 625mg Amoxicillin + Clavulanate, Schedule H Rx required, Rack A-1/Shelf 2, HSN 3004, GST 12%)
     - Batch 1: `BT-2026-08`, Exp: `2026-08-15` (Near Expiry!), Stock: 45, MRP: ₹201.50, Cost: ₹145.00
     - Batch 2: `BT-2026-11`, Exp: `2026-11-20`, Stock: 120, MRP: ₹201.50, Cost: ₹145.00
  2. *Paracetamol 650 Calpol* (Tablet, 650mg Paracetamol, OTC, Rack B-3/Shelf 1, HSN 3004, GST 12%)
     - Batch 1: `CP-9901`, Exp: `2026-09-10` (Near Expiry!), Stock: 15, MRP: ₹30.50, Cost: ₹20.00
     - Batch 2: `CP-9902`, Exp: `2027-04-12`, Stock: 300, MRP: ₹30.50, Cost: ₹20.00
  3. *Azithral 500mg* (Tablet, Azithromycin, Schedule H Rx, Rack A-2/Shelf 4, Stock: 8, Low Stock Alert)
     - Batch 1: `AZ-2026-10`, Exp: `2026-10-05`, Stock: 8, MRP: ₹118.00, Cost: ₹82.00
  4. *Benadryl Cough Syrup 100ml* (Syrup, Diphenhydramine, Rack C-1/Shelf 1, Stock: 60)
     - Batch 1: `BN-2026-08`, Exp: `2026-08-10` (Critical Expiry!), Stock: 25, MRP: ₹135.00, Cost: ₹95.00
  5. *Pantocid 40mg* (Tablet, Pantoprazole, OTC, Rack A-4/Shelf 3)
     - Batch 1: `PT-2027-01`, Exp: `2027-01-30`, Stock: 210, MRP: ₹165.00, Cost: ₹110.00
  6. *Metformin 500mg Glycomet* (Tablet, Metformin HCl, Schedule H Rx, Rack B-1/Shelf 2)
     - Batch 1: `GM-2026-08`, Exp: `2026-08-25`, Stock: 30, MRP: ₹42.00, Cost: ₹28.00
  7. *Volini Spray 50g* (Ointment/Spray, OTC, Rack D-2/Shelf 1)
     - Batch 1: `VL-2027-08`, Exp: `2027-08-15`, Stock: 50, MRP: ₹245.00, Cost: ₹175.00
  8. *Accu-Chek Active Test Strips* (Equipment, Box of 50, Rack E-1/Shelf 1)
     - Batch 1: `AC-2027-03`, Exp: `2027-03-31`, Stock: 18, MRP: ₹975.00, Cost: ₹750.00
- **Suppliers Dataset** (3 entries):
  - *Sun Pharma Distributors*, *Cipla Direct Supply*, *Reddy Healthcare Wholesale*.
- **Patients Dataset** (3 entries):
  - *Rajesh Kumar*, *Priya Sharma*, *Amitabh Verma* (with prescription logs & chronic medicine tags).
- **Recent Sales History** (7-day sales records for dashboard rendering & analytics).
- **FEFO Helper Functions**: `getFEFOBatch(product)`, `calculateNearExpiryCount()`, `calculateLowStockCount()`.

---

### 4. Auth & RBAC Context (`src/context/AuthContext.jsx`)

- **State**:
  - `role`: `'Admin'` | `'Cashier'` (defaults to `'Admin'`, persisted in `localStorage`).
  - `user`: `{ name: 'Dr. Vikrant Sharma', role: 'Admin', staffId: 'EMP-001' }` (or Cashier: `{ name: 'Rohan Mehta', role: 'Cashier', staffId: 'EMP-004' }`).
- **Context API**:
  - `role`
  - `user`
  - `toggleRole()`: Toggles role between Admin & Cashier.
  - `setRole(newRole)`
  - `isAdmin`: boolean getter (`role === 'Admin'`).
  - `isCashier`: boolean getter (`role === 'Cashier'`).
  - `permissions`:
    - `canOverrideStock`: `isAdmin`
    - `canViewFinancialProfit`: `isAdmin`
    - `canCreatePurchaseOrder`: `isAdmin`
    - `canModifyStoreSettings`: `isAdmin`

---

### 5. Keyboard Engine (`src/hooks/useHotkeys.js`)

Custom hook registering global keydown handlers:
- **Keys Handled**:
  - `F1`: Dashboard Navigation (`'dashboard'`)
  - `F2`: POS Billing (`'pos'`)
  - `F3`: Inventory Catalog (`'inventory'`)
  - `F4`: Expiry Radar (`'expiry'`)
  - `F9`: Trigger Thermal Receipt Modal (or callback)
  - `F10`: Trigger A4 Tax Invoice Modal (or callback)
- **Safety Features**:
  - Calls `event.preventDefault()` to prevent standard browser actions (F1 help popup, F3 browser search, etc.).
  - Binds event listener to `window` with cleanup return in `useEffect`.

---

### 6. Layout Shell (`src/components/layout/`)

#### `Sidebar.jsx`
- **Brand Header**: PharmaLink logo icon + brand title + "v1.0.0" pill.
- **Navigation Links** (8 Screens):
  1. `Dashboard` (Icon: `LayoutDashboard`, Hotkey badge: `F1`)
  2. `POS Billing` (Icon: `ShoppingCart`, Hotkey badge: `F2`)
  3. `Inventory` (Icon: `Package`, Hotkey badge: `F3`)
  4. `Expiry Radar` (Icon: `AlertTriangle`, Hotkey badge: `F4`)
  5. `Suppliers` (Icon: `Truck`)
  6. `Patients` (Icon: `Users`)
  7. `Analytics` (Icon: `TrendingUp`, lock icon if Cashier)
  8. `Settings` (Icon: `Settings`, lock icon if Cashier)
- **Footer**: Hotkey Cheat-Sheet summary box (`F1-F4` nav, `F9/F10` print).

#### `Topbar.jsx`
- **Title Section**: Current active screen title & path badge.
- **Live RBAC Role Switcher**:
  - Interactive toggle button showing current user role (`Admin` vs `Cashier`).
  - Visual styling:
    - **Admin**: Royal Blue / Purple badge with Shield / Crown icon.
    - **Cashier**: Teal / Slate badge with User icon.
  - Clicking seamlessly switches context state.
- **Quick Print Triggers**: F9 Thermal Receipt & F10 A4 Invoice buttons.
- **User Profile Pill**: Current user name and quick status indicator.

#### `Layout.jsx`
- Main grid wrapper organizing `Sidebar`, `Topbar`, and main content viewport container.
- Handles global hotkey registration to switch active screen state (`currentScreen`).
- Renders active page dynamically based on `currentScreen`.

---

### 7. Screen 1: Dashboard Page (`src/pages/DashboardPage.jsx`)

#### Features & Layout:
1. **Welcome & Shift Banner**:
   - Store Name ("PharmaLink Chemist & Healthcare")
   - Current Date & Time format
   - Active Role Greeting ("Welcome back, Dr. Vikrant (Admin)" or "Welcome back, Rohan (Cashier)")
2. **KPI Cards Grid (4 Cards)**:
   - **Today's Revenue**: ₹24,850.00 (+14.2% vs yesterday) — Icon: `IndianRupee` / `TrendingUp`
   - **Est. Gross Profit**: ₹6,920.00 (27.8% margin) — Icon: `PieChart` *(If Cashier role active: Displays `🔒 Locked for Cashier` or masked value)*
   - **Low Stock Alerts**: 3 Items below reorder level — Icon: `PackageX` (Clicking switches to Inventory)
   - **Near Expiry Warning**: 4 Batches expiring < 60 days — Icon: `ClockAlert` (Clicking switches to Expiry Radar)
3. **7-Day Sales Trend Visualizer**:
   - Interactive bar visualizer displaying revenue over the past 7 days.
   - Shows total transactions count and daily average.
4. **Urgent Action Alert Feed**:
   - Table / list of critical batches expiring in < 30 days.
   - Columns: Product Name, Batch Number, Expiry Date, Days Remaining, Rack / Shelf location.
5. **Quick Action Trigger Panel**:
   - Direct shortcut buttons for F2 (Launch POS Checkout), F3 (Catalog Search), F4 (Expiry Audit), F9 (Last Receipt), F10 (Last Invoice).

---

### 8. Placeholder Screen Pages (`src/pages/`)
For Milestone 1 completeness, lightweight placeholder pages will be provided so all 8 sidebar items function without errors:
- `POSPage.jsx`
- `InventoryPage.jsx`
- `ExpiryRadarPage.jsx`
- `SuppliersPage.jsx`
- `PatientsPage.jsx`
- `AnalyticsPage.jsx`
- `SettingsPage.jsx`

Each placeholder page will display a styled banner, active role check message, and milestone readiness pill.

---

## Verification & Independent Test Plan

1. **Scaffold & Build Verification**:
   - Run `npm run build` or check for compilation syntax in files.
   - Verify index.html loads Plus Jakarta Sans font and proper root container.
2. **Theme Verification**:
   - Verify `#0284C7` Ocean Blue primary color in header & active sidebar items.
   - Verify `#F7F4EF` canvas background on main layout area.
   - Verify responsive font scaling and card shadows.
3. **Hotkey Verification**:
   - Press `F1` -> Switches to Dashboard.
   - Press `F2` -> Switches to POS Page.
   - Press `F3` -> Switches to Inventory Page.
   - Press `F4` -> Switches to Expiry Radar Page.
   - Verify standard browser defaults (like F1 browser help) are prevented.
4. **RBAC Switcher Verification**:
   - Click topbar role toggle to switch to `Cashier`.
   - Observe Admin badge change to Cashier.
   - Observe Net Profit KPI card on Dashboard mask/lock its value.
   - Observe lock icons on restricted sidebar tabs (Analytics & Settings).
