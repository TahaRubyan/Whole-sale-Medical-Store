## 2026-08-01T01:51:24Z
You are Worker M4 (Fix) for PharmaLink ERP & POS.
Working directory: d:\Code\Medical Store\.agents\worker_m4_fix

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Reviewer M4 requested changes for Milestone 4:
The RBAC Staff Add/Edit Modal is missing from Settings & Staff Management Screen (src/pages/SettingsPage.jsx).

Your Task:
1. Create `src/components/modals/StaffModal.jsx` (or `NewStaffModal.jsx`) to handle adding and editing staff accounts (Name, Username/Email, Role [Admin or Cashier], Passcode/Pin, Status [Active/Inactive]).
2. Update `src/context/AuthContext.jsx` (or staff state in SettingsPage/localStorage) to support dynamic adding and editing of staff members initialized from `MOCK_STAFF_ACCOUNTS` and persisted to `localStorage`.
3. Update `src/pages/SettingsPage.jsx` Tab 3 (Staff Management):
   - Add an "+ Add Staff Account" button at top right of staff table (disabled/hidden when active role is Cashier).
   - Add Edit action buttons on staff table rows to trigger editing an existing staff account.
   - Render the modal dynamically for creating or editing staff entries.
4. Run `npm run build` to confirm a clean compilation with 0 errors.

Deliver your changes and build results in d:\Code\Medical Store\.agents\worker_m4_fix\handoff.md and send a summary message back to parent.
