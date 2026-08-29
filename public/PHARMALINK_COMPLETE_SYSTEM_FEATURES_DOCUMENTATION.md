# 🏥 PharmaLink ERP & POS — Complete System Features & Technical Specification Manual
**Commercial Pharmaceutical Wholesale & Distribution Management System**
*Version: 2.5.0 Production Ready | Regulatory Compliance: DRAP Act 2012 & Drugs Act 1976 Form 2 / Section 23*

---

## 📑 Table of Contents
1. [Executive Overview & System Architecture](#1-executive-overview--system-architecture)
2. [Multi-Tenant SaaS & Super-Admin Control Center](#2-multi-tenant-saas--super-admin-control-center)
3. [Role-Based Access Control (RBAC) & Staff Security](#3-role-based-access-control-rbac--staff-security)
4. [Fast Wholesale POS & fast Billing Engine](#4-fast-wholesale-pos--fast-billing-engine)
5. [A4 Commercial Dual-Page Invoice & Thermal Receipt Engine](#5-a4-commercial-dual-page-invoice--thermal-receipt-engine)
6. [Inventory, Batch Management & FEFO Expiry Radar](#6-inventory-batch-management--fefo-expiry-radar)
7. [Stock Movement & Regional Distribution Audit](#7-stock-movement--regional-distribution-audit)
8. [FBR Official Sales Tax Audit & Lawyer Schedule (Annexure-C)](#8-fbr-official-sales-tax-audit--lawyer-schedule-annexure-c)
9. [Customer Ledger & Credit Receivables Engine](#9-customer-ledger--credit-receivables-engine)
10. [Supplier Directory, Purchase Orders (PO) & Return to Vendor (RTV)](#10-supplier-directory-purchase-orders-po--return-to-vendor-rtv)
11. [Store Profile, Tax Configuration & Digital Signature Center](#11-store-profile-tax-configuration--digital-signature-center)
12. [Disaster Recovery, JSON Backup & Offline PWA Resilience](#12-disaster-recovery-json-backup--offline-pwa-resilience)
13. [Keyboard Shortcuts & Operator Cheat Sheet](#13-keyboard-shortcuts--operator-cheat-sheet)

---

## 1. Executive Overview & System Architecture

PharmaLink ERP is an enterprise-grade wholesale pharmaceutical management, Point of Sale (POS), and regulatory compliance platform engineered specifically for wholesale medicine depots, distributors, and pharmacy chains in Pakistan.

### 🏗️ Technical Architecture
- **Frontend Core:** React 18 SPA built on Vite with ES Modules for sub-second hot reloading and instant bundle compilation.
- **PWA Ready:** Full Progressive Web Application with `manifest.webmanifest` and service worker caching for offline offline POS operations.
- **Persistence Engine:** Automatic browser `localStorage` synchronization with multi-key isolated namespaces, cross-tab event broadcasting (`tax_config_updated`, `store_info_updated`, `sales_updated`), and complete JSON snapshot backup/restore.
- **Design Language:** High-contrast professional UI with CSS custom property design tokens, dark/light visual hierarchy, and responsive fluid layouts.
- **Zero External Reporting Dependencies:** Native browser document printing engine generating pixel-perfect A4 paginated contracts, 80mm/58mm thermal receipts, and formal tax audit schedules without third-party PDF server dependencies.

---

## 2. Multi-Tenant SaaS & Super-Admin Control Center

PharmaLink supports multi-tenant provisioning, allowing software providers to manage multiple pharmaceutical distributors from a single super-admin gateway.

- **Super-Admin Authentication:** Secured master login (`rubyan` / `1234`) with credential verification.
- **Dynamic Tenant Provisioning:**
  - One-click onboarding of new wholesale pharmacies.
  - Generates unique `tenant_id` (e.g. `TENANT-1002`) and provisioned database spaces.
  - Mandatory first-time password reset workflow for new tenants.
- **30-Day Automated Membership Due Tracking:**
  - Calculates subscription cycles and billing renewal dates automatically.
  - Visual alert badges: `ACTIVE` vs `MEMBERSHIP DUE` (highlighted in high-contrast amber/red).
  - One-click "Record Subscription Payment" action extending billing cycles by 30 days and logging full payment timestamps.
- **Tenant Management Console:** View all provisioned stores, monthly fees, registration dates, active operators, and account statuses.

---

## 3. Role-Based Access Control (RBAC) & Staff Security

Strict role isolation guarantees data integrity and prevents unauthorized access to sensitive financial records:

| Feature / Module | Admin (Director / Owner) | Cashier (Fast Billing) | Delivery Staff |
| :--- | :---: | :---: | :---: |
| **Wholesale POS Billing** | ✅ Full Access | ✅ Full Access | ❌ Restricted |
| **View Medicine Catalog & Stock** | ✅ Full Access | ✅ Read Only | ❌ Restricted |
| **A4 Invoice Printing & Thermal Slip** | ✅ Full Access | ✅ Full Access | ❌ Restricted |
| **Sales Return Processing** | ✅ Full Access | ✅ Full Access | ❌ Restricted |
| **Customer Ledger & Debt Settlement** | ✅ Full Access | ❌ Blocked | ❌ Restricted |
| **Supplier Directory & PO Creation** | ✅ Full Access | ❌ Blocked | ❌ Restricted |
| **Stock & Price Overrides** | ✅ Full Access | ❌ Blocked | ❌ Restricted |
| **FBR Official Sales Tax Audit** | ✅ Full Access | ❌ Blocked | ❌ Restricted |
| **System Settings & Tax Toggles** | ✅ Full Access | ❌ Blocked | ❌ Restricted |
| **Regional Delivery Manifests** | ✅ Full Access | ✅ Read Only | ✅ View Route |

- **Author Audit Trail:** Every transaction, sales order, purchase order, stock override, and sales return permanently logs the operator's name and role (e.g., `Hassan (Cashier)` vs `Dr. Idrees (Admin)`).

---

## 4. Fast Wholesale POS & Fast Billing Engine

Designed for rapid commercial order booking in high-volume wholesale markets:

### ⚡ Rapid Search & Keyboard Navigation
- **Multi-Field Instant Search:** Real-time search across Brand Name, Generic Formula, Item Code, Barcode, and Physical Rack Location.
- **Full Keyboard Navigation:**
  - `ArrowDown` / `ArrowUp`: Move highlight across search suggestions with automatic list scrolling.
  - `Enter`: Instant add highlighted medicine to cart.
  - `Escape`: Dismiss search dropdown.
  - Automatic refocusing on search bar after item insertion.

### 📦 Multi-Unit Packaging Conversion
- Seamless toggle between **Box Packaging** (e.g., 200 tablets/box) and **Loose Units** (tablets/strips) with auto-calculated unit price formulas.

### ✏️ Per-Item Interactive Line Edit Modal
- Click **Edit** on any cart line to adjust:
  - **Line Discount %:** Real-time preview of discount PKR amount.
  - **Adv Tax (0.5% default):** Editable percentage rate per item.
  - **Sale Tax (18% default):** Editable rate with instant line total recalculation.
  - **Unit Price & Quantity:** Dynamic gross and net subtotal sync.

### 💳 Multi-Payment & Credit Settlement
- **Payment Modes:** `Cash`, `Bank Transfer`, `Cheque`, `Credit / Receivables`.
- **Live Cash Change Calculator:** Enter Cash Tendered to see live Change Due in large high-contrast numerals.
- **Credit Debt Tagging:** Flags orders as `PAID`, `PARTIAL_CREDIT`, or `UNPAID_CREDIT` and automatically syncs customer ledger debt balances.

---

## 5. A4 Commercial Dual-Page Invoice & Thermal Receipt Engine

Engineered in strict compliance with the **Pakistan Drugs Act 1976 (Form 2)** and **DRAP Rules 2014**:

### 📄 Intelligent Multi-Page Pagination
- **10 Items Per Page Capacity:** Prevents crowded text. Data seamlessly overflows to Page 2 only when Page 1 capacity is reached.
- **Full Header & Footer on Every Page:** Every single printed page includes the full distributor header, customer box, legal warranty text, digital signature stamp, and `Page n of m` pagination.

### 🏷️ Distinct Metadata Sections
- **Distributor Section (Left Header):** Pharmacy Name, NTN, STRN, Address, Phone numbers, Drug License Form 20 & 21.
- **Customer Section (Below Header):** Customer Code, Pharmacy Name, Delivery Address, Customer NTN/CNIC, Customer STRN, Delivery Route, Order Timestamp.

### 📊 Itemized Commercial Columns
1. `Sr.`
2. `Item Name & Generic Formula`
3. `Batch No.`
4. `Expiry Date (MM/YYYY)`
5. `Qty (Boxes/Tabs)`
6. `Rate (PKR)`
7. `Gross Amount`
8. `Disc %`
9. `Sale Tax 18%`
10. `Adv Tax 0.5%`
11. `Net Amount`

### ⚖️ Legal Warranties & Security
- **Section 23 Drugs Act Warranty:** Official distributor warranty text under Section 23 of the Drugs Act 1976.
- **DRAP Rules 2014 Compliance:** Authorized distributor warranty statement.
- **Urdu Legal Notice:** Full Urdu tax responsibility disclaimer.
- **Digital PNG Signature & Stamp:** High-resolution digital signature badge rendering with dual issuer and receiver signature lines.
- **Pakistani Rupees In Words:** Auto-translates numeric totals to words (e.g., *"Rupees Twenty-Seven Thousand Seven Hundred Five and 30/100 Only"*).

---

## 6. Inventory, Batch Management & FEFO Expiry Radar

Comprehensive pharmaceutical stock control with First-Expiry-First-Out automation:

- **20+ High-Demand Wholesale Catalog:** Built-in medicines (Panadol, Augmentin, Risek, Lipiget, Softin, Klaricid, Nexum, Voltral, Flagyl, Amoxil, Brufen, Cac-1000, Surbex-Z, Ciproxin, Zestril, Disprin, etc.).
- **Batch Tracking Matrix:** Unique Batch Number, Expiry Date, Total Boxes Available, Total Tablets Available, Cost Price, Box Selling Price, Price Per Tablet, and Supplier linkage.
- **FEFO Dispatch Engine:** POS automatically suggests and selects the earliest expiring non-quarantined batch.
- **Expiry Radar Dashboard:**
  - 🔴 **Critical (< 3 Months / Expired):** Highlighted with urgent return-to-vendor actions.
  - 🟡 **Near Expiry (< 6 Months):** Highlighted for priority wholesale discounting.
  - 🟢 **Safe (> 1 Year):** Standard inventory clearance.
- **Prescription (Rx) Safety Guard:** Interactive toggle flags prescription drugs with warning modals during POS checkout.
- **Stock Override & Adjustments:** Authorized admin actions for physical stock counts, sample deductions, and batch extensions.

---

## 7. Stock Movement & Regional Distribution Audit

Full supply chain visibility from depot inward receiving to regional retail pharmacy delivery:

- **Stock Velocity & Turnover:** Calculates sold vs remaining box ratio and turnover percentage.
- **Regional Sales Matrix:** Visual breakdown of units delivered across North, Central, and South distribution territories (Gujrat, Lahore, Gujranwala, Faisalabad, etc.).
- **Regional Delivery Manifest Generator:**
  - Printable delivery sheets with driver names, vehicle numbers, invoice stop orders, carton counts, and receiver signature blocks.
- **Stock Movement Audit Print Modal:** Official printable audit report for stock movement verification.

---

## 8. FBR Official Sales Tax Audit & Lawyer Schedule (Annexure-C)

Built for tax lawyers, chartered accountants, and monthly Federal Board of Revenue (FBR) sales tax return filings:

- **18% Standard Sales Tax + 0.5% Advance Tax:** Automatically aggregated per line item and per invoice.
- **Flexible Audit Timeframes:** `Today`, `Past 7 Days`, `Past 30 Days`, `Custom Date Range`, and `Credit Debt`.
- **Itemized Tax Schedule:**
  - Medicine Brand & Generic Composition
  - Regulatory Category
  - Total Quantity Sold (Boxes)
  - Net Taxable Sales Value (PKR)
  - Net 18% Sales Tax Collected (PKR)
- **FBR Lawyer Report Modal:** Printable official audit document with Annexure-C reference, NTN/STRN credentials, total tax collected cards, legal declaration, and verified signature badge.

---

## 9. Customer Ledger & Credit Receivables Engine

End-to-end management of customer credit limits and accounts receivable:

- **Customer Master Directory:** Full customer records with NTN, STRN, credit limits, phone numbers, and physical addresses.
- **Live Ledger Statement:** Chronological invoice history with DSS numbers, invoice totals, payments received, and remaining credit debt.
- **Debt Settlement Modal:** Record partial payments or full settlements with Cash, Bank, or Cheque tags.
- **Printable Customer Statement:** Formal A4 Statement of Account with custom date range filters, aging breakdown, and payment history.

---

## 10. Supplier Directory, Purchase Orders (PO) & Return to Vendor (RTV)

Complete procurement and distributor accounts payable control:

- **Registered Pharmaceutical Distributors:** Directory of major pharmaceutical distributors (GSK, Getz, Abbott, Sanofi, Novartis, Haleon, etc.).
- **Purchase Order (PO) Workflow:** Create POs, receive stock into inventory batches, and flag payment status (`PAID` vs `DEBT_OWING`).
- **Return to Vendor (RTV) Debit Notes:** Generate return debit notes for near-expiry or damaged batches with automatic stock deduction and supplier balance credit offset.
- **Supplier Ledger Modal:** Printable supplier account statement with purchase logs and debit note reconciliations.

---

## 11. Store Profile, Tax Configuration & Digital Signature Center

Centralized administrative control in **Settings**:

- **Store Profile Management:** Configurable trade name, physical address, phone numbers, NTN, STRN, GSTIN, Drug License Form 20 & 21.
- **Automatic Legacy Data Purging:** Automatically cleanses cached legacy mock profiles from browser storage upon initial load.
- **Clear All Profile Fields:** One-click manual reset button to clear all profile fields for new testers.
- **Digital Signature PNG Center:** Upload PNG signature images with live preview and base64 persistence for automatic embedding on all printed documents.
- **Global Tax Toggles:** Enable or disable 18% Sales Tax and 0.5% Advance Tax system-wide.
- **Warranty Text Editor:** Editable Section 23 Drug Act warranty, DRAP warranty, and Urdu notice text.

---

## 12. Disaster Recovery, JSON Backup & Offline PWA Resilience

Enterprise data protection without cloud lock-in:

- **One-Click JSON System Backup:** Exports all medicines, inventory batches, sales invoices, customer ledgers, supplier accounts, POs, RTV notes, and audit logs into a single downloadable JSON backup file (`pharmalink_system_backup_YYYY-MM-DD.json`).
- **Instant System Restore:** Upload backup JSON file to completely restore the entire system state with zero data loss.
- **Offline PWA Engine:** Continued operations even during internet disconnections.

---

## 13. Keyboard Shortcuts & Operator Cheat Sheet

| Key / Combination | Function | Context |
| :--- | :--- | :--- |
| `Arrow Down (↓)` | Select next item in medicine search | POS Page |
| `Arrow Up (↑)` | Select previous item in medicine search | POS Page |
| `Enter (↵)` | Add selected medicine to active cart | POS Page |
| `Escape (Esc)` | Close search dropdown / dismiss modal | System-Wide |
| `Ctrl + P` | Trigger browser print dialog | Invoices / Modals |

---

*PharmaLink ERP — Advanced Agentic Engineering by DeepMind Pair Programming Team.*
