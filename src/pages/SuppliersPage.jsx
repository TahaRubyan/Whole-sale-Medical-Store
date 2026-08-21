import React, { useState, useMemo } from 'react';
import { Truck, Lock, Plus, CheckCircle, DollarSign, RotateCcw, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSupplier } from '../context/SupplierContext';
import NewPOModal from '../components/modals/NewPOModal';
import PaySupplierModal from '../components/modals/PaySupplierModal';
import SupplierHistoryModal from '../components/modals/SupplierHistoryModal';
import ReturnToVendorModal from '../components/modals/ReturnToVendorModal';
import RtvInvoicePrintModal from '../components/modals/RtvInvoicePrintModal';
import { formatDateDDMMYYYY } from '../utils/dateUtils';

export const SuppliersPage = () => {
  const { isCashier, permissions } = useAuth();
  const { suppliers, purchaseOrders } = useSupplier();

  const [isPoModalOpen, setIsPoModalOpen] = useState(false);
  const [selectedSupplierForPo, setSelectedSupplierForPo] = useState(null);

  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedSupplierForPay, setSelectedSupplierForPay] = useState(null);

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedSupplierForHistory, setSelectedSupplierForHistory] = useState(null);

  const [isRtvModalOpen, setIsRtvModalOpen] = useState(false);
  const [selectedSupplierForRtv, setSelectedSupplierForRtv] = useState(null);
  const [rtvPrintRecord, setRtvPrintRecord] = useState(null);
  const [filterDebtOnly, setFilterDebtOnly] = useState(false);
  const [supplierSearchQuery, setSupplierSearchQuery] = useState('');

  const handleOpenPoModal = (supplierId = null) => {
    setSelectedSupplierForPo(supplierId);
    setIsPoModalOpen(true);
  };

  const handleOpenPayModal = (supplier) => {
    setSelectedSupplierForPay(supplier);
    setIsPayModalOpen(true);
  };

  const handleOpenHistoryModal = (supplier) => {
    const pos = purchaseOrders.filter((po) => (po.distributorName || po.supplierName || '').toLowerCase() === (supplier.name || supplier.companyName || '').toLowerCase());
    setSelectedSupplierForHistory({
      ...supplier,
      poHistory: pos
    });
    setIsHistoryModalOpen(true);
  };

  const handleOpenRtvModal = (supplier = null) => {
    setSelectedSupplierForRtv(supplier);
    setIsRtvModalOpen(true);
  };

  // Group suppliers by Unique Company Name
  const uniqueSuppliers = useMemo(() => {
    const map = new Map();

    suppliers.forEach((s) => {
      const companyName = (s.companyName || s.name || 'Pharma Supplier').trim();
      const normKey = companyName.toLowerCase();

      if (!map.has(normKey)) {
        const matchingPOs = purchaseOrders.filter(
          (po) => (po.distributorName || po.supplierName || '').toLowerCase().trim() === normKey
        );

        const calculatedDebt = matchingPOs.reduce(
          (sum, po) => sum + (Number(po.remainingDebt) || 0),
          0
        );

        const currentBal = s.pendingBalance !== undefined ? Number(s.pendingBalance) : (Number(s.outstandingBalance) || calculatedDebt);

        map.set(normKey, {
          ...s,
          companyName,
          name: companyName,
          phone: s.phone || '+92 300 0000000',
          licenseNo: s.licenseNo || s.gstin || '09-342-0139-045748D',
          ntn: s.ntn || '3277876174544',
          city: s.city || 'Wholesale Commercial Market',
          pendingBalance: currentBal,
          poCount: matchingPOs.length,
          poHistory: matchingPOs,
        });
      }
    });

    return Array.from(map.values());
  }, [suppliers, purchaseOrders]);

  // Compute Debt KPIs based on Unique Companies
  const debtSuppliersCount = uniqueSuppliers.filter((s) => s.pendingBalance > 0).length;
  const totalDebtAmount = uniqueSuppliers.reduce((sum, s) => sum + Number(s.pendingBalance || 0), 0);

  const displayedSuppliers = useMemo(() => {
    let list = filterDebtOnly
      ? uniqueSuppliers.filter((s) => s.pendingBalance > 0)
      : uniqueSuppliers;

    if (supplierSearchQuery.trim()) {
      const q = supplierSearchQuery.toLowerCase().trim();
      list = list.filter((s) =>
        (s.companyName && s.companyName.toLowerCase().includes(q)) ||
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.phone && s.phone.includes(q)) ||
        (s.licenseNo && s.licenseNo.toLowerCase().includes(q)) ||
        (s.ntn && s.ntn.includes(q)) ||
        (s.city && s.city.toLowerCase().includes(q))
      );
    }
    return list;
  }, [uniqueSuppliers, filterDebtOnly, supplierSearchQuery]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Header Card (Ocean Cyan Blue Theme) */}
      <div className="card" style={{ padding: '1.25rem', backgroundColor: '#0284C7', color: '#FFFFFF', border: 'none' }}>
        <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Truck size={28} color="#FFFFFF" />
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Pakistan Supplier Directory & Stock Inward Orders</h2>
              <p style={{ fontSize: '0.8rem', color: '#E0F2FE', marginTop: '0.15rem' }}>
                Distributor company directory, license verification, ledger statements & inward PO shipments.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              className="btn"
              onClick={() => handleOpenRtvModal(null)}
              style={{
                backgroundColor: '#DC2626',
                color: '#FFFFFF',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                border: 'none'
              }}
            >
              <RotateCcw size={16} /> Return Stock (RTV Debit Note)
            </button>

            <button
              className="btn btn-primary"
              onClick={() => handleOpenPoModal(null)}
              disabled={!permissions.canCreatePurchaseOrder}
              style={{
                backgroundColor: '#FFFFFF',
                color: '#0284C7',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                opacity: !permissions.canCreatePurchaseOrder ? 0.5 : 1,
                cursor: !permissions.canCreatePurchaseOrder ? 'not-allowed' : 'pointer',
              }}
            >
              {!permissions.canCreatePurchaseOrder ? <Lock size={16} /> : <Plus size={16} />}
              New Purchase Order
            </button>
          </div>
        </div>
      </div>

      {/* SUPPLIER DEBT SUMMARY KPI CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
        <div className="card" style={{ padding: '1rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748B' }}>TOTAL REGISTERED PHARMA DISTRIBUTORS</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0F172A', marginTop: '0.2rem' }}>
            {uniqueSuppliers.length} Companies
          </div>
        </div>

        <div className="card" style={{ padding: '1rem', backgroundColor: '#FEF2F2', border: '1.5px solid #FCA5A5' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#991B1B' }}>DISTRIBUTORS WITH OUTSTANDING DEBT</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#DC2626', marginTop: '0.2rem' }}>
            {debtSuppliersCount} Distributors Owing Debt
          </div>
        </div>

        <div className="card" style={{ padding: '1rem', backgroundColor: '#F0F9FF', border: '1.5px solid #0284C7' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#0369A1' }}>NET TOTAL PAYABLE STOCK DEBT</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0284C7', marginTop: '0.2rem' }}>
            Rs. {totalDebtAmount.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '1.25rem' }}>
        {/* Supplier Directory Section */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div className="flex-between" style={{ marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text-main)', margin: 0 }}>
              Pharma Distributor Directory ({displayedSuppliers.length} Companies)
            </h3>

            {/* SEARCH INPUT & FILTER TAB BUTTONS */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Search supplier, license, city..."
                value={supplierSearchQuery}
                onChange={(e) => setSupplierSearchQuery(e.target.value)}
                style={{
                  padding: '0.4rem 0.75rem',
                  fontSize: '0.8rem',
                  borderRadius: '6px',
                  border: '1px solid #CBD5E1',
                  minWidth: '220px'
                }}
              />

              <button
                onClick={() => setFilterDebtOnly(false)}
                className={`btn ${!filterDebtOnly ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '0.775rem', fontWeight: 800, padding: '0.35rem 0.75rem' }}
              >
                All Companies ({uniqueSuppliers.length})
              </button>

              <button
                onClick={() => setFilterDebtOnly(true)}
                className={`btn ${filterDebtOnly ? 'btn-danger' : 'btn-outline'}`}
                style={{ fontSize: '0.775rem', fontWeight: 800, padding: '0.35rem 0.75rem', borderColor: '#EF4444', color: filterDebtOnly ? '#FFF' : '#EF4444' }}
              >
                🔴 Debt Owing Companies Only ({debtSuppliersCount})
              </button>
            </div>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Distributor / Company Name</th>
                  <th>Contact Phone</th>
                  <th>GSTIN / License #</th>
                  <th>City</th>
                  <th style={{ textAlign: 'center' }}>Total PO Orders</th>
                  <th style={{ textAlign: 'right' }}>Outstanding Debt</th>
                  <th style={{ textAlign: 'center' }}>Company Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedSuppliers.map((supplier) => {
                  const bal = supplier.pendingBalance || 0;
                  const isDebt = bal > 0;

                  return (
                    <tr key={supplier.id || supplier.name}>
                      <td style={{ fontWeight: 900, color: '#0F172A', fontSize: '0.9rem' }}>
                        {supplier.companyName || supplier.name}
                      </td>
                      <td style={{ fontWeight: 700 }}>{supplier.phone || '-'}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.775rem' }}>
                        {supplier.gstin || supplier.licenseNo || '-'}
                      </td>
                      <td>{supplier.city || 'Wholesale Market'}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, backgroundColor: '#F1F5F9', color: '#0284C7', padding: '0.2rem 0.55rem', borderRadius: '4px' }}>
                          {supplier.poCount || (supplier.poHistory ? supplier.poHistory.length : 1)} Orders
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span
                          style={{
                            fontWeight: 900,
                            color: isDebt ? '#DC2626' : '#059669',
                            backgroundColor: isDebt ? '#FEF2F2' : '#ECFDF5',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            border: isDebt ? '1px solid #FCA5A5' : '1px solid #A7F3D0',
                          }}
                        >
                          Rs. {Number(bal).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                          <button
                            onClick={() => handleOpenHistoryModal(supplier)}
                            className="btn btn-outline"
                            style={{ padding: '0.3rem 0.65rem', fontSize: '0.775rem', fontWeight: 900, borderColor: '#0284C7', color: '#0284C7', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                            title="Click for supplier log ledger with full transaction & PO details"
                          >
                            <FileText size={14} /> 📋 View Log Ledger & Details
                          </button>

                          <button
                            onClick={() => handleOpenPoModal(supplier.id)}
                            className="btn btn-outline"
                            style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem', fontWeight: 800 }}
                            title="Create Inward Purchase Order"
                          >
                            <Plus size={12} /> PO
                          </button>

                          <button
                            onClick={() => handleOpenPayModal(supplier)}
                            className="btn btn-primary"
                            disabled={!isDebt || isCashier}
                            style={{
                              padding: '0.3rem 0.5rem',
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              backgroundColor: isDebt ? '#059669' : '#94A3B8',
                              borderColor: isDebt ? '#059669' : '#94A3B8',
                              cursor: !isDebt || isCashier ? 'not-allowed' : 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.2rem',
                            }}
                          >
                            {isCashier ? <Lock size={12} /> : <DollarSign size={12} />} Pay
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Purchase Orders Log Section */}
        <div>
          <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text-main)' }}>
              Inward Stock Purchase Orders ({purchaseOrders.length})
            </h3>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>PO Reference #</th>
                  <th>Distributor / Supplier</th>
                  <th>Date</th>
                  <th>Item Lines</th>
                  <th>Total Amount</th>
                  <th>Payment Status</th>
                  <th>Stock Status</th>
                </tr>
              </thead>
              <tbody>
                {purchaseOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--color-text-muted)' }}>
                      No purchase orders recorded yet.
                    </td>
                  </tr>
                ) : (
                  purchaseOrders.map((po) => {
                    const remDebt = Number(po.remainingDebt || 0);
                    const isFullyPaid = po.paymentStatus === 'PAID_IN_FULL' || remDebt <= 0;

                    return (
                      <tr key={po.id || po.poNumber}>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#0284C7' }}>
                          {po.poNumber || po.id}
                        </td>
                        <td style={{ fontWeight: 700 }}>{po.distributorName || po.supplierName}</td>
                        <td style={{ fontWeight: 600 }}>{formatDateDDMMYYYY(po.inwardDate || po.date)}</td>
                        <td>
                          <span style={{ fontWeight: 700 }}>{po.brandName ? `${po.brandName} (${po.quantity} Boxes)` : `${po.itemCount} item(s)`}</span>
                        </td>
                        <td style={{ fontWeight: 800 }}>
                          Rs. {Number(po.totalAmount || (po.purchasePriceBox * (po.quantity / 200))).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                        </td>
                        <td>
                          {isFullyPaid ? (
                            <span style={{ backgroundColor: '#ECFDF5', color: '#047857', border: '1.5px solid #6EE7B7', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 800, fontSize: '0.725rem' }}>
                              🟢 PAID IN FULL
                            </span>
                          ) : (
                            <span style={{ backgroundColor: '#FEF2F2', color: '#B91C1C', border: '1.5px solid #FCA5A5', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 800, fontSize: '0.725rem' }}>
                              🔴 DEBT OWED (Rs. {remDebt.toLocaleString('en-PK')})
                            </span>
                          )}
                        </td>
                        <td>
                          <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <CheckCircle size={12} /> Stock Received
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* New Purchase Order Builder Modal */}
      {isPoModalOpen && (
        <NewPOModal
          isOpen={isPoModalOpen}
          onClose={() => setIsPoModalOpen(false)}
          initialSupplierId={selectedSupplierForPo}
        />
      )}

      {/* Return to Vendor Modal */}
      {isRtvModalOpen && (
        <ReturnToVendorModal
          isOpen={isRtvModalOpen}
          initialSupplier={selectedSupplierForRtv}
          onClose={() => setIsRtvModalOpen(false)}
          onSuccessPrint={(record) => {
            setRtvPrintRecord(record);
          }}
        />
      )}

      {/* Printable RTV Debit Note Modal */}
      {rtvPrintRecord && (
        <RtvInvoicePrintModal
          rtv={rtvPrintRecord}
          onClose={() => setRtvPrintRecord(null)}
        />
      )}

      {/* Pay Supplier Debt Modal */}
      {isPayModalOpen && (
        <PaySupplierModal
          isOpen={isPayModalOpen}
          supplier={selectedSupplierForPay}
          onClose={() => setIsPayModalOpen(false)}
        />
      )}

      {/* Supplier History & Ledger Log Modal */}
      {isHistoryModalOpen && (
        <SupplierHistoryModal
          isOpen={isHistoryModalOpen}
          supplier={selectedSupplierForHistory}
          onClose={() => setIsHistoryModalOpen(false)}
        />
      )}
    </div>
  );
};

export default SuppliersPage;
