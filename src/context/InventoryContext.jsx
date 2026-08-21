import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_MEDICINES, INITIAL_BATCHES } from '../data/mockData';

const InventoryContext = createContext();

const INITIAL_AUDIT_LOGS = [];

export const InventoryProvider = ({ children }) => {
  const [medicines, setMedicines] = useState(() => {
    const saved = localStorage.getItem('pharmalink_pk_medicines');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error('Failed to parse saved medicines', e);
      }
    }
    return INITIAL_MEDICINES;
  });

  const [batches, setBatches] = useState(() => {
    const saved = localStorage.getItem('pharmalink_pk_batches');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error('Failed to parse saved batches', e);
      }
    }
    return INITIAL_BATCHES;
  });

  const [auditLogs, setAuditLogs] = useState(() => {
    const saved = localStorage.getItem('pharmalink_pk_audit_logs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error('Failed to parse saved audit logs', e);
      }
    }
    return INITIAL_AUDIT_LOGS;
  });

  useEffect(() => {
    localStorage.setItem('pharmalink_pk_medicines', JSON.stringify(medicines));
  }, [medicines]);

  useEffect(() => {
    localStorage.setItem('pharmalink_pk_batches', JSON.stringify(batches));
  }, [batches]);

  useEffect(() => {
    localStorage.setItem('pharmalink_pk_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  const addAuditLog = (actionTitle, itemBrandName, details, type = 'INFO', performedBy = 'Dr. Idrees') => {
    const now = new Date();
    const timeStr = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const newLog = {
      id: `LOG-${Date.now().toString().slice(-6)}`,
      actionTitle,
      itemBrandName,
      details,
      performedBy,
      timestamp: timeStr,
      type,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Toggle Prescription Required (Rx) status for a medicine
  const togglePrescriptionRequirement = (medicineId) => {
    setMedicines((prevMeds) =>
      prevMeds.map((m) => {
        if (m.id === medicineId) {
          const newRxState = !m.requiresPrescription;
          addAuditLog('Rx Status Changed', m.brandName, `Prescription requirement set to ${newRxState ? 'Doctor Note Required (Rx)' : 'Over-the-Counter'}`, 'MODIFY', 'Dr. Idrees');
          return { ...m, requiresPrescription: newRxState };
        }
        return m;
      })
    );
  };

  // Deduct stock after a sale
  const deductStock = (cartItems) => {
    if (!cartItems || cartItems.length === 0) return;
    setBatches((prevBatches) => {
      return prevBatches.map((b) => {
        const match = cartItems.find((ci) => ci.batchNumber === b.batchNumber);
        if (match) {
          const boxesDeducted = match.unitSelection === 'Box' ? match.quantity : Math.ceil(match.quantity / (match.tabletsPerBox || 20));
          const tabletsToDeduct = match.unitSelection === 'Box' 
            ? match.quantity * (match.tabletsPerBox || 20) 
            : match.quantity;

          const currentBoxes = b.totalBoxesAvailable !== undefined ? b.totalBoxesAvailable : Math.floor((b.totalTabletsAvailable || 0) / (match.tabletsPerBox || 20));
          const newBoxQty = Math.max(0, currentBoxes - boxesDeducted);
          const newTabletQty = Math.max(0, (b.totalTabletsAvailable || 0) - tabletsToDeduct);

          return {
            ...b,
            totalBoxesAvailable: newBoxQty,
            totalTabletsAvailable: newTabletQty,
          };
        }
        return b;
      });
    });

    cartItems.forEach((ci) => {
      const tabs = ci.unitSelection === 'Box' ? ci.quantity * (ci.tabletsPerBox || 1) : ci.quantity;
      addAuditLog('POS Sale Stock Deduction', ci.brandName, `Deducted ${tabs} Tablets (Batch ${ci.batchNumber}) via POS Billing`, 'DEDUCT', 'Dr. Idrees');
    });
  };

  // Restore stock for returned items
  const restoreStock = (returnedItems) => {
    if (!returnedItems || returnedItems.length === 0) return;
    setBatches((prevBatches) => {
      return prevBatches.map((b) => {
        const match = returnedItems.find((ri) => ri.batchNumber === b.batchNumber);
        if (match) {
          const tabletsToRestore = match.unitSelection === 'Box'
            ? match.quantity * (match.tabletsPerBox || 1)
            : match.quantity;
          return { ...b, totalTabletsAvailable: b.totalTabletsAvailable + tabletsToRestore };
        }
        return b;
      });
    });

    returnedItems.forEach((ri) => {
      const tabs = ri.unitSelection === 'Box' ? ri.quantity * (ri.tabletsPerBox || 1) : ri.quantity;
      addAuditLog('Sales Return Stock Restoration', ri.brandName, `Restored +${tabs} Tablets (Batch ${ri.batchNumber}) via Sales Return`, 'ADD', 'Dr. Idrees');
    });
  };

  // Stock Override (Price & Quantity adjustment)
  const stockOverride = (batchId, overrideData) => {
    setBatches((prevBatches) => {
      return prevBatches.map((b) => {
        if (b.id === batchId || b.batchNumber === batchId) {
          const newQty = overrideData.totalTabletsAvailable !== undefined ? Number(overrideData.totalTabletsAvailable) : b.totalTabletsAvailable;
          const newBoxPrice = overrideData.boxPrice !== undefined ? Number(overrideData.boxPrice) : b.boxPrice;
          const newPerTabletPrice = overrideData.pricePerTablet !== undefined ? Number(overrideData.pricePerTablet) : (newBoxPrice / (overrideData.tabletsPerBox || 1));
          const newPurchasePrice = overrideData.purchasePriceBox !== undefined ? Number(overrideData.purchasePriceBox) : b.purchasePriceBox;

          return {
            ...b,
            totalTabletsAvailable: Math.max(0, newQty),
            boxPrice: newBoxPrice,
            pricePerTablet: newPerTabletPrice,
            purchasePriceBox: newPurchasePrice,
          };
        }
        return b;
      });
    });

    addAuditLog('Admin Stock & Price Override', overrideData.brandName || 'Batch', `Modified stock/price override for Batch ${batchId}`, 'MODIFY', 'Dr. Idrees');
  };

  // Batch Issue (Reduce stock for damage/sample)
  const issueBatchStock = (batchId, qtyToDeduct, reason) => {
    setBatches((prevBatches) => {
      return prevBatches.map((b) => {
        if (b.id === batchId || b.batchNumber === batchId) {
          return {
            ...b,
            totalTabletsAvailable: Math.max(0, b.totalTabletsAvailable - Number(qtyToDeduct)),
            lastIssueReason: reason,
          };
        }
        return b;
      });
    });

    addAuditLog('Batch Issue / Stock Reduction', 'Medicine Batch', `Issued/Reduced ${qtyToDeduct} Tablets from Batch ${batchId} (${reason})`, 'DEDUCT', 'Dr. Idrees');
  };

  // Batch Extend (Add stock by Box count)
  const extendBatchStock = (batchId, boxCount, tabletsPerBox = 200) => {
    const tabletsToAdd = Number(boxCount) * Number(tabletsPerBox);

    setBatches((prevBatches) => {
      return prevBatches.map((b) => {
        if (b.id === batchId || b.batchNumber === batchId) {
          return {
            ...b,
            totalTabletsAvailable: b.totalTabletsAvailable + tabletsToAdd,
          };
        }
        return b;
      });
    });

    addAuditLog('Batch Stock Extended', 'Medicine Batch', `Extended Batch ${batchId} by +${boxCount} Boxes (+${tabletsToAdd} Tablets)`, 'ADD', 'Dr. Idrees');
  };

  const getEarliestExpiryBatch = (medicineId) => {
    const available = batches
      .filter((b) => b.medicineId === medicineId && b.totalTabletsAvailable > 0 && b.status !== 'Quarantined')
      .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
    return available.length > 0 ? available[0] : null;
  };

  const deleteMedicine = (medicineId) => {
    setMedicines((prevMeds) => prevMeds.filter((m) => m.id !== medicineId));
    setBatches((prevBatches) => prevBatches.filter((b) => b.medicineId !== medicineId));
    addAuditLog('Medicine Deleted', medicineId, `Deleted medicine ${medicineId} from wholesale catalog`, 'DELETE', 'Admin');
  };

  return (
    <InventoryContext.Provider
      value={{
        medicines,
        batches,
        auditLogs,
        setMedicines,
        setBatches,
        deleteMedicine,
        togglePrescriptionRequirement,
        deductStock,
        restoreStock,
        stockOverride,
        issueBatchStock,
        extendBatchStock,
        getEarliestExpiryBatch,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};

export default InventoryContext;
