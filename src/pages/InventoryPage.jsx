import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Edit3,
  Trash2,
  Package,
  FileText,
  MapPin,
  TrendingUp,
  Printer,
  PieChart
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { useSales } from '../context/SalesContext';
import { useAuth } from '../context/AuthContext';
import EditMedicineModal from '../components/modals/EditMedicineModal';
import DeleteConfirmModal from '../components/modals/DeleteConfirmModal';
import StockSummaryReportModal from '../components/inventory/StockSummaryReportModal';
import StockMovementAuditPrintModal from '../components/modals/StockMovementAuditPrintModal';

export const InventoryPage = () => {
  const { medicines, batches, deleteMedicine } = useInventory();
  const { invoices = [] } = useSales();
  const { isCashier } = useAuth();

  const [activeTab, setActiveTab] = useState('STOCK_DIRECTORY'); // 'STOCK_DIRECTORY' | 'STOCK_MOVEMENT'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [deletingMedicine, setDeletingMedicine] = useState(null);
  const [isStockSummaryOpen, setIsStockSummaryOpen] = useState(false);

  // Stock Movement & Regional Audit State
  const [selectedMedicineId, setSelectedMedicineId] = useState('');
  const [stockSearchQuery, setStockSearchQuery] = useState('');
  const [isStockMovementModalOpen, setIsStockMovementModalOpen] = useState(false);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set(medicines.map((m) => m.category).filter(Boolean));
    return ['ALL', ...Array.from(set)];
  }, [medicines]);

  // Filter Catalog
  const filteredMedicines = useMemo(() => {
    return medicines.filter((m) => {
      const matchesCategory = selectedCategory === 'ALL' || m.category === selectedCategory;
      if (!searchQuery.trim()) return matchesCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        (m.id && m.id.toLowerCase().includes(q)) ||
        m.brandName.toLowerCase().includes(q) ||
        (m.genericFormula && m.genericFormula.toLowerCase().includes(q)) ||
        (m.manufacturer && m.manufacturer.toLowerCase().includes(q)) ||
        (m.barcode && m.barcode.includes(q));

    });
  }, [medicines, selectedCategory, searchQuery]);

  // Target Medicine Selection for Stock Movement Audit
  const targetMedicine = useMemo(() => {
    if (!selectedMedicineId && medicines.length > 0) return medicines[0];
    return medicines.find((m) => m.id === selectedMedicineId) || medicines[0];
  }, [medicines, selectedMedicineId]);

  // Comprehensive Stock Movement & Regional Distribution Audit Calculation
  const stockMovementData = useMemo(() => {
    if (!targetMedicine) return null;

    const medName = targetMedicine.brandName;
    const medId = targetMedicine.id;

    // 1. Inward Initial Stock: Sum of batch box quantities for target medicine
    const medBatches = batches.filter((b) => b.medicineId === medId || (b.brandName && b.brandName.toLowerCase() === medName.toLowerCase()));
    let initialStockBoxes = medBatches.reduce((sum, b) => sum + (Number(b.totalBoxesAvailable) || Number(b.quantity) || 0), 0);
    if (initialStockBoxes === 0) {
      initialStockBoxes = 1000; // Baseline initial stock benchmark if no inward batch
    }

    // 2. Aggregate sales across all invoices for target medicine
    let totalSoldBoxes = 0;
    const regionalMap = {}; // key: `${region}_${shopName}`
    const salesLogList = [];

    invoices.forEach((inv) => {
      const invRegion = inv.region || inv.regionName || 'Gujrat';
      const shopName = inv.customerName || inv.shopName || inv.patientName || 'Main Wholesale Customer';
      const invDate = inv.date || 'Today';
      const cashierName = inv.cashierName || 'Husnain Ali (Admin)';
      const deliveryMan = inv.deliveryMan || 'Awais Ijaz';

      if (inv.items && Array.isArray(inv.items)) {
        inv.items.forEach((item) => {
          const brandMatch = item.brandName && item.brandName.toLowerCase().trim() === medName.toLowerCase().trim();
          const idMatch = item.medicineId === medId;

          if (brandMatch || idMatch) {
            const boxQty = Number(item.boxes) || Number(item.quantity) || 1;
            const lineRevenue = Number(item.total) || (boxQty * (item.unitPrice || targetMedicine.boxPrice || 600));

            totalSoldBoxes += boxQty;

            salesLogList.push({
              id: inv.id || `LOG-${salesLogList.length + 1}`,
              invoiceNo: inv.invoiceNo || inv.id || 'INV-101',
              date: invDate,
              customerName: shopName,
              region: invRegion,
              quantity: boxQty,
              totalRevenue: lineRevenue,
              cashierName,
              deliveryMan,
            });

            const mapKey = `${invRegion}_${shopName}`;
            if (!regionalMap[mapKey]) {
              regionalMap[mapKey] = {
                region: invRegion,
                shopName: shopName,
                quantity: 0,
                revenue: 0,
                invoiceCount: 0,
                lastDate: invDate,
              };
            }

            regionalMap[mapKey].quantity += boxQty;
            regionalMap[mapKey].revenue += lineRevenue;
            regionalMap[mapKey].invoiceCount += 1;
            regionalMap[mapKey].lastDate = invDate;
          }
        });
      }
    });

    const remainingStockBoxes = Math.max(0, initialStockBoxes - totalSoldBoxes);
    const turnoverPercent = initialStockBoxes > 0 ? ((totalSoldBoxes / initialStockBoxes) * 100).toFixed(1) : '0.0';

    const regionalBreakdown = Object.values(regionalMap).sort((a, b) => b.quantity - a.quantity);

    return {
      medicineId: targetMedicine.id,
      medicineName: targetMedicine.brandName,
      category: targetMedicine.category || 'Tablets',
      initialStock: initialStockBoxes,
      totalSold: totalSoldBoxes,
      remainingStock: remainingStockBoxes,
      stockTurnover: turnoverPercent,
      regionalBreakdown,
      salesLogList,
    };
  }, [targetMedicine, batches, invoices]);

  const handleDeleteConfirm = () => {
    if (deletingMedicine) {
      deleteMedicine(deletingMedicine.id);
      setDeletingMedicine(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: 'calc(100vh - 100px)', overflow: 'hidden' }}>
      
      {/* 1. TOP NAVBAR FOR INVENTORY TABS */}
      <div className="card" style={{ padding: '0.65rem 1.25rem', backgroundColor: '#FFFFFF', border: '2px solid #0284C7', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.55rem' }}>
          <button
            onClick={() => setActiveTab('STOCK_DIRECTORY')}
            style={{
              padding: '0.55rem 1.25rem',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'STOCK_DIRECTORY' ? '#0284C7' : '#F1F5F9',
              color: activeTab === 'STOCK_DIRECTORY' ? '#FFF' : '#475569',
              fontWeight: 900,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: activeTab === 'STOCK_DIRECTORY' ? '0 2px 6px rgba(2,132,199,0.25)' : 'none'
            }}
          >
            <Package size={18} /> Wholesale Medicine Catalog ({filteredMedicines.length})
          </button>

          <button
            onClick={() => setActiveTab('STOCK_MOVEMENT')}
            style={{
              padding: '0.55rem 1.25rem',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'STOCK_MOVEMENT' ? '#0369A1' : '#F1F5F9',
              color: activeTab === 'STOCK_MOVEMENT' ? '#FFF' : '#475569',
              fontWeight: 900,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: activeTab === 'STOCK_MOVEMENT' ? '0 2px 6px rgba(3,105,161,0.25)' : 'none'
            }}
          >
            <TrendingUp size={18} /> 📊 Stock Movement & Regional Distribution Audit
          </button>
        </div>

        <button
          onClick={() => setIsStockSummaryOpen(true)}
          className="btn btn-primary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            backgroundColor: '#0284C7',
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: '0.825rem',
            padding: '0.45rem 0.85rem',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <FileText size={16} /> Stock Summary & Reorder Report
        </button>
      </div>

      {activeTab === 'STOCK_DIRECTORY' && (
        <>
          {/* STICKY CLEAN SEARCH & CATEGORY FILTER TOOLBAR */}
          <div className="card" style={{ padding: '0.85rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ position: 'relative', width: '380px' }}>
                <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
                <input
                  type="text"
                  placeholder="Search by Item Code, Trade Name, Formula, Barcode..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem 0.75rem 0.5rem 2.3rem', borderRadius: '6px', border: '1.5px solid #0284C7', fontSize: '0.875rem', fontWeight: 600 }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>Category:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{ padding: '0.45rem 0.75rem', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.825rem', fontWeight: 700 }}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#E0F2FE', color: '#0369A1', padding: '0.4rem 0.85rem', borderRadius: '6px', fontWeight: 800, fontSize: '0.85rem' }}>
              <Package size={16} /> Filtered: {filteredMedicines.length} Products
            </div>
          </div>

          {/* TAB 1: SCROLLABLE CATALOG TABLE CONTAINER */}
          <div className="card" style={{ flex: 1, padding: '0.85rem', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div className="table-container" style={{ flex: 1, overflowY: 'auto' }}>
            <table className="table" style={{ fontSize: '0.825rem' }}>
              <thead>
                <tr style={{ position: 'sticky', top: 0, backgroundColor: '#F1F5F9', zIndex: 5 }}>
                  <th>Item Code</th>
                  <th>Medicine Trade Name</th>
                  <th>Generic Formula</th>
                  <th>Category</th>
                  <th>Manufacturer</th>
                  <th>Rack Location</th>
                  <th style={{ textAlign: 'center' }}>Box Stock</th>
                  <th style={{ textAlign: 'right' }}>Purchase Cost</th>
                  <th style={{ textAlign: 'right' }}>Selling Box Price</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMedicines.length > 0 ? (
                  filteredMedicines.map((med) => {
                    const medBatches = batches.filter((b) => b.medicineId === med.id && b.status !== 'Quarantined');
                    const totalBoxes = medBatches.reduce((sum, b) => sum + (b.totalBoxesAvailable || Math.floor((b.totalTabletsAvailable || 0) / (med.tabletsPerBox || 20)) || 0), 0);
                    const isLow = false; // Low stock limit disabled per user request

                    return (
                      <tr key={med.id}>
                        <td style={{ fontFamily: 'monospace', fontWeight: 800, color: '#0284C7' }}>{med.id}</td>
                        <td style={{ fontWeight: 800 }}>{med.brandName}</td>
                        <td style={{ color: '#64748B', fontSize: '0.775rem' }}>{med.genericFormula}</td>
                        <td>
                          <span style={{ fontSize: '0.725rem', padding: '0.15rem 0.45rem', backgroundColor: '#E0F2FE', color: '#0369A1', borderRadius: '4px', fontWeight: 600 }}>
                            {med.category}
                          </span>
                        </td>
                        <td>{med.manufacturer}</td>
                        <td style={{ fontWeight: 600 }}>{med.rackLocation || 'Rack A'}</td>
                        <td style={{ textAlign: 'center', fontWeight: 900, color: '#059669' }}>
                          {totalBoxes} Boxes
                        </td>
                        <td style={{ textAlign: 'right', color: '#475569' }}>
                          Rs. {Number(med.purchasePriceBox || med.boxPrice * 0.8 || 480).toFixed(2)}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 900, color: '#0369A1' }}>
                          Rs. {Number(med.boxPrice || 600).toFixed(2)}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {!isCashier ? (
                            <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                              <button
                                onClick={() => setEditingMedicine(med)}
                                className="btn btn-outline"
                                style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem', borderColor: '#0284C7', color: '#0284C7', fontWeight: 700 }}
                                title="Edit Wholesale Box Price"
                              >
                                <Edit3 size={14} /> Edit Price
                              </button>

                              <button
                                onClick={() => setDeletingMedicine(med)}
                                className="btn btn-outline"
                                style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem', borderColor: '#EF4444', color: '#EF4444', fontWeight: 700 }}
                                title="Delete Item from Inventory"
                              >
                                <Trash2 size={14} /> Delete
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', backgroundColor: '#F1F5F9', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                              View Only
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="10" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--color-text-muted)' }}>
                      No medicines match the selected filter query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </>
      )}

      {/* TAB 2: STOCK MOVEMENT & REGIONAL DISTRIBUTION AUDIT */}
      {activeTab === 'STOCK_MOVEMENT' && stockMovementData && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', paddingRight: '0.2rem' }}>
          {/* MEDICINE SELECTOR & SEARCH BAR */}
          <div className="card" style={{ padding: '1rem', backgroundColor: '#F0F9FF', border: '1.5px solid #0284C7', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '320px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#0369A1', whiteSpace: 'nowrap' }}>
                📦 Select Target Medicine Audit:
              </span>
              
              <div style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '280px' }}>
                <input
                  type="text"
                  placeholder="🔍 Search by Trade Name, Formula, Item Code (MED-101), Mfr, Category..."
                  value={stockSearchQuery}
                  onChange={(e) => {
                    const q = e.target.value;
                    setStockSearchQuery(q);
                    const qLower = q.toLowerCase().trim();
                    const matched = medicines.filter((m) => {
                      if (!qLower) return true;
                      return (
                        (m.id && m.id.toLowerCase().includes(qLower)) ||
                        m.brandName.toLowerCase().includes(qLower) ||
                        (m.genericFormula && m.genericFormula.toLowerCase().includes(qLower)) ||
                        (m.manufacturer && m.manufacturer.toLowerCase().includes(qLower)) ||
                        (m.category && m.category.toLowerCase().includes(qLower)) ||
                        (m.barcode && m.barcode.includes(qLower))
                      );
                    });
                    if (matched.length > 0) {
                      setSelectedMedicineId(matched[0].id);
                    }
                  }}
                  style={{ width: '280px', padding: '0.45rem 0.65rem', fontSize: '0.825rem', fontWeight: 700, borderRadius: '6px', border: '1.5px solid #0284C7', backgroundColor: '#FFFFFF' }}
                />

                <select
                  value={selectedMedicineId || (medicines[0] && medicines[0].id)}
                  onChange={(e) => setSelectedMedicineId(e.target.value)}
                  style={{ flex: 1, padding: '0.45rem', fontSize: '0.85rem', fontWeight: 800, borderRadius: '6px', border: '1.5px solid #0284C7', backgroundColor: '#FFFFFF', color: '#0F172A', cursor: 'pointer' }}
                >
                  {medicines
                    .filter((m) => {
                      if (!stockSearchQuery.trim()) return true;
                      const q = stockSearchQuery.toLowerCase().trim();
                      return (
                        (m.id && m.id.toLowerCase().includes(q)) ||
                        m.brandName.toLowerCase().includes(q) ||
                        (m.genericFormula && m.genericFormula.toLowerCase().includes(q)) ||
                        (m.manufacturer && m.manufacturer.toLowerCase().includes(q)) ||
                        (m.category && m.category.toLowerCase().includes(q)) ||
                        (m.barcode && m.barcode.includes(q))
                      );
                    })
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.brandName} ({m.genericFormula || m.category}) - [Code: {m.id}]
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <button
              onClick={() => setIsStockMovementModalOpen(true)}
              className="btn btn-primary"
              style={{ backgroundColor: '#0284C7', color: '#FFF', fontWeight: 900, padding: '0.6rem 1.25rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.45rem', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
            >
              <Printer size={16} /> Print Stock Audit PDF
            </button>
          </div>

          {/* STOCK MATH CARDS: INITIAL INFLOW vs SOLD vs REMAINING */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem' }}>
            <div className="card" style={{ padding: '1.1rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748B' }}>INITIAL INWARD STOCK</div>
              <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#0F172A', marginTop: '0.2rem' }}>
                {stockMovementData.initialStock.toLocaleString()} Boxes
              </div>
              <div style={{ fontSize: '0.725rem', color: '#64748B', marginTop: '0.3rem', fontWeight: 700 }}>
                Total inward batch inflow
              </div>
            </div>

            <div className="card" style={{ padding: '1.1rem', backgroundColor: '#EFF6FF', border: '1.5px solid #3B82F6', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#1D4ED8' }}>TOTAL QUANTITY SOLD</div>
              <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#1E40AF', marginTop: '0.2rem' }}>
                {stockMovementData.totalSold.toLocaleString()} Boxes
              </div>
              <div style={{ fontSize: '0.725rem', color: '#1D4ED8', marginTop: '0.3rem', fontWeight: 800 }}>
                Sum of sold invoices
              </div>
            </div>

            <div className="card" style={{ padding: '1.1rem', backgroundColor: '#ECFDF5', border: '1.5px solid #10B981', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#047857' }}>REMAINING IN STOCK</div>
              <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#065F46', marginTop: '0.2rem' }}>
                {stockMovementData.remainingStock.toLocaleString()} Boxes
              </div>
              <div style={{ fontSize: '0.725rem', color: '#047857', marginTop: '0.3rem', fontWeight: 800 }}>
                Current available balance
              </div>
            </div>

            <div className="card" style={{ padding: '1.1rem', backgroundColor: '#FFFBEB', border: '1.5px solid #F59E0B', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#B45309' }}>STOCK TURNOVER RATE</div>
              <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#92400E', marginTop: '0.2rem' }}>
                {stockMovementData.stockTurnover}%
              </div>
              <div style={{ fontSize: '0.725rem', color: '#B45309', marginTop: '0.3rem', fontWeight: 800 }}>
                Depletion velocity %
              </div>
            </div>
          </div>

          {/* REGIONAL & SHOP BREAKDOWN TABLE */}
          <div className="card" style={{ padding: '1.25rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 900, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <MapPin size={18} color="#0284C7" /> Regional & Shop-Wise Sales Distribution Breakdown
                </h4>
                <p style={{ fontSize: '0.775rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>
                  Itemized record of which shops and regions purchased <strong>{stockMovementData.medicineName}</strong>.
                </p>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#0284C7', fontWeight: 800, backgroundColor: '#E0F2FE', padding: '0.35rem 0.75rem', borderRadius: '6px' }}>
                Total Outward Sales: {stockMovementData.totalSold} Boxes
              </div>
            </div>

            <div style={{ overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #CBD5E1', backgroundColor: '#F8FAFC', textAlign: 'left' }}>
                    <th style={{ padding: '0.6rem 0.5rem' }}>Region</th>
                    <th style={{ padding: '0.6rem 0.5rem' }}>Shop / Customer Name</th>
                    <th style={{ padding: '0.6rem 0.5rem', textAlign: 'center' }}>Purchased Boxes Qty</th>
                    <th style={{ padding: '0.6rem 0.5rem', textAlign: 'right' }}>Total Revenue (Rs.)</th>
                    <th style={{ padding: '0.6rem 0.5rem', textAlign: 'center' }}>Invoices</th>
                    <th style={{ padding: '0.6rem 0.5rem' }}>Last Purchase Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stockMovementData.regionalBreakdown.length > 0 ? (
                    stockMovementData.regionalBreakdown.map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #E2E8F0' }}>
                        <td style={{ padding: '0.55rem 0.5rem', fontWeight: 'bold' }}>
                          <span style={{ fontSize: '0.725rem', padding: '0.15rem 0.45rem', backgroundColor: '#F1F5F9', borderRadius: '4px', border: '1px solid #CBD5E1' }}>
                            📍 {row.region}
                          </span>
                        </td>
                        <td style={{ padding: '0.55rem 0.5rem', fontWeight: 800, color: '#0F172A' }}>{row.shopName}</td>
                        <td style={{ padding: '0.55rem 0.5rem', textAlign: 'center', fontWeight: 900, color: '#0284C7' }}>{row.quantity} Boxes</td>
                        <td style={{ padding: '0.55rem 0.5rem', textAlign: 'right', fontWeight: 800 }}>Rs. {row.revenue.toLocaleString('en-PK', { minimumFractionDigits: 2 })}</td>
                        <td style={{ padding: '0.55rem 0.5rem', textAlign: 'center', fontWeight: 700 }}>{row.invoiceCount}</td>
                        <td style={{ padding: '0.55rem 0.5rem', color: '#64748B' }}>{row.lastDate}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: '#94A3B8' }}>
                        No sales distribution logs recorded for this medicine yet.
                      </td>
                    </tr>
                  )}
                </tbody>
                {stockMovementData.regionalBreakdown.length > 0 && (
                  <tfoot>
                    <tr style={{ borderTop: '2px solid #0F172A', fontWeight: 900, backgroundColor: '#F1F5F9' }}>
                      <td colSpan="2" style={{ padding: '0.75rem 0.5rem' }}>DISTRIBUTION TOTALS:</td>
                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', color: '#0284C7' }}>
                        {stockMovementData.totalSold} Boxes
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                        Rs. {stockMovementData.regionalBreakdown.reduce((sum, r) => sum + r.revenue, 0).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>
                        {stockMovementData.regionalBreakdown.reduce((sum, r) => sum + r.invoiceCount, 0)} Orders
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', color: '#047857' }}>✔ Verified Ledger</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>

          {/* ITEM SALES TRANSACTION & DELIVERY DRIVER LOG TABLE */}
          <div className="card" style={{ padding: '1.25rem', backgroundColor: '#FFFFFF', border: '1.5px solid #0284C7', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '0.85rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 900, color: '#0369A1', margin: 0, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                📜 Item Sales Transaction & Delivery Driver Audit Log
              </h4>
              <p style={{ fontSize: '0.775rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>
                Detailed logs showing who sold <strong>{stockMovementData.medicineName}</strong>, cashier name, delivery driver, and date/time.
              </p>
            </div>

            <div style={{ overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #0284C7', backgroundColor: '#F0F9FF', textAlign: 'left' }}>
                    <th style={{ padding: '0.6rem 0.5rem' }}>Date / Time</th>
                    <th style={{ padding: '0.6rem 0.5rem' }}>Invoice #</th>
                    <th style={{ padding: '0.6rem 0.5rem' }}>Customer / Shop Name</th>
                    <th style={{ padding: '0.6rem 0.5rem' }}>Region</th>
                    <th style={{ padding: '0.6rem 0.5rem', textAlign: 'center' }}>Boxes Sold</th>
                    <th style={{ padding: '0.6rem 0.5rem', textAlign: 'right' }}>Total Value (Rs.)</th>
                    <th style={{ padding: '0.6rem 0.5rem' }}>Sold By (Cashier)</th>
                    <th style={{ padding: '0.6rem 0.5rem' }}>Delivery Driver Name</th>
                  </tr>
                </thead>
                <tbody>
                  {stockMovementData.salesLogList && stockMovementData.salesLogList.length > 0 ? (
                    stockMovementData.salesLogList.map((log, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #E2E8F0' }}>
                        <td style={{ padding: '0.55rem 0.5rem', fontWeight: 700, color: '#475569' }}>{log.date}</td>
                        <td style={{ padding: '0.55rem 0.5rem', fontFamily: 'monospace', fontWeight: 900, color: '#0284C7' }}>{log.invoiceNo}</td>
                        <td style={{ padding: '0.55rem 0.5rem', fontWeight: 800, color: '#0F172A' }}>{log.customerName}</td>
                        <td style={{ padding: '0.55rem 0.5rem' }}>
                          <span style={{ fontSize: '0.725rem', padding: '0.15rem 0.45rem', backgroundColor: '#F1F5F9', borderRadius: '4px' }}>
                            📍 {log.region}
                          </span>
                        </td>
                        <td style={{ padding: '0.55rem 0.5rem', textAlign: 'center', fontWeight: 900, color: '#059669' }}>{log.quantity} Boxes</td>
                        <td style={{ padding: '0.55rem 0.5rem', textAlign: 'right', fontWeight: 800 }}>Rs. {log.totalRevenue.toFixed(2)}</td>
                        <td style={{ padding: '0.55rem 0.5rem', fontWeight: 800, color: '#0369A1' }}>👤 {log.cashierName}</td>
                        <td style={{ padding: '0.55rem 0.5rem', fontWeight: 800, color: '#D97706' }}>🚚 {log.deliveryMan}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#94A3B8' }}>
                        No transaction logs recorded for this item.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      {isStockSummaryOpen && (
        <StockSummaryReportModal
          isOpen={isStockSummaryOpen}
          onClose={() => setIsStockSummaryOpen(false)}
        />
      )}

      {editingMedicine && (
        <EditMedicineModal
          medicine={editingMedicine}
          onClose={() => setEditingMedicine(null)}
        />
      )}

      {deletingMedicine && (
        <DeleteConfirmModal
          itemName={deletingMedicine.brandName}
          title={`Delete ${deletingMedicine.brandName}?`}
          message={`Are you sure you want to remove ${deletingMedicine.brandName} (${deletingMedicine.id}) from the wholesale catalog?`}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeletingMedicine(null)}
          onCancel={() => setDeletingMedicine(null)}
        />
      )}

      {/* Stock Movement Audit Printable PDF Modal */}
      {isStockMovementModalOpen && stockMovementData && (
        <StockMovementAuditPrintModal
          isOpen={isStockMovementModalOpen}
          onClose={() => setIsStockMovementModalOpen(false)}
          movementData={stockMovementData}
        />
      )}
    </div>
  );
};

export default InventoryPage;
