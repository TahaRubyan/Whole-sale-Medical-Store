import React, { useState } from 'react';
import { AlertTriangle, Clock, ShieldAlert, FileText, Printer } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { formatDateDDMMYYYY, formatExpiryMMYYYY } from '../utils/dateUtils';
import { getStoreInfo } from '../data/mockData';

export const ExpiryRadarPage = () => {
  const { medicines, batches } = useInventory();
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'expired' | 'sixMonths'

  const [, setSettingTick] = React.useState(0);
  React.useEffect(() => {
    const handleSettingUpdate = () => setSettingTick((t) => t + 1);
    window.addEventListener('store_info_updated', handleSettingUpdate);
    window.addEventListener('warranty_config_updated', handleSettingUpdate);
    window.addEventListener('tax_config_updated', handleSettingUpdate);
    return () => {
      window.removeEventListener('store_info_updated', handleSettingUpdate);
      window.removeEventListener('warranty_config_updated', handleSettingUpdate);
      window.removeEventListener('tax_config_updated', handleSettingUpdate);
    };
  }, []);

  const today = new Date();

  // Safely compute near expiry batches list (expiry <= 180 days / 6 months)
  const nearExpiryList = batches
    .filter((b) => b.status !== 'Quarantined' && (b.totalBoxesAvailable > 0 || b.totalTabletsAvailable > 0))
    .map((b) => {
      const med = medicines.find((m) => m.id === b.medicineId);
      const expDate = new Date(b.expiryDate);
      const diffTime = expDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const diffMonths = (expDate.getFullYear() - today.getFullYear()) * 12 + (expDate.getMonth() - today.getMonth());

      return {
        id: b.id,
        brandName: med?.brandName || 'Medicine',
        genericFormula: med?.genericFormula || '-',
        rackLocation: med?.rackLocation || 'Rack A-01',
        batchNumber: b.batchNumber,
        expiryDate: b.expiryDate,
        diffDays,
        diffMonths,
        totalBoxesAvailable: b.totalBoxesAvailable || Math.floor((b.totalTabletsAvailable || 0) / 20) || 1,
        boxPrice: b.boxPrice || med?.boxPrice || 600,
        distributorName: b.distributorName || 'Supplier',
      };
    })
    .filter((item) => item.diffDays <= 180 || item.diffMonths <= 6) // Items <= 6 months or expired
    .sort((a, b) => a.diffDays - b.diffDays);

  const filteredList = nearExpiryList.filter((item) => {
    if (activeTab === 'expired') return item.diffDays <= 0;
    if (activeTab === 'sixMonths') return item.diffDays > 0 && (item.diffDays <= 180 || item.diffMonths <= 6);
    return true; // 'all'
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Print CSS Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #expiry-report-print, #expiry-report-print * {
            visibility: visible;
          }
          #expiry-report-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Header Banner (Ocean Cyan Blue Theme) */}
      <div className="card no-print" style={{ padding: '1.25rem', backgroundColor: '#0284C7', color: '#FFFFFF', border: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertTriangle size={28} color="#FFF" />
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Pakistan Pharmacy Expiry Radar & Loss Control</h2>
              <p style={{ fontSize: '0.8rem', color: '#E0F2FE', marginTop: '0.15rem' }}>
                Track near-expiry batches (≤ 6 months) and generate printable A4 expiry audit reports.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={handlePrint}
              className="btn btn-primary"
              style={{ padding: '0.5rem 1rem', fontWeight: 800, fontSize: '0.85rem', backgroundColor: '#FFFFFF', color: '#0284C7', border: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}
            >
              <Printer size={16} /> 📄 Print Expiry Report PDF
            </button>

            <span className="badge" style={{ backgroundColor: '#FFF', color: '#0284C7', fontWeight: 800 }}>
              {nearExpiryList.length} At-Risk Batches
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs (Simplified to <= 6 Months and Expired) */}
      <div className="card no-print" style={{ padding: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('all')}
          className={`btn ${activeTab === 'all' ? 'btn-primary' : 'btn-outline'}`}
          style={{ fontSize: '0.85rem', fontWeight: 800 }}
        >
          All At-Risk Items (≤ 6 Months & Expired) ({nearExpiryList.length})
        </button>

        <button
          onClick={() => setActiveTab('sixMonths')}
          className={`btn ${activeTab === 'sixMonths' ? 'btn-primary' : 'btn-outline'}`}
          style={{ fontSize: '0.85rem', fontWeight: 800, backgroundColor: activeTab === 'sixMonths' ? '#D97706' : 'transparent', borderColor: '#D97706', color: activeTab === 'sixMonths' ? '#FFF' : '#D97706' }}
        >
          ⚠️ Expiring in ≤ 6 Months ({nearExpiryList.filter((i) => i.diffDays > 0).length})
        </button>

        <button
          onClick={() => setActiveTab('expired')}
          className={`btn ${activeTab === 'expired' ? 'btn-danger' : 'btn-outline'}`}
          style={{ fontSize: '0.85rem', fontWeight: 800 }}
        >
          🚨 Already Expired ({nearExpiryList.filter((i) => i.diffDays <= 0).length})
        </button>
      </div>

      {/* Printable Expiry Table */}
      <div id="expiry-report-print" className="card" style={{ padding: '1.25rem' }}>
        
        {/* Printable Header */}
        <div style={{ marginBottom: '1rem', borderBottom: '2px solid #0F172A', paddingBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0284C7', margin: 0 }}>
              {getStoreInfo().name} — Medicines Expiry & Audit Report (≤ 6 Months)
            </h2>
            <p style={{ fontSize: '0.775rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>
              DSL #: {getStoreInfo().dslNumber} | Date Generated: {formatDateDDMMYYYY(new Date())}
            </p>
          </div>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#DC2626', border: '1px solid #DC2626', padding: '0.35rem 0.65rem', borderRadius: '4px' }}>
            CRITICAL EXPIRY LIST
          </div>
        </div>

        <div className="table-container">
          <table className="table" style={{ fontSize: '0.825rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC' }}>
                <th>Sr.</th>
                <th>Medicine Trade Name</th>
                <th>Generic Formula</th>
                <th>Batch #</th>
                <th>Rack Location</th>
                <th>Expiry Date</th>
                <th>Status / Days Left</th>
                <th style={{ textAlign: 'center' }}>Box Stock</th>
                <th style={{ textAlign: 'right' }}>Box MRP (Rs.)</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length > 0 ? (
                filteredList.map((item, idx) => {
                  const isExpired = item.diffDays <= 0;
                  return (
                    <tr key={item.id} style={{ backgroundColor: isExpired ? '#FEF2F2' : 'transparent' }}>
                      <td>{idx + 1}</td>
                      <td style={{ fontWeight: 800, color: '#0F172A' }}>{item.brandName}</td>
                      <td style={{ color: '#64748B' }}>{item.genericFormula}</td>
                      <td style={{ fontFamily: 'monospace', fontWeight: 800 }}>{item.batchNumber}</td>
                      <td style={{ fontWeight: 700 }}>{item.rackLocation}</td>
                      <td style={{ fontWeight: 800, color: isExpired ? '#DC2626' : '#D97706' }}>
                        {formatExpiryMMYYYY(item.expiryDate)}
                      </td>
                      <td>
                        {isExpired ? (
                          <span style={{ backgroundColor: '#FEE2E2', color: '#991B1B', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 800, fontSize: '0.75rem' }}>
                            🚨 EXPIRED ({Math.abs(item.diffDays)} days ago)
                          </span>
                        ) : (
                          <span style={{ backgroundColor: '#FEF3C7', color: '#92400E', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 800, fontSize: '0.75rem' }}>
                            ⚠️ {item.diffDays} Days Left (≤ 6 Months)
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 800 }}>{item.totalBoxesAvailable} Boxes</td>
                      <td style={{ textAlign: 'right', fontWeight: 900, color: '#0369A1' }}>
                        Rs. {Number(item.boxPrice).toFixed(2)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '2.5rem', color: '#64748B' }}>
                    No medicines found in the selected expiry criteria. All stock has &gt; 6 months expiry!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default ExpiryRadarPage;
