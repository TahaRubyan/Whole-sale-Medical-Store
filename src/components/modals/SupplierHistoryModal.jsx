import React from 'react';
import { Truck, X, Calendar, DollarSign, FileText, CheckCircle, Clock } from 'lucide-react';
import { formatDateDDMMYYYY } from '../../utils/dateUtils';

export const SupplierHistoryModal = ({ isOpen, onClose, supplier }) => {
  if (!isOpen || !supplier) return null;

  const paymentLogs = supplier.paymentLogs || [];
  const poHistory = supplier.poHistory || [];

  return (
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div className="card" style={{ width: '750px', maxWidth: '94vw', maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem', backgroundColor: '#FFFFFF', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '2px solid #E2E8F0', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#E0F2FE', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Truck size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                {supplier.name || supplier.companyName} — Ledger & Stock Log History
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0.15rem 0 0 0' }}>
                Lic #: {supplier.licenseNo || 'N/A'} | NTN #: {supplier.ntn || 'N/A'} | Phone: {supplier.phone}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748B' }}>
            <X size={22} />
          </button>
        </div>

        {/* Current Outstanding Debt KPI */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FEF2F2', padding: '0.85rem 1.1rem', borderRadius: '8px', border: '1.5px solid #FCA5A5', marginBottom: '1.25rem' }}>
          <div>
            <span style={{ fontSize: '0.775rem', fontWeight: 800, color: '#991B1B', textTransform: 'uppercase' }}>
              Current Pending Payable Balance:
            </span>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#DC2626' }}>
              Rs. {Number(supplier.pendingBalance || 0).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#991B1B', backgroundColor: '#FFF', padding: '0.35rem 0.65rem', borderRadius: '6px', border: '1px solid #FCA5A5' }}>
            {supplier.fbrStatus || 'Active Supplier'}
          </span>
        </div>

        {/* 1. Cash Payments History Section */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 900, color: '#0369A1', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <DollarSign size={18} /> Cash Debt Payments Log ({paymentLogs.length})
          </h3>

          <div className="table-container">
            <table className="table" style={{ fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC' }}>
                  <th>Date & Time</th>
                  <th>Amount Paid (Rs.)</th>
                  <th>Payment Method</th>
                  <th>Due Balance Left (Rs.)</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {paymentLogs.length > 0 ? (
                  paymentLogs.map((log) => (
                    <tr key={log.id}>
                      <td style={{ fontWeight: 700 }}>{formatDateDDMMYYYY(log.date)}</td>
                      <td style={{ fontWeight: 900, color: '#059669' }}>Rs. {Number(log.amountPaid).toFixed(2)}</td>
                      <td><span style={{ fontWeight: 700, backgroundColor: '#E0F2FE', color: '#0369A1', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.75rem' }}>{log.paymentMode || 'Cash'}</span></td>
                      <td style={{ fontWeight: 800, color: log.remainingBalance > 0 ? '#DC2626' : '#059669' }}>
                        Rs. {Number(log.remainingBalance).toFixed(2)}
                      </td>
                      <td style={{ color: '#64748B' }}>{log.notes || 'Supplier Cash Payment'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '1.25rem', color: '#64748B' }}>
                      No debt payments recorded yet for this supplier.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. Stock Inward PO Receipts History */}
        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 900, color: '#0369A1', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FileText size={18} /> Stock Inward Purchase Orders ({poHistory.length})
          </h3>

          <div className="table-container">
            <table className="table" style={{ fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC' }}>
                  <th>PO Reference #</th>
                  <th>Inward Date</th>
                  <th style={{ textAlign: 'center' }}>Total Items / Batches</th>
                  <th style={{ textAlign: 'right' }}>Total PO Amount (Rs.)</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {poHistory.length > 0 ? (
                  poHistory.map((po) => (
                    <tr key={po.poNumber}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 800, color: '#0284C7' }}>{po.poNumber}</td>
                      <td style={{ fontWeight: 700 }}>{formatDateDDMMYYYY(po.date)}</td>
                      <td style={{ textAlign: 'center', fontWeight: 700 }}>{po.itemsCount || (po.items ? po.items.length : 1)} Items</td>
                      <td style={{ textAlign: 'right', fontWeight: 900, color: '#0F172A' }}>Rs. {Number(po.totalAmount || 0).toFixed(2)}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ backgroundColor: '#D1FAE5', color: '#065F46', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 800, fontSize: '0.75rem' }}>
                          RECEIVED INWARD
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '1.25rem', color: '#64748B' }}>
                      No purchase order receipts recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SupplierHistoryModal;
