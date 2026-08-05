import React, { useState } from 'react';
import { AlertTriangle, Clock, ShieldAlert, FileText } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export const ExpiryRadarPage = () => {
  const { medicines, batches } = useInventory();
  const [activeTab, setActiveTab] = useState('all'); // 'expired' | '30' | '60' | '90' | 'all'

  const todayStr = '2026-08-01';
  const today = new Date(todayStr);

  // Safely compute near expiry batches list
  const nearExpiryList = batches
    .filter((b) => b.status !== 'Quarantined' && b.totalTabletsAvailable > 0)
    .map((b) => {
      const med = medicines.find((m) => m.id === b.medicineId);
      const expDate = new Date(b.expiryDate);
      const diffDays = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));

      return {
        id: b.id,
        brandName: med?.brandName || 'Medicine',
        genericFormula: med?.genericFormula || '-',
        rackLocation: med?.rackLocation || 'Rack A-01',
        batchNumber: b.batchNumber,
        expiryDate: b.expiryDate,
        diffDays,
        totalTabletsAvailable: b.totalTabletsAvailable,
        boxPrice: b.boxPrice || 500,
        distributorName: b.distributorName || 'Supplier',
      };
    })
    .filter((item) => item.diffDays <= 90)
    .sort((a, b) => a.diffDays - b.diffDays);

  const filteredList = nearExpiryList.filter((item) => {
    if (activeTab === 'expired') return item.diffDays <= 0;
    if (activeTab === '30') return item.diffDays > 0 && item.diffDays <= 30;
    if (activeTab === '60') return item.diffDays > 0 && item.diffDays <= 60;
    if (activeTab === '90') return item.diffDays > 0 && item.diffDays <= 90;
    return true; // 'all'
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header Banner */}
      <div className="card" style={{ padding: '1.25rem', backgroundColor: '#0284C7', color: '#FFFFFF', border: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertTriangle size={28} color="#FFF" />
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Pakistan Pharmacy Expiry Radar & Loss Control</h2>
              <p style={{ fontSize: '0.8rem', color: '#E0F2FE', marginTop: '0.15rem' }}>
                Track near-expiry batches, days remaining, and return notes for suppliers.
              </p>
            </div>
          </div>
          <span className="badge" style={{ backgroundColor: '#FFF', color: '#0284C7', fontWeight: 800 }}>
            {nearExpiryList.length} At-Risk Batches
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="card" style={{ padding: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('all')}
          className={`btn ${activeTab === 'all' ? 'btn-primary' : 'btn-outline'}`}
          style={{ fontSize: '0.8rem' }}
        >
          All Near Expiry ({nearExpiryList.length})
        </button>
        <button
          onClick={() => setActiveTab('expired')}
          className={`btn ${activeTab === 'expired' ? 'btn-danger' : 'btn-outline'}`}
          style={{ fontSize: '0.8rem' }}
        >
          Expired ({nearExpiryList.filter((i) => i.diffDays <= 0).length})
        </button>
        <button
          onClick={() => setActiveTab('30')}
          className={`btn ${activeTab === '30' ? 'btn-danger' : 'btn-outline'}`}
          style={{ fontSize: '0.8rem' }}
        >
          &le; 30 Days ({nearExpiryList.filter((i) => i.diffDays > 0 && i.diffDays <= 30).length})
        </button>
        <button
          onClick={() => setActiveTab('60')}
          className={`btn ${activeTab === '60' ? 'btn-primary' : 'btn-outline'}`}
          style={{ fontSize: '0.8rem' }}
        >
          &le; 60 Days ({nearExpiryList.filter((i) => i.diffDays > 0 && i.diffDays <= 60).length})
        </button>
        <button
          onClick={() => setActiveTab('90')}
          className={`btn ${activeTab === '90' ? 'btn-primary' : 'btn-outline'}`}
          style={{ fontSize: '0.8rem' }}
        >
          &le; 90 Days ({nearExpiryList.filter((i) => i.diffDays > 0 && i.diffDays <= 90).length})
        </button>
      </div>

      {/* Expiry Table */}
      <div className="table-container card">
        <table className="table">
          <thead>
            <tr>
              <th>Medicine Name & Formula</th>
              <th>Batch #</th>
              <th>Rack Location</th>
              <th>Distributor</th>
              <th>Expiry Date</th>
              <th>Days Left</th>
              <th>Available Stock</th>
              <th>Est. Loss Value</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.length > 0 ? (
              filteredList.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div style={{ fontWeight: 800 }}>{item.brandName}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{item.genericFormula}</div>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{item.batchNumber}</td>
                  <td><span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', backgroundColor: '#E0F2FE', color: '#0369A1', borderRadius: '4px', fontWeight: 700 }}>{item.rackLocation}</span></td>
                  <td style={{ fontSize: '0.8rem', fontWeight: 600 }}>{item.distributorName}</td>
                  <td style={{ fontWeight: 700, color: item.diffDays <= 0 ? '#EF4444' : '#D97706' }}>{item.expiryDate}</td>
                  <td>
                    {item.diffDays <= 0 ? (
                      <span className="badge badge-danger">EXPIRED</span>
                    ) : (
                      <span className="badge badge-warning">{item.diffDays} Days Left</span>
                    )}
                  </td>
                  <td><strong>{item.totalTabletsAvailable} Tablets</strong></td>
                  <td style={{ fontWeight: 800, color: '#EF4444' }}>
                    Rs. {item.boxPrice}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                  No near expiry batches match selected filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpiryRadarPage;
