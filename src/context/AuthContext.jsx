import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_STAFF_ACCOUNTS } from '../data/mockData';

const AuthContext = createContext();

const ADMIN_USER = {
  name: 'Idrees (Admin)',
  role: 'Admin',
  staffId: 'EMP-001',
  title: 'Store Owner & Operations Director'
};

const CASHIER_USER = {
  name: 'Hassan (Cashier)',
  role: 'Cashier',
  staffId: 'EMP-002',
  title: 'Senior POS Cashier'
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('pharmalink_logged_in') === 'true';
  });

  const [role, setRoleState] = useState(() => {
    const savedRole = localStorage.getItem('pharmalink_user_role');
    return savedRole === 'Cashier' ? 'Cashier' : 'Admin';
  });

  const [user, setUser] = useState(role === 'Admin' ? ADMIN_USER : CASHIER_USER);

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

  const login = (username, password) => {
    const u = (username || '').toLowerCase().trim();
    if (u === 'admin' && password === 'admin123') {
      setRoleState('Admin');
      setIsAuthenticated(true);
      localStorage.setItem('pharmalink_logged_in', 'true');
      localStorage.setItem('pharmalink_user_role', 'Admin');
      return true;
    }
    if (u === 'cashier' && password === 'cashier123') {
      setRoleState('Cashier');
      setIsAuthenticated(true);
      localStorage.setItem('pharmalink_logged_in', 'true');
      localStorage.setItem('pharmalink_user_role', 'Cashier');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('pharmalink_logged_in');
  };

  const setRole = (newRole) => {
    if (newRole === 'Admin' || newRole === 'Cashier') {
      setRoleState(newRole);
    }
  };

  const toggleRole = () => {
    setRoleState(prevRole => (prevRole === 'Admin' ? 'Cashier' : 'Admin'));
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
    isAuthenticated,
    login,
    logout,
    role,
    user,
    setRole,
    toggleRole,
    isAdmin,
    isCashier,
    permissions,
    staffAccounts,
    setStaffAccounts,
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
