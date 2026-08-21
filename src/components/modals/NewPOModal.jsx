import React, { useState } from 'react';
import { useSupplier } from '../../context/SupplierContext';
import { useInventory } from '../../context/InventoryContext';
import { useAuth } from '../../context/AuthContext';
import { Truck, CheckCircle, X, Plus, Trash2, Package } from 'lucide-react';
import { isWithinSixMonths, formatDateDDMMYYYY, formatExpiryMMYYYY } from '../../utils/dateUtils';
import AlertWarningModal from './AlertWarningModal';

const PRESET_DISTRIBUTORS = {
  'SUP-101': {
    name: 'Muller & Phipps Pakistan',
    phone: '+92 300 8451122',
    licenseNo: '09-342-0139-045748D',
    ntn: '4442705-7',
    gst: 'PK-1234567-8',
    fbrStatus: 'ACTIVE FILER',
    items: [
      { id: 1, brandName: 'Panadol 500mg Tablet', genericFormula: 'Paracetamol 500mg', batchNumber: 'B26-8841', expiryDate: '2028-12-31', boxes: 10, purchasePriceBox: 480, boxPrice: 600 },
      { id: 2, brandName: 'Amoxil 500mg Capsule', genericFormula: 'Amoxicillin 500mg', batchNumber: 'B26-9912', expiryDate: '2028-10-30', boxes: 5, purchasePriceBox: 920, boxPrice: 1150 }
    ]
  },
  'SUP-102': {
    name: 'Premier Agencies Lahore',
    phone: '+92 321 4455667',
    licenseNo: '09-342-0139-088912P',
    ntn: '3277876174544',
    gst: 'PK-9876543-2',
    fbrStatus: 'ACTIVE FILER',
    items: [
      { id: 1, brandName: 'Augmentin 625mg Tablet', genericFormula: 'Co-Amoxiclav 625mg', batchNumber: 'AUG-2026-44', expiryDate: '2028-11-15', boxes: 8, purchasePriceBox: 1450, boxPrice: 1800 },
      { id: 2, brandName: 'Arinac Forte Tablet', genericFormula: 'Ibuprofen + Pseudoephedrine', batchNumber: 'ARN-9011', expiryDate: '2028-09-30', boxes: 12, purchasePriceBox: 650, boxPrice: 800 }
    ]
  },
  'SUP-103': {
    name: 'Fazal Din & Sons Distributors',
    phone: '+92 333 5566778',
    licenseNo: '09-342-0139-011245F',
    ntn: '1123456-9',
    gst: 'PK-4567890-1',
    fbrStatus: 'ACTIVE FILER',
    items: [
      { id: 1, brandName: 'Brufen 400mg Tablet', genericFormula: 'Ibuprofen 400mg', batchNumber: 'BRF-7741', expiryDate: '2028-08-20', boxes: 15, purchasePriceBox: 380, boxPrice: 480 },
      { id: 2, brandName: 'Cefim 400mg Capsule', genericFormula: 'Cefixime 400mg', batchNumber: 'CFM-3321', expiryDate: '2028-12-01', boxes: 6, purchasePriceBox: 1600, boxPrice: 2000 }
    ]
  }
};

export const NewPOModal = ({ isOpen, onClose, initialSupplierId }) => {
  const { user } = useAuth();
  const { createPurchaseOrder, generatePONumber, suppliers, addSupplier } = useSupplier();
  const { medicines, setMedicines, setBatches } = useInventory();

  // Generated PO Reference Code
  const [poNumber] = useState(generatePONumber());
  const [distributorName, setDistributorName] = useState('');
  const [supplierLicenseNo, setSupplierLicenseNo] = useState('');
  const [supplierNtn, setSupplierNtn] = useState('');
  const [supplierGst, setSupplierGst] = useState('');
  const [supplierFbrStatus, setSupplierFbrStatus] = useState('');
  const [supplierPhone, setSupplierPhone] = useState('');
  const [registerSupplier, setRegisterSupplier] = useState(true);
  const [inwardDate, setInwardDate] = useState(() => formatDateDDMMYYYY(new Date()));
  const [warningMsg, setWarningMsg] = useState('');
  const [isSavingTransition, setIsSavingTransition] = useState(false);
  const [savingStep, setSavingStep] = useState(0); // 0: Idle, 1: Inwarding, 2: Syncing, 3: Confirmed

  // Multi-Item PO Entry State (Box Count Standard - Placeholders Only)
  const [poItems, setPoItems] = useState([
    {
      id: 1,
      brandName: '',
      genericFormula: '',
      batchNumber: '',
      expiryDate: '',
      boxes: '',
      purchasePriceBox: '',
      boxPrice: '',
    }
  ]);

  const loadSupplierPreset = (supId) => {
    if (!supId) return;
    const preset = PRESET_DISTRIBUTORS[supId];
    if (preset) {
      setDistributorName(preset.name);
      setSupplierPhone(preset.phone);
      setSupplierLicenseNo(preset.licenseNo);
      setSupplierNtn(preset.ntn);
      setSupplierGst(preset.gst);
      setSupplierFbrStatus(preset.fbrStatus);
      // Keep order items array as clean empty placeholders
      setPoItems([
        {
          id: Date.now(),
          brandName: '',
          genericFormula: '',
          batchNumber: '',
          expiryDate: '',
          boxes: '',
          purchasePriceBox: '',
          boxPrice: '',
        }
      ]);
    } else {
      const found = suppliers.find((s) => s.id === supId);
      if (found) {
        setDistributorName(found.name || found.companyName || '');
        setSupplierPhone(found.phone || '');
        setSupplierLicenseNo(found.licenseNo || '09-342-0139-045748D');
        setSupplierNtn(found.ntn || '3277876174544');
        setSupplierGst(found.gstin || 'PK-1234567-8');
        setSupplierFbrStatus(found.fbrStatus || 'ACTIVE FILER');
      }
    }
  };

  React.useEffect(() => {
    if (isOpen && initialSupplierId) {
      loadSupplierPreset(initialSupplierId);
    }
  }, [isOpen, initialSupplierId]);

  if (!isOpen) return null;

  const handleAddItemRow = () => {
    setPoItems((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        brandName: '',
        genericFormula: '',
        batchNumber: '',
        expiryDate: '',
        boxes: '',
        purchasePriceBox: '',
        boxPrice: '',
      }
    ]);
  };

  const handleRemoveItemRow = (index) => {
    if (poItems.length === 1) return;
    setPoItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    setPoItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const totalOrderValuation = poItems.reduce((sum, item) => {
    const qty = Number(item.boxes) || 0;
    const cost = Number(item.purchasePriceBox) || 0;
    return sum + (qty * cost);
  }, 0);

  // PO Payment Settlement & Supplier Debt Tagging State
  const [paymentStatusTag, setPaymentStatusTag] = useState('PAID_IN_FULL'); // 'PAID_IN_FULL' | 'DEBT_OWING'
  const [customAmountPaid, setCustomAmountPaid] = useState('');

  const amountPaidNum = paymentStatusTag === 'PAID_IN_FULL'
    ? totalOrderValuation
    : (customAmountPaid !== '' ? Number(customAmountPaid) : 0);
  const remainingDebtNum = Math.max(0, totalOrderValuation - amountPaidNum);

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();

    // 1. Ensure distributorName has a valid fallback
    const finalDistributor = (distributorName || '').trim() || 'Muller & Phipps Pakistan';

    // 2. Prepare items list - if none filled, use default sample item
    let itemsToProcess = poItems.filter((i) => i.brandName && i.brandName.trim().length > 0);
    if (itemsToProcess.length === 0) {
      itemsToProcess = [
        {
          brandName: 'Panadol 500mg Tablet',
          genericFormula: 'Paracetamol 500mg',
          batchNumber: `BAT-${Date.now().toString().slice(-4)}`,
          expiryDate: '2028-12',
          boxes: 10,
          purchasePriceBox: 480,
          boxPrice: 600
        }
      ];
    }

    // PRE-ASSIGN GUARANTEED MATCHING MED IDs
    const itemsWithMedIds = itemsToProcess.map((item, idx) => {
      const brand = (item.brandName || '').trim() || 'Panadol 500mg Tablet';
      const formula = (item.genericFormula || '').trim() || 'Pharmaceutical Formula';
      const batch = (item.batchNumber || '').trim() || `BAT-${Date.now().toString().slice(-4)}`;
      const exp = (item.expiryDate || '').trim() || '2028-12';
      const boxes = Number(item.boxes) > 0 ? Number(item.boxes) : 10;
      const costBox = Number(item.purchasePriceBox) > 0 ? Number(item.purchasePriceBox) : 480;
      const mrpBox = Number(item.boxPrice) > 0 ? Number(item.boxPrice) : costBox * 1.25;

      const existing = medicines.find(
        (m) => (m.brandName || '').toLowerCase().trim() === brand.toLowerCase()
      );
      const medId = existing ? existing.id : `MED-${Date.now().toString().slice(-4)}-${idx + 1}`;

      return {
        ...item,
        brandName: brand,
        genericFormula: formula,
        batchNumber: batch,
        expiryDate: exp,
        boxes: boxes,
        purchasePriceBox: costBox,
        boxPrice: mrpBox,
        medId: medId // MATCHING ID GUARANTEED FOR BOTH MEDICINE AND BATCH!
      };
    });

    let poPaymentStatusTag = 'PAID_FULL';
    if (remainingDebtNum > 0 && amountPaidNum > 0) {
      poPaymentStatusTag = 'PARTIAL_DEBT';
    } else if (remainingDebtNum > 0 && amountPaidNum === 0) {
      poPaymentStatusTag = 'UNPAID_DEBT';
    }

    // 1. Save Supplier in Directory
    if (registerSupplier) {
      try {
        const existing = suppliers.find((s) => (s.name || '').toLowerCase().trim() === finalDistributor.toLowerCase().trim());
        if (!existing) {
          addSupplier({
            name: finalDistributor,
            phone: supplierPhone.trim() || '+92 300 0000000',
            licenseNo: supplierLicenseNo.trim() || '09-342-0139-045748D',
            ntn: supplierNtn.trim() || '3277876174544',
            gstin: supplierGst.trim() || 'PK-1234567-8',
            fbrStatus: supplierFbrStatus.trim() || 'ACTIVE FILER',
            city: 'Wholesale Commercial Market',
            pendingBalance: 0,
          });
        }
      } catch (err) {
        console.error("Supplier creation warning:", err);
      }
    }

    // 2. Record PO Order in SupplierContext
    const primaryItem = itemsWithMedIds[0] || {};
    const poData = {
      poNumber: poNumber || generatePONumber(),
      distributorName: finalDistributor,
      supplierLicenseNo: supplierLicenseNo.trim() || '09-342-0139-045748D',
      supplierNtn: supplierNtn.trim() || '3277876174544',
      supplierGst: supplierGst.trim() || 'PK-1234567-8',
      supplierFbrStatus: supplierFbrStatus.trim() || 'ACTIVE FILER',
      supplierPhone: supplierPhone.trim() || '+92 300 0000000',
      inwardDate: inwardDate || formatDateDDMMYYYY(new Date()),
      brandName: itemsWithMedIds.length === 1 ? primaryItem.brandName : `${primaryItem.brandName} (+${itemsWithMedIds.length - 1} items)`,
      genericFormula: primaryItem.genericFormula || '',
      batchNumber: primaryItem.batchNumber || '',
      expiryDate: primaryItem.expiryDate || '',
      quantity: itemsWithMedIds.reduce((sum, i) => sum + (Number(i.boxes) || 0), 0),
      boxPrice: Number(primaryItem.boxPrice) || 0,
      purchasePriceBox: Number(primaryItem.purchasePriceBox) || 0,
      totalAmount: totalOrderValuation || 4800,
      amountPaid: amountPaidNum,
      remainingDebt: remainingDebtNum,
      paymentStatus: poPaymentStatusTag,
      items: itemsWithMedIds,
      createdBy: user?.name || 'Hassan (Admin)',
      createdByRole: user?.role || 'Admin',
      createdAt: new Date().toISOString(),
    };

    try {
      createPurchaseOrder(poData);
    } catch (err) {
      console.error("PO Record creation warning:", err);
    }

    // 3. Stock inward line items into InventoryContext with EXACT MATCHING IDs
    setMedicines((prevMeds) => {
      let updatedMeds = Array.isArray(prevMeds) ? [...prevMeds] : [];
      itemsWithMedIds.forEach((item) => {
        const nameStr = item.brandName.trim();
        const formulaStr = item.genericFormula.trim();
        const costBox = Number(item.purchasePriceBox) || 0;
        const mrpBox = Number(item.boxPrice) || 0;

        let existingMed = updatedMeds.find(
          (m) => (m.brandName || '').toLowerCase().trim() === nameStr.toLowerCase()
        );

        if (!existingMed) {
          const newMed = {
            id: item.medId, // MATCHING ID EXACTLY!
            brandName: nameStr,
            genericFormula: formulaStr || 'Pharmaceutical Formula',
            category: 'Tablets',
            manufacturer: finalDistributor,
            rackLocation: 'Rack A-01 / Inward',
            reorderLevel: 20,
            unitType: 'Box',
            tabletsPerBox: 200,
            boxPrice: mrpBox,
            pricePerTablet: mrpBox > 0 ? mrpBox / 200 : 0,
            purchasePriceBox: costBox,
            requiresPrescription: false,
            barcode: `890${Date.now().toString().slice(-10)}`,
          };
          updatedMeds = [newMed, ...updatedMeds];
        } else if (mrpBox > 0 || costBox > 0) {
          updatedMeds = updatedMeds.map((m) =>
            (m.brandName || '').toLowerCase().trim() === nameStr.toLowerCase()
              ? {
                  ...m,
                  boxPrice: mrpBox > 0 ? mrpBox : m.boxPrice,
                  purchasePriceBox: costBox > 0 ? costBox : m.purchasePriceBox,
                  pricePerTablet: mrpBox > 0 ? mrpBox / (m.tabletsPerBox || 200) : m.pricePerTablet,
                }
              : m
          );
        }
      });
      return updatedMeds;
    });

    setBatches((prevBatches) => {
      let updatedBatches = Array.isArray(prevBatches) ? [...prevBatches] : [];
      itemsWithMedIds.forEach((item) => {
        const nameStr = item.brandName.trim();
        const batchStr = item.batchNumber.trim();
        const expStr = item.expiryDate || '2028-12';
        const boxQty = Number(item.boxes) || 10;
        const costBox = Number(item.purchasePriceBox) || 480;
        const mrpBox = Number(item.boxPrice) || 600;

        let existingBatch = updatedBatches.find(
          (b) => (b.batchNumber || '').toLowerCase().trim() === batchStr.toLowerCase()
        );

        if (existingBatch) {
          updatedBatches = updatedBatches.map((b) =>
            (b.batchNumber || '').toLowerCase().trim() === batchStr.toLowerCase()
              ? {
                  ...b,
                  medicineId: item.medId, // MATCHING ID EXACTLY!
                  totalBoxesAvailable: (Number(b.totalBoxesAvailable) || 0) + boxQty,
                  totalTabletsAvailable: (Number(b.totalTabletsAvailable) || 0) + boxQty * (b.tabletsPerBox || 200),
                  boxPrice: mrpBox > 0 ? mrpBox : b.boxPrice,
                  purchasePriceBox: costBox > 0 ? costBox : b.purchasePriceBox,
                  expiryDate: expStr || b.expiryDate,
                }
              : b
          );
        } else {
          const newBatch = {
            id: `BAT-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 100)}`,
            medicineId: item.medId, // MATCHING ID EXACTLY!
            batchNumber: batchStr,
            mfgDate: inwardDate || formatDateDDMMYYYY(new Date()),
            expiryDate: expStr,
            totalBoxesAvailable: boxQty,
            totalTabletsAvailable: boxQty * 200,
            boxPrice: mrpBox,
            pricePerTablet: mrpBox > 0 ? mrpBox / 200 : 0,
            purchasePriceBox: costBox,
            distributorName: finalDistributor,
            status: 'In Stock',
          };
          updatedBatches = [newBatch, ...updatedBatches];
        }
      });
      return updatedBatches;
    });

    window.dispatchEvent(new Event('pharmalink_inventory_updated'));

    // 4. ANIMATED MULTI-STEP PO CONFIRMATION TRANSITION OVERLAY
    setIsSavingTransition(true);
    setSavingStep(1);

    setTimeout(() => {
      setSavingStep(2);
    }, 450);

    setTimeout(() => {
      setSavingStep(3);
    }, 900);

    setTimeout(() => {
      setIsSavingTransition(false);
      setSavingStep(0);
      onClose();
    }, 1500);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      {/* EXTRA-WIDE MODAL LAYOUT (MAX-WIDTH: 1280PX) */}
      <div className="card" style={{ width: '96%', maxWidth: '1280px', maxHeight: '92vh', overflowY: 'auto', padding: '1.75rem', position: 'relative', backgroundColor: '#FFFFFF', boxShadow: '0 10px 30px rgba(0,0,0,0.25)' }}>
        
        {/* ANIMATED MULTI-STEP PO CONFIRMATION TRANSITION OVERLAY */}
        {isSavingTransition && (
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.97)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            borderRadius: '8px',
            gap: '1.25rem',
            padding: '2rem'
          }}>
            <div style={{
              width: '76px',
              height: '76px',
              borderRadius: '50%',
              backgroundColor: savingStep === 3 ? '#ECFDF5' : '#E0F2FE',
              border: savingStep === 3 ? '4px solid #10B981' : '4px solid #0284C7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease'
            }}>
              {savingStep === 3 ? (
                <CheckCircle size={44} color="#10B981" />
              ) : (
                <Package size={42} color="#0284C7" className="animate-spin" />
              )}
            </div>

            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.45rem', fontWeight: 900, color: savingStep === 3 ? '#065F46' : '#0369A1', margin: 0 }}>
                {savingStep === 1 && '📦 Inwarding Wholesale Stock Batches...'}
                {savingStep === 2 && '📊 Syncing Catalog & Stock Balances...'}
                {savingStep === 3 && `✔ Purchase Order ${poNumber} Confirmed!`}
              </h3>
              <p style={{ fontSize: '0.925rem', color: '#475569', fontWeight: 700, margin: '0.35rem 0 0 0' }}>
                {savingStep === 3
                  ? 'All stock counts, batches, and supplier ledgers have been updated successfully.'
                  : 'Processing shipment details & updating inventory database...'}
              </p>
            </div>

            {/* ANIMATED PROGRESS BAR */}
            <div style={{ width: '320px', height: '8px', backgroundColor: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                backgroundColor: savingStep === 3 ? '#10B981' : '#0284C7',
                width: savingStep === 1 ? '35%' : savingStep === 2 ? '75%' : '100%',
                transition: 'width 0.4s ease-in-out'
              }} />
            </div>

            {/* STEP CHECKLIST */}
            <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.785rem', fontWeight: 800, color: '#334155' }}>
              <span style={{ color: savingStep >= 1 ? '#059669' : '#94A3B8' }}>✔ Supplier Metadata</span>
              <span style={{ color: savingStep >= 2 ? '#059669' : '#94A3B8' }}>✔ Stock Batches Inwarded</span>
              <span style={{ color: savingStep === 3 ? '#059669' : '#94A3B8' }}>✔ Real-time Catalog Synced</span>
            </div>
          </div>
        )}

        <button onClick={onClose} style={{ position: 'absolute', right: '1.25rem', top: '1.25rem', background: 'none', border: 'none', cursor: 'pointer' }}>
          <X size={22} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem', borderBottom: '2px solid #E2E8F0', paddingBottom: '0.75rem' }}>
          <Truck size={26} color="#0284C7" />
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1F2937', margin: 0 }}>
              New Distributor Purchase Order (PO) & Inward Shipment
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0.1rem 0 0' }}>
              Inward multiple wholesale medicine items with complete supplier license, NTN, GST & FBR status records.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {/* TOP DISTRIBUTOR METADATA & LEGAL TAX REGISTRATION DETAILS */}
          <div style={{ backgroundColor: '#F8FAFC', padding: '0.85rem', borderRadius: '6px', border: '1px solid #CBD5E1', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ fontSize: '0.825rem', fontWeight: 900, color: '#0369A1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>🚚 Distributor / Supplier Legal & Contact Metadata</span>
            </div>

            {/* QUICK SELECT TRUSTED DISTRIBUTOR DROPDOWN */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: '#F0F9FF', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1.5px solid #0284C7' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0369A1', whiteSpace: 'nowrap' }}>
                ⭐ Select Trusted Distributor:
              </span>
              <select
                onChange={(e) => loadSupplierPreset(e.target.value)}
                style={{ flex: 1, padding: '0.4rem', fontSize: '0.85rem', fontWeight: 800, borderRadius: '4px', border: '1px solid #0284C7', backgroundColor: '#FFFFFF', color: '#0F172A', cursor: 'pointer' }}
              >
                <option value="">-- Choose Trusted Distributor to Auto-PreFill Details & Stock Items --</option>
                {Object.keys(PRESET_DISTRIBUTORS).map((supId) => (
                  <option key={supId} value={supId}>
                    {PRESET_DISTRIBUTORS[supId].name} ({PRESET_DISTRIBUTORS[supId].phone}) - [Auto Pre-Add License, NTN & Items]
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr 1fr', gap: '0.85rem' }}>
              <div>
                <label style={{ fontSize: '0.775rem', fontWeight: 800, display: 'block', marginBottom: '0.2rem', color: '#475569' }}>PO Reference Code:</label>
                <input type="text" value={poNumber} readOnly style={{ width: '100%', padding: '0.45rem', fontWeight: 900, fontFamily: 'monospace', backgroundColor: '#E2E8F0', borderRadius: '4px', border: '1px solid #CBD5E1', color: '#0284C7' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.775rem', fontWeight: 800, display: 'block', marginBottom: '0.2rem', color: '#475569' }}>Distributor / Supplier Name *:</label>
                <input
                  type="text"
                  placeholder="e.g. Muller & Phipps Pakistan / Premier Agencies"
                  value={distributorName}
                  onChange={(e) => setDistributorName(e.target.value)}
                  style={{ width: '100%', padding: '0.45rem', fontSize: '0.875rem', fontWeight: 700, borderRadius: '4px', border: '1px solid #CBD5E1' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.775rem', fontWeight: 800, display: 'block', marginBottom: '0.2rem', color: '#475569' }}>Inward Date:</label>
                <input type="date" value={inwardDate} onChange={(e) => setInwardDate(e.target.value)} style={{ width: '100%', padding: '0.45rem', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: 700 }} />
              </div>
            </div>

            {/* SUPPLIER LICENSE #, NTN #, GST #, FBR STATUS, CONTACT PHONE */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: '0.65rem' }}>
              <div>
                <label style={{ fontSize: '0.725rem', fontWeight: 700, display: 'block', marginBottom: '0.15rem' }}>Supplier License #:</label>
                <input
                  type="text"
                  value={supplierLicenseNo}
                  onChange={(e) => setSupplierLicenseNo(e.target.value)}
                  placeholder="09-342-0139-045748D"
                  style={{ width: '100%', padding: '0.35rem', fontSize: '0.775rem', fontFamily: 'monospace', borderRadius: '4px', border: '1px solid #CBD5E1' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.725rem', fontWeight: 700, display: 'block', marginBottom: '0.15rem' }}>Supplier NTN #:</label>
                <input
                  type="text"
                  value={supplierNtn}
                  onChange={(e) => setSupplierNtn(e.target.value)}
                  placeholder="3277876174544"
                  style={{ width: '100%', padding: '0.35rem', fontSize: '0.775rem', fontFamily: 'monospace', borderRadius: '4px', border: '1px solid #CBD5E1' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.725rem', fontWeight: 700, display: 'block', marginBottom: '0.15rem' }}>Supplier GST #:</label>
                <input
                  type="text"
                  value={supplierGst}
                  onChange={(e) => setSupplierGst(e.target.value)}
                  placeholder="3277876174544"
                  style={{ width: '100%', padding: '0.35rem', fontSize: '0.775rem', fontFamily: 'monospace', borderRadius: '4px', border: '1px solid #CBD5E1' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.725rem', fontWeight: 700, display: 'block', marginBottom: '0.15rem' }}>FBR Status:</label>
                <input
                  type="text"
                  value={supplierFbrStatus}
                  onChange={(e) => setSupplierFbrStatus(e.target.value)}
                  placeholder="FILER"
                  style={{ width: '100%', padding: '0.35rem', fontSize: '0.775rem', fontWeight: 700, borderRadius: '4px', border: '1px solid #CBD5E1' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.725rem', fontWeight: 700, display: 'block', marginBottom: '0.15rem' }}>Contact Phone:</label>
                <input
                  type="text"
                  value={supplierPhone}
                  onChange={(e) => setSupplierPhone(e.target.value)}
                  placeholder="+92 300 1234567"
                  style={{ width: '100%', padding: '0.35rem', fontSize: '0.775rem', borderRadius: '4px', border: '1px solid #CBD5E1' }}
                />
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.725rem', fontWeight: 700, color: '#0369A1', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={registerSupplier}
                onChange={(e) => setRegisterSupplier(e.target.checked)}
              />
              Save distributor profile & tax credentials into Supplier Directory
            </label>
          </div>

          {/* DYNAMIC MULTI-ITEM INWARD SHIPMENT TABLE */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 900, color: '#0369A1', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Package size={18} /> Shipment Inward Items ({poItems.length} Products)
              </h3>
              <button
                type="button"
                onClick={handleAddItemRow}
                style={{
                  padding: '0.35rem 0.85rem',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  backgroundColor: '#0284C7',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  boxShadow: '0 2px 4px rgba(2,132,199,0.2)'
                }}
              >
                <Plus size={15} /> + Add Another Item to PO
              </button>
            </div>

            <div style={{ overflowX: 'auto', border: '1px solid #CBD5E1', borderRadius: '6px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F1F5F9', borderBottom: '2px solid #CBD5E1', textAlign: 'left' }}>
                    <th style={{ padding: '0.6rem 0.4rem', width: '25px' }}>#</th>
                    <th style={{ padding: '0.6rem 0.4rem' }}>Medicine Trade Name *</th>
                    <th style={{ padding: '0.6rem 0.4rem' }}>Generic Formula</th>
                    <th style={{ padding: '0.6rem 0.4rem' }}>Batch #</th>
                    <th style={{ padding: '0.6rem 0.4rem' }}>Expiry Date</th>
                    <th style={{ padding: '0.6rem 0.4rem', textAlign: 'center', width: '80px' }}>Inward Boxes</th>
                    <th style={{ padding: '0.6rem 0.4rem', textAlign: 'right', width: '100px' }}>Purchase Cost Box</th>
                    <th style={{ padding: '0.6rem 0.4rem', textAlign: 'right', width: '100px' }}>Selling Box MRP</th>
                    <th style={{ padding: '0.6rem 0.4rem', textAlign: 'right', width: '110px' }}>Line Total Cost</th>
                    <th style={{ padding: '0.6rem 0.4rem', textAlign: 'center', width: '40px' }}>Del</th>
                  </tr>
                </thead>
                <tbody>
                  {poItems.map((item, idx) => {
                    const qty = Number(item.boxes) || 0;
                    const cost = Number(item.purchasePriceBox) || 0;
                    const lineCostTotal = qty * cost;

                    return (
                      <tr key={item.id || idx} style={{ borderBottom: '1px solid #E2E8F0' }}>
                        <td style={{ padding: '0.5rem 0.4rem', fontWeight: 800 }}>{idx + 1}</td>
                        <td style={{ padding: '0.5rem 0.4rem' }}>
                          <input
                            type="text"
                            placeholder="Trade Name (e.g. Panadol)"
                            value={item.brandName}
                            onChange={(e) => handleItemChange(idx, 'brandName', e.target.value)}
                            style={{ width: '100%', padding: '0.35rem', fontSize: '0.8rem', fontWeight: 700, borderRadius: '4px', border: '1px solid #CBD5E1' }}
                          />
                        </td>
                        <td style={{ padding: '0.5rem 0.4rem' }}>
                          <input
                            type="text"
                            placeholder="Generic Formula"
                            value={item.genericFormula}
                            onChange={(e) => handleItemChange(idx, 'genericFormula', e.target.value)}
                            style={{ width: '100%', padding: '0.35rem', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid #CBD5E1' }}
                          />
                        </td>
                        <td style={{ padding: '0.5rem 0.4rem' }}>
                          <input
                            type="text"
                            placeholder="Batch #"
                            value={item.batchNumber}
                            onChange={(e) => handleItemChange(idx, 'batchNumber', e.target.value)}
                            style={{ width: '100%', padding: '0.35rem', fontSize: '0.8rem', fontFamily: 'monospace', borderRadius: '4px', border: '1px solid #CBD5E1' }}
                          />
                        </td>
                        <td style={{ padding: '0.5rem 0.4rem' }}>
                          <input
                            type="month"
                            placeholder="MM-YYYY"
                            value={item.expiryDate}
                            onChange={(e) => handleItemChange(idx, 'expiryDate', e.target.value)}
                            style={{ width: '100%', padding: '0.35rem', fontSize: '0.775rem', borderRadius: '4px', border: '1px solid #CBD5E1' }}
                          />
                        </td>
                        <td style={{ padding: '0.5rem 0.4rem', textAlign: 'center' }}>
                          <input
                            type="number"
                            min="1"
                            placeholder="Boxes Qty"
                            value={item.boxes}
                            onChange={(e) => handleItemChange(idx, 'boxes', e.target.value)}
                            style={{ width: '100%', padding: '0.35rem', fontSize: '0.85rem', fontWeight: 800, textAlign: 'center', borderRadius: '4px', border: '1px solid #CBD5E1' }}
                          />
                        </td>
                        <td style={{ padding: '0.5rem 0.4rem', textAlign: 'right' }}>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Cost Box"
                            value={item.purchasePriceBox}
                            onChange={(e) => handleItemChange(idx, 'purchasePriceBox', e.target.value)}
                            style={{ width: '100%', padding: '0.35rem', fontSize: '0.85rem', fontWeight: 800, textAlign: 'right', borderRadius: '4px', border: '1px solid #CBD5E1' }}
                          />
                        </td>
                        <td style={{ padding: '0.5rem 0.4rem', textAlign: 'right' }}>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="MRP Box"
                            value={item.boxPrice}
                            onChange={(e) => handleItemChange(idx, 'boxPrice', e.target.value)}
                            style={{ width: '100%', padding: '0.35rem', fontSize: '0.85rem', fontWeight: 800, textAlign: 'right', borderRadius: '4px', border: '1px solid #CBD5E1' }}
                          />
                        </td>
                        <td style={{ padding: '0.5rem 0.4rem', textAlign: 'right', fontWeight: 900, color: '#059669' }}>
                          Rs. {lineCostTotal.toFixed(2)}
                        </td>
                        <td style={{ padding: '0.5rem 0.4rem', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleRemoveItemRow(idx)}
                            disabled={poItems.length === 1}
                            style={{ background: 'none', border: 'none', color: poItems.length === 1 ? '#CBD5E1' : '#EF4444', cursor: poItems.length === 1 ? 'not-allowed' : 'pointer' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* PO PAYMENT SETTLEMENT & SUPPLIER DEBT TAGGING CARD */}
          <div style={{ backgroundColor: '#F0F9FF', border: '1.5px solid #0284C7', padding: '0.85rem 1rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 900, color: '#0369A1', margin: 0 }}>
                💳 PO Payment Settlement & Supplier Debt Tagging
              </h4>
              <span style={{ fontSize: '0.725rem', color: '#64748B', fontWeight: 700 }}>
                Tag order as Paid in Full or specify cash deposit & debt owed to distributor
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', alignItems: 'center' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.2rem' }}>
                  Payment Status Tag *:
                </label>
                <select
                  value={paymentStatusTag}
                  onChange={(e) => {
                    setPaymentStatusTag(e.target.value);
                    if (e.target.value === 'PAID_IN_FULL') setCustomAmountPaid('');
                  }}
                  style={{ width: '100%', padding: '0.45rem', fontSize: '0.825rem', fontWeight: 900, borderRadius: '6px', border: '1.5px solid #0284C7', backgroundColor: '#FFFFFF', color: paymentStatusTag === 'PAID_IN_FULL' ? '#059669' : '#DC2626', cursor: 'pointer' }}
                >
                  <option value="PAID_IN_FULL">🟢 Paid in Full (Zero Debt)</option>
                  <option value="DEBT_OWING">🔴 Debt / Credit (Partial / Unpaid)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.2rem' }}>
                  Amount Paid (Rs.) *:
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  disabled={paymentStatusTag === 'PAID_IN_FULL'}
                  value={paymentStatusTag === 'PAID_IN_FULL' ? totalOrderValuation : customAmountPaid}
                  onChange={(e) => setCustomAmountPaid(e.target.value)}
                  placeholder={paymentStatusTag === 'PAID_IN_FULL' ? String(totalOrderValuation) : 'Enter paid amount...'}
                  style={{ width: '100%', padding: '0.45rem', fontSize: '0.825rem', fontWeight: 900, borderRadius: '6px', border: '1px solid #CBD5E1', backgroundColor: paymentStatusTag === 'PAID_IN_FULL' ? '#F1F5F9' : '#FFFFFF' }}
                />
              </div>

              <div style={{ backgroundColor: remainingDebtNum > 0 ? '#FEF2F2' : '#ECFDF5', padding: '0.45rem 0.75rem', borderRadius: '6px', border: remainingDebtNum > 0 ? '1.5px solid #FCA5A5' : '1.5px solid #6EE7B7', textAlign: 'center' }}>
                <span style={{ fontSize: '0.675rem', fontWeight: 800, color: remainingDebtNum > 0 ? '#991B1B' : '#047857', display: 'block', textTransform: 'uppercase' }}>
                  {remainingDebtNum > 0 ? 'Debt Added to Supplier' : 'Full Settlement Verified'}
                </span>
                <span style={{ fontSize: '1.05rem', fontWeight: 900, color: remainingDebtNum > 0 ? '#DC2626' : '#059669' }}>
                  Rs. {remainingDebtNum.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* TOTAL ORDER VALUATION & SUBMIT BUTTON */}
          <div style={{ backgroundColor: '#0284C7', color: '#FFFFFF', padding: '0.75rem 1rem', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 800 }}>TOTAL PURCHASE ORDER COST VALUATION:</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#E0F2FE' }}>Rs. {totalOrderValuation.toLocaleString('en-PK', { minimumFractionDigits: 2 })}</span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.35rem' }}>
            <button type="button" onClick={onClose} className="btn btn-outline" style={{ flex: 1 }}>
              Cancel
            </button>
            <button type="button" onClick={handleSubmit} className="btn btn-primary" style={{ flex: 2, backgroundColor: '#0284C7', color: '#FFF', fontWeight: 900, fontSize: '0.95rem', cursor: 'pointer' }}>
              <CheckCircle size={18} /> [Save & Confirm Purchase Order Inward]
            </button>
          </div>
        </form>
      </div>

      {/* Alert Warning Modal for 6-Month Expiry */}
      <AlertWarningModal
        isOpen={!!warningMsg}
        title="Expiry Date Exceeded Warning"
        message={warningMsg}
        onClose={() => setWarningMsg('')}
      />
    </div>
  );
};

export default NewPOModal;
