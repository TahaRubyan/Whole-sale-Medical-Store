import React, { useState } from 'react';
import { useSupplier } from '../../context/SupplierContext';
import { useInventory } from '../../context/InventoryContext';
import { Truck, CheckCircle, X, Plus, Trash2, Package } from 'lucide-react';
import { isWithinSixMonths } from '../../utils/dateUtils';
import AlertWarningModal from './AlertWarningModal';

export const NewPOModal = ({ isOpen, onClose }) => {
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
  const [inwardDate, setInwardDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Multi-Item PO Entry State (Box Count Standard)
  const [poItems, setPoItems] = useState([
    {
      id: 1,
      brandName: '',
      genericFormula: '',
      batchNumber: '',
      expiryDate: '',
      boxes: 1,
      purchasePriceBox: '',
      boxPrice: '',
    }
  ]);

  if (!isOpen) return null;

  const handleAddItemRow = () => {
    setPoItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        brandName: '',
        genericFormula: '',
        batchNumber: `B26-${Math.floor(1000 + Math.random() * 9000)}`,
        expiryDate: '2028-12-31',
        boxes: 10,
        purchasePriceBox: 480,
        boxPrice: 600,
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

  const [warningMsg, setWarningMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    for (const item of poItems) {
      if (isWithinSixMonths(item.expiryDate)) {
        setWarningMsg(`Cannot Add Batch: Expiry Date Exceeded for "${item.brandName || 'Medicine'}". Expiry must be greater than 6 months from today!`);
        return;
      }
    }

    // 1. Check if distributor is registered, if not & checkbox checked, register them with full metadata
    if (registerSupplier && distributorName.trim()) {
      const exists = suppliers.some((s) => (s.companyName || s.name || '').toLowerCase() === distributorName.trim().toLowerCase());
      if (!exists && addSupplier) {
        addSupplier({
          name: distributorName.trim(),
          companyName: distributorName.trim(),
          contactPerson: 'Manager',
          phone: supplierPhone.trim() || '+92 300 1234567',
          email: 'info@distributor.pk',
          licenseNo: supplierLicenseNo.trim(),
          ntn: supplierNtn.trim(),
          gstin: supplierGst.trim(),
          fbrStatus: supplierFbrStatus.trim(),
          city: 'Islamabad',
          pendingBalance: 0,
        });
      }
    }

    // 2. Process each inward line item into InventoryContext & SupplierContext
    poItems.forEach((item) => {
      const nameStr = (item.brandName || 'Medicine Item').trim();
      const formulaStr = (item.genericFormula || 'Generic Formula').trim();
      const batchStr = (item.batchNumber || 'BATCH-01').trim();
      const expStr = item.expiryDate || '2028-12-31';
      const boxQty = Number(item.boxes) || 1;
      const costBox = Number(item.purchasePriceBox) || 480;
      const mrpBox = Number(item.boxPrice) || 600;

      // Find or create linked medicine
      let targetMedicine = medicines.find(
        (m) => m.brandName.toLowerCase().trim() === nameStr.toLowerCase()
      );

      let targetMedicineId = targetMedicine ? targetMedicine.id : `MED-${Date.now().toString().slice(-4)}`;

      if (!targetMedicine) {
        targetMedicine = {
          id: targetMedicineId,
          brandName: nameStr,
          genericFormula: formulaStr,
          category: 'Tablets',
          manufacturer: distributorName.trim(),
          rackLocation: 'Rack A-01 / Inward',
          reorderLevel: 20,
          unitType: 'Box',
          tabletsPerBox: 200,
          boxPrice: mrpBox,
          pricePerTablet: mrpBox / 200,
          purchasePriceBox: costBox,
          requiresPrescription: false,
          barcode: `890${Date.now().toString().slice(-10)}`,
        };

        setMedicines((prevMeds) => [targetMedicine, ...prevMeds]);
      }

      // Record PO in SupplierContext
      const poData = {
        poNumber,
        distributorName: distributorName.trim(),
        supplierLicenseNo: supplierLicenseNo.trim(),
        supplierNtn: supplierNtn.trim(),
        supplierGst: supplierGst.trim(),
        supplierFbrStatus: supplierFbrStatus.trim(),
        supplierPhone: supplierPhone.trim(),
        inwardDate,
        brandName: nameStr,
        genericFormula: formulaStr,
        batchNumber: batchStr,
        expiryDate: expStr,
        quantity: boxQty,
        boxPrice: mrpBox,
        purchasePriceBox: costBox,
        totalAmount: boxQty * costBox,
      };

      createPurchaseOrder(poData);

      // Stock inward new batch into InventoryContext
      const newBatch = {
        id: `BAT-${Date.now().toString().slice(-6)}-${Math.floor(Math.random()*100)}`,
        medicineId: targetMedicineId,
        batchNumber: batchStr,
        mfgDate: inwardDate,
        expiryDate: expStr,
        totalBoxesAvailable: boxQty,
        totalTabletsAvailable: boxQty * 200,
        boxPrice: mrpBox,
        pricePerTablet: mrpBox / 200,
        purchasePriceBox: costBox,
        distributorName: distributorName.trim(),
        status: 'In Stock',
      };

      setBatches((prev) => [newBatch, ...prev]);
    });

    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      {/* EXTRA-WIDE MODAL LAYOUT (MAX-WIDTH: 1280PX) */}
      <div className="card" style={{ width: '96%', maxWidth: '1280px', maxHeight: '92vh', overflowY: 'auto', padding: '1.75rem', position: 'relative', backgroundColor: '#FFFFFF', boxShadow: '0 10px 30px rgba(0,0,0,0.25)' }}>
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
            <div style={{ fontSize: '0.825rem', fontWeight: 900, color: '#0369A1' }}>
              🚚 Distributor / Supplier Legal & Contact Metadata
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
                            required
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
                            required
                          />
                        </td>
                        <td style={{ padding: '0.5rem 0.4rem' }}>
                          <input
                            type="date"
                            value={item.expiryDate}
                            onChange={(e) => handleItemChange(idx, 'expiryDate', e.target.value)}
                            style={{ width: '100%', padding: '0.35rem', fontSize: '0.775rem', borderRadius: '4px', border: '1px solid #CBD5E1' }}
                            required
                          />
                        </td>
                        <td style={{ padding: '0.5rem 0.4rem', textAlign: 'center' }}>
                          <input
                            type="number"
                            min="1"
                            value={item.boxes}
                            onChange={(e) => handleItemChange(idx, 'boxes', e.target.value)}
                            style={{ width: '100%', padding: '0.35rem', fontSize: '0.85rem', fontWeight: 800, textAlign: 'center', borderRadius: '4px', border: '1px solid #CBD5E1' }}
                            required
                          />
                        </td>
                        <td style={{ padding: '0.5rem 0.4rem', textAlign: 'right' }}>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.purchasePriceBox}
                            onChange={(e) => handleItemChange(idx, 'purchasePriceBox', e.target.value)}
                            style={{ width: '100%', padding: '0.35rem', fontSize: '0.85rem', fontWeight: 800, textAlign: 'right', borderRadius: '4px', border: '1px solid #CBD5E1' }}
                            required
                          />
                        </td>
                        <td style={{ padding: '0.5rem 0.4rem', textAlign: 'right' }}>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.boxPrice}
                            onChange={(e) => handleItemChange(idx, 'boxPrice', e.target.value)}
                            style={{ width: '100%', padding: '0.35rem', fontSize: '0.85rem', fontWeight: 800, textAlign: 'right', borderRadius: '4px', border: '1px solid #CBD5E1' }}
                            required
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

          {/* TOTAL ORDER VALUATION & SUBMIT BUTTON */}
          <div style={{ backgroundColor: '#0284C7', color: '#FFFFFF', padding: '0.75rem 1rem', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 800 }}>TOTAL PURCHASE ORDER COST VALUATION:</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#E0F2FE' }}>Rs. {totalOrderValuation.toLocaleString('en-PK', { minimumFractionDigits: 2 })}</span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.35rem' }}>
            <button type="button" onClick={onClose} className="btn btn-outline" style={{ flex: 1 }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2, backgroundColor: '#0284C7', color: '#FFF', fontWeight: 900, fontSize: '0.95rem' }}>
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
