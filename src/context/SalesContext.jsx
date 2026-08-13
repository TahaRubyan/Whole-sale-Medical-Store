import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_INVOICES } from '../data/mockData';

const SalesContext = createContext();

export const SalesProvider = ({ children }) => {
  const [invoices, setInvoices] = useState(() => {
    const saved = localStorage.getItem('pharmalink_pk_invoices');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Failed to parse saved invoices', e);
      }
    }
    return INITIAL_INVOICES;
  });

  const [returns, setReturns] = useState(() => {
    const saved = localStorage.getItem('pharmalink_pk_returns');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error('Failed to parse saved returns', e);
      }
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('pharmalink_pk_invoices', JSON.stringify(invoices));
    } catch (e) {
      console.error('Failed to save invoices to localStorage', e);
    }
  }, [invoices]);

  useEffect(() => {
    try {
      localStorage.setItem('pharmalink_pk_returns', JSON.stringify(returns));
    } catch (e) {
      console.error('Failed to save returns to localStorage', e);
    }
  }, [returns]);

  // Record a new POS Sale
  const recordSale = (saleData) => {
    setInvoices((prev) => [saleData, ...prev]);
  };

  // Process a Sales Return
  const recordReturn = (returnData) => {
    setReturns((prev) => [returnData, ...prev]);
  };

  // Helper to find invoice by Invoice No or Customer Phone
  const findInvoice = (query) => {
    if (!query) return null;
    const q = String(query).trim().toLowerCase();
    return invoices.find(
      (inv) =>
        inv.invoiceNo.toLowerCase() === q ||
        (inv.customerPhone && inv.customerPhone.toLowerCase() === q)
    );
  };

  // Record Debt Payment (Full or Partial Settlement)
  const recordDebtPayment = (invoiceNo, amountPaid, paymentMode = 'Cash', note = '') => {
    setInvoices((prevInvoices) => {
      return prevInvoices.map((inv) => {
        if (inv.invoiceNo === invoiceNo || inv.id === invoiceNo) {
          const originalNet = Number(inv.netTotal || inv.subtotal || 0);
          const currentDebt = inv.remainingDebt !== undefined ? Number(inv.remainingDebt) : originalNet;
          const paidNum = Number(amountPaid) || 0;
          const newRemaining = Math.max(0, currentDebt - paidNum);
          const isFullyCleared = newRemaining <= 0;

          const paymentEntry = {
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            amountPaid: paidNum,
            paymentMode,
            note: note || `Cash Settlement (Rs. ${paidNum})`,
            remainingDebtAfter: newRemaining,
          };

          return {
            ...inv,
            paymentStatus: isFullyCleared ? 'PAID' : (newRemaining < originalNet ? 'PARTIAL DEBT' : 'UNPAID_CREDIT'),
            remainingDebt: newRemaining,
            paymentLogs: [...(inv.paymentLogs || []), paymentEntry],
          };
        }
        return inv;
      });
    });
  };

  const markInvoiceAsPaid = (invoiceNo, paymentMode = 'Cash') => {
    const inv = findInvoice(invoiceNo);
    const amount = inv ? (inv.remainingDebt !== undefined ? inv.remainingDebt : inv.netTotal) : 0;
    recordDebtPayment(invoiceNo, amount, paymentMode, 'Full Settlement');
  };

  return (
    <SalesContext.Provider
      value={{
        invoices,
        returns,
        recordSale,
        recordReturn,
        findInvoice,
        recordDebtPayment,
        markInvoiceAsPaid,
      }}
    >
      {children}
    </SalesContext.Provider>
  );
};

export const useSales = () => {
  const context = useContext(SalesContext);
  if (!context) {
    throw new Error('useSales must be used within a SalesProvider');
  }
  return context;
};

export default SalesContext;
