## 2026-08-01T01:23:52Z
<USER_REQUEST>
You are the Worker for Milestone 1: Infra & Foundation Setup of PharmaLink ERP & POS.
Your metadata working directory is d:\Code\Medical Store\.agents\teamwork_preview_worker_m1_1. Please create this directory if it does not exist yet.

Task Scope:
Read the Explorer's analysis at d:\Code\Medical Store\.agents\teamwork_preview_explorer_m1_1\analysis.md and handoff.md.

Construct the React + Vanilla CSS application foundation in d:\Code\Medical Store:
1. `package.json` (Vite, React 18+, React DOM, Lucide React, @vitejs/plugin-react, build scripts).
2. `vite.config.js`, `index.html` (with Plus Jakarta Sans font link), `src/main.jsx`, `src/App.jsx`, `src/index.css`.
3. Ocean Blue CSS theme in `src/styles/theme.css` (#0284C7 primary, #F7F4EF canvas, #E0F2FE tint, Plus Jakarta Sans) and `src/styles/global.css`.
4. Comprehensive seed dataset in `src/data/mockData.js` covering multi-batch FEFO products (Rack/Shelf locations e.g. Rack B-03 / Shelf 2, Schedule H Rx flags, expiry dates, HSN, batch numbers, MRP, purchase price), suppliers, patients, sales ledger history, store info (DL Form 20/21, GSTIN).
5. `src/context/AuthContext.jsx` for live top-bar Admin ↔ Cashier role switching with localStorage persistence and helper flags (`isAdmin`, `isCashier`, `permissions`).
6. `src/hooks/useHotkeys.js` binding F1 (Dashboard), F2 (POS), F3 (Inventory), F4 (Expiry Radar), F9 (Thermal Receipt Modal), F10 (A4 Invoice Modal) with event default prevention.
7. Shell layout components: `src/components/layout/Sidebar.jsx`, `Topbar.jsx`, `Layout.jsx` featuring 8 screen navigation links, hotkey badges, live role switcher.
8. Screen 1: `src/pages/DashboardPage.jsx` featuring 4 KPI cards (Revenue, Profit with Cashier lockout, Low Stock, Near Expiry), 7-day sales chart, urgent expiry feed, and hotkey action cards.
9. Baseline placeholders for 7 remaining pages (`POSPage.jsx`, `InventoryPage.jsx`, `ExpiryRadarPage.jsx`, `SuppliersPage.jsx`, `PatientsPage.jsx`, `AnalyticsPage.jsx`, `SettingsPage.jsx`) to ensure all 8 screens render smoothly.
10. Execute `npm install` and `npm run build` in `d:\Code\Medical Store` to verify a clean production build!

DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Document commands and results in your handoff report at `d:\Code\Medical Store\.agents\teamwork_preview_worker_m1_1\handoff.md` and send a message back to the orchestrator.
</USER_REQUEST>
