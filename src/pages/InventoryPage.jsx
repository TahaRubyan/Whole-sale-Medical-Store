import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Edit3,
  Trash2,
  Package,
  FileText
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { useAuth } from '../context/AuthContext';
import EditMedicineModal from '../components/modals/EditMedicineModal';
import DeleteConfirmModal from '../components/modals/DeleteConfirmModal';
import StockSummaryReportModal from '../components/inventory/StockSummaryReportModal';

export const InventoryPage = () => {
  const { medicines, batches, deleteMedicine } = useInventory();
  const { isCashier } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [deletingMedicine, setDeletingMedicine] = useState(null);
  const [isStockSummaryOpen, setIsStockSummaryOpen] = useState(false);

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

      return matchesCategory && matchesSearch;
    });
  }, [medicines, selectedCategory, searchQuery]);

  const handleDeleteConfirm = () => {
    if (deletingMedicine) {
      deleteMedicine(deletingMedicine.id);
      setDeletingMedicine(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: 'calc(100vh - 100px)', overflow: 'hidden' }}>
      
      {/* STICKY CLEAN SEARCH & CATEGORY FILTER TOOLBAR */}
      <div className="card" style={{ position: 'sticky', top: 0, zIndex: 10, padding: '0.85rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1' }}>
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

        {/* Clean Count Badge & Stock Summary Report Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#E0F2FE', color: '#0369A1', padding: '0.4rem 0.85rem', borderRadius: '6px', fontWeight: 800, fontSize: '0.85rem' }}>
            <Package size={16} /> Total Items: {filteredMedicines.length} Products
          </div>
        </div>
      </div>

      {/* SCROLLABLE CATALOG TABLE CONTAINER WITH DEDICATED SCROLLBAR */}
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
                  const isLow = totalBoxes <= med.reorderLevel;

                  return (
                    <tr key={med.id} style={{ backgroundColor: isLow ? '#FEF2F2' : 'transparent' }}>
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
                      <td style={{ textAlign: 'center', fontWeight: 900, color: isLow ? '#DC2626' : '#059669' }}>
                        {totalBoxes} Boxes {isLow && <span style={{ fontSize: '0.7rem', color: '#DC2626' }}>(Low Stock)</span>}
                      </td>
                      <td style={{ textAlign: 'right', color: '#475569' }}>
                        Rs. {Number(med.purchasePriceBox || med.boxPrice * 0.8 || 480).toFixed(2)}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 900, color: '#0369A1' }}>
                        Rs. {Number(med.boxPrice || 600).toFixed(2)}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => setEditingMedicine(med)}
                            className="btn btn-outline"
                            style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem', borderColor: '#0284C7', color: '#0284C7', fontWeight: 700 }}
                            title="Edit Wholesale Box Price"
                          >
                            <Edit3 size={14} /> Edit Price
                          </button>

                          {!isCashier && (
                            <button
                              onClick={() => setDeletingMedicine(med)}
                              className="btn btn-outline"
                              style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem', borderColor: '#EF4444', color: '#EF4444', fontWeight: 700 }}
                              title="Delete Item from Inventory"
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          )}
                        </div>
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
          title={`Delete ${deletingMedicine.brandName}?`}
          message={`Are you sure you want to remove ${deletingMedicine.brandName} (${deletingMedicine.id}) from the wholesale catalog?`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingMedicine(null)}
        />
      )}
    </div>
  );
};

export default InventoryPage;
