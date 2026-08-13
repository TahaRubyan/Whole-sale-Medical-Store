import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_SUPPLIERS } from '../data/mockData';
import { formatDateDDMMYYYY } from '../utils/dateUtils';

const SupplierContext = createContext();

export const SupplierProvider = ({ children }) => {
  const [suppliers, setSuppliers] = useState(() => {
    const saved = localStorage.getItem('pharmalink_pk_suppliers');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Failed to parse saved suppliers', e);
      }
    }
    return INITIAL_SUPPLIERS;
  });

  const [purchaseOrders, setPurchaseOrders] = useState(() => {
    const saved = localStorage.getItem('pharmalink_pk_purchase_orders');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error('Failed to parse saved purchase orders', e);
      }
    }
    return [
      {
        poNumber: "PO-20260801-0101",
        distributorName: "Muller & Phipps Pakistan",
        inwardDate: "2026-08-01",
        brandName: "Panadol 500mg",
        genericFormula: "Paracetamol 500mg",
        batchNumber: "B26-Pan-01",
        expiryDate: "2027-06-30",
        quantity: 200,
        boxPrice: 600,
        purchasePriceBox: 480,
        totalAmount: 96000,
      },
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('pharmalink_pk_suppliers', JSON.stringify(suppliers));
    } catch (e) {
      console.error('Failed to save suppliers to localStorage', e);
    }
  }, [suppliers]);

  useEffect(() => {
    try {
      localStorage.setItem('pharmalink_pk_purchase_orders', JSON.stringify(purchaseOrders));
    } catch (e) {
      console.error('Failed to save purchase orders to localStorage', e);
    }
  }, [purchaseOrders]);

  // Helper to generate PO Number: PO-YYYYMMDD-XXXX
  const generatePONumber = () => {
    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const seq = String(purchaseOrders.length + 1).padStart(4, '0');
    return `PO-${dateStr}-${seq}`;
  };

  const addSupplier = (supplierData) => {
    const newId = `SUP-${Date.now().toString().slice(-4)}`;
    const newSupplier = {
      id: newId,
      companyName: supplierData.companyName || supplierData.distributorName || supplierData.name || 'New Supplier',
      contactPerson: supplierData.contactPerson || '-',
      phone: supplierData.phone || '-',
      email: supplierData.email || '-',
      gstin: supplierData.gstin || 'PK-0000000-0',
      city: supplierData.city || 'Lahore',
      pendingBalance: Number(supplierData.pendingBalance) || 0,
      outstandingBalance: Number(supplierData.pendingBalance) || 0,
    };
    setSuppliers((prev) => [...prev, newSupplier]);
    return newSupplier;
  };

  const recordSupplierPayment = (supplierId, amountPaid, paymentMode = 'Cash', note = 'Supplier Debt Payment') => {
    const amount = Number(amountPaid) || 0;
    if (amount <= 0) return;

    setSuppliers((prev) =>
      prev.map((s) => {
        if (s.id === supplierId || s.companyName === supplierId || s.name === supplierId) {
          const currentBal = s.pendingBalance !== undefined ? s.pendingBalance : (s.outstandingBalance || 0);
          const newBal = Math.max(0, currentBal - amount);
          const now = new Date();
          const newLog = {
            id: `PAY-SUP-${Date.now()}`,
            date: formatDateDDMMYYYY(now),
            time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
            amountPaid: amount,
            paymentMode: paymentMode || 'Cash',
            note: note || 'Supplier Debt Payment',
            notes: note || 'Supplier Debt Payment',
            remainingBalance: newBal,
            remainingBalanceAfter: newBal,
          };
          return {
            ...s,
            pendingBalance: newBal,
            outstandingBalance: newBal,
            paymentLogs: [newLog, ...(Array.isArray(s.paymentLogs) ? s.paymentLogs : [])],
          };
        }
        return s;
      })
    );
  };

  const clearSupplierBalance = (supplierId, paymentAmount) => {
    const amountPaid = Number(paymentAmount) || 0;
    recordSupplierPayment(supplierId, amountPaid, 'Cash', 'Full Balance Settlement');
  };

  const createPurchaseOrder = (poData) => {
    const newPo = {
      poNumber: generatePONumber(),
      distributorName: poData.distributorName || 'Muller & Phipps Pakistan',
      inwardDate: poData.inwardDate || new Date().toISOString().split('T')[0],
      brandName: poData.brandName || 'Medicine',
      genericFormula: poData.genericFormula || 'Formula',
      batchNumber: poData.batchNumber || `BAT-${Date.now().toString().slice(-4)}`,
      expiryDate: poData.expiryDate || '2027-12-31',
      quantity: Number(poData.quantity) || 1,
      boxPrice: Number(poData.boxPrice) || 0,
      purchasePriceBox: Number(poData.purchasePriceBox) || 0,
      totalAmount: (Number(poData.quantity) || 1) * (Number(poData.purchasePriceBox) || 0),
    };
    setPurchaseOrders((prev) => [newPo, ...prev]);
    return newPo;
  };

  return (
    <SupplierContext.Provider
      value={{
        suppliers,
        purchaseOrders,
        addSupplier,
        clearSupplierBalance,
        recordSupplierPayment,
        createPurchaseOrder,
        generatePONumber,
      }}
    >
      {children}
    </SupplierContext.Provider>
  );
};

export const useSupplier = () => {
  const context = useContext(SupplierContext);
  if (!context) {
    throw new Error('useSupplier must be used within a SupplierProvider');
  }
  return context;
};

export default SupplierContext;
