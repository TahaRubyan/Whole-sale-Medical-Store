import React, { useState } from 'react';
import { Truck, Lock, Plus, CheckCircle, DollarSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSupplier } from '../context/SupplierContext';
import NewPOModal from '../components/modals/NewPOModal';
import PaySupplierModal from '../components/modals/PaySupplierModal';
import SupplierHistoryModal from '../components/modals/SupplierHistoryModal';
import { formatDateDDMMYYYY } from '../utils/dateUtils';

export const SuppliersPage = () => {
  const { permissions } = useAuth();
  const { suppliers, purchaseOrders } = useSupplier();

  const [isPoModalOpen, setIsPoModalOpen] = useState(false);
  const [selectedSupplierForPo, setSelectedSupplierForPo] = useState(null);

  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedSupplierForPay, setSelectedSupplierForPay] = useState(null);

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedSupplierForHistory, setSelectedSupplierForHistory] = useState(null);

  const handleOpenPoModal = (supplierId = null) => {
    setSelectedSupplierForPo(supplierId);
    setIsPoModalOpen(true);
  };

  const handleOpenPayModal = (supplier) => {
    setSelectedSupplierForPay(supplier);
    setIsPayModalOpen(true);
  };

  const handleOpenHistoryModal = (supplier) => {
    // Attach matching PO history to supplier object for modal
    const pos = purchaseOrders.filter((po) => (po.distributorName || po.supplierName || '').toLowerCase() === (supplier.name || supplier.companyName || '').toLowerCase());
    setSelectedSupplierForHistory({
      ...supplier,
      poHistory: pos
    });
    setIsHistoryModalOpen(true);
  };

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
                Distributor contact profiles, GSTIN verification, credit balances & Inward Purchase Orders.
              </p>
            </div>
          </div>

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

      <div className="card" style={{ padding: '1.25rem' }}>
        {/* Supplier Directory Section */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text-main)' }}>
              Registered Pharma Distributors ({suppliers.length})
            </h3>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Distributor Name & ID</th>
                  <th>Contact Person</th>
                  <th>Phone / Email</th>
                  <th>GSTIN / Tax #</th>
                  <th>City Address</th>
                  <th>Outstanding Balance</th>
                  <th>Active Orders</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((sup) => {
                  const supplierPoCount = purchaseOrders.filter((po) => po.supplierId === sup.id).length;
                  const curBal = sup.pendingBalance !== undefined ? sup.pendingBalance : (sup.outstandingBalance || 0);

                  return (
                    <tr key={sup.id}>
                      <td>
                        <div style={{ fontWeight: 800, color: 'var(--color-text-main)' }}>{sup.name || sup.companyName}</div>
                        <div style={{ fontSize: '0.725rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                          {sup.id}
                        </div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{sup.contactPerson}</td>
                      <td>
                        <div style={{ fontSize: '0.825rem' }}>{sup.phone}</div>
                        <div style={{ fontSize: '0.725rem', color: 'var(--color-text-muted)' }}>{sup.email}</div>
                      </td>
                      <td>
                        <span className="hotkey-pill">{sup.gstin}</span>
                      </td>
                      <td style={{ fontSize: '0.775rem', color: 'var(--color-text-muted)', maxWidth: '200px' }}>
                        {sup.city || sup.address || 'Pakistan'}
                      </td>
                      <td
                        style={{
                          fontWeight: 800,
                          color: curBal > 0 ? '#EF4444' : '#059669'
                        }}
                      >
                        Rs. {Number(curBal).toLocaleString('en-PK')}
                      </td>
                      <td>
                        <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>
                          {supplierPoCount} Order{supplierPoCount !== 1 ? 's' : ''}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                          <button
                            className="btn btn-outline"
                            onClick={() => handleOpenHistoryModal(sup)}
                            style={{
                              fontSize: '0.725rem',
                              padding: '0.25rem 0.5rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              borderColor: '#0284C7',
                              color: '#0284C7',
                              fontWeight: 700
                            }}
                            title="View full ledger & inward PO logs"
                          >
                            📜 History Log
                          </button>
                          <button
                            className="btn btn-outline"
                            onClick={() => handleOpenPoModal(sup.id)}
                            disabled={!permissions.canCreatePurchaseOrder}
                            style={{
                              fontSize: '0.725rem',
                              padding: '0.25rem 0.5rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem'
                            }}
                          >
                            {!permissions.canCreatePurchaseOrder ? <Lock size={12} /> : <Plus size={12} />} New PO
                          </button>
                          <button
                            className="btn btn-outline"
                            onClick={() => handleOpenPayModal(sup)}
                            disabled={!permissions.canCreatePurchaseOrder}
                            style={{
                              fontSize: '0.725rem',
                              padding: '0.25rem 0.5rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              borderColor: curBal > 0 ? '#059669' : '#CBD5E1',
                              color: curBal > 0 ? '#059669' : '#94A3B8',
                            }}
                          >
                            {!permissions.canCreatePurchaseOrder ? <Lock size={12} /> : <DollarSign size={12} />} Pay Balance
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
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {purchaseOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--color-text-muted)' }}>
                      No purchase orders recorded yet.
                    </td>
                  </tr>
                ) : (
                  purchaseOrders.map((po) => (
                    <tr key={po.id || po.poNumber}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#0284C7' }}>
                        {po.poNumber || po.id}
                      </td>
                      <td style={{ fontWeight: 700 }}>{po.distributorName || po.supplierName}</td>
                      <td style={{ fontWeight: 600 }}>{formatDateDDMMYYYY(po.inwardDate || po.date)}</td>
                      <td>
                        <span style={{ fontWeight: 700 }}>{po.brandName ? `${po.brandName} (${po.quantity} Tabs)` : `${po.itemCount} item(s)`}</span>
                      </td>
                      <td style={{ fontWeight: 800 }}>
                        Rs. {Number(po.totalAmount || (po.purchasePriceBox * (po.quantity / 200))).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                      </td>
                      <td>
                        <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <CheckCircle size={12} /> Inward Stock Received
                        </span>
                      </td>
                    </tr>
                  ))
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
