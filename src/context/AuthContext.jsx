import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_STAFF_ACCOUNTS } from '../data/mockData';

const AuthContext = createContext();

const ADMIN_USER = {
  name: 'Hassan',
  role: 'Admin',
  staffId: 'EMP-001',
  title: 'Store Operations Manager (Admin)'
};

const CASHIER_USER = {
  name: 'Ali',
  role: 'Cashier',
  staffId: 'EMP-002',
  title: 'Senior POS Cashier'
};

export const AuthProvider = ({ children }) => {
  // Load saved role from localStorage or default to 'Admin'
  const [role, setRoleState] = useState(() => {
    const savedRole = localStorage.getItem('pharmalink_user_role');
    return savedRole === 'Cashier' ? 'Cashier' : 'Admin';
  });

  const [user, setUser] = useState(role === 'Admin' ? ADMIN_USER : CASHIER_USER);

  // Load saved staff accounts from localStorage or default to MOCK_STAFF_ACCOUNTS
  const [staffAccounts, setStaffAccounts] = useState(() => {
    const savedStaff = localStorage.getItem('pharmalink_staff_accounts_v2');
    if (savedStaff) {
      try {
        const parsed = JSON.parse(savedStaff);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Failed to parse saved staff accounts', e);
      }
    }
    return MOCK_STAFF_ACCOUNTS;
  });

  useEffect(() => {
    localStorage.setItem('pharmalink_user_role', role);
    setUser(role === 'Admin' ? ADMIN_USER : CASHIER_USER);
  }, [role]);

  useEffect(() => {
    localStorage.setItem('pharmalink_staff_accounts_v2', JSON.stringify(staffAccounts));
  }, [staffAccounts]);

  const setRole = (newRole) => {
    if (newRole === 'Admin' || newRole === 'Cashier') {
      setRoleState(newRole);
    }
  };

  const toggleRole = () => {
    setRoleState(prevRole => (prevRole === 'Admin' ? 'Cashier' : 'Admin'));
  };

  const addStaffAccount = (staffData) => {
    const newId = staffData.id || `EMP-${String(staffAccounts.length + 1).padStart(3, '0')}`;
    const newStaff = {
      id: newId,
      name: staffData.name || '',
      username: staffData.username || staffData.email || '',
      email: staffData.email || staffData.username || '',
      role: staffData.role || 'Cashier',
      title: staffData.title || (staffData.role === 'Admin' ? 'Managing Pharmacist & Admin' : 'Billing Cashier'),
      phone: staffData.phone || '',
      pin: staffData.pin || staffData.passcode || '1234',
      passcode: staffData.passcode || staffData.pin || '1234',
      status: staffData.status || 'Active'
    };
    setStaffAccounts(prev => [newStaff, ...prev]);
    return newStaff;
  };

  const updateStaffAccount = (id, updatedData) => {
    setStaffAccounts(prev => prev.map(staff => {
      if (staff.id === id) {
        const merged = { ...staff, ...updatedData };
        if (updatedData.username && !updatedData.email) merged.email = updatedData.username;
        if (updatedData.email && !updatedData.username) merged.username = updatedData.email;
        if (updatedData.pin && !updatedData.passcode) merged.passcode = updatedData.pin;
        if (updatedData.passcode && !updatedData.pin) merged.pin = updatedData.passcode;
        return merged;
      }
      return staff;
    }));
  };

  const isAdmin = role === 'Admin';
  const isCashier = role === 'Cashier';

  const permissions = {
    canOverrideStock: isAdmin,
    canViewFinancialProfit: isAdmin,
    canCreatePurchaseOrder: isAdmin,
    canModifyStoreSettings: isAdmin,
  };

  const value = {
    role,
    user,
    setRole,
    toggleRole,
    isAdmin,
    isCashier,
    permissions,
    staffAccounts,
    setStaffAccounts,
    addStaffAccount,
    updateStaffAccount
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
