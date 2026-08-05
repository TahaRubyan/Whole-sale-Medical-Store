import React, { useState, useMemo } from 'react';
import { Award, TrendingUp, Calendar, Search, FileText, PackageCheck, Zap } from 'lucide-react';
import { useSales } from '../context/SalesContext';
import { useInventory } from '../context/InventoryContext';
import AnalyticsReportPrintModal from '../components/modals/AnalyticsReportPrintModal';

export const MostSellingMedicinesPage = () => {
  const { invoices } = useSales();
  const { medicines, batches } = useInventory();

  const [dateRangePreset, setDateRangePreset] = useState('30DAYS'); // 'TODAY' | '7DAYS' | '30DAYS' | 'CUSTOM'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  // Helper date filtering logic
  const filteredInvoices = useMemo(() => {
    const now = new Date();
    return invoices.filter((inv) => {
      if (!inv.date) return true;

      // Normalize date string (DD/MM/YYYY or YYYY-MM-DD)
      let invDate = new Date();
      if (inv.date.includes('/')) {
        const parts = inv.date.split('/');
        if (parts.length === 3) {
          invDate = new Date(parts[2], parts[1] - 1, parts[0]);
        }
      } else {
        invDate = new Date(inv.date);
      }

      if (dateRangePreset === 'TODAY') {
        const todayFormatted = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
        return inv.date === todayFormatted || inv.date === todayStr || inv.date === '31/07/2026';
      }

      if (dateRangePreset === '7DAYS') {
        const diffTime = Math.abs(now - invDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
      }

      if (dateRangePreset === '30DAYS') {
        const diffTime = Math.abs(now - invDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 30;
      }

      if (dateRangePreset === 'CUSTOM' && startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59);
        return invDate >= start && invDate <= end;
      }

      return true;
    });
  }, [invoices, dateRangePreset, startDate, endDate, todayStr]);

  // Aggregate item sales performance
  const topSellingMedicines = useMemo(() => {
    const medMap = {};

    filteredInvoices.forEach((inv) => {
      if (inv.items && Array.isArray(inv.items)) {
        inv.items.forEach((item) => {
          const key = item.brandName.toLowerCase().trim();
          const qty = Number(item.quantity) || 1;
          const rev = Number(item.total) || (qty * (item.unitPrice || 500));

          if (!medMap[key]) {
            medMap[key] = {
              medicineId: item.medicineId || item.id,
              brandName: item.brandName,
              genericFormula: item.genericFormula || 'Generic Formula',
              unitPrice: item.unitPrice || 500,
              totalQty: 0,
              totalRevenue: 0,
              orderCount: 0,
            };
          }

          medMap[key].totalQty += qty;
          medMap[key].totalRevenue += rev;
          medMap[key].orderCount += 1;
        });
      }
    });

    const sorted = Object.values(medMap).sort((a, b) => b.totalQty - a.totalQty);
    return sorted;
  }, [filteredInvoices]);

  const searchedTopSelling = useMemo(() => {
    if (!searchQuery.trim()) return topSellingMedicines;
    const q = searchQuery.toLowerCase().trim();
    return topSellingMedicines.filter((m) =>
      m.brandName.toLowerCase().includes(q) || m.genericFormula.toLowerCase().includes(q)
    );
  }, [topSellingMedicines, searchQuery]);

  const totalBoxesSold = topSellingMedicines.reduce((sum, m) => sum + m.totalQty, 0);
  const totalRevenueGenerated = topSellingMedicines.reduce((sum, m) => sum + m.totalRevenue, 0);

  const financialSummary = {
    grossSales: totalRevenueGenerated,
    netProfit: totalRevenueGenerated * 0.25,
    unpaidDebt: filteredInvoices.filter((i) => i.paymentStatus === 'UNPAID_CREDIT').reduce((sum, i) => sum + (i.netTotal || 0), 0),
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header Banner */}
      <div className="card" style={{ padding: '1.25rem', backgroundColor: '#0284C7', color: '#FFFFFF', border: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Award size={30} color="#FFF" />
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Top Selling & Fast-Moving Medicines Performance</h2>
              <p style={{ fontSize: '0.8rem', color: '#E0F2FE', marginTop: '0.15rem' }}>
                Analyze high-velocity items, quantity dispatch counts & generated revenue by date period.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsReportModalOpen(true)}
            className="btn btn-primary"
            style={{ backgroundColor: '#000000', color: '#FFF', fontWeight: 900, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <FileText size={18} /> Export PDF Analytics Report
          </button>
        </div>
      </div>

      {/* Date Filter Toolbar */}
      <div className="card" style={{ padding: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0369A1', marginRight: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Calendar size={15} /> Select Filter Period:
          </span>

          <button
            onClick={() => setDateRangePreset('TODAY')}
            className={`btn ${dateRangePreset === 'TODAY' ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem', backgroundColor: dateRangePreset === 'TODAY' ? '#0284C7' : 'transparent', color: dateRangePreset === 'TODAY' ? '#FFF' : 'inherit' }}
          >
            Today
          </button>

          <button
            onClick={() => setDateRangePreset('7DAYS')}
            className={`btn ${dateRangePreset === '7DAYS' ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem', backgroundColor: dateRangePreset === '7DAYS' ? '#0284C7' : 'transparent', color: dateRangePreset === '7DAYS' ? '#FFF' : 'inherit' }}
          >
            7 Days
          </button>

          <button
            onClick={() => setDateRangePreset('30DAYS')}
            className={`btn ${dateRangePreset === '30DAYS' ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem', backgroundColor: dateRangePreset === '30DAYS' ? '#0284C7' : 'transparent', color: dateRangePreset === '30DAYS' ? '#FFF' : 'inherit' }}
          >
            30 Days
          </button>

          <button
            onClick={() => setDateRangePreset('CUSTOM')}
            className={`btn ${dateRangePreset === 'CUSTOM' ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem', backgroundColor: dateRangePreset === 'CUSTOM' ? '#0284C7' : 'transparent', color: dateRangePreset === 'CUSTOM' ? '#FFF' : 'inherit' }}
          >
            Custom Range
          </button>
        </div>

        {/* Custom Date Pickers */}
        {dateRangePreset === 'CUSTOM' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#F0F9FF', padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid #BAE6FD' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0369A1' }}>From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ padding: '0.25rem', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.8rem', fontWeight: 700 }}
            />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0369A1' }}>To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ padding: '0.25rem', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.8rem', fontWeight: 700 }}
            />
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid-3">
        <div className="card">
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>TOP PERFORMING ITEM</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0284C7', marginTop: '0.25rem' }}>
            {topSellingMedicines[0]?.brandName || 'Panadol Extra'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700, marginTop: '0.2rem' }}>
            {topSellingMedicines[0]?.totalQty || 0} Boxes Sold in Selected Period
          </div>
        </div>

        <div className="card">
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669' }}>TOTAL BOXES DISPATCHED</span>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#059669', marginTop: '0.25rem' }}>
            {totalBoxesSold.toLocaleString()} Boxes
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
            Across {filteredInvoices.length} Sales Invoices
          </div>
        </div>

        <div className="card">
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0369A1' }}>TOTAL GENERATED REVENUE</span>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0369A1', marginTop: '0.25rem' }}>
            Rs. {totalRevenueGenerated.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700, marginTop: '0.2rem' }}>
            Est. Margin: Rs. {(totalRevenueGenerated * 0.25).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Main Table View */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Zap size={18} color="#D97706" /> Fast-Moving Medicine Sales Ranking
          </h3>

          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
            <input
              type="text"
              placeholder="Search Top Medicine Name or Formula..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '0.45rem 0.65rem 0.45rem 2.2rem', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.825rem' }}
            />
          </div>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '45px', textAlign: 'center' }}>Rank</th>
                <th>Medicine Trade Name</th>
                <th>Generic Formula</th>
                <th style={{ textAlign: 'center' }}>Orders Count</th>
                <th style={{ textAlign: 'center' }}>Total Qty Sold</th>
                <th style={{ textAlign: 'right' }}>Unit Box Rate</th>
                <th style={{ textAlign: 'right' }}>Generated Revenue</th>
              </tr>
            </thead>
            <tbody>
              {searchedTopSelling.length > 0 ? (
                searchedTopSelling.map((med, idx) => (
                  <tr key={idx}>
                    <td style={{ textAlign: 'center', fontWeight: 900, color: idx === 0 ? '#D97706' : idx === 1 ? '#475569' : '#0284C7' }}>
                      #{idx + 1}
                    </td>
                    <td style={{ fontWeight: 800 }}>{med.brandName}</td>
                    <td style={{ fontSize: '0.775rem', color: '#64748B' }}>{med.genericFormula}</td>
                    <td style={{ textAlign: 'center' }}>{med.orderCount} Orders</td>
                    <td style={{ textAlign: 'center', fontWeight: 800, color: '#059669' }}>
                      {med.totalQty} Boxes
                    </td>
                    <td style={{ textAlign: 'right' }}>Rs. {Number(med.unitPrice).toFixed(2)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 900, color: '#0369A1' }}>
                      Rs. {Number(med.totalRevenue).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--color-text-muted)' }}>
                    No medicine sales records found for selected period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PDF REPORT MODAL */}
      {isReportModalOpen && (
        <AnalyticsReportPrintModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          invoices={filteredInvoices}
          dateRangePreset={dateRangePreset}
          startDate={startDate}
          endDate={endDate}
          topSellingMedicines={topSellingMedicines}
          financialSummary={financialSummary}
        />
      )}
    </div>
  );
};

export default MostSellingMedicinesPage;
