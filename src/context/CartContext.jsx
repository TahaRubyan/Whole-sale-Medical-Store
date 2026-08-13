import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { useInventory } from './InventoryContext';
import { useSales } from './SalesContext';
import { getTaxConfig } from '../data/mockData';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { deductStock } = useInventory();
  const { recordSale } = useSales();

  // Dynamic system-wide tax configuration
  const globalTaxes = getTaxConfig();

  // Persistent state for cart items so navigating screens doesn't clear cart
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('pharmalink_pos_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [customerName, setCustomerName] = useState(() => localStorage.getItem('pharmalink_pos_cust') || '');
  const [doctorName, setDoctorName] = useState(() => localStorage.getItem('pharmalink_pos_doc') || '');
  const [saleType, setSaleType] = useState('Bulk'); // Wholesale Bulk Standard
  const [discountType, setDiscountType] = useState('percentage'); // 'percentage' | 'rupees'
  const [discountValue, setDiscountValue] = useState(0);
  const [paymentMode, setPaymentMode] = useState('Cash'); // 'Cash' | 'Card' | 'Mobile Banking' | 'Bank Transfer'
  const [cashTendered, setCashTendered] = useState('');
  const [lastCompletedSale, setLastCompletedSale] = useState(null);

  // Sync cart to localStorage
  useEffect(() => {
    localStorage.setItem('pharmalink_pos_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('pharmalink_pos_cust', customerName);
  }, [customerName]);

  useEffect(() => {
    localStorage.setItem('pharmalink_pos_doc', doctorName);
  }, [doctorName]);

  const addToCart = (medicine, batch, unitSelection = 'Box') => {
    const currentGlobalTaxes = getTaxConfig();
    const isSaleTaxEnabled = currentGlobalTaxes.enableSaleTax !== false;
    const isAdTaxEnabled = currentGlobalTaxes.enableAdTax !== false;
    const isAdvTaxEnabled = currentGlobalTaxes.enableAdvTax !== false;

    setCart((prev) => {
      const existing = prev.find((i) => i.medicineId === medicine.id && i.batchNumber === batch.batchNumber);
      const unitPrice = Number(batch.boxPrice || medicine.boxPrice || 600);

      if (existing) {
        const nextQty = existing.quantity + 1;
        const gross = nextQty * unitPrice;
        const discP = existing.discPercent || 0;
        const discAmt = gross * (discP / 100);
        const discountedGross = gross - discAmt;

        const stP = isSaleTaxEnabled ? (existing.saleTaxPercent !== undefined ? existing.saleTaxPercent : Number(currentGlobalTaxes.saleTaxPercent || 18)) : 0;
        const adtP = isAdTaxEnabled ? (existing.adTaxPercent !== undefined ? existing.adTaxPercent : Number(currentGlobalTaxes.adTaxPercent || 4)) : 0;
        const advtP = isAdvTaxEnabled ? (existing.advTaxPercent !== undefined ? existing.advTaxPercent : Number(currentGlobalTaxes.advTaxPercent || 0.5)) : 0;

        const stAmt = discountedGross * (stP / 100);
        const adtAmt = discountedGross * (adtP / 100);
        const advtAmt = discountedGross * (advtP / 100);
        const lineTotal = discountedGross + stAmt + adtAmt + advtAmt;

        return prev.map((i) =>
          i.medicineId === medicine.id && i.batchNumber === batch.batchNumber
            ? {
                ...i,
                quantity: nextQty,
                gross,
                discAmount: discAmt,
                saleTaxPercent: stP,
                saleTaxAmt: stAmt,
                adTaxPercent: adtP,
                adTaxAmt: adtAmt,
                advTaxPercent: advtP,
                advTaxAmt: advtAmt,
                total: lineTotal
              }
            : i
        );
      } else {
        const qty = 1;
        const gross = qty * unitPrice;
        const discP = 0;
        const discAmt = 0;
        const discountedGross = gross;

        const stP = isSaleTaxEnabled ? Number(currentGlobalTaxes.saleTaxPercent || 18) : 0;
        const adtP = isAdTaxEnabled ? Number(currentGlobalTaxes.adTaxPercent || 4) : 0;
        const advtP = isAdvTaxEnabled ? Number(currentGlobalTaxes.advTaxPercent || 0.5) : 0;

        const stAmt = discountedGross * (stP / 100);
        const adtAmt = discountedGross * (adtP / 100);
        const advtAmt = discountedGross * (advtP / 100);
        const lineTotal = discountedGross + stAmt + adtAmt + advtAmt;

        return [
          ...prev,
          {
            medicineId: medicine.id,
            itemCode: medicine.id,
            brandName: medicine.brandName,
            genericFormula: medicine.genericFormula,
            requiresPrescription: medicine.requiresPrescription,
            tabletsPerBox: medicine.tabletsPerBox,
            batchNumber: batch.batchNumber,
            expiryDate: batch.expiryDate || '2028-12-31',
            unitSelection: 'Box',
            unitPrice,
            quantity: qty,
            gross,
            discPercent: discP,
            discAmount: discAmt,
            saleTaxPercent: stP,
            saleTaxAmt: stAmt,
            adTaxPercent: adtP,
            adTaxAmt: adtAmt,
            advTaxPercent: advtP,
            advTaxAmt: advtAmt,
            total: lineTotal,
          },
        ];
      }
    });
  };

  const updateCartQuantity = (index, qty) => {
    const currentGlobalTaxes = getTaxConfig();
    const isSaleTaxEnabled = currentGlobalTaxes.enableSaleTax !== false;
    const isAdTaxEnabled = currentGlobalTaxes.enableAdTax !== false;
    const isAdvTaxEnabled = currentGlobalTaxes.enableAdvTax !== false;

    const q = Math.max(1, Number(qty) || 1);
    setCart((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;

        const gross = q * item.unitPrice;
        const discP = item.discPercent || 0;
        const discAmt = gross * (discP / 100);
        const discountedGross = gross - discAmt;

        const stP = isSaleTaxEnabled ? (item.saleTaxPercent !== undefined ? item.saleTaxPercent : 18) : 0;
        const adtP = isAdTaxEnabled ? (item.adTaxPercent !== undefined ? item.adTaxPercent : 4) : 0;
        const advtP = isAdvTaxEnabled ? (item.advTaxPercent !== undefined ? item.advTaxPercent : 0.5) : 0;

        const stAmt = discountedGross * (stP / 100);
        const adtAmt = discountedGross * (adtP / 100);
        const advtAmt = discountedGross * (advtP / 100);
        const lineTotal = discountedGross + stAmt + adtAmt + advtAmt;

        return {
          ...item,
          quantity: q,
          gross,
          discAmount: discAmt,
          saleTaxPercent: stP,
          saleTaxAmt: stAmt,
          adTaxPercent: adtP,
          adTaxAmt: adtAmt,
          advTaxPercent: advtP,
          advTaxAmt: advtAmt,
          total: lineTotal
        };
      })
    );
  };

  const removeFromCart = (index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    setCart([]);
    setCustomerName('');
    setDoctorName('');
    setDiscountValue(0);
    setCashTendered('');
    localStorage.removeItem('pharmalink_pos_cart');
    localStorage.removeItem('pharmalink_pos_cust');
    localStorage.removeItem('pharmalink_pos_doc');
  };

  // Comprehensive calculations including Gross Subtotal, Line Taxes & Final Net Bill
  const calculations = useMemo(() => {
    const taxCfg = getTaxConfig();
    const isSaleTaxEnabled = taxCfg.enableSaleTax !== false;
    const isAdTaxEnabled = taxCfg.enableAdTax !== false;
    const isAdvTaxEnabled = taxCfg.enableAdvTax !== false;

    const grossSubtotal = cart.reduce((sum, item) => sum + (item.gross || item.total), 0);
    const lineDiscounts = cart.reduce((sum, item) => sum + (item.discAmount || 0), 0);
    const subtotalAfterLineDiscounts = grossSubtotal - lineDiscounts;

    const totalSaleTax = isSaleTaxEnabled ? cart.reduce((sum, item) => sum + (item.saleTaxAmt || 0), 0) : 0;
    const totalAdTax = isAdTaxEnabled ? cart.reduce((sum, item) => sum + (item.adTaxAmt || 0), 0) : 0;
    const totalAdvTax = isAdvTaxEnabled ? cart.reduce((sum, item) => sum + (item.advTaxAmt || 0), 0) : 0;
    const totalTaxes = totalSaleTax + totalAdTax + totalAdvTax;

    let extraOrderDiscount = 0;
    if (discountType === 'percentage') {
      extraOrderDiscount = (subtotalAfterLineDiscounts * (Number(discountValue) || 0)) / 100;
    } else {
      extraOrderDiscount = Math.min(subtotalAfterLineDiscounts, Number(discountValue) || 0);
    }

    // Final Net Total Bill including 18% Sale Tax, 4% AdTax, 0.5% Adv Tax
    const netTotal = Math.max(0, subtotalAfterLineDiscounts + totalTaxes - extraOrderDiscount);
    const tendered = Number(cashTendered) || 0;
    const change = Math.max(0, tendered - netTotal);

    return {
      subtotal: subtotalAfterLineDiscounts,
      grossSubtotal,
      lineDiscounts,
      totalSaleTax,
      totalAdTax,
      totalAdvTax,
      totalTaxes,
      discountAmount: extraOrderDiscount,
      netTotal,
      tendered,
      change,
    };
  }, [cart, discountType, discountValue, cashTendered]);

  const processCheckout = (extraDetails = {}) => {
    if (cart.length === 0) {
      return false;
    }

    const invoiceNo = `DJ-${Math.floor(1000000 + Math.random() * 9000000)}`;
    const saleOrderNo = `0${Math.floor(100000 + Math.random() * 900000)}`;
    const dssId = `${Math.floor(1000000 + Math.random() * 9000000)}`;
    const now = new Date();
    const todayFormatted = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;

    const saleRecord = {
      invoiceNo,
      saleOrderNo,
      dssId,
      date: todayFormatted,
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      saleOrderType: 'REGULAR',
      cashierName: 'Husnain Ali',
      customerName: extraDetails.customerName !== undefined ? extraDetails.customerName : customerName,
      region: extraDetails.region !== undefined ? extraDetails.region : '',
      customerPhone: extraDetails.customerPhone !== undefined ? extraDetails.customerPhone : '',
      customerAddress: extraDetails.address !== undefined ? extraDetails.address : '',
      customerLicenseNo: extraDetails.customerLicenseNo !== undefined ? extraDetails.customerLicenseNo : '',
      customerNtn: extraDetails.customerNtn !== undefined ? extraDetails.customerNtn : '',
      customerGst: extraDetails.customerGst !== undefined ? extraDetails.customerGst : '',
      fbrStatus: extraDetails.fbrStatus !== undefined ? extraDetails.fbrStatus : '',
      bookingMan: extraDetails.bookingMan !== undefined ? extraDetails.bookingMan : '',
      referenceNo: extraDetails.referenceNo !== undefined ? extraDetails.referenceNo : '',
      deliveryMan: extraDetails.deliveryMan !== undefined ? extraDetails.deliveryMan : '',
      shipTo: extraDetails.shipTo !== undefined ? extraDetails.shipTo : '',
      paymentStatus: extraDetails.paymentStatus || 'UNPAID_CREDIT',
      remainingDebt: extraDetails.paymentStatus === 'PAID' ? 0 : calculations.netTotal,
      paymentLogs: extraDetails.paymentStatus === 'PAID' ? [{ date: todayFormatted, time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), amountPaid: calculations.netTotal, paymentMode: 'Cash', note: 'Counter Full Settlement', remainingDebtAfter: 0 }] : [],
      includeDrugActWarranty: extraDetails.includeDrugActWarranty !== undefined ? extraDetails.includeDrugActWarranty : true,
      includeDrapWarranty: extraDetails.includeDrapWarranty !== undefined ? extraDetails.includeDrapWarranty : true,
      items: [...cart],
      grossSubtotal: calculations.grossSubtotal,
      subtotal: calculations.subtotal,
      totalSaleTax: calculations.totalSaleTax,
      totalAdTax: calculations.totalAdTax,
      totalAdvTax: calculations.totalAdvTax,
      totalTaxes: calculations.totalTaxes,
      discount: calculations.discountAmount,
      netTotal: calculations.netTotal,
      tendered: calculations.tendered,
      change: calculations.change,
      paymentMode,
    };

    deductStock(cart);
    recordSale(saleRecord);
    setLastCompletedSale(saleRecord);
    clearCart();

    // Clean checkout without native browser alert pop-up!
    return saleRecord;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        setCart,
        customerName,
        setCustomerName,
        doctorName,
        setDoctorName,
        saleType,
        setSaleType,
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
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
