import React, { useState, useRef, useEffect } from 'react';
import { useInventory } from '../context/InventoryContext';
import { useCart } from '../context/CartContext';
import { getTaxConfig } from '../data/mockData';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  CheckCircle,
  RotateCcw,
  UserCheck,
  Edit3
} from 'lucide-react';
import A4InvoicePrintModal from '../components/modals/A4InvoicePrintModal';
import SalesReturnModal from '../components/modals/SalesReturnModal';
import CustomerDetailsModal from '../components/modals/CustomerDetailsModal';
import CartItemEditModal from '../components/modals/CartItemEditModal';
import AlertWarningModal from '../components/modals/AlertWarningModal';
import { formatDateDDMMYYYY, isWithinSixMonths } from '../utils/dateUtils';

export const POSPage = () => {
  const { medicines, batches } = useInventory();
  const {
    cart,
    setCart,
    customerName,
    setCustomerName,
    discountType,
    setDiscountType,
    discountValue,
    setDiscountValue,
    paymentMode,
    setPaymentMode,
    cashTendered,
    setCashTendered,
    lastCompletedSale,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    calculations,
    processCheckout,
  } = useCart();

  // Wholesale Customer Details State matching reference invoice
  const [customerDetails, setCustomerDetails] = useState({
    customerName: '',
    region: '',
    address: '',
    customerPhone: '',
    customerLicenseNo: '',
    customerNtn: '',
    customerGst: '',
    fbrStatus: '',
    bookingMan: '',
    referenceNo: '',
    deliveryMan: '',
    shipTo: '',
  });

  const [paymentStatus, setPaymentStatus] = useState('UNPAID_CREDIT'); // 'PAID' | 'UNPAID_CREDIT'
  
  // DUAL SEPARATE WARRANTY CHECKBOXES FOR INVOICE INITIALIZED FROM SETTINGS
  const initialWarrantyConfig = getWarrantyConfig();
  const [includeDrugActWarranty, setIncludeDrugActWarranty] = useState(initialWarrantyConfig.enableDrugActWarranty !== false);
  const [includeDrapWarranty, setIncludeDrapWarranty] = useState(initialWarrantyConfig.enableDrapWarranty !== false);

  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [editingCartItemIndex, setEditingCartItemIndex] = useState(null);

  const [showA4Modal, setShowA4Modal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [warningMsg, setWarningMsg] = useState('');

  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);

  // Sync customerName with customerDetails
  useEffect(() => {
    if (customerDetails?.customerName) {
      setCustomerName(customerDetails.customerName);
    }
  }, [customerDetails, setCustomerName]);

  // Click outside listener for search dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter Medicines for Live Search Autocomplete Dropdown
  const filteredSuggestions = medicines.filter((m) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      (m.id && m.id.toLowerCase().includes(q)) ||
      m.brandName.toLowerCase().includes(q) ||
      (m.genericFormula && m.genericFormula.toLowerCase().includes(q)) ||
      (m.manufacturer && m.manufacturer.toLowerCase().includes(q)) ||
      (m.barcode && m.barcode.includes(q))
    );
  });

  // Reset highlight index when query changes
  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchQuery]);

  const handleAddItemToCart = (med) => {
    const activeBatches = batches.filter(
      (b) => b.medicineId === med.id && b.status !== 'Quarantined'
    ).sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));

    if (activeBatches.length === 0) {
      setWarningMsg(`No active stock available for "${med.brandName}"!`);
      return;
    }

    const totalAvailableBoxes = activeBatches.reduce(
      (sum, b) => sum + (b.totalBoxesAvailable !== undefined ? b.totalBoxesAvailable : Math.floor((b.totalTabletsAvailable || 0) / (med.tabletsPerBox || 20))),
      0
    );

    const existingCartItem = cart.find((i) => i.medicineId === med.id);
    const existingQty = existingCartItem ? existingCartItem.quantity : 0;

    if (existingQty + 1 > totalAvailableBoxes) {
      setWarningMsg(`Stock Limit Exceeded: Only ${totalAvailableBoxes} Box(es) available in stock for "${med.brandName}". Cannot add more!`);
      return;
    }

    const targetBatch = activeBatches[0];
    if (isWithinSixMonths(targetBatch.expiryDate)) {
      setWarningMsg(`Cannot Add Item: Expiry Date Exceeded for "${med.brandName || 'Medicine'}". Expiry date is within 6 months!`);
      return;
    }

    addToCart(med, targetBatch, 'Box');
    setSearchQuery('');
    setShowDropdown(false);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Keyboard navigation event handler: ArrowDown, ArrowUp, Enter
  const handleKeyDown = (e) => {
    if (!showDropdown || filteredSuggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % filteredSuggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + filteredSuggestions.length) % filteredSuggestions.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const targetMed = filteredSuggestions[highlightedIndex];
      if (targetMed) {
        handleAddItemToCart(targetMed);
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  const handleSaveCartItemEdit = (updatedItemData) => {
    if (editingCartItemIndex !== null && cart[editingCartItemIndex]) {
      setCart((prevCart) => {
        const next = [...prevCart];
        next[editingCartItemIndex] = {
          ...next[editingCartItemIndex],
          ...updatedItemData
        };
        return next;
      });
    }
  };

  const handleCheckoutClick = () => {
    const extraDetails = {
      ...customerDetails,
      paymentStatus,
      includeDrugActWarranty,
      includeDrapWarranty
    };

    const saleRecord = processCheckout(extraDetails);
    if (saleRecord) {
      setShowA4Modal(true);
    }
  };

  // Check if Cash payment mode is selected to conditionally show Cash Received
  const isCashPayment = paymentMode === 'Cash';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: 'calc(100vh - 110px)' }}>
      
      {/* 1. TOP TOOLBAR: CUSTOMER METADATA ACTION & SALES RETURN */}
      <div className="card" style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => setShowCustomerModal(true)}
            style={{
              padding: '0.5rem 1.1rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              backgroundColor: '#0284C7',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: '0 2px 4px rgba(2,132,199,0.2)'
            }}
          >
            <UserCheck size={18} /> + Add / Select Customer Details
          </button>

          <div style={{ fontSize: '0.825rem', color: '#475569', fontWeight: 700 }}>
            Customer: <strong style={{ color: '#0369A1' }}>{customerDetails.customerName || 'Walk-in / Cash Customer'}</strong> {customerDetails.region ? `(${customerDetails.region})` : ''}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={clearCart}
            className="btn btn-outline"
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem', borderColor: '#64748B', color: '#475569', fontWeight: 700 }}
          >
            Clear Cart
          </button>

          <button
            onClick={() => setShowReturnModal(true)}
            className="btn btn-outline"
            style={{ padding: '0.45rem 1rem', fontSize: '0.85rem', borderColor: '#EF4444', color: '#EF4444', fontWeight: 700 }}
          >
            <RotateCcw size={16} /> ↺ Sales Return / Exchange
          </button>
        </div>
      </div>

      {/* 2. MAIN POS 2-COLUMN LAYOUT */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.55fr 1fr', gap: '1rem', flex: 1, minHeight: 0 }}>
        
        {/* LEFT COLUMN: CLEAN KEYBOARD SEARCH & WHOLESALE CART TABLE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', overflow: 'hidden' }}>
          
          {/* CLEAN KEYBOARD SEARCH INPUT FIELD WITH LIVE DROPDOWN SUGGESTIONS */}
          <div ref={searchContainerRef} className="card" style={{ padding: '0.85rem', position: 'relative', overflow: 'visible', zIndex: 100 }}>
            <div style={{ position: 'relative' }}>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Type Item Name, Code (e.g. med-333), Formula, or scan barcode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  setShowDropdown(true);
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '6px',
                  border: '2px solid #0284C7',
                  fontSize: '1rem',
                  fontWeight: 700,
                  boxShadow: '0 2px 6px rgba(2, 132, 199, 0.15)'
                }}
              />

              {/* LIVE AUTOCOMPLETE SUGGESTIONS DROPDOWN MENU */}
              {showDropdown && filteredSuggestions.length > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: '#FFFFFF',
                    border: '2px solid #0284C7',
                    borderRadius: '8px',
                    marginTop: '0.35rem',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.18)',
                    maxHeight: '320px',
                    overflowY: 'auto',
                    zIndex: 200
                  }}
                >
                  {filteredSuggestions.map((med, idx) => {
                    const isHighlighted = idx === highlightedIndex;
                    const medBatches = batches.filter((b) => b.medicineId === med.id && b.status !== 'Quarantined');
                    const totalBoxes = medBatches.reduce((sum, b) => sum + (b.totalBoxesAvailable || Math.floor((b.totalTabletsAvailable || 0) / (med.tabletsPerBox || 20)) || 0), 0);

                    return (
                      <div
                        key={med.id}
                        onClick={() => handleAddItemToCart(med)}
                        onMouseEnter={() => setHighlightedIndex(idx)}
                        style={{
                          padding: '0.75rem 1rem',
                          backgroundColor: isHighlighted ? '#E0F2FE' : '#FFFFFF',
                          borderBottom: '1px solid #E2E8F0',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontFamily: 'monospace', fontWeight: 900, color: '#0284C7', backgroundColor: '#F1F5F9', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                              {med.id}
                            </span>
                            <strong style={{ fontSize: '0.95rem', color: '#1F2937' }}>{med.brandName}</strong>
                            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>({med.genericFormula})</span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.2rem' }}>
                            Rack: {med.rackLocation || 'Rack A'} &nbsp;|&nbsp; Mfr: {med.manufacturer}
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#0369A1' }}>
                            Rs. {Number(med.boxPrice || 600).toFixed(2)} / Box
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: totalBoxes > 0 ? '#059669' : '#DC2626' }}>
                            {totalBoxes} Boxes Stock
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* WHOLESALE BILLING CART TABLE WITH FULL ITEMIZED TAX COLUMNS */}
          <div className="card" style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0369A1', margin: 0 }}>
                🛒 Billing Cart Items ({cart.length} Line Items)
              </h3>
              <span style={{ fontSize: '0.775rem', fontWeight: 700, color: '#0284C7', backgroundColor: '#E0F2FE', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                💡 Tip: Double-click any item row to edit discounts & tax rates
              </span>
            </div>

            <div className="table-container" style={{ flex: 1, overflowY: 'auto' }}>
              <table className="table" style={{ fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F1F5F9' }}>
                    <th style={{ padding: '0.65rem 0.35rem' }}>Sr. Item Name</th>
                    <th style={{ padding: '0.65rem 0.35rem' }}>Batch No.</th>
                    <th style={{ padding: '0.65rem 0.35rem' }}>Expiry</th>
                    <th style={{ padding: '0.65rem 0.35rem', textAlign: 'center' }}>Qty</th>
                    <th style={{ padding: '0.65rem 0.35rem', textAlign: 'right' }}>Rate</th>
                    <th style={{ padding: '0.65rem 0.35rem', textAlign: 'right' }}>Gross</th>
                    <th style={{ padding: '0.65rem 0.35rem', textAlign: 'right' }}>Disc %</th>
                    {getTaxConfig().enableSaleTax !== false && (
                      <th style={{ padding: '0.65rem 0.35rem', textAlign: 'right' }}>{getTaxConfig().saleTaxName || 'Sale Tax 18%'}</th>
                    )}
                    {getTaxConfig().enableAdTax !== false && (
                      <th style={{ padding: '0.65rem 0.35rem', textAlign: 'right' }}>{getTaxConfig().adTaxName || 'AdTax 4%'}</th>
                    )}
                    {getTaxConfig().enableAdvTax !== false && (
                      <th style={{ padding: '0.65rem 0.35rem', textAlign: 'right' }}>{getTaxConfig().advTaxName || 'Adv Tax 0.5%'}</th>
                    )}
                    <th style={{ padding: '0.65rem 0.35rem', textAlign: 'right' }}>Net Amount</th>
                    <th style={{ padding: '0.65rem 0.35rem', textAlign: 'center' }}>Edit / Del</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.length > 0 ? (
                    cart.map((ci, idx) => {
                      const qty = Number(ci.quantity) || 1;
                      const rate = Number(ci.unitPrice) || 600;
                      const gross = ci.gross || (qty * rate);
                      const discP = ci.discPercent || 0;
                      const discAmt = ci.discAmount || (gross * (discP / 100));
                      const discountedGross = gross - discAmt;

                      const taxCfg = getTaxConfig();
                      const stAmt = taxCfg.enableSaleTax !== false ? (ci.saleTaxAmt !== undefined ? ci.saleTaxAmt : (discountedGross * 0.18)) : 0;
                      const adtAmt = taxCfg.enableAdTax !== false ? (ci.adTaxAmt !== undefined ? ci.adTaxAmt : (discountedGross * 0.04)) : 0;
                      const advtAmt = taxCfg.enableAdvTax !== false ? (ci.advTaxAmt !== undefined ? ci.advTaxAmt : (discountedGross * 0.005)) : 0;
                      const netAmt = ci.total || (discountedGross + stAmt + adtAmt + advtAmt);

                      return (
                        <tr
                          key={idx}
                          onDoubleClick={() => setEditingCartItemIndex(idx)}
                          style={{ borderBottom: '1px solid #E2E8F0', cursor: 'pointer' }}
                          title="Double-click to edit line discount & tax percentages"
                        >
                          <td style={{ padding: '0.65rem 0.35rem', fontWeight: 800, color: '#1F2937' }}>
                            {idx + 1}. {ci.brandName}
                          </td>
                          <td style={{ padding: '0.65rem 0.35rem', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                            {ci.batchNumber}
                          </td>
                          <td style={{ padding: '0.65rem 0.35rem', fontSize: '0.75rem' }}>
                            {formatDateDDMMYYYY(ci.expiryDate)}
                          </td>
                          <td style={{ padding: '0.65rem 0.35rem', textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                              <button
                                onClick={(e) => { e.stopPropagation(); updateCartQuantity(idx, ci.quantity - 1); }}
                                style={{ width: '20px', height: '20px', border: '1px solid #CBD5E1', background: '#FFFFFF', cursor: 'pointer', borderRadius: '3px' }}
                              >
                                <Minus size={10} />
                              </button>
                              <span style={{ fontWeight: 900, minWidth: '22px', textAlign: 'center' }}>{ci.quantity}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const medBatches = batches.filter((b) => b.medicineId === ci.medicineId && b.status !== 'Quarantined');
                                  const totalAvailableBoxes = medBatches.reduce(
                                    (sum, b) => sum + (b.totalBoxesAvailable !== undefined ? b.totalBoxesAvailable : Math.floor((b.totalTabletsAvailable || 0) / (ci.tabletsPerBox || 20))),
                                    0
                                  );
                                  if (ci.quantity + 1 > totalAvailableBoxes) {
                                    setWarningMsg(`Stock Limit Exceeded: Only ${totalAvailableBoxes} Box(es) available in stock for "${ci.brandName}".`);
                                    return;
                                  }
                                  updateCartQuantity(idx, ci.quantity + 1);
                                }}
                                style={{ width: '20px', height: '20px', border: '1px solid #CBD5E1', background: '#FFFFFF', cursor: 'pointer', borderRadius: '3px' }}
                              >
                                <Plus size={10} />
                              </button>
                            </div>
                          </td>
                          <td style={{ padding: '0.65rem 0.35rem', textAlign: 'right' }}>{rate.toFixed(2)}</td>
                          <td style={{ padding: '0.65rem 0.35rem', textAlign: 'right' }}>{gross.toFixed(2)}</td>
                          <td style={{ padding: '0.65rem 0.35rem', textAlign: 'right', color: discP > 0 ? '#059669' : '#64748B' }}>
                            {discP.toFixed(1)}%
                          </td>
                          {taxCfg.enableSaleTax !== false && (
                            <td style={{ padding: '0.65rem 0.35rem', textAlign: 'right', fontSize: '0.75rem' }}>{stAmt.toFixed(2)}</td>
                          )}
                          {taxCfg.enableAdTax !== false && (
                            <td style={{ padding: '0.65rem 0.35rem', textAlign: 'right', fontSize: '0.75rem' }}>{adtAmt.toFixed(2)}</td>
                          )}
                          {taxCfg.enableAdvTax !== false && (
                            <td style={{ padding: '0.65rem 0.35rem', textAlign: 'right', fontSize: '0.75rem' }}>{advtAmt.toFixed(2)}</td>
                          )}
                          <td style={{ padding: '0.65rem 0.35rem', textAlign: 'right', fontWeight: 900, color: '#059669' }}>
                            {netAmt.toFixed(2)}
                          </td>
                          <td style={{ padding: '0.65rem 0.35rem', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '0.2rem', justifyContent: 'center' }}>
                              <button
                                onClick={(e) => { e.stopPropagation(); setEditingCartItemIndex(idx); }}
                                style={{ background: 'none', border: 'none', color: '#0284C7', cursor: 'pointer' }}
                                title="Edit Line Discount & Taxes"
                              >
                                <Edit3 size={14} />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); removeFromCart(idx); }}
                                style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="12" style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#64748B', fontSize: '0.9rem' }}>
                        Cart is empty. Type in search bar above and press <strong>Enter ↵</strong> to add items.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PROMINENT CASH COUNTER & PAYMENT CONTROLS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflow: 'hidden' }}>
          
          {/* CASH COUNTER PANEL */}
          <div className="card" style={{ padding: '1rem', backgroundColor: '#F0F9FF', border: '2px solid #0284C7', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 900, color: '#0369A1', margin: 0, borderBottom: '1.5px solid #BAE6FD', paddingBottom: '0.4rem' }}>
              💳 Commercial Cash Counter
            </h3>

            {/* Subtotal & Tax Breakdown */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.825rem', fontWeight: 600, color: '#475569' }}>Gross Subtotal:</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>Rs. {calculations.grossSubtotal.toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#0369A1' }}>
              <span>Total Taxes:</span>
              <span style={{ fontWeight: 800 }}>+ Rs. {calculations.totalTaxes.toFixed(2)}</span>
            </div>

            {/* Overall Order Discount Selector */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Extra Order Disc:</span>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                  style={{ padding: '0.15rem', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid #CBD5E1', fontWeight: 700 }}
                >
                  <option value="percentage">%</option>
                  <option value="rupees">Rs.</option>
                </select>
              </div>
              <input
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(Math.max(0, Number(e.target.value)))}
                style={{ width: '80px', padding: '0.25rem 0.4rem', textAlign: 'right', fontSize: '0.85rem', fontWeight: 700, borderRadius: '4px', border: '1px solid #CBD5E1' }}
              />
            </div>

            {/* PROMINENT NET TOTAL BADGE INCLUDING TAXES */}
            <div style={{ backgroundColor: '#0284C7', color: '#FFFFFF', padding: '0.75rem 1rem', borderRadius: '8px', boxShadow: '0 4px 10px rgba(2, 132, 199, 0.25)', margin: '0.35rem 0' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', opacity: 0.9 }}>
                FINAL BILL INCLUDING APPLIED TAXES
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#E0F2FE' }}>Rs. {calculations.netTotal.toFixed(2)}</div>
            </div>

            {/* DUAL SEPARATE WARRANTY CHECKBOXES FOR INVOICE */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', backgroundColor: '#FFFFFF', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1.5px solid #0284C7', marginTop: '0.2rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#0369A1' }}>📜 Legal Warranty Inclusions for A4 Invoice:</span>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', fontSize: '0.775rem', fontWeight: 700, color: '#1F2937' }}>
                <input
                  type="checkbox"
                  checked={includeDrugActWarranty}
                  onChange={(e) => setIncludeDrugActWarranty(e.target.checked)}
                  style={{ width: '15px', height: '15px', cursor: 'pointer', accentColor: '#0284C7' }}
                />
                <span>Include Section 23 Drug Act 1976 Warranty (Form 2A)</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', fontSize: '0.775rem', fontWeight: 700, color: '#1F2937' }}>
                <input
                  type="checkbox"
                  checked={includeDrapWarranty}
                  onChange={(e) => setIncludeDrapWarranty(e.target.checked)}
                  style={{ width: '15px', height: '15px', cursor: 'pointer', accentColor: '#0284C7' }}
                />
                <span>Include DRAP 2014 Alternative Medicines Warranty</span>
              </label>
            </div>

            {/* Complete Checkout Button */}
            <button
              onClick={handleCheckoutClick}
              disabled={cart.length === 0}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', fontSize: '1.05rem', fontWeight: 900, backgroundColor: '#0284C7', color: '#FFFFFF', marginTop: '0.2rem', boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }}
            >
              <CheckCircle size={20} /> [Generate A4 Tax Invoice]
            </button>
          </div>
        </div>
      </div>

      {/* Customer Details Modal */}
      {showCustomerModal && (
        <CustomerDetailsModal
          customerDetails={customerDetails}
          onSave={(updatedDetails) => setCustomerDetails(updatedDetails)}
          onClose={() => setShowCustomerModal(false)}
        />
      )}

      {/* Cart Item Edit Modal */}
      {editingCartItemIndex !== null && cart[editingCartItemIndex] && (
        <CartItemEditModal
          item={cart[editingCartItemIndex]}
          onSave={handleSaveCartItemEdit}
          onClose={() => setEditingCartItemIndex(null)}
        />
      )}

      {/* A4 Invoice Print Modal */}
      {showA4Modal && lastCompletedSale && (
        <A4InvoicePrintModal
          invoice={lastCompletedSale}
          onClose={() => setShowA4Modal(false)}
        />
      )}

      {/* Sales Return Modal */}
      {showReturnModal && (
        <SalesReturnModal
          onClose={() => setShowReturnModal(false)}
        />
      )}

      {/* Alert Warning Modal for 6-Month Expiry Block */}
      <AlertWarningModal
        isOpen={!!warningMsg}
        title="Expiry Date Exceeded Warning"
        message={warningMsg}
        onClose={() => setWarningMsg('')}
      />
    </div>
  );
};

export default POSPage;
