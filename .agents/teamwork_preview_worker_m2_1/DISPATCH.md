## 2026-08-12T20:01:54Z
You are Worker for Milestone 2 (R2 & R3).
Your task is to implement the fixes and enhancements for Milestone 2 in codebase at "d:/Code/medical store whole sale/Medical Store Phase 2".

Read the original requirements from "d:/Code/medical store whole sale/Medical Store Phase 2/.agents/ORIGINAL_REQUEST.md" and the detailed step-by-step implementation guide from "d:/Code/medical store whole sale/Medical Store Phase 2/.agents/explorer_m2_1/explorer_report.md".

Your metadata and report directory: "d:/Code/medical store whole sale/Medical Store Phase 2/.agents/teamwork_preview_worker_m2_1"

Files owned by you for this task:
- `src/utils/dateUtils.js` (create new helper `formatDateDDMMYYYY`)
- `src/pages/POSPage.jsx`
- `src/components/modals/NewPOModal.jsx`
- `src/components/modals/A4InvoiceModal.jsx`
- `src/components/modals/A4InvoicePrintModal.jsx`
- `src/components/modals/StockSummaryReportModal.jsx`
- `src/components/modals/PaymentHistoryModal.jsx`
- `src/components/modals/RegionalDeliveryManifestModal.jsx`
- `src/pages/RegionLedgerPage.jsx`
- `src/pages/InventoryPage.jsx`
- `src/pages/FinancialAnalyticsPage.jsx` (or `AnalyticsPage.jsx`)
- `src/components/modals/AnalyticsReportPrintModal.jsx`
- `src/pages/ExpiryRadarPage.jsx`
- `src/pages/SuppliersPage.jsx`

Tasks:
1. R2 (6-Month Expiry Rejection & Warnings):
   - In `POSPage.jsx` (`handleAddItemToCart`), check if earliest expiring batch has expiry <= 6 months from today. If so, block addition with alert: `"Cannot Add Item: Expiry Date Exceeded (Expires within 6 Months)"`.
   - In `NewPOModal.jsx` (`handleSubmit`), check if any batch item has expiry <= 6 months from today. If so, block submission with alert: `"Cannot Add Batch: Expiry Date Exceeded (Must be > 6 Months)"`.
2. R3 (Date Standardization DD-MM-YYYY):
   - Create `src/utils/dateUtils.js` exporting `formatDateDDMMYYYY(dateInput)` to convert ISO dates, `YYYY-MM-DD`, `DD/MM/YYYY`, Date objects, etc., into standard `DD-MM-YYYY` format.
   - Import and use `formatDateDDMMYYYY` across all displayed dates in POS, Invoices, POs, Inventory, Region Ledger, Financial Reports/Analytics, Expiry Radar, and Suppliers.
3. Run `npm run build` in "d:/Code/medical store whole sale/Medical Store Phase 2" to verify clean build with 0 errors.
