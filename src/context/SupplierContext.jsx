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
        if (Array.isArray(parsed)) return parsed;
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
    return [];
  });

  const [rtvNotes, setRtvNotes] = useState(() => {
    const saved = localStorage.getItem('pharmalink_pk_rtv_notes');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error('Failed to parse saved RTV notes', e);
      }
    }
    return [];
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

  useEffect(() => {
    try {
      localStorage.setItem('pharmalink_pk_rtv_notes', JSON.stringify(rtvNotes));
    } catch (e) {
      console.error('Failed to save RTV notes to localStorage', e);
    }
  }, [rtvNotes]);

  // Helper to generate PO Number: PO-YYYYMMDD-XXXX
  const generatePONumber = () => {
    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const seq = String(purchaseOrders.length + 1).padStart(4, '0');
    return `PO-${dateStr}-${seq}`;
  };

  // Helper to generate RTV Debit Note Number: RTV-YYYYMMDD-XXXX
  const generateRTVNumber = () => {
    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const seq = String(rtvNotes.length + 1).padStart(4, '0');
    return `RTV-${dateStr}-${seq}`;
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
    const now = new Date();
    const formattedTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const totAmount = (Number(poData.quantity) || 1) * (Number(poData.purchasePriceBox) || 0);
    const amtPaid = poData.amountPaid !== undefined ? Number(poData.amountPaid) : (poData.paymentStatus === 'PAID_IN_FULL' ? totAmount : 0);
    const remDebt = poData.remainingDebt !== undefined ? Number(poData.remainingDebt) : (totAmount - amtPaid);
    const statusTag = poData.paymentStatus || (remDebt <= 0 ? 'PAID_IN_FULL' : 'DEBT_OWING');

    const newPo = {
      poNumber: poData.poNumber || generatePONumber(),
      distributorName: poData.distributorName || 'Muller & Phipps Pakistan',
      inwardDate: poData.inwardDate || new Date().toISOString().split('T')[0],
      createdAt: poData.createdAt || `${formatDateDDMMYYYY(now)} ${formattedTime}`,
      createdBy: poData.createdBy || 'Husnain Ali',
      brandName: poData.brandName || 'Medicine',
      genericFormula: poData.genericFormula || 'Formula',
      batchNumber: poData.batchNumber || `BAT-${Date.now().toString().slice(-4)}`,
      expiryDate: poData.expiryDate || '2027-12-31',
      quantity: Number(poData.quantity) || 1,
      boxPrice: Number(poData.boxPrice) || 0,
      purchasePriceBox: Number(poData.purchasePriceBox) || 0,
      totalAmount: totAmount,
      amountPaid: amtPaid,
      remainingDebt: remDebt,
      paymentStatus: statusTag,
      items: poData.items || undefined,
    };

    setPurchaseOrders((prev) => [newPo, ...prev]);

    // Automatically update supplier's outstanding debt balance if remaining debt > 0
    if (remDebt > 0 && poData.distributorName) {
      setSuppliers((prev) =>
        prev.map((s) => {
          if ((s.companyName || s.name || '').toLowerCase().trim() === poData.distributorName.toLowerCase().trim()) {
            const cur = s.pendingBalance !== undefined ? s.pendingBalance : (s.outstandingBalance || 0);
            const updatedBal = cur + remDebt;
            return { ...s, pendingBalance: updatedBal, outstandingBalance: updatedBal };
          }
          return s;
        })
      );
    }

    // Log payment entry if initial cash amount was paid
    if (amtPaid > 0 && poData.distributorName) {
      const distName = poData.distributorName;
      setSuppliers((prev) =>
        prev.map((s) => {
          if ((s.companyName || s.name || '').toLowerCase().trim() === distName.toLowerCase().trim()) {
            const cur = s.pendingBalance !== undefined ? s.pendingBalance : (s.outstandingBalance || 0);
            const newLog = {
              id: `PAY-PO-${Date.now()}`,
              date: formatDateDDMMYYYY(now),
              time: formattedTime,
              amountPaid: amtPaid,
              paymentMode: 'Cash',
              note: `Initial PO Cash Deposit (${newPo.poNumber})`,
              remainingBalance: cur,
              remainingBalanceAfter: cur,
            };
            return {
              ...s,
              paymentLogs: [newLog, ...(Array.isArray(s.paymentLogs) ? s.paymentLogs : [])],
            };
          }
          return s;
        })
      );
    }

    return newPo;
  };

  const createRtvNote = (rtvData) => {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const rtvNo = rtvData.rtvNumber || generateRTVNumber();
    const refundAmt = Number(rtvData.agreedRefundAmount) || 0;

    const newRtv = {
      id: `RTV-${Date.now()}`,
      rtvNumber: rtvNo,
      distributorName: rtvData.distributorName || 'Pharma Supplier',
      supplierId: rtvData.supplierId || '',
      date: rtvData.date || new Date().toISOString().split('T')[0],
      time: formattedTime,
      createdAt: `${formatDateDDMMYYYY(now)} ${formattedTime}`,
      createdBy: rtvData.createdBy || 'Dr. Idrees',
      brandName: rtvData.brandName || 'Near-Expiry Medicine',
      genericFormula: rtvData.genericFormula || '',
      batchNumber: rtvData.batchNumber || '',
      expiryDate: rtvData.expiryDate || '',
      returnedBoxes: Number(rtvData.returnedBoxes) || 1,
      agreedRefundAmount: refundAmt,
      reason: rtvData.reason || 'Near Expiry Stock Return',
    };

    setRtvNotes((prev) => [newRtv, ...prev]);

    // Automatically reduce supplier balance by agreed refund amount
    if (refundAmt > 0 && rtvData.distributorName) {
      setSuppliers((prev) =>
        prev.map((s) => {
          if ((s.companyName || s.name || '').toLowerCase().trim() === rtvData.distributorName.toLowerCase().trim() || s.id === rtvData.supplierId) {
            const currentBal = s.pendingBalance !== undefined ? s.pendingBalance : (s.outstandingBalance || 0);
            const newBal = Math.max(0, currentBal - refundAmt);
            const newLog = {
              id: `RTV-CREDIT-${Date.now()}`,
              date: formatDateDDMMYYYY(now),
              time: formattedTime,
              amountPaid: refundAmt,
              paymentMode: 'RTV Credit Note',
              note: `Stock Return Debit Note (${rtvNo}): ${newRtv.brandName} (${newRtv.returnedBoxes} Boxes)`,
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
    }

    return newRtv;
  };

  return (
    <SupplierContext.Provider
      value={{
        suppliers,
        purchaseOrders,
        rtvNotes,
        addSupplier,
        clearSupplierBalance,
        recordSupplierPayment,
        createPurchaseOrder,
        generatePONumber,
        createRtvNote,
        generateRTVNumber,
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
