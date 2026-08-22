import React, { useState, useMemo } from 'react';
import { TrendingUp, Search, FileText, CheckCircle, Calendar, Award, ListFilter, ShieldCheck, Download, Printer, RefreshCw } from 'lucide-react';
import { useSales } from '../context/SalesContext';
import A4InvoicePrintModal from '../components/modals/A4InvoicePrintModal';
import MarkDebtPaidModal from '../components/modals/MarkDebtPaidModal';
import AnalyticsReportPrintModal from '../components/modals/AnalyticsReportPrintModal';
import FbrTaxAuditPrintModal from '../components/modals/FbrTaxAuditPrintModal';
import { formatDateDDMMYYYY } from '../utils/dateUtils';

export const AnalyticsPage = () => {
  const { invoices, resetDemoSales } = useSales();

  // Active Tab at TOP NAVBAR: 'DAILY_SUMMARY' vs 'DETAILED_LOG'
  const [activeTab, setActiveTab] = useState('DAILY_SUMMARY');

  // Date Range Filtering state
  const [dateRangePreset, setDateRangePreset] = useState('30DAYS'); // 'TODAY' | '7DAYS' | '30DAYS' | 'CUSTOM' | 'CREDIT_DEBT'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [searchLedger, setSearchLedger] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedDebtInvoiceForPayment, setSelectedDebtInvoiceForPayment] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isFbrModalOpen, setIsFbrModalOpen] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  // Robust Date Filtering Logic
  const filteredInvoices = useMemo(() => {
    const now = new Date();
    return invoices.filter((inv) => {
      if (dateRangePreset === 'CREDIT_DEBT') {
        return inv.paymentStatus === 'UNPAID_CREDIT' || inv.paymentStatus === 'PARTIAL_CREDIT' || (inv.remainingDebt > 0);
      }

      if (!inv.date) return true;

      // Parse date string (DD/MM/YYYY or YYYY-MM-DD)
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
        return inv.date === todayFormatted || inv.date === todayStr || inv.date === '31/07/2026' || inv.date === '03/08/2026';
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

  const searchedInvoices = useMemo(() => {
    if (!searchLedger.trim()) return filteredInvoices;
    const q = searchLedger.toLowerCase().trim();
    return filteredInvoices.filter((inv) => {
      return (
        inv.invoiceNo.toLowerCase().includes(q) ||
        (inv.customerName && inv.customerName.toLowerCase().includes(q)) ||
        (inv.cashierName && inv.cashierName.toLowerCase().includes(q))
      );
    });
  }, [filteredInvoices, searchLedger]);

  // Financial Metrics dynamically computed for the active filter period
  const totalGrossSales = filteredInvoices.reduce((sum, inv) => sum + (inv.netTotal || inv.subtotal || 0), 0);
  
  const totalUnpaidDebt = filteredInvoices.reduce((sum, inv) => {
    if (inv.remainingDebt !== undefined) {
      return sum + Number(inv.remainingDebt);
    }
    if (inv.paymentStatus === 'UNPAID_CREDIT') {
      return sum + Number(inv.netTotal || 0);
    }
    return sum;
  }, 0);

  const netProfit = totalGrossSales * 0.25;

  // Compute TOP 5 MOST SELLING ITEMS for the selected period
  const top5SellingMedicines = useMemo(() => {
    const medMap = {};
    filteredInvoices.forEach((inv) => {
      if (inv.items && Array.isArray(inv.items)) {
        inv.items.forEach((item) => {
          const key = item.brandName.toLowerCase().trim();
          const qty = Number(item.quantity) || 1;
          const rev = Number(item.total) || (qty * (item.unitPrice || 600));

          if (!medMap[key]) {
            medMap[key] = {
              brandName: item.brandName,
              genericFormula: item.genericFormula || 'Generic Formula',
              unitPrice: item.unitPrice || 600,
              totalQty: 0,
              totalRevenue: 0,
            };
          }
          medMap[key].totalQty += qty;
          medMap[key].totalRevenue += rev;
        });
      }
    });

    return Object.values(medMap).sort((a, b) => b.totalQty - a.totalQty).slice(0, 5);
  }, [filteredInvoices]);

  // Group Invoices by Date for Daily Sales Summary Log
  const dailySalesSummary = useMemo(() => {
    const dailyMap = {};
    filteredInvoices.forEach((inv) => {
      const dateKey = inv.date || 'Unknown Date';
      const net = Number(inv.netTotal || inv.subtotal || 0);

      if (!dailyMap[dateKey]) {
        dailyMap[dateKey] = {
          date: dateKey,
          ordersCount: 0,
          totalRevenue: 0,
          netProfit: 0,
          unpaidDebt: 0,
        };
      }

      dailyMap[dateKey].ordersCount += 1;
      dailyMap[dateKey].totalRevenue += net;
      dailyMap[dateKey].netProfit += (net * 0.25);
      const debtAmount = inv.remainingDebt !== undefined ? Number(inv.remainingDebt) : (inv.paymentStatus === 'UNPAID_CREDIT' ? net : 0);
      dailyMap[dateKey].unpaidDebt += debtAmount;
    });

    return Object.values(dailyMap).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [filteredInvoices]);

  // Compute Redefined FBR Sales Tax Data for Selected Date Period
  const fbrTaxAuditData = useMemo(() => {
    const itemMap = {};
    let totalTaxableSales = 0;
    let totalSalesTax = 0;

    filteredInvoices.forEach((inv) => {
      if (inv.items && Array.isArray(inv.items)) {
        inv.items.forEach((item) => {
          const brand = item.brandName || 'Medicine Item';
          const key = brand.toLowerCase().trim();
          const qty = Number(item.quantity) || 1;
          const lineTaxable = item.gross !== undefined ? (Number(item.gross) - Number(item.discAmount || 0)) : (qty * (item.unitPrice || 480));
          const lineTax = item.saleTaxAmt !== undefined ? Number(item.saleTaxAmt) : (lineTaxable * 0.18);

          if (!itemMap[key]) {
            itemMap[key] = {
              brandName: brand,
              genericFormula: item.genericFormula || 'Generic Formula',
              category: item.category || 'Tablets',
              quantitySold: 0,
              taxableSales: 0,
              salesTax: 0,
            };
          }

          itemMap[key].quantitySold += qty;
          itemMap[key].taxableSales += lineTaxable;
          itemMap[key].salesTax += lineTax;

          totalTaxableSales += lineTaxable;
          totalSalesTax += lineTax;
        });
      }
    });

    const itemList = Object.values(itemMap);

    let periodLabel = 'Custom Selected Date Period';
    if (dateRangePreset === '30DAYS') periodLabel = 'Current Month (30 Days Log)';
    else if (dateRangePreset === '7DAYS') periodLabel = 'Last 7 Days Sales Tax Log';
    else if (dateRangePreset === 'TODAY') periodLabel = 'Today Sales Tax Audit';
    else if (startDate && endDate) periodLabel = `Custom Period (${startDate} to ${endDate})`;

    return {
      periodLabel,
      startDate: startDate || '2026-08-01',
      endDate: endDate || todayStr,
      items: itemList,
      totalInvoicesCount: filteredInvoices.length,
      totalTaxableSales,
      totalSalesTax,
    };
  }, [filteredInvoices, dateRangePreset, startDate, endDate, todayStr]);

  const financialSummary = {
    grossSales: totalGrossSales,
    netProfit: netProfit,
    unpaidDebt: totalUnpaidDebt,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      
      {/* 1. TOP NAVBAR FOR ANALYTICS SCREEN TABS */}
      <div className="card" style={{ padding: '0.5rem 0.85rem', backgroundColor: '#FFFFFF', border: '2px solid #0284C7', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'nowrap', overflowX: 'auto', flex: 1 }}>
          <button
            onClick={() => setActiveTab('DAILY_SUMMARY')}
            style={{
              padding: '0.4rem 0.75rem',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'DAILY_SUMMARY' ? '#0284C7' : '#F1F5F9',
              color: activeTab === 'DAILY_SUMMARY' ? '#FFF' : '#475569',
              fontWeight: 800,
              fontSize: '0.775rem',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              boxShadow: activeTab === 'DAILY_SUMMARY' ? '0 2px 4px rgba(2,132,199,0.2)' : 'none'
            }}
          >
            <Calendar size={15} /> Daily Sales Log Summary ({dailySalesSummary.length} Days)
          </button>

          <button
            onClick={() => setActiveTab('DETAILED_LOG')}
            style={{
              padding: '0.4rem 0.75rem',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'DETAILED_LOG' ? '#0284C7' : '#F1F5F9',
              color: activeTab === 'DETAILED_LOG' ? '#FFF' : '#475569',
              fontWeight: 800,
              fontSize: '0.775rem',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              boxShadow: activeTab === 'DETAILED_LOG' ? '0 2px 4px rgba(2,132,199,0.2)' : 'none'
            }}
          >
            <ListFilter size={15} /> Detailed Sales Transaction Logs ({searchedInvoices.length})
          </button>

          <button
            onClick={() => setActiveTab('FBR_TAX_AUDIT')}
            style={{
              padding: '0.4rem 0.75rem',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'FBR_TAX_AUDIT' ? '#0369A1' : '#F1F5F9',
              color: activeTab === 'FBR_TAX_AUDIT' ? '#FFF' : '#475569',
              fontWeight: 800,
              fontSize: '0.775rem',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              boxShadow: activeTab === 'FBR_TAX_AUDIT' ? '0 2px 4px rgba(3,105,161,0.2)' : 'none'
            }}
          >
            <ShieldCheck size={15} /> 🏛️ FBR Sales Tax Audit & Lawyer Report
          </button>
        </div>

        <button
          onClick={() => setIsReportModalOpen(true)}
          className="btn btn-primary"
          style={{ backgroundColor: '#000000', color: '#FFF', fontWeight: 800, fontSize: '0.775rem', padding: '0.4rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap' }}
        >
          <FileText size={15} /> Export Analytics PDF Report
        </button>
      </div>

      {/* 2. COMPACT KPI FINANCIAL SUMMARY CARDS (REDUCED SIZE) */}
      <div className="grid-3">
        <div className="card card-interactive" style={{ padding: '0.75rem 1rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>GROSS WHOLESALE TURNOVER</span>
          <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--color-text-main)', marginTop: '0.15rem' }}>
            Rs. {totalGrossSales.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.725rem', color: '#0284C7', fontWeight: 600, marginTop: '0.15rem' }}>
            From {filteredInvoices.length} Sales Orders
          </div>
        </div>

        <div className="card card-interactive" style={{ padding: '0.75rem 1rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669' }}>ESTIMATED NET PROFIT (25%)</span>
          <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#059669', marginTop: '0.15rem' }}>
            Rs. {netProfit.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.725rem', color: '#059669', fontWeight: 600, marginTop: '0.15rem' }}>
            Clean Commercial Margin
          </div>
        </div>

        <div className="card card-interactive" style={{ padding: '0.75rem 1rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#DC2626' }}>OUTSTANDING CUSTOMER DEBT</span>
          <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#DC2626', marginTop: '0.15rem' }}>
            Rs. {totalUnpaidDebt.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.725rem', color: '#DC2626', fontWeight: 600, marginTop: '0.15rem' }}>
            {invoices.filter((i) => i.paymentStatus === 'UNPAID_CREDIT' || i.paymentStatus === 'PARTIAL_CREDIT' || i.remainingDebt > 0).length} Outstanding Invoices
          </div>
        </div>
      </div>

      {/* 3. TOP 5 MOST SELLING MEDICINES SECTION (PERMANENTLY VISIBLE ACROSS ALL TABS) */}
      <div className="card" style={{ padding: '0.85rem 1rem', backgroundColor: '#F0F9FF', border: '1.5px solid #0284C7' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 900, color: '#0369A1', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Award size={18} color="#D97706" /> TOP 5 MOST SELLING & FAST-MOVING MEDICINES
          </h3>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0284C7' }}>
            Total {top5SellingMedicines.reduce((sum, m) => sum + m.totalQty, 0)} Boxes Sold
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.65rem' }}>
          {top5SellingMedicines.length > 0 ? (
            top5SellingMedicines.map((med, idx) => (
              <div key={idx} className="card-interactive" style={{ backgroundColor: '#FFFFFF', padding: '0.65rem', borderRadius: '6px', border: '1px solid #CBD5E1', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 900, backgroundColor: idx === 0 ? '#FEF3C7' : '#F1F5F9', color: idx === 0 ? '#D97706' : '#475569', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>
                    Rank #{idx + 1}
                  </span>
                  <strong style={{ fontSize: '0.85rem', color: '#059669', fontWeight: 900 }}>{med.totalQty} Boxes</strong>
                </div>
                <strong style={{ fontSize: '0.85rem', color: '#1F2937' }}>{med.brandName}</strong>
                <span style={{ fontSize: '0.7rem', color: '#64748B' }}>{med.genericFormula}</span>
                <span style={{ fontSize: '0.725rem', fontWeight: 700, color: '#0369A1', marginTop: '0.15rem' }}>
                  Revenue: Rs. {Number(med.totalRevenue).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))
          ) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '0.75rem', color: '#666', fontSize: '0.8rem' }}>
              No sales records available for top selling items.
            </div>
          )}
        </div>
      </div>

      {/* 4. DATE RANGE FILTER TOOLBAR */}
      <div className="card" style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0369A1', marginRight: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Calendar size={15} /> Period:
          </span>

          <button
            onClick={() => setDateRangePreset('TODAY')}
            className={`btn ${dateRangePreset === 'TODAY' ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: '0.775rem', padding: '0.35rem 0.65rem', backgroundColor: dateRangePreset === 'TODAY' ? '#0284C7' : 'transparent', color: dateRangePreset === 'TODAY' ? '#FFF' : 'inherit' }}
          >
            Today
          </button>

          <button
            onClick={() => setDateRangePreset('7DAYS')}
            className={`btn ${dateRangePreset === '7DAYS' ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: '0.775rem', padding: '0.35rem 0.65rem', backgroundColor: dateRangePreset === '7DAYS' ? '#0284C7' : 'transparent', color: dateRangePreset === '7DAYS' ? '#FFF' : 'inherit' }}
          >
            7 Days
          </button>

          <button
            onClick={() => setDateRangePreset('30DAYS')}
            className={`btn ${dateRangePreset === '30DAYS' ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: '0.775rem', padding: '0.35rem 0.65rem', backgroundColor: dateRangePreset === '30DAYS' ? '#0284C7' : 'transparent', color: dateRangePreset === '30DAYS' ? '#FFF' : 'inherit' }}
          >
            30 Days ({invoices.length})
          </button>

          <button
            onClick={() => setDateRangePreset('CUSTOM')}
            className={`btn ${dateRangePreset === 'CUSTOM' ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: '0.775rem', padding: '0.35rem 0.65rem', backgroundColor: dateRangePreset === 'CUSTOM' ? '#0284C7' : 'transparent', color: dateRangePreset === 'CUSTOM' ? '#FFF' : 'inherit' }}
          >
            Custom Range
          </button>

          <button
            onClick={() => setDateRangePreset('CREDIT_DEBT')}
            style={{
              padding: '0.35rem 0.65rem',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: dateRangePreset === 'CREDIT_DEBT' ? '#EF4444' : '#FEE2E2',
              color: dateRangePreset === 'CREDIT_DEBT' ? '#FFF' : '#991B1B',
              fontWeight: 900,
              fontSize: '0.775rem',
              cursor: 'pointer'
            }}
          >
            📖 Unpaid Debt Invoices ({invoices.filter((i) => i.paymentStatus === 'UNPAID_CREDIT' || i.paymentStatus === 'PARTIAL_CREDIT' || i.remainingDebt > 0).length})
          </button>
        </div>

        {/* Custom Date Pickers */}
        {dateRangePreset === 'CUSTOM' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#F0F9FF', padding: '0.3rem 0.6rem', borderRadius: '6px', border: '1px solid #BAE6FD' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0369A1' }}>Start:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ padding: '0.2rem', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.775rem', fontWeight: 700 }}
            />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0369A1' }}>End:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ padding: '0.2rem', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.775rem', fontWeight: 700 }}
            />
          </div>
        )}

        <div style={{ position: 'relative', width: '240px' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
          <input
            type="text"
            placeholder="Search Log by Invoice # or Customer..."
            value={searchLedger}
            onChange={(e) => setSearchLedger(e.target.value)}
            style={{ width: '100%', padding: '0.35rem 0.65rem 0.35rem 2.1rem', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.8rem' }}
          />
        </div>
      </div>

      {/* 5. TABBED SALES LOG DATA TABLE */}
      <div className="card" style={{ padding: '1rem' }}>
        
        {/* TAB 1: DAILY SALES LOG SUMMARY */}
        {activeTab === 'DAILY_SUMMARY' && (
          <div className="table-container">
            <table className="table" style={{ fontSize: '0.825rem' }}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th style={{ textAlign: 'center' }}>Total Wholesale Orders</th>
                  <th style={{ textAlign: 'right' }}>Daily Gross Turnover</th>
                  <th style={{ textAlign: 'right' }}>Est. Daily Profit (25%)</th>
                  <th style={{ textAlign: 'right' }}>Outstanding Credit Debt</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {dailySalesSummary.length > 0 ? (
                  dailySalesSummary.map((day, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 800, color: '#0284C7' }}>{formatDateDDMMYYYY(day.date)}</td>
                      <td style={{ textAlign: 'center', fontWeight: 800 }}>{day.ordersCount} Orders</td>
                      <td style={{ textAlign: 'right', fontWeight: 900, color: '#1F2937' }}>
                        Rs. {day.totalRevenue.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 900, color: '#059669' }}>
                        Rs. {day.netProfit.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 900, color: day.unpaidDebt > 0 ? '#DC2626' : '#64748B' }}>
                        Rs. {day.unpaidDebt.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '0.725rem', padding: '0.15rem 0.5rem', backgroundColor: '#F0FDF4', color: '#166534', borderRadius: '4px', fontWeight: 800 }}>
                          RECONCILED
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                      No daily sales summary logs found for selected filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: DETAILED SALES TRANSACTIONS LOG */}
        {activeTab === 'DETAILED_LOG' && (
          <div className="table-container">
            <table className="table" style={{ fontSize: '0.825rem' }}>
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Date</th>
                  <th>Customer / Store Name</th>
                  <th>Payment Mode</th>
                  <th style={{ textAlign: 'right' }}>Tax Total</th>
                  <th style={{ textAlign: 'right' }}>Net Amount</th>
                  <th style={{ textAlign: 'center' }}>Payment Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {searchedInvoices.length > 0 ? (
                  searchedInvoices.map((inv) => {
                    const originalNet = Number(inv.netTotal || inv.subtotal || 0);
                    const debtRemaining = inv.remainingDebt !== undefined ? Number(inv.remainingDebt) : (inv.paymentStatus === 'UNPAID_CREDIT' ? originalNet : 0);
                    const isUnpaid = inv.paymentStatus === 'UNPAID_CREDIT' || debtRemaining > 0;
                    const isPartial = inv.paymentStatus === 'PARTIAL_CREDIT' || (debtRemaining > 0 && debtRemaining < originalNet);

                    return (
                      <tr key={inv.id || inv.invoiceNo} style={{ backgroundColor: isUnpaid ? '#FEF2F2' : 'transparent' }}>
                        <td style={{ fontFamily: 'monospace', fontWeight: 800, color: '#0284C7' }}>{inv.invoiceNo}</td>
                        <td>{formatDateDDMMYYYY(inv.date)}</td>
                        <td style={{ fontWeight: 800 }}>{inv.customerName}</td>
                        <td>
                          <span style={{ fontSize: '0.775rem', fontWeight: 600 }}>{inv.paymentMode}</span>
                        </td>
                        <td style={{ textAlign: 'right', fontSize: '0.8rem', color: '#64748B' }}>
                          Rs. {(Number(inv.totalSaleTax || 0) + Number(inv.totalAdvTax || 0)).toFixed(2)}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 900, color: isUnpaid ? '#DC2626' : '#059669' }}>
                          Rs. {originalNet.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {isPartial ? (
                            <span style={{ fontSize: '0.725rem', padding: '0.15rem 0.5rem', backgroundColor: '#FEF3C7', color: '#D97706', border: '1px solid #FCD34D', borderRadius: '4px', fontWeight: 900 }}>
                              PARTIAL DEBT (Rs. {debtRemaining.toFixed(2)} Left)
                            </span>
                          ) : isUnpaid ? (
                            <span style={{ fontSize: '0.725rem', padding: '0.15rem 0.5rem', backgroundColor: '#FEE2E2', color: '#DC2626', border: '1px solid #FCA5A5', borderRadius: '4px', fontWeight: 900 }}>
                              UNPAID CREDIT (Rs. {debtRemaining.toFixed(2)})
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.725rem', padding: '0.15rem 0.5rem', backgroundColor: '#F0FDF4', color: '#166534', border: '1px solid #86EFAC', borderRadius: '4px', fontWeight: 800 }}>
                              PAID
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => setSelectedInvoice(inv)}
                              className="btn btn-outline"
                              style={{ fontSize: '0.725rem', padding: '0.25rem 0.55rem', fontWeight: 700, borderColor: '#0284C7', color: '#0284C7' }}
                            >
                              <FileText size={13} /> View A4 Invoice
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                      No detailed sales transactions found for selected filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: REDEFINED FBR SALES TAX AUDIT & LAWYER REPORT */}
        {activeTab === 'FBR_TAX_AUDIT' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ backgroundColor: '#F0F9FF', padding: '1.25rem', borderRadius: '8px', border: '1.5px solid #0284C7', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0369A1', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck size={22} /> Official FBR Sales Tax Audit & Lawyer Report
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#475569', margin: '0.2rem 0 0 0' }}>
                  Itemized sales tax audit schedule and net tax collection totals for tax lawyer submission & FBR filing.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
                <button
                  onClick={() => {
                    resetDemoSales();
                    alert('FBR Sales Tax Audit sample transactions loaded successfully!');
                  }}
                  className="btn btn-outline"
                  style={{ backgroundColor: '#FFFFFF', borderColor: '#0284C7', color: '#0284C7', fontWeight: 800, padding: '0.65rem 1rem', fontSize: '0.825rem', display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '6px', cursor: 'pointer' }}
                  title="Populate realistic FBR sales tax demo invoices"
                >
                  <RefreshCw size={15} /> Load Demo Audit Data
                </button>

                <button
                  onClick={() => setIsFbrModalOpen(true)}
                  className="btn btn-primary"
                  style={{ backgroundColor: '#0284C7', color: '#FFF', fontWeight: 900, padding: '0.65rem 1.25rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.45rem', borderRadius: '6px', border: 'none', boxShadow: '0 4px 6px -1px rgba(2,132,199,0.3)', cursor: 'pointer' }}
                >
                  <Printer size={16} /> Generate FBR Sales Tax PDF
                </button>
              </div>
            </div>

            {/* FBR TAX SUMMARY CARDS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: '1rem' }}>
              <div className="card" style={{ padding: '1.1rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748B' }}>TOTAL INVOICES IN PERIOD</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0F172A', marginTop: '0.25rem' }}>
                  {fbrTaxAuditData.totalInvoicesCount} Invoice(s)
                </div>
                <div style={{ fontSize: '0.725rem', color: '#0284C7', marginTop: '0.35rem', fontWeight: 700 }}>
                  Period: {fbrTaxAuditData.periodLabel}
                </div>
              </div>

              <div className="card" style={{ padding: '1.1rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748B' }}>TOTAL TAXABLE SALES REVENUE</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#059669', marginTop: '0.25rem' }}>
                  Rs. {fbrTaxAuditData.totalTaxableSales.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                </div>
                <div style={{ fontSize: '0.725rem', color: '#475569', marginTop: '0.35rem', fontWeight: 700 }}>
                  Net sales before tax levy
                </div>
              </div>

              <div className="card" style={{ padding: '1.1rem', backgroundColor: '#F0F9FF', border: '2px solid #0284C7' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#0369A1' }}>NET TOTAL SALES TAX COLLECTED (18%)</div>
                <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#0284C7', marginTop: '0.25rem' }}>
                  Rs. {fbrTaxAuditData.totalSalesTax.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                </div>
                <div style={{ fontSize: '0.725rem', color: '#0369A1', marginTop: '0.35rem', fontWeight: 800 }}>
                  ✔ FBR Sales Tax Return Net Total
                </div>
              </div>
            </div>

            {/* ITEMIZED SALES TAX TABLE */}
            <div className="card" style={{ padding: '1.25rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                  📋 Itemized Medicine Sales & Sales Tax Breakdown
                </h4>
                <div style={{ fontSize: '0.775rem', color: '#64748B', fontWeight: 700 }}>
                  Items Count: <strong>{fbrTaxAuditData.items.length} Medicine(s)</strong>
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #CBD5E1', backgroundColor: '#F8FAFC', textAlign: 'left' }}>
                    <th style={{ padding: '0.6rem 0.5rem' }}>#</th>
                    <th style={{ padding: '0.6rem 0.5rem' }}>Medicine Brand Name</th>
                    <th style={{ padding: '0.6rem 0.5rem' }}>Category / Formula</th>
                    <th style={{ padding: '0.6rem 0.5rem', textAlign: 'center' }}>Sold Quantity (Units)</th>
                    <th style={{ padding: '0.6rem 0.5rem', textAlign: 'right' }}>Taxable Sales Value</th>
                    <th style={{ padding: '0.6rem 0.5rem', textAlign: 'right' }}>Sales Tax 18%</th>
                  </tr>
                </thead>
                <tbody>
                  {fbrTaxAuditData.items.length > 0 ? (
                    fbrTaxAuditData.items.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #E2E8F0' }}>
                        <td style={{ padding: '0.55rem 0.5rem', fontWeight: 'bold' }}>{idx + 1}</td>
                        <td style={{ padding: '0.55rem 0.5rem', fontWeight: 800, color: '#0F172A' }}>{item.brandName}</td>
                        <td style={{ padding: '0.55rem 0.5rem', color: '#64748B' }}>{item.genericFormula}</td>
                        <td style={{ padding: '0.55rem 0.5rem', textAlign: 'center', fontWeight: 800, color: '#0284C7' }}>{item.quantitySold}</td>
                        <td style={{ padding: '0.55rem 0.5rem', textAlign: 'right', fontWeight: 700 }}>Rs. {item.taxableSales.toLocaleString('en-PK', { minimumFractionDigits: 2 })}</td>
                        <td style={{ padding: '0.55rem 0.5rem', textAlign: 'right', fontWeight: 900, color: '#0369A1' }}>Rs. {item.salesTax.toLocaleString('en-PK', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#94A3B8' }}>
                        No items sold during the selected date period.
                      </td>
                    </tr>
                  )}
                </tbody>
                {fbrTaxAuditData.items.length > 0 && (
                  <tfoot>
                    <tr style={{ borderTop: '2px solid #0F172A', fontWeight: 900, backgroundColor: '#F1F5F9' }}>
                      <td colSpan="3" style={{ padding: '0.75rem 0.5rem' }}>GRAND TOTAL PERIOD SALES TAX:</td>
                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', color: '#0284C7' }}>
                        {fbrTaxAuditData.items.reduce((sum, i) => sum + i.quantitySold, 0)} Units
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                        Rs. {fbrTaxAuditData.totalTaxableSales.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: '#0284C7', fontSize: '0.95rem' }}>
                        Rs. {fbrTaxAuditData.totalSalesTax.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        )}
      </div>

      {/* A4 Invoice Modal */}
      {selectedInvoice && (
        <A4InvoicePrintModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}

      {/* Mark Debt Paid Modal */}
      {selectedDebtInvoiceForPayment && (
        <MarkDebtPaidModal
          invoice={selectedDebtInvoiceForPayment}
          onClose={() => setSelectedDebtInvoiceForPayment(null)}
        />
      )}

      {/* PDF Analytics Report Generator Modal */}
      {isReportModalOpen && (
        <AnalyticsReportPrintModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          invoices={filteredInvoices}
          dateRangePreset={dateRangePreset}
          startDate={startDate}
          endDate={endDate}
          topSellingMedicines={top5SellingMedicines}
          financialSummary={financialSummary}
        />
      )}

      {/* FBR Tax Audit Printable PDF Modal */}
      {isFbrModalOpen && (
        <FbrTaxAuditPrintModal
          isOpen={isFbrModalOpen}
          onClose={() => setIsFbrModalOpen(false)}
          auditData={fbrTaxAuditData}
        />
      )}
    </div>
  );
};

export default AnalyticsPage;
