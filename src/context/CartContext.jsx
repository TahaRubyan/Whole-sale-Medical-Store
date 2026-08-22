import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { getTaxConfig } from '../data/mockData';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('pharmalink_pos_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [customerName, setCustomerName] = useState(() => {
    return localStorage.getItem('pharmalink_pos_cust') || '';
  });

  const [doctorName, setDoctorName] = useState(() => {
    return localStorage.getItem('pharmalink_pos_doc') || '';
  });

  const [saleType, setSaleType] = useState('wholesale');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState(0);
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [cashTendered, setCashTendered] = useState('');
  const [lastCompletedSale, setLastCompletedSale] = useState(null);
  const [taxConfigVersion, setTaxConfigVersion] = useState(0);

  useEffect(() => {
    localStorage.setItem('pharmalink_pos_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('pharmalink_pos_cust', customerName);
  }, [customerName]);

  useEffect(() => {
    localStorage.setItem('pharmalink_pos_doc', doctorName);
  }, [doctorName]);

  useEffect(() => {
    const handleTaxUpdate = () => {
      setTaxConfigVersion((v) => v + 1);
    };
    window.addEventListener('tax_config_updated', handleTaxUpdate);
    return () => window.removeEventListener('tax_config_updated', handleTaxUpdate);
  }, []);

  const addToCart = (medicine, batch, unitSelection = 'Box') => {
    const currentGlobalTaxes = getTaxConfig();
    const isSaleTaxEnabled = currentGlobalTaxes.enableSaleTax !== false;
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
        const advtP = isAdvTaxEnabled ? (existing.advTaxPercent !== undefined ? existing.advTaxPercent : Number(currentGlobalTaxes.advTaxPercent || 0.5)) : 0;

        const stAmt = discountedGross * (stP / 100);
        const advtAmt = discountedGross * (advtP / 100);
        const lineTotal = discountedGross + stAmt + advtAmt;

        return prev.map((i) =>
          i.medicineId === medicine.id && i.batchNumber === batch.batchNumber
            ? {
                ...i,
                quantity: nextQty,
                gross,
                discAmount: discAmt,
                saleTaxPercent: stP,
                saleTaxAmt: stAmt,
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
        const advtP = isAdvTaxEnabled ? Number(currentGlobalTaxes.advTaxPercent !== undefined ? currentGlobalTaxes.advTaxPercent : 0.5) : 0;

        const stAmt = discountedGross * (stP / 100);
        const advtAmt = discountedGross * (advtP / 100);
        const lineTotal = discountedGross + stAmt + advtAmt;

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
        const advtP = isAdvTaxEnabled ? (item.advTaxPercent !== undefined ? item.advTaxPercent : 0.5) : 0;

        const stAmt = discountedGross * (stP / 100);
        const advtAmt = discountedGross * (advtP / 100);
        const lineTotal = discountedGross + stAmt + advtAmt;

        return {
          ...item,
          quantity: q,
          gross,
          discAmount: discAmt,
          saleTaxPercent: stP,
          saleTaxAmt: stAmt,
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
    const isAdvTaxEnabled = taxCfg.enableAdvTax !== false;

    const grossSubtotal = cart.reduce((sum, item) => sum + (item.gross || item.total), 0);
    const lineDiscounts = cart.reduce((sum, item) => sum + (item.discAmount || 0), 0);
    const subtotalAfterLineDiscounts = grossSubtotal - lineDiscounts;

    const totalSaleTax = isSaleTaxEnabled ? cart.reduce((sum, item) => sum + (item.saleTaxAmt || 0), 0) : 0;
    const totalAdvTax = isAdvTaxEnabled ? cart.reduce((sum, item) => sum + (item.advTaxAmt || 0), 0) : 0;
    const totalTaxes = totalSaleTax + totalAdvTax;

    let extraOrderDiscount = 0;
    if (discountType === 'percentage') {
      extraOrderDiscount = (subtotalAfterLineDiscounts * (Number(discountValue) || 0)) / 100;
    } else {
      extraOrderDiscount = Math.min(subtotalAfterLineDiscounts, Number(discountValue) || 0);
    }

    // Final Net Total Bill including Sale Tax (18%) and Adv Tax (0.5%)
    const netTotal = Math.max(0, subtotalAfterLineDiscounts + totalTaxes - extraOrderDiscount);
    const tendered = Number(cashTendered) || 0;
    const change = Math.max(0, tendered - netTotal);

    return {
      subtotal: subtotalAfterLineDiscounts,
      grossSubtotal,
      lineDiscounts,
      totalSaleTax,
      totalAdvTax,
      totalTaxes,
      discountAmount: extraOrderDiscount,
      netTotal,
      tendered,
      change,
    };
  }, [cart, discountType, discountValue, cashTendered, taxConfigVersion]);

  const processCheckout = (extraDetails = {}) => {
    if (cart.length === 0) {
      return false;
    }

    const details = extraDetails || {};
    const now = new Date();
    const dateTag = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;
    const uniqueSeq = `${Date.now().toString().slice(-4)}${Math.floor(10 + Math.random() * 90)}`;
    const invoiceNo = `INV-${dateTag}-${uniqueSeq}`;
    const saleOrderNo = `SO-${dateTag}-${uniqueSeq}`;
    const dssId = `DSS-${dateTag}-${uniqueSeq}`;
    const todayFormatted = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;

    const saleRecord = {
      id: Date.now().toString(),
      invoiceNo,
      saleOrderNo,
      dssId,
      date: now.toISOString().split('T')[0],
      dueDate: details.dueDate || now.toISOString().split('T')[0],
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      cashierName: user?.name || 'Hassan (Cashier)',
      customerId: details.customerId || 'WALK-IN',
      customerName: details.customerName || customerName || 'Walk-in Commercial Customer',
      customerAddress: details.customerAddress || 'Local Market, Commercial Zone',
      customerPhone: details.customerPhone || '0300-1234567',
      customerNtn: details.customerNtn || '',
      customerStrn: details.customerStrn || '',
      doctorName: doctorName || '-',
      saleType,
      region: details.region || 'North Region',
      deliveryMan: details.deliveryMan !== undefined ? details.deliveryMan : '',
      shipTo: details.shipTo !== undefined ? details.shipTo : '',
      paymentStatus: details.paymentStatus || 'UNPAID_CREDIT',
      remainingDebt: details.paymentStatus === 'PAID' ? 0 : calculations.netTotal,
      paymentLogs: details.paymentStatus === 'PAID' ? [{ date: todayFormatted, time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), amountPaid: calculations.netTotal, paymentMode: 'Cash', note: 'Counter Full Settlement', remainingDebtAfter: 0 }] : [],
      includeDrugActWarranty: details.includeDrugActWarranty !== undefined ? details.includeDrugActWarranty : true,
      includeDrapWarranty: details.includeDrapWarranty !== undefined ? details.includeDrapWarranty : true,
      items: [...cart],
      grossSubtotal: calculations.grossSubtotal,
      subtotal: calculations.subtotal,
      totalSaleTax: calculations.totalSaleTax,
      totalAdvTax: calculations.totalAdvTax,
      totalTaxes: calculations.totalTaxes,
      discount: calculations.discountAmount,
      netTotal: calculations.netTotal,
      tendered: calculations.tendered,
      change: calculations.change,
      paymentMode,
    };

    setLastCompletedSale(saleRecord);
    clearCart();

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
        setLastCompletedSale,
        calculations,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        processCheckout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
export default CartContext;
