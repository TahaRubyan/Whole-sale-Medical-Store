## 2026-08-12T15:14:10Z
<USER_REQUEST>
You are Worker M1 (Stock Summary Modal & Reorder PDF Report Developer).
Your working directory is: d:/Code/medical store whole sale/Medical Store Phase 2/.agents/worker_m1/
The original user request is at: d:/Code/medical store whole sale/Medical Store Phase 2/.agents/ORIGINAL_REQUEST.md
The project plan is at: d:/Code/medical store whole sale/Medical Store Phase 2/.agents/orchestrator_phase2/PROJECT.md

Your mission for Milestone 1:
Implement `StockSummaryReportModal.jsx` and integrate it into `src/pages/InventoryPage.jsx`.

Requirements & Blueprint:
1. Create `src/components/inventory/StockSummaryReportModal.jsx`:
   - Accept `isOpen` and `onClose` props.
   - Access `medicines` and `batches` from `useInventory()`.
   - Calculate 4 KPI Summary Cards:
     a. Total Medicines (catalog items count)
     b. Total Boxes Available (sum of `b.totalBoxesAvailable` or derived from `b.totalTabletsAvailable` across non-quarantined batches)
     c. Estimated Inventory Cost Valuation (Rs. sum of `totalBoxes * purchasePriceBox` across medicines)
     d. Low Stock Items Count (items where `totalBoxes <= med.reorderLevel`)
   - Render Low Stock Reorder Table for items at or below reorder level (`totalBoxes <= reorderLevel`):
     - Columns: Code/SKU, Medicine Name, Rack/Shelf, Current Boxes Available, Minimum Reorder Level, Suggested Reorder Boxes (`Math.max(med.reorderLevel * 2 - totalBoxes, med.reorderLevel)`), Purchase Price/Box (Rs.), Estimated Investment (Rs.).
   - Provide a "One-Click A4 PDF Export" button (`Export A4 Purchase Manifest` / `Save PDF` / `Print`) that triggers `window.print()`.
   - Implement `@media print` CSS DOM isolation with container ID `#stock-summary-pdf` so that only the A4 Purchase Reorder Manifest (header, branding, date/time, KPI summary, reorder table, signature block) prints cleanly on A4 paper, hiding background modal overlays and UI elements.
2. Integrate into `src/pages/InventoryPage.jsx`:
   - Add state `const [isStockSummaryOpen, setIsStockSummaryOpen] = useState(false);`
   - Add "Stock Summary & Reorder Report" button in the header toolbar next to the Total Items badge.
   - Render `<StockSummaryReportModal isOpen={isStockSummaryOpen} onClose={() => setIsStockSummaryOpen(false)} />`.
3. Build & Test Verification:
   - Run `npm run build` using command line to verify 0 errors / 0 warnings.
   - Verify all features work cleanly.

DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Write your implementation details and verification results in `d:/Code/medical store whole sale/Medical Store Phase 2/.agents/worker_m1/handoff.md`. Send a message when completed.
</USER_REQUEST>
