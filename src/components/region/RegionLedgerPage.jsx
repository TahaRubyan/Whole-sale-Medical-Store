import React, { useState, useMemo, useEffect } from 'react';
import {
  MapPin,
  Search,
  Filter,
  DollarSign,
  Store,
  Truck,
  CheckCircle,
  History,
  Printer,
  Calendar,
  AlertCircle,
  FileText,
  TrendingUp,
  RotateCcw,
  X,
  Layers,
  Plus,
} from 'lucide-react';
import { useSales } from '../../context/SalesContext';
import PaymentHistoryModal from './PaymentHistoryModal';
import RegionalDeliveryManifestModal from './RegionalDeliveryManifestModal';
import AddRegionModal from '../modals/AddRegionModal';

export const RegionLedgerPage = () => {
  const { invoices = [], recordDebtPayment } = useSales();

  // Selected Region filter ("All Regions" by default)
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  // Status filter ("ALL" by default: "ALL" | "UNPAID_CREDIT" | "PARTIAL DEBT" | "PAID")
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  // Search query for filtering shop name / invoice / delivery man / phone
  const [searchQuery, setSearchQuery] = useState('');

  // Custom Created Regions State (persisted to localStorage)
  const [customRegions, setCustomRegions] = useState(() => {
    const saved = localStorage.getItem('pharmalink_regions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return ['Karianwala', 'Gujrat', 'Tanda', 'Jalalpur Jattan', 'Lalamusa', 'Dingha'];
  });

  const [isAddRegionOpen, setIsAddRegionOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('pharmalink_regions', JSON.stringify(customRegions));
  }, [customRegions]);

  const handleAddRegion = (newRegionName) => {
    if (!newRegionName) return;
    const exists = customRegions.some((r) => r.toLowerCase() === newRegionName.toLowerCase());
    if (!exists) {
      setCustomRegions((prev) => [...prev, newRegionName]);
      showNotification(`Region "${newRegionName}" added successfully!`);
    } else {
      showNotification(`Region "${newRegionName}" already exists!`, 'error');
    }
  };

  // Focus states for input styling
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [focusedInputInvoiceNo, setFocusedInputInvoiceNo] = useState(null);

  // Per-shop interactive cash input map: invoiceNo -> cash amount string
  const [cashInputs, setCashInputs] = useState({});

  // Modals state
  const [selectedInvoiceForLogs, setSelectedInvoiceForLogs] = useState(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isManifestModalOpen, setIsManifestModalOpen] = useState(false);

  // Notification message for user feedback
  const [notification, setNotification] = useState(null);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // 1. Dynamic Region Sync: Extract unique region names normalized with shop counts
  const { regionOptions, activeRegionsCount } = useMemo(() => {
    const defaults = customRegions;
    
    // Key-to-display map to handle case-insensitive normalization
    const keyToDisplayMap = new Map();

    // Pre-populate defaults
    defaults.forEach((reg) => {
      keyToDisplayMap.set(reg.toLowerCase(), reg);
    });

    // Extract dynamic regions from active invoices in SalesContext
    invoices.forEach((inv) => {
      const raw = (inv.region || '').trim();
      if (raw.length > 0) {
        const key = raw.toLowerCase();
        if (!keyToDisplayMap.has(key)) {
          keyToDisplayMap.set(key, raw);
        }
      }
    });

    // Count shop invoices per region key
    const counts = {};
    invoices.forEach((inv) => {
      const reg = (inv.region || '').trim();
      const key = reg.length > 0 ? reg.toLowerCase() : 'unassigned';
      counts[key] = (counts[key] || 0) + 1;
    });

    // Build list of region options
    const list = [];
    keyToDisplayMap.forEach((displayName, key) => {
      const count = counts[key] || 0;
      list.push({ key, displayName, count });
    });

    // Alphabetical sort by displayName
    list.sort((a, b) => a.displayName.localeCompare(b.displayName));

    // Count how many regions have at least 1 invoice
    const activeCount = list.filter((r) => r.count > 0).length;

    return {
      regionOptions: list,
      activeRegionsCount: activeCount,
    };
  }, [invoices]);

  // 2. Filter invoices by selected region, payment status, and search query
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      // Region Filter
      if (selectedRegion && selectedRegion !== 'All Regions') {
        const invRegion = (inv.region || 'Unassigned').trim().toLowerCase();
        if (invRegion !== selectedRegion.trim().toLowerCase()) {
          return false;
        }
      }

      // Status Filter
      if (selectedStatus && selectedStatus !== 'ALL') {
        const originalNet = Number(inv.netTotal || inv.subtotal || 0);
        const currentDebt = inv.remainingDebt !== undefined ? Number(inv.remainingDebt) : originalNet;
        const isPaid = currentDebt === 0;

        let statusLabel = 'UNPAID_CREDIT';
        if (isPaid) {
          statusLabel = 'PAID';
        } else if (currentDebt < originalNet) {
          statusLabel = 'PARTIAL DEBT';
        }

        if (statusLabel !== selectedStatus) {
          return false;
        }
      }

      // Search Query Filter
      if (searchQuery && searchQuery.trim().length > 0) {
        const q = searchQuery.trim().toLowerCase();
        const shopName = (inv.shopName || inv.customerName || '').toLowerCase();
        const invoiceNo = (inv.invoiceNo || '').toLowerCase();
        const region = (inv.region || '').toLowerCase();
        const deliveryMan = (inv.deliveryMan || '').toLowerCase();
        const phone = (inv.customerPhone || '').toLowerCase();

        return (
          shopName.includes(q) ||
          invoiceNo.includes(q) ||
          region.includes(q) ||
          deliveryMan.includes(q) ||
          phone.includes(q)
        );
      }

      return true;
    });
  }, [invoices, selectedRegion, selectedStatus, searchQuery]);

  // 3. Calculate Summary KPI Cards metrics for active selection
  const regionKPIs = useMemo(() => {
    let totalShops = filteredInvoices.length;
    let totalSalesNet = 0;
    let totalOutstandingDebt = 0;
    let totalCashSettledToday = 0;

    const todayStr = new Date().toISOString().split('T')[0];

    filteredInvoices.forEach((inv) => {
      const net = Number(inv.netTotal || inv.subtotal || 0);
      const remaining = inv.remainingDebt !== undefined ? Number(inv.remainingDebt) : net;

      totalSalesNet += net;
      totalOutstandingDebt += remaining;

      // Sum today's cash settlements from payment logs
      const logs = inv.paymentLogs || [];
      logs.forEach((log) => {
        if (log.date === todayStr) {
          totalCashSettledToday += Number(log.amountPaid || 0);
        }
      });
    });

    return {
      totalShops,
      totalSalesNet,
      totalOutstandingDebt,
      totalCashSettledToday,
    };
  }, [filteredInvoices]);

  // Check if any filter is non-default
  const isFilterActive = selectedRegion !== 'All Regions' || selectedStatus !== 'ALL' || searchQuery.trim().length > 0;

  const handleResetFilters = () => {
    setSelectedRegion('All Regions');
    setSelectedStatus('ALL');
    setSearchQuery('');
  };

  // Handler for cash input change per shop invoice
  const handleCashInputChange = (invoiceNo, val) => {
    setCashInputs((prev) => ({
      ...prev,
      [invoiceNo]: val,
    }));
  };

  // 4. "Settle Cash" handler per shop
  const handleSettleCash = (inv) => {
    const rawVal = cashInputs[inv.invoiceNo];
    const cashAmount = Number(rawVal);

    const originalNet = Number(inv.netTotal || inv.subtotal || 0);
    const currentDebt = inv.remainingDebt !== undefined ? Number(inv.remainingDebt) : originalNet;

    if (!rawVal || isNaN(cashAmount) || cashAmount <= 0) {
      showNotification('Please enter a valid cash amount greater than Rs. 0', 'error');
      return;
    }

    if (cashAmount > currentDebt) {
      showNotification(
        `Entered amount (Rs. ${cashAmount}) exceeds remaining debt (Rs. ${currentDebt})`,
        'error'
      );
      return;
    }

    // Call SalesContext.recordDebtPayment
    recordDebtPayment(inv.invoiceNo, cashAmount, 'Cash', `Regional Delivery Settlement (${inv.region || 'Region'})`);

    // Reset input field
    setCashInputs((prev) => ({
      ...prev,
      [inv.invoiceNo]: '',
    }));

    const shopName = inv.shopName || inv.customerName || inv.invoiceNo;
    showNotification(`Successfully settled Rs. ${cashAmount.toLocaleString('en-PK')} for ${shopName}!`);
  };

  // 5. "Settle All Region Cash" batch handler
  const handleSettleAllRegionCash = () => {
    let settledCount = 0;
    let totalSettledAmount = 0;

    filteredInvoices.forEach((inv) => {
      const rawVal = cashInputs[inv.invoiceNo];
      const cashAmount = Number(rawVal);
      const originalNet = Number(inv.netTotal || inv.subtotal || 0);
      const currentDebt = inv.remainingDebt !== undefined ? Number(inv.remainingDebt) : originalNet;

      if (rawVal && !isNaN(cashAmount) && cashAmount > 0 && cashAmount <= currentDebt) {
        recordDebtPayment(
          inv.invoiceNo,
          cashAmount,
          'Cash',
          `Batch Regional Settlement (${inv.region || 'Region'})`
        );
        settledCount += 1;
        totalSettledAmount += cashAmount;
      }
    });

    if (settledCount === 0) {
      showNotification(
        'No valid cash amounts (> 0) entered in the input fields for this selection.',
        'error'
      );
      return;
    }

    // Clear cash inputs
    setCashInputs({});

    showNotification(
      `Batch Settlement Complete! Processed ${settledCount} shop(s) for a total of Rs. ${totalSettledAmount.toLocaleString('en-PK')}.`
    );
  };

  // Open Payment Logs modal
  const handleOpenLogs = (inv) => {
    setSelectedInvoiceForLogs(inv);
    setIsHistoryModalOpen(true);
  };

  return (
    <div className="page-container" style={{ padding: '1.5rem', backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      {/* Top Notification Banner */}
      {notification && (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            borderRadius: '10px',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            backgroundColor: notification.type === 'error' ? '#FEE2E2' : '#D1FAE5',
            color: notification.type === 'error' ? '#991B1B' : '#065F46',
            border: notification.type === 'error' ? '1px solid #FCA5A5' : '1px solid #6EE7B7',
            fontWeight: 700,
            fontSize: '0.9rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
          }}
        >
          {notification.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#0284C7',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)',
            }}
          >
            <MapPin size={26} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.02em', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Region-Based Delivery & Settlement Ledger
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0, fontWeight: 500 }}>
              Regional Shop Deliveries, Debt Ledger & Daily Cash Settlement Tracker
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => setIsManifestModalOpen(true)}
            className="btn btn-outline"
            style={{
              borderColor: '#0284C7',
              color: '#0284C7',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.65rem 1.15rem',
              borderRadius: '8px',
              backgroundColor: '#FFFFFF',
              transition: 'all 0.2s ease',
            }}
          >
            <Printer size={18} /> A4 Regional Manifest PDF
          </button>

          <button
            onClick={handleSettleAllRegionCash}
            className="btn btn-primary"
            style={{
              backgroundColor: '#059669',
              color: '#FFFFFF',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.65rem 1.25rem',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            title="Settle all non-zero Cash Received Today amounts for the current selection"
          >
            <CheckCircle size={18} /> Settle All Region Cash
          </button>
        </div>
      </div>

      {/* Modern Summary KPI Cards (4 Cards) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.1rem',
          marginBottom: '1.5rem',
        }}
      >
        {/* KPI Card 1: Total Regional Sales */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderTop: '4px solid #0284C7',
            borderRadius: '12px',
            padding: '1.15rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#E0F2FE',
              color: '#0284C7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <TrendingUp size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.725rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Regional Sales (Net)
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0F172A', marginTop: '0.15rem' }}>
              Rs. {regionKPIs.totalSalesNet.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.15rem', fontWeight: 500 }}>
              Total gross invoice valuation for active selection
            </div>
          </div>
        </div>

        {/* KPI Card 2: Total Outstanding Debt */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #FCA5A5',
            borderTop: '4px solid #EF4444',
            borderRadius: '12px',
            padding: '1.15rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#FEE2E2',
              color: '#DC2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <AlertCircle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.725rem', fontWeight: 800, color: '#991B1B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Outstanding Debt
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#DC2626', marginTop: '0.15rem' }}>
              Rs. {regionKPIs.totalOutstandingDebt.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.15rem', fontWeight: 500 }}>
              Remaining collectible balance across shops
            </div>
          </div>
        </div>

        {/* KPI Card 3: Total Cash Settled Today */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #6EE7B7',
            borderTop: '4px solid #10B981',
            borderRadius: '12px',
            padding: '1.15rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#D1FAE5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
              flexShrink: 0,
            }}
          >
            <CheckCircle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.725rem', fontWeight: 800, color: '#065F46', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Cash Settled Today
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#059669', marginTop: '0.15rem' }}>
              Rs. {regionKPIs.totalCashSettledToday.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.15rem', fontWeight: 500 }}>
              Real-time sum of today's collection entries
            </div>
          </div>
        </div>

        {/* KPI Card 4: Active Regions & Shops */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #C7D2FE',
            borderTop: '4px solid #6366F1',
            borderRadius: '12px',
            padding: '1.15rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#EEF2FF',
              color: '#4F46E5',
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
              flexShrink: 0,
            }}
          >
            <Store size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.725rem', fontWeight: 800, color: '#3730A3', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Active Regions & Shops
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#1E1B4B', marginTop: '0.15rem' }}>
              {regionKPIs.totalShops} <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#6366F1' }}>Shops ({activeRegionsCount} Active)</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.15rem', fontWeight: 500 }}>
              Active delivery destinations in selected route
            </div>
          </div>
        </div>
      </div>

      {/* Unified Filter Bar (Search, Region Dropdown, Status Dropdown, Reset Button) */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        }}
      >
        {/* Search Input Box */}
        <div style={{ flex: '1.5', minWidth: '260px', position: 'relative' }}>
          <Search
            size={18}
            color={isSearchFocused ? '#0284C7' : '#64748B'}
            style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', transition: 'color 0.2s ease' }}
          />
          <input
            type="text"
            placeholder="Search shop name, region, invoice #, or delivery man..."
            value={searchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.6rem 2.2rem 0.6rem 2.5rem',
              borderRadius: '8px',
              border: isSearchFocused ? '1.5px solid #0284C7' : '1px solid #CBD5E1',
              fontSize: '0.875rem',
              fontWeight: 500,
              backgroundColor: '#FFFFFF',
              outline: 'none',
              boxShadow: isSearchFocused ? '0 0 0 3px rgba(2, 132, 199, 0.15)' : 'none',
              transition: 'all 0.2s ease',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#94A3B8',
                padding: '0.2rem',
              }}
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Region Dropdown Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1.2', minWidth: '280px' }}>
          <Filter size={18} color="#0284C7" />
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            style={{
              flex: 1,
              padding: '0.6rem 0.85rem',
              borderRadius: '8px',
              border: '1.5px solid #0284C7',
              backgroundColor: '#F0F9FF',
              fontWeight: 800,
              fontSize: '0.875rem',
              color: '#0369A1',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="All Regions">
              🌐 All Regions ({invoices.length} {invoices.length === 1 ? 'shop' : 'shops'})
            </option>
            {regionOptions.map((item) => (
              <option key={item.key} value={item.displayName}>
                📍 {item.displayName} ({item.count} {item.count === 1 ? 'shop' : 'shops'})
              </option>
            ))}
          </select>
          <button
            onClick={() => setIsAddRegionOpen(true)}
            className="btn btn-outline"
            style={{ padding: '0.55rem 0.75rem', fontSize: '0.8rem', fontWeight: 800, borderColor: '#0284C7', color: '#0284C7', display: 'flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap' }}
            title="Create a new delivery region"
          >
            <Plus size={16} /> + Region
          </button>
        </div>

        {/* Payment Status Dropdown Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '0.9', minWidth: '190px' }}>
          <Layers size={18} color="#475569" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{
              flex: 1,
              padding: '0.6rem 0.85rem',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.875rem',
              color: '#334155',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="ALL">📋 All Statuses</option>
            <option value="UNPAID_CREDIT">🔴 Unpaid Debt</option>
            <option value="PARTIAL DEBT">🟡 Partial Debt</option>
            <option value="PAID">🟢 Fully Paid</option>
          </select>
        </div>

        {/* Reset Filters Button */}
        {isFilterActive && (
          <button
            onClick={handleResetFilters}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.6rem 0.85rem',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#F1F5F9',
              color: '#475569',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title="Reset all active filters"
          >
            <RotateCcw size={14} /> Reset
          </button>
        )}
      </div>

      {/* Styled Shop Delivery & Inline Cash Settlement Table */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}
      >
        <div
          style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid #E2E8F0',
            backgroundColor: '#FAFAFA',
            display: 'flex',
            alignItems: 'center',
            justify: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Truck size={20} color="#0284C7" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Regional Shop Deliveries & Inline Cash Settlement Table
            </h3>
          </div>
          <span style={{ fontSize: '0.825rem', fontWeight: 700, color: '#64748B', backgroundColor: '#E2E8F0', padding: '0.25rem 0.65rem', borderRadius: '9999px' }}>
            Showing {filteredInvoices.length} of {invoices.length} Shop Invoices
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F1F5F9', borderBottom: '1.5px solid #CBD5E1', color: '#475569' }}>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 800 }}>Shop Name / Customer</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 800 }}>Region</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 800 }}>Delivery Man</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 800, textAlign: 'center' }}>Payment Status</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 800, textAlign: 'right' }}>Net Total (Rs.)</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 800, textAlign: 'right' }}>Current Due (Rs.)</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 800, textAlign: 'center', width: '190px' }}>
                  Cash Received Today (Rs.)
                </th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 800, textAlign: 'center', width: '220px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((inv) => {
                  const originalNet = Number(inv.netTotal || inv.subtotal || 0);
                  const currentDebt = inv.remainingDebt !== undefined ? Number(inv.remainingDebt) : originalNet;
                  const isPaid = currentDebt === 0;

                  // Format status: PAID, PARTIAL DEBT, UNPAID_CREDIT
                  let statusLabel = 'UNPAID_CREDIT';
                  let statusBg = '#FEE2E2';
                  let statusColor = '#991B1B';
                  let statusBorder = '#FCA5A5';

                  if (isPaid) {
                    statusLabel = 'PAID';
                    statusBg = '#D1FAE5';
                    statusColor = '#065F46';
                    statusBorder = '#6EE7B7';
                  } else if (currentDebt < originalNet) {
                    statusLabel = 'PARTIAL DEBT';
                    statusBg = '#FEF3C7';
                    statusColor = '#B45309';
                    statusBorder = '#FCD34D';
                  } else if (inv.paymentStatus) {
                    statusLabel = inv.paymentStatus;
                  }

                  const currentCashInput = cashInputs[inv.invoiceNo] || '';
                  const isInputFocused = focusedInputInvoiceNo === inv.invoiceNo;

                  return (
                    <tr
                      key={inv.invoiceNo}
                      style={{
                        borderBottom: '1px solid #F1F5F9',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
                    >
                      {/* Shop Name & Details */}
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: '#0F172A' }}>
                        <div style={{ fontSize: '0.925rem' }}>{inv.shopName || inv.customerName || 'Shop Customer'}</div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.15rem' }}>
                          <span>Inv #{inv.invoiceNo}</span>
                          {inv.customerPhone && (
                            <>
                              <span>•</span>
                              <span>Ph: {inv.customerPhone}</span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Region Badge */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            padding: '0.3rem 0.65rem',
                            backgroundColor: '#E0F2FE',
                            color: '#0369A1',
                            borderRadius: '6px',
                            fontWeight: 700,
                            fontSize: '0.775rem',
                            border: '1px solid #BAE6FD',
                          }}
                        >
                          <MapPin size={13} />
                          {inv.region || 'Unassigned'}
                        </span>
                      </td>

                      {/* Delivery Driver */}
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#334155' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Truck size={14} color="#64748B" />
                          <span>{inv.deliveryMan || 'Unassigned'}</span>
                        </div>
                      </td>

                      {/* Payment Status Badge */}
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                        <span
                          style={{
                            padding: '0.3rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: 900,
                            letterSpacing: '0.03em',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            backgroundColor: statusBg,
                            color: statusColor,
                            border: `1px solid ${statusBorder}`,
                          }}
                        >
                          {isPaid ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                          {statusLabel}
                        </span>
                      </td>

                      {/* Net Total */}
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 700, color: '#0F172A' }}>
                        Rs. {originalNet.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                      </td>

                      {/* Current Due / Remaining Debt */}
                      <td
                        style={{
                          padding: '0.85rem 1rem',
                          textAlign: 'right',
                          fontWeight: 900,
                          color: currentDebt > 0 ? '#DC2626' : '#059669',
                          fontSize: '0.95rem',
                        }}
                      >
                        Rs. {currentDebt.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                      </td>

                      {/* Cash Received Today Interactive Input with Focus Styling */}
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                        <input
                          type="number"
                          min="0"
                          max={currentDebt}
                          step="1"
                          placeholder={isPaid ? 'Cleared' : 'e.g. 5000'}
                          disabled={isPaid}
                          value={currentCashInput}
                          onFocus={() => setFocusedInputInvoiceNo(inv.invoiceNo)}
                          onBlur={() => setFocusedInputInvoiceNo(null)}
                          onChange={(e) => handleCashInputChange(inv.invoiceNo, e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.5rem 0.65rem',
                            borderRadius: '6px',
                            border: isPaid
                              ? '1px solid #E2E8F0'
                              : isInputFocused
                              ? '2px solid #059669'
                              : '1.5px solid #10B981',
                            fontSize: '0.9rem',
                            fontWeight: 800,
                            textAlign: 'right',
                            color: isPaid ? '#94A3B8' : '#047857',
                            backgroundColor: isPaid ? '#F1F5F9' : isInputFocused ? '#FFFFFF' : '#F0FDF4',
                            outline: 'none',
                            boxShadow: isInputFocused ? '0 0 0 3px rgba(5, 150, 105, 0.25)' : 'none',
                            transition: 'all 0.15s ease',
                          }}
                        />
                      </td>

                      {/* Actions Buttons */}
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem' }}>
                          <button
                            onClick={() => handleSettleCash(inv)}
                            disabled={isPaid}
                            className="btn btn-primary"
                            style={{
                              backgroundColor: isPaid ? '#CBD5E1' : '#059669',
                              color: '#FFFFFF',
                              padding: '0.45rem 0.75rem',
                              fontSize: '0.775rem',
                              fontWeight: 800,
                              borderRadius: '6px',
                              cursor: isPaid ? 'not-allowed' : 'pointer',
                              border: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <DollarSign size={14} /> Settle Cash
                          </button>

                          <button
                            onClick={() => handleOpenLogs(inv)}
                            className="btn btn-outline"
                            style={{
                              borderColor: '#0284C7',
                              color: '#0284C7',
                              padding: '0.45rem 0.7rem',
                              fontSize: '0.775rem',
                              fontWeight: 800,
                              borderRadius: '6px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              backgroundColor: '#FFFFFF',
                              transition: 'all 0.15s ease',
                            }}
                            title="View Payment Logs & Audit History"
                          >
                            <History size={14} /> Logs
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748B' }}>
                    <MapPin size={40} style={{ margin: '0 auto 0.5rem auto', opacity: 0.4, color: '#0284C7' }} />
                    <p style={{ margin: 0, fontWeight: 800, fontSize: '1rem', color: '#1E293B' }}>
                      No delivery invoices match the selected region, status, or search query.
                    </p>
                    <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.825rem', color: '#64748B' }}>
                      Try selecting "All Regions", clearing the status filter, or resetting the search box.
                    </p>
                    {isFilterActive && (
                      <button
                        onClick={handleResetFilters}
                        style={{
                          marginTop: '0.85rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.5rem 0.9rem',
                          borderRadius: '6px',
                          border: '1px solid #0284C7',
                          backgroundColor: '#F0F9FF',
                          color: '#0284C7',
                          fontWeight: 800,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                        }}
                      >
                        <RotateCcw size={14} /> Reset Filters
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment History Log Modal */}
      <PaymentHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => {
          setIsHistoryModalOpen(false);
          setSelectedInvoiceForLogs(null);
        }}
        invoice={selectedInvoiceForLogs}
      />

      {/* A4 Regional Delivery Manifest & Settlement PDF Modal */}
      <RegionalDeliveryManifestModal
        isOpen={isManifestModalOpen}
        onClose={() => setIsManifestModalOpen(false)}
        selectedRegion={selectedRegion}
        invoices={filteredInvoices}
      />

      {/* Add New Region Modal */}
      <AddRegionModal
        isOpen={isAddRegionOpen}
        onClose={() => setIsAddRegionOpen(false)}
        onAddRegion={handleAddRegion}
      />
    </div>
  );
};

export default RegionLedgerPage;
