// Pakistani Pharmacy Mock Data & Pre-seeded Catalog

export const getTaxConfig = () => {
  const defaults = {
    enableSaleTax: true,
    saleTaxPercent: 18,
    saleTaxName: 'Sale Tax 18%',
    enableAdvTax: true,
    advTaxPercent: 0.5,
    advTaxName: 'Adv Tax 0.5%',
  };
  const saved = localStorage.getItem('pharmalink_tax_config');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') {
        return { ...defaults, ...parsed };
      }
    } catch (e) {}
  }
  return defaults;
};

export const getWarrantyConfig = () => {
  const defaults = {
    enableDrugActWarranty: true,
    enableDrapWarranty: true,
    drugActWarranty: 'I, M. Idrees being a person resident in Pakistan carrying on business at Jalal Pur Jattan under the name of Idrees Medical Store and being authorized distributor of the manufacturers / Principals, do hereby give this warranty that the drugs here above described as sold by me, and contained in this invoice prescribing the goods referred to herein do not contravene in any way the provisions of Section 23 of the Drug Act, 1976.',
    drapWarranty: 'Warranty under Alternative Medicines and Health Products (Enlistment) Rules 2014 [See Rules 10(3) and (5)]: We, as the authorized distributors/agents and on behalf of the principals/manufacturers/importers hereby give warranty that the supplied alternative medicines and health products mentioned herein do not contravene any provision of the prevailing DRAP Act 2012 and rules framed thereunder.',
    urduNotice: 'برائے مہربانی انوائس پر اپنا این-ٹی-این اور شناختی کارڈ نمبر چیک کر لیں غلط ٹیکس جمع ہونے کی صورت میں کمپنی ذمہ دار نہیں ہوگی',
    noteItems: [
      'This warranty does not apply to unani, homeopathic, bio-chemic, herbal, nutraceutical and general items including syringes, medical disposables if any mentioned in this invoice.',
      "Near Expiry stock will be treated as per company's policies.",
      'Ensure that you have received the stock according to the Printed Quantities and values.',
      "Incase of any discrepancy, please inform us immediately otherwise we don't accept any responsibility afterwards."
    ]
  };
  const saved = localStorage.getItem('pharmalink_warranty_config');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') {
        return { ...defaults, ...parsed };
      }
    } catch (e) {}
  }
  return defaults;
};

export const STORE_INFO = {
  name: 'Idrees Medical Store',
  address: 'Jalal Pur Jattan',
  phone: '053-3724601, 053-3724602',
  email: 'company@gmail.com',
  ownerName: 'M. Idrees',
  signatoryName: 'M. Idrees',
  signatoryTitle: 'Managing Director / Authorized Signatory',
  signatureStyle: 'FONT', // 'FONT' | 'SEAL' | 'CUSTOM'
  sellerName: 'M. Idrees',
  dslNumber: '09-342-0139-045748D',
  stnNumber: '3277876174544',
  ntnNumber: '4442705-7',
  dlNumber: '09-342-0139-045748D',
  gstin: '3277876174544',
  get drugActWarranty() {
    return getWarrantyConfig().drugActWarranty;
  },
  get drapWarranty() {
    return getWarrantyConfig().drapWarranty;
  },
  get urduNotice() {
    return getWarrantyConfig().urduNotice;
  },
  get noteItems() {
    return getWarrantyConfig().noteItems;
  },
  signatureImage: 'data:image/png;base64,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'
};

export const getStoreInfo = () => {
  const saved = localStorage.getItem('pharmalink_store_info');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return { ...STORE_INFO, ...parsed };
    } catch (e) {}
  }
  return STORE_INFO;
};

export const MOCK_STAFF_ACCOUNTS = [
  {
    id: 'EMP-101',
    name: 'Hassan',
    username: 'hassan_admin',
    role: 'Admin',
    title: 'Store Operations Manager (Admin)',
    phone: '0300-9876543',
    status: 'ACTIVE',
  },
  {
    id: 'EMP-102',
    name: 'Ali',
    username: 'ali_cashier',
    role: 'Cashier',
    title: 'Senior POS Cashier',
    phone: '0321-8765432',
    status: 'ACTIVE',
  },
  {
    id: 'EMP-103',
    name: 'Awais Ijaz',
    username: 'awais_logistics',
    role: 'Cashier',
    title: 'Delivery & Counter Dispatch Executive',
    phone: '0333-7654321',
    status: 'ACTIVE',
  },
];

export const INITIAL_MEDICINES = [
  {
    id: "MED-101",
    brandName: "Panadol 500mg",
    genericFormula: "Paracetamol 500mg",
    category: "Tablets",
    manufacturer: "GSK Pakistan",
    hsnCode: "3004.90",
    rackLocation: "Rack A-01 / Shelf 2",
    reorderLevel: 50,
    unitType: "Tablet",
    tabletsPerBox: 200,
    boxPrice: 600, // Rs. 600 per box of 200
    pricePerTablet: 3.0, // Rs. 3.00 per tablet
    purchasePriceBox: 480,
    requiresPrescription: false,
    barcode: "8901234567890",
  },
  {
    id: "MED-102",
    brandName: "Risek 20mg",
    genericFormula: "Omeprazole 20mg",
    category: "Capsules",
    manufacturer: "Getz Pharma",
    hsnCode: "3004.91",
    rackLocation: "Rack B-03 / Shelf 1",
    reorderLevel: 20,
    unitType: "Capsule",
    tabletsPerBox: 14,
    boxPrice: 350,
    pricePerTablet: 25.0,
    purchasePriceBox: 280,
    requiresPrescription: true, // Doctor Note Required
    barcode: "8901234567891",
  },
  {
    id: "MED-103",
    brandName: "Augmentin 625mg",
    genericFormula: "Co-amoxiclav 625mg",
    category: "Tablets",
    manufacturer: "GSK Pakistan",
    hsnCode: "3004.20",
    rackLocation: "Rack A-04 / Shelf 3",
    reorderLevel: 15,
    unitType: "Tablet",
    tabletsPerBox: 10,
    boxPrice: 420,
    pricePerTablet: 42.0,
    purchasePriceBox: 340,
    requiresPrescription: true,
    barcode: "8901234567892",
  },
  {
    id: "MED-104",
    brandName: "Arinac Forte",
    genericFormula: "Ibuprofen 400mg + Pseudoephedrine 60mg",
    category: "Tablets",
    manufacturer: "Abbott Pakistan",
    hsnCode: "3004.92",
    rackLocation: "Rack B-02 / Shelf 2",
    reorderLevel: 30,
    unitType: "Tablet",
    tabletsPerBox: 100,
    boxPrice: 850,
    pricePerTablet: 8.5,
    purchasePriceBox: 680,
    requiresPrescription: false,
    barcode: "8901234567893",
  },
  {
    id: "MED-105",
    brandName: "Softin 10mg",
    genericFormula: "Loratadine 10mg",
    category: "Tablets",
    manufacturer: "PharmEvo",
    hsnCode: "3004.93",
    rackLocation: "Rack C-01 / Shelf 1",
    reorderLevel: 25,
    unitType: "Tablet",
    tabletsPerBox: 10,
    boxPrice: 180,
    pricePerTablet: 18.0,
    purchasePriceBox: 140,
    requiresPrescription: false,
    barcode: "8901234567894",
  },
  {
    id: "MED-106",
    brandName: "Brufen 400mg",
    genericFormula: "Ibuprofen 400mg",
    category: "Tablets",
    manufacturer: "Abbott Pakistan",
    hsnCode: "3004.94",
    rackLocation: "Rack B-01 / Shelf 3",
    reorderLevel: 40,
    unitType: "Tablet",
    tabletsPerBox: 500,
    boxPrice: 1200,
    pricePerTablet: 2.4,
    purchasePriceBox: 960,
    requiresPrescription: false,
    barcode: "8901234567895",
  },
  {
    id: "MED-107",
    brandName: "Disprin 300mg",
    genericFormula: "Aspirin 300mg",
    category: "Tablets",
    manufacturer: "Reckitt Benckiser",
    hsnCode: "3004.95",
    rackLocation: "Rack A-02 / Shelf 1",
    reorderLevel: 50,
    unitType: "Tablet",
    tabletsPerBox: 100,
    boxPrice: 250,
    pricePerTablet: 2.5,
    purchasePriceBox: 190,
    requiresPrescription: false,
    barcode: "8901234567896",
  },
  {
    id: "MED-108",
    brandName: "Flagyl 400mg",
    genericFormula: "Metronidazole 400mg",
    category: "Tablets",
    manufacturer: "Sanofi Pakistan",
    hsnCode: "3004.96",
    rackLocation: "Rack C-03 / Shelf 2",
    reorderLevel: 35,
    unitType: "Tablet",
    tabletsPerBox: 200,
    boxPrice: 540,
    pricePerTablet: 2.7,
    purchasePriceBox: 420,
    requiresPrescription: true,
    barcode: "8901234567897",
  },
];

export const INITIAL_BATCHES = [
  {
    id: "BAT-PAN-2026A",
    medicineId: "MED-101",
    batchNumber: "B26-Pan-01",
    mfgDate: "2025-01-10",
    expiryDate: "2027-06-30",
    totalTabletsAvailable: 850,
    boxPrice: 600,
    pricePerTablet: 3.0,
    purchasePriceBox: 480,
    distributorName: "Muller & Phipps Pakistan",
    status: "In Stock",
  },
  {
    id: "BAT-RIS-2026B",
    medicineId: "MED-102",
    batchNumber: "B26-Ris-09",
    mfgDate: "2025-03-15",
    expiryDate: "2026-08-25", // Near Expiry (<30 days)
    totalTabletsAvailable: 112,
    boxPrice: 350,
    pricePerTablet: 25.0,
    purchasePriceBox: 280,
    distributorName: "Premier Agencies Lahore",
    status: "Near Expiry",
  },
  {
    id: "BAT-AUG-2026C",
    medicineId: "MED-103",
    batchNumber: "B26-Aug-04",
    mfgDate: "2025-02-01",
    expiryDate: "2026-09-15",
    totalTabletsAvailable: 80,
    boxPrice: 420,
    pricePerTablet: 42.0,
    purchasePriceBox: 340,
    distributorName: "Muller & Phipps Pakistan",
    status: "In Stock",
  },
  {
    id: "BAT-ARI-2026D",
    medicineId: "MED-104",
    batchNumber: "B26-Ari-12",
    mfgDate: "2024-11-20",
    expiryDate: "2026-08-10", // Near Expiry
    totalTabletsAvailable: 450,
    boxPrice: 850,
    pricePerTablet: 8.5,
    purchasePriceBox: 680,
    distributorName: "Fazal Din & Sons Distributors",
    status: "Near Expiry",
  },
  {
    id: "BAT-SOF-2026E",
    medicineId: "MED-105",
    batchNumber: "B26-Sof-88",
    mfgDate: "2025-04-10",
    expiryDate: "2027-01-20",
    totalTabletsAvailable: 150,
    boxPrice: 180,
    pricePerTablet: 18.0,
    purchasePriceBox: 140,
    distributorName: "Citi Pharma Agencies",
    status: "In Stock",
  },
  {
    id: "BAT-BRU-2026F",
    medicineId: "MED-106",
    batchNumber: "B26-Bru-33",
    mfgDate: "2024-08-01",
    expiryDate: "2026-07-20", // Expired
    totalTabletsAvailable: 240,
    boxPrice: 1200,
    pricePerTablet: 2.4,
    purchasePriceBox: 960,
    distributorName: "Fazal Din & Sons Distributors",
    status: "Expired",
  },
  {
    id: "BAT-DIS-2026G",
    medicineId: "MED-107",
    batchNumber: "B26-Dis-02",
    mfgDate: "2025-05-12",
    expiryDate: "2027-08-15",
    totalTabletsAvailable: 600,
    boxPrice: 250,
    pricePerTablet: 2.5,
    purchasePriceBox: 190,
    distributorName: "Allied Distributors Karachi",
    status: "In Stock",
  },
  {
    id: "BAT-FLA-2026H",
    medicineId: "MED-108",
    batchNumber: "B26-Fla-19",
    mfgDate: "2025-01-18",
    expiryDate: "2026-10-10",
    totalTabletsAvailable: 500,
    boxPrice: 540,
    pricePerTablet: 2.7,
    purchasePriceBox: 420,
    distributorName: "Premier Agencies Lahore",
    status: "In Stock",
  },
];

export const INITIAL_SUPPLIERS = [
  {
    id: "SUP-101",
    companyName: "Muller & Phipps Pakistan",
    contactPerson: "Tariq Mahmood",
    phone: "+92 300 8451122",
    email: "company@gmail.com",
    gstin: "PK-1234567-8",
    city: "Lahore",
    pendingBalance: 45000,
  },
  {
    id: "SUP-102",
    companyName: "Premier Agencies Lahore",
    contactPerson: "Shahid Rafique",
    phone: "+92 321 4455667",
    email: "sales@premieragencies.pk",
    gstin: "PK-9876543-2",
    city: "Lahore",
    pendingBalance: 18500,
  },
  {
    id: "SUP-103",
    companyName: "Fazal Din & Sons Distributors",
    contactPerson: "Usman Fazal",
    phone: "+92 333 5566778",
    email: "usman@fazaldin.pk",
    gstin: "PK-4567890-1",
    city: "Islamabad",
    pendingBalance: 0,
  },
];

export const INITIAL_PATIENTS = [
  {
    id: "PAT-101",
    name: "Muhammad Ali",
    age: 45,
    phone: "0300-1234567",
    prescribingDoctor: "Dr. Aamir Khan (PMC-45812)",
    address: "House 45, Street 8, F-7/2, Islamabad",
    lastVisit: "2026-08-01",
    totalSpend: 2450,
  },
  {
    id: "PAT-102",
    name: "Fatima Bibi",
    age: 62,
    phone: "0321-9876543",
    prescribingDoctor: "Dr. Bushra Zaidi (PMC-33910)",
    address: "Flat 302, Al-Latif Heights, Gulberg, Lahore",
    lastVisit: "2026-07-28",
    totalSpend: 4120,
  },
  {
    id: "PAT-103",
    name: "Zubair Ahmed",
    age: 34,
    phone: "0333-5544332",
    prescribingDoctor: "Dr. Tariq Parvez (PMC-88120)",
    address: "Plot 12, Sector C, DHA Phase 5, Karachi",
    lastVisit: "2026-07-15",
    totalSpend: 1180,
  },
];

export const INITIAL_INVOICES = [
  // KARIANWALA REGION (4 SHOPS)
  {
    invoiceNo: "INV-20260812-101",
    date: "2026-08-12",
    time: "09:30 AM",
    saleType: "Bulk",
    cashierName: "Dr. Idrees",
    customerName: "Al-Razi Pharmacy",
    shopName: "Al-Razi Pharmacy",
    region: "Karianwala",
    deliveryMan: "Awais Ijaz",
    bookingMan: "Tariq Mahmood",
    customerPhone: "0300-8451122",
    items: [
      { medicineId: "MED-101", brandName: "Panadol Extra", batchNumber: "B26-Pan-01", unitSelection: "Box", quantity: 50, unitPrice: 600, total: 30000 },
      { medicineId: "MED-102", brandName: "Risek 20mg", batchNumber: "B26-Ris-09", unitSelection: "Box", quantity: 50, unitPrice: 350, total: 17500 },
    ],
    subtotal: 47500,
    discount: 2500,
    tax: 0,
    netTotal: 45000,
    remainingDebt: 15000,
    paymentStatus: "PARTIAL DEBT",
    paymentMode: "Credit / Debt",
    paymentLogs: [
      { date: "2026-08-12", time: "09:30 AM", amountPaid: 20000, paymentMode: "Cash", note: "Booking Advance Payment", remainingDebtAfter: 25000 },
      { date: "2026-08-13", time: "02:15 PM", amountPaid: 10000, paymentMode: "Cash", note: "Delivery Cash Collection", remainingDebtAfter: 15000 }
    ],
  },
  {
    invoiceNo: "INV-20260812-102",
    date: "2026-08-12",
    time: "10:15 AM",
    saleType: "Bulk",
    cashierName: "Dr. Idrees",
    customerName: "Karianwala Medicos",
    shopName: "Karianwala Medicos",
    region: "Karianwala",
    deliveryMan: "Awais Ijaz",
    bookingMan: "Tariq Mahmood",
    customerPhone: "0321-4455667",
    items: [
      { medicineId: "MED-103", brandName: "Augmentin 625mg", batchNumber: "B26-Aug-04", unitSelection: "Box", quantity: 40, unitPrice: 420, total: 16800 },
    ],
    subtotal: 16800,
    discount: 800,
    tax: 0,
    netTotal: 16000,
    remainingDebt: 16000,
    paymentStatus: "UNPAID_CREDIT",
    paymentMode: "Credit",
    paymentLogs: [],
  },
  {
    invoiceNo: "INV-20260812-103",
    date: "2026-08-12",
    time: "11:00 AM",
    saleType: "Bulk",
    cashierName: "Dr. Idrees",
    customerName: "Bismillah Drug Store",
    shopName: "Bismillah Drug Store",
    region: "Karianwala",
    deliveryMan: "Awais Ijaz",
    bookingMan: "Tariq Mahmood",
    customerPhone: "0333-5566778",
    items: [
      { medicineId: "MED-106", brandName: "Brufen 400mg", batchNumber: "B26-Bru-33", unitSelection: "Box", quantity: 30, unitPrice: 1200, total: 36000 },
    ],
    subtotal: 36000,
    discount: 1000,
    tax: 0,
    netTotal: 35000,
    remainingDebt: 0,
    paymentStatus: "PAID",
    paymentMode: "Cash",
    paymentLogs: [
      { date: "2026-08-12", time: "11:00 AM", amountPaid: 35000, paymentMode: "Cash", note: "Full Payment Received", remainingDebtAfter: 0 }
    ],
  },
  {
    invoiceNo: "INV-20260812-104",
    date: "2026-08-12",
    time: "11:45 AM",
    saleType: "Bulk",
    cashierName: "Dr. Idrees",
    customerName: "Shaheen Pharmacy",
    shopName: "Shaheen Pharmacy",
    region: "Karianwala",
    deliveryMan: "Awais Ijaz",
    bookingMan: "Tariq Mahmood",
    customerPhone: "0300-9988776",
    items: [
      { medicineId: "MED-104", brandName: "Arinac Forte", batchNumber: "B26-Ari-12", unitSelection: "Box", quantity: 20, unitPrice: 850, total: 17000 },
    ],
    subtotal: 17000,
    discount: 1000,
    tax: 0,
    netTotal: 16000,
    remainingDebt: 6000,
    paymentStatus: "PARTIAL DEBT",
    paymentMode: "Credit / Debt",
    paymentLogs: [
      { date: "2026-08-12", time: "11:45 AM", amountPaid: 10000, paymentMode: "Cash", note: "Partial Deposit", remainingDebtAfter: 6000 }
    ],
  },

  // GUJRAT REGION (3 SHOPS)
  {
    invoiceNo: "INV-20260813-105",
    date: "2026-08-13",
    time: "08:45 AM",
    saleType: "Bulk",
    cashierName: "Dr. Idrees",
    customerName: "Gujrat City Medicos",
    shopName: "Gujrat City Medicos",
    region: "Gujrat",
    deliveryMan: "Zubair Ahmed",
    bookingMan: "Shahid Rafique",
    customerPhone: "0321-7788990",
    items: [
      { medicineId: "MED-105", brandName: "Softin 10mg", batchNumber: "B26-Sof-88", unitSelection: "Box", quantity: 100, unitPrice: 180, total: 18000 },
    ],
    subtotal: 18000,
    discount: 0,
    tax: 0,
    netTotal: 18000,
    remainingDebt: 18000,
    paymentStatus: "UNPAID_CREDIT",
    paymentMode: "Credit",
    paymentLogs: [],
  },
  {
    invoiceNo: "INV-20260813-106",
    date: "2026-08-13",
    time: "09:15 AM",
    saleType: "Bulk",
    cashierName: "Dr. Idrees",
    customerName: "Chaudhry & Sons Pharmacy",
    shopName: "Chaudhry & Sons Pharmacy",
    region: "Gujrat",
    deliveryMan: "Zubair Ahmed",
    bookingMan: "Shahid Rafique",
    customerPhone: "0333-1122334",
    items: [
      { medicineId: "MED-101", brandName: "Panadol Extra", batchNumber: "B26-Pan-01", unitSelection: "Box", quantity: 60, unitPrice: 600, total: 36000 },
    ],
    subtotal: 36000,
    discount: 1000,
    tax: 0,
    netTotal: 35000,
    remainingDebt: 10000,
    paymentStatus: "PARTIAL DEBT",
    paymentMode: "Credit / Debt",
    paymentLogs: [
      { date: "2026-08-13", time: "09:15 AM", amountPaid: 25000, paymentMode: "Cash", note: "Counter Payment Received", remainingDebtAfter: 10000 }
    ],
  },
  {
    invoiceNo: "INV-20260813-107",
    date: "2026-08-13",
    time: "10:30 AM",
    saleType: "Bulk",
    cashierName: "Dr. Idrees",
    customerName: "Punjab Wholesale Medicine",
    shopName: "Punjab Wholesale Medicine",
    region: "Gujrat",
    deliveryMan: "Zubair Ahmed",
    bookingMan: "Shahid Rafique",
    customerPhone: "0300-5544332",
    items: [
      { medicineId: "MED-108", brandName: "Flagyl 400mg", batchNumber: "B26-Fla-19", unitSelection: "Box", quantity: 50, unitPrice: 540, total: 27000 },
    ],
    subtotal: 27000,
    discount: 2000,
    tax: 0,
    netTotal: 25000,
    remainingDebt: 0,
    paymentStatus: "PAID",
    paymentMode: "Cash",
    paymentLogs: [
      { date: "2026-08-13", time: "10:30 AM", amountPaid: 25000, paymentMode: "Cash", note: "Full Settlement", remainingDebtAfter: 0 }
    ],
  },

  // TANDA REGION (2 SHOPS)
  {
    invoiceNo: "INV-20260813-108",
    date: "2026-08-13",
    time: "11:20 AM",
    saleType: "Bulk",
    cashierName: "Dr. Idrees",
    customerName: "Tanda Care Medicos",
    shopName: "Tanda Care Medicos",
    region: "Tanda",
    deliveryMan: "Usman Malik",
    bookingMan: "Usman Fazal",
    customerPhone: "0321-9988112",
    items: [
      { medicineId: "MED-107", brandName: "Disprin 300mg", batchNumber: "B26-Dis-02", unitSelection: "Box", quantity: 80, unitPrice: 250, total: 20000 },
    ],
    subtotal: 20000,
    discount: 1000,
    tax: 0,
    netTotal: 19000,
    remainingDebt: 9000,
    paymentStatus: "PARTIAL DEBT",
    paymentMode: "Credit / Debt",
    paymentLogs: [
      { date: "2026-08-13", time: "11:20 AM", amountPaid: 10000, paymentMode: "Cash", note: "Driver Cash Collection", remainingDebtAfter: 9000 }
    ],
  },
  {
    invoiceNo: "INV-20260813-109",
    date: "2026-08-13",
    time: "12:00 PM",
    saleType: "Bulk",
    cashierName: "Dr. Idrees",
    customerName: "Jalil Pharmacy & Distributors",
    shopName: "Jalil Pharmacy & Distributors",
    region: "Tanda",
    deliveryMan: "Usman Malik",
    bookingMan: "Usman Fazal",
    customerPhone: "0333-7766554",
    items: [
      { medicineId: "MED-102", brandName: "Risek 20mg", batchNumber: "B26-Ris-09", unitSelection: "Box", quantity: 60, unitPrice: 350, total: 21000 },
    ],
    subtotal: 21000,
    discount: 1000,
    tax: 0,
    netTotal: 20000,
    remainingDebt: 20000,
    paymentStatus: "UNPAID_CREDIT",
    paymentMode: "Credit",
    paymentLogs: [],
  },
];
