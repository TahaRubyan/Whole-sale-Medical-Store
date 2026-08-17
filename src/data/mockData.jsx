// Wholesale Pharmacy Production Master Data Configurations

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
    drugActWarranty: 'I, being a person resident in Pakistan carrying on business under the authorized distributor license, do hereby give this warranty that the drugs here above described as sold by me, and contained in this invoice prescribing the goods referred to herein do not contravene in any way the provisions of Section 23 of the Drug Act, 1976.',
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
  name: 'My Medical Store',
  address: 'Commercial Market',
  phone: '',
  email: '',
  ownerName: '',
  signatoryName: '',
  signatoryTitle: 'Authorized Signatory',
  signatureStyle: 'FONT', // 'FONT' | 'SEAL' | 'CUSTOM'
  sellerName: '',
  dslNumber: '',
  stnNumber: '',
  ntnNumber: '',
  dlNumber: '',
  gstin: '',
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
  signatureImage: '',
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
    name: 'Admin User',
    username: 'admin',
    role: 'Admin',
    title: 'Store Operations Manager (Admin)',
    phone: '',
    status: 'ACTIVE',
  },
  {
    id: 'EMP-102',
    name: 'Cashier User',
    username: 'cashier',
    role: 'Cashier',
    title: 'Senior POS Cashier',
    phone: '',
    status: 'ACTIVE',
  },
];

export const INITIAL_MEDICINES = [];
export const INITIAL_BATCHES = [];
export const INITIAL_SUPPLIERS = [];
export const INITIAL_PATIENTS = [];
export const INITIAL_INVOICES = [];
