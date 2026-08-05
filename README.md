# 🏥 Wholesale Medical Store ERP & Commercial POS System

A state-of-the-art, high-performance **Wholesale Pharmacy Management, Stock Catalog & Billing System** built with **React 18**, **Vite 5**, and modern HSL design system tokens. Tailored specifically for wholesale medical distributors and pharmaceutical suppliers operating under Pakistani DRAP and Drug Act regulatory compliance.

---

## ✨ Key System Features

### 📦 1. 100% Wholesale Box-Count Standard
- **No Tablet Count Needed**: Designed strictly for wholesale B2B pharmaceutical sales operating on full **Box Counts** (`Box MRP`, `Purchase Box Cost`, `Boxes Available`).
- Streamlined wholesale stock management without unit-conversion clutter.

### 💳 2. Commercial POS Billing & Instant Search
- **Instant Autocomplete Search**: Search items by **Item Code** (e.g. `med-333`), **Medicine Trade Name**, **Generic Formula**, or **Barcode**.
- **Keyboard Navigation**: Press **ArrowDown ↓** to navigate live suggestions, **Enter ↵** to add directly into the cart, and **Escape** to dismiss.
- **Itemized Tax Editing**: Double-click any item row in the cart to edit line-item Discount %, Sale Tax 18%, AdTax 4%, and Adv Tax 0.5%.

### 📜 3. Dual Legal & DRAP Warranty Checkbox System
- **Section 23 Drug Act 1976 Warranty (Form 2A)**:
  > *"I, M. Idrees being a person resident in Pakistan carrying on business at Jalal Pur Jattan under the name of Idrees Medical Store and being authorized distributor of the manufacturers / Principals..."*
- **DRAP 2014 Alternative Medicines Warranty**:
  > *"Warranty under Alternative Medicines and Health Products (Enlistment) Rules 2014 [See Rules 10(3) and (5)]..."*
- **Independent Toggles**: Toggling each warranty checkbox on POS or print preview modals independently displays or hides its respective legal text paragraph on the printed A4 invoice.

### 📊 4. System-Wide Dynamic Tax Configuration
- **Custom Tax Headings**: Configure custom tax names in Store Settings (e.g., *Sale Tax 18%*, *AdTax 4%*, *Adv Tax 0.5%*).
- **Dynamic Propagation**: Tax names and rates automatically propagate across POS billing cart columns, cash counter breakdowns, and printed A4 tax invoices.

### 📄 5. Edge-to-Edge A4 Commercial Sale Tax Invoice
- **13-Column Itemized Table**: Item Name, Batch #, Expiry Date, Qty, Bonus, Rate, Gross, Disc %, Disc Amt, Sale Tax 18%, AdTax 4%, Adv Tax 0.5%, and Net Amount.
- **Store Owner Section**: Displays Store DSL #, STN #, NTN #, Customer FBR Filer Status, and Authorized Digital Signature.
- **Urdu Advance Tax Notice**: Standard Pakistani tax compliance banner.

### 💵 6. Full & Partial Customer Debt Settlement
- **Partial Payment Engine**: Record partial debt collections (e.g. Customer owes Rs. 10,000, pays Rs. 4,000 today).
- **Remaining Balance Tracking**: Updates invoice status to `PARTIAL DEBT (Rs. 6,000 Left)` and logs all payment transactions until fully settled (`PAID`).

### 🚚 7. Multi-Item Distributor Purchase Orders (PO)
- **Extra-Wide Layout (`1280px`)**: Spacious inward shipment modal for entering multiple medicine items in a single purchase order.
- **Supplier Legal Metadata**: Captures Supplier License #, NTN #, GST #, FBR Filer Status, and Contact Phone Number.

### 📈 8. Financial Analytics & Top Selling Showcase
- **Top Log Navbar**: Top-row navigation tabs for instant switching between **Daily Sales Log Summary** and **Detailed Sales Log**.
- **Top 5 Fast-Moving Medicines**: Permanent showcase card displaying rank, boxes sold, and total revenue for top-selling medicines.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Core** | React 18 (Functional Components, Custom Context Hooks) |
| **Build Tool & Dev Server** | Vite 5 (Lightning-fast HMR and bundle compilation) |
| **Icons** | Lucide React Icons |
| **Styling & Theme** | Vanilla CSS3 with HSL Color Tokens, Modern Typography (Inter / Outfit) |
| **State Persistence** | React Context API + LocalStorage State Synchronization |
| **Print Output** | Pure CSS `@media print` A4 Portrait Layout |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v16.0 or higher)
- **npm** (v8.0 or higher)

### Installation Steps

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/TahaRubyan/Whole-sale-Medical-Store.git
   cd Whole-sale-Medical-Store
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start Development Dev Server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:3000` or the URL shown in your terminal.

4. **Build Production Bundle**:
   ```bash
   npm run build
   ```

---

## 📂 Project Structure

```
Whole-sale-Medical-Store/
├── src/
│   ├── assets/              # Images and signature graphics
│   ├── components/
│   │   ├── common/          # Reusable UI components (Modal, Badge, Toast)
│   │   ├── layout/          # Layout wrappers (Topbar, Sidebar, Main Layout)
│   │   └── modals/          # Feature modals (A4 Invoice, Customer Details, New PO, Debt Payment)
│   ├── context/             # Global State Providers (CartContext, SalesContext, InventoryContext, SupplierContext)
│   ├── data/                # Pre-seeded wholesale medicine catalog and store metadata (mockData.js)
│   ├── pages/               # Main Application Views (Dashboard, POS, Inventory, Suppliers, Analytics, Settings)
│   ├── styles/              # Global CSS & HSL Theme tokens
│   ├── App.jsx              # Main App routing component
│   └── main.jsx             # React DOM entrypoint
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## 📜 License & Acknowledgments

Developed for **Idrees Medical Store** (Jalal Pur Jattan, Pakistan). All rights reserved.
