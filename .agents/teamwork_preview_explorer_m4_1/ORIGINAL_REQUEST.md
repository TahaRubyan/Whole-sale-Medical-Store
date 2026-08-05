## 2026-08-01T01:46:18Z
<USER_REQUEST>
You are an Explorer for Milestone 4: Patient Logs, Financial Analytics & Settings of PharmaLink ERP & POS.
Your metadata working directory is d:\Code\Medical Store\.agents\teamwork_preview_explorer_m4_1. Please create it if it does not exist.

Task Scope:
1. Examine the codebase in d:\Code\Medical Store.
2. Review d:\Code\Medical Store\.agents\orchestrator\PROJECT.md and plan.md.
3. Formulate a detailed file-by-file implementation plan for Milestone 4:
   - **Screen 6: Prescriptions & Patient Records (`src/pages/PatientsPage.jsx`)**:
     - Patient Registry Table: Name, Phone, Age/Gender, Chronic Conditions, Prescribing Doctor, Total Orders, Action buttons ("View Rx History", "+ New Patient").
     - Search & Filter: Search input (Name / Phone / Patient ID).
     - Patient Rx History Side Drawer (`src/components/modals/PatientHistoryDrawer.jsx` or inline drawer): Shows prescription purchase logs (`rxLogs`), prescribed medicines list, prescribing doctor, date, and invoice link.
     - New Patient Registration Modal (`src/components/modals/NewPatientModal.jsx`): Captures Name, Phone, Age, Gender, Chronic Conditions (tags), and Default Doctor Name.
   - **Screen 7: Financial & Sales Analytics (`src/pages/AnalyticsPage.jsx`)**:
     - Date Range Picker: Preset options (`Today`, `7 Days`, `30 Days`, `Custom Date Range`).
     - Financial KPI Cards: Gross Sales (₹), COGS Cost (₹), Net Profit (₹), Net Profit Margin (%), GST Tax Breakdown (5%, 12%, 18%, Total Tax collected).
     - RBAC Masking for Cashier: When logged in as Cashier (`permissions.canViewFinancialProfit` is false), COGS Cost, Net Profit, and Net Profit Margin cards are masked with a lock badge (`🔒 Restricted for Cashier`). Gross Sales & GST Tax remain accessible.
     - Sales Transaction Ledger Table: Invoice #, Date/Time, Customer/Patient, Items Count, Total Amount, GST Amount, Payment Mode (Cash/Card/UPI), Cashier Name, Actions ("View Invoice").
     - Itemized Transaction Detail Modal (`src/components/modals/TransactionDetailModal.jsx`): Shows line-by-line itemized receipt details, FEFO batch numbers, MRP vs sale price, GST split, and print trigger (Thermal F9 / A4 F10).
   - **Screen 8: Settings & Staff Management (`src/pages/SettingsPage.jsx`)**:
     - Store Profile & Licensing Tab/Section: Store Name, Address, Phone, Email, Drug License Numbers (DL Form 20 `DL-20/2024/7890`, DL Form 21 `DL-21/2024/7891`), GSTIN `27AABCP12341ZV`, FSSAI License, Save button.
     - Thermal Printer Config Tab/Section: Receipt Paper Width (80mm Thermal POS / 58mm Mini POS), Print Header Text, Footer Thank You Note, Auto-Print Receipts on Checkout toggle.
     - Staff RBAC Accounts & Permissions Matrix Tab/Section: Staff list (`Admin` vs `Cashier` accounts), active status, and visual permissions matrix checklist (Master Catalog CRUD, Stock Overrides, Financial Profit Analytics, Supplier POs, Settings Editing).
     - RBAC Enforcement for Cashier: When logged in as Cashier (`permissions.canModifyStoreSettings` is false), store profile inputs are read-only and save/edit buttons are disabled/hidden with a cashier lock banner.
4. Write your detailed analysis and plan to `d:\Code\Medical Store\.agents\teamwork_preview_explorer_m4_1\analysis.md` and `handoff.md`.
5. Send a message back to the orchestrator.
</USER_REQUEST>
