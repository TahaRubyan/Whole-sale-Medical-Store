# Execution Plan: PharmaLink ERP & POS

## Overview
This plan outlines the execution steps for building the PharmaLink ERP & POS React + Vanilla CSS application in `d:\Code\Medical Store`.

## Milestone Execution Roadmap

### Milestone 1: Infra & Foundation Setup
- [x] Initialize Vite + React project structure in `d:\Code\Medical Store`
- [x] Setup Vanilla CSS design tokens (`theme.css`) with Ocean Blue palette (`#0284C7`, `#F7F4EF`, `#E0F2FE`, Plus Jakarta Sans typography)
- [x] Create mock database (`mockData.js`) containing initial seed data for products with multi-batch FEFO dates, locations (Rack/Shelf), suppliers, patients, sales records, and store settings
- [x] Implement AuthContext with live RBAC Admin ↔ Cashier switcher toggle
- [x] Implement global Hotkey hook (`useHotkeys.js`) supporting F1-F4, F9, F10
- [x] Build Main Layout shell with Ocean Blue Navigation Sidebar and Topbar showing active role and quick status indicators
- [x] Verify build and component structure

### Milestone 2: POS & FEFO Billing Checkout + Modals
- [x] Build POS Omni-Search (Barcode & Name filtering)
- [x] Implement FEFO auto-batch selection logic on item addition to cart
- [x] Display Rack/Shelf badges for picked items
- [x] Build Schedule H Rx Patient Drawer for prescription collection
- [x] Build Thermal Receipt (80mm) modal (F9 shortcut trigger)
- [x] Build A4 Tax Invoice preview modal (F10 shortcut trigger)
- [x] Complete Checkout flow updating inventory stock and sales ledger

### Milestone 3: Inventory, Expiry Radar & Supplier Management
- [x] Build Master Inventory catalog table with search, category & Schedule H filter
- [x] Build Multi-batch details side drawer showing batch-wise stock and expiry
- [x] Build Admin Stock Override modal (locked for Cashier)
- [x] Build Expiry Radar with 30/60/90 days timeline tabs, batch value loss calculation, and one-click supplier return note modal
- [x] Build Supplier Directory and New PO Inward stock builder with batch creation

### Milestone 4: Patient Logs, Financial Analytics & Settings
- [x] Build Patient Registry table and Rx transaction log
- [x] Build Financial & Sales Analytics dashboard with date range picker, Gross Sales, COGS, Net Profit, GST tax breakdown, and transaction ledger (locked for Cashier)
- [x] Build Settings & Staff Management screen (Drug License Form 20/21, GSTIN, thermal printer config, RBAC accounts manager)

### Milestone 5: E2E Verification & Build Hardening
- [x] Run complete E2E testing of all 8 operational screens
- [x] Verify RBAC lockouts for Cashier role across all restricted views/actions
- [x] Verify F1-F4 navigation hotkeys and F9/F10 print modal triggers
- [x] Run `npm run build` verification to ensure clean production build with zero errors
