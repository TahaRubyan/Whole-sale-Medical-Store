import React, { useState, Component } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PatientProvider } from './context/PatientContext';
import { InventoryProvider } from './context/InventoryContext';
import { SupplierProvider } from './context/SupplierContext';
import { SalesProvider } from './context/SalesContext';
import { CartProvider } from './context/CartContext';
import Layout from './components/layout/Layout';
import DashboardPage from './pages/DashboardPage';
import POSPage from './pages/POSPage';
import InventoryPage from './pages/InventoryPage';
import ExpiryRadarPage from './pages/ExpiryRadarPage';
import SuppliersPage from './pages/SuppliersPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import RegionLedgerPage from './pages/RegionLedgerPage';
import LoginPage from './pages/LoginPage';

// Fallback Error Boundary to prevent Blank White Screen on unexpected runtime errors
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught React Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F8FAFC',
          fontFamily: 'system-ui, sans-serif',
          padding: '2rem'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '2px solid #EF4444',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '500px',
            textAlign: 'center',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{ color: '#DC2626', margin: '0 0 1rem 0' }}>System Recovery Mode</h2>
            <p style={{ color: '#4B5563', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              An unexpected cache or state glitch occurred. Click below to clear stale cache and reload the application cleanly.
            </p>
            {this.state.error && (
              <pre style={{
                backgroundColor: '#FEF2F2',
                color: '#991B1B',
                padding: '0.75rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                textAlign: 'left',
                overflowX: 'auto',
                marginBottom: '1.5rem'
              }}>
                {this.state.error.toString()}
              </pre>
            )}
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              style={{
                backgroundColor: '#0284C7',
                color: '#FFFFFF',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Reset Cache & Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const AppContent = () => {
  const { isAuthenticated, isCashier } = useAuth();
  const [currentScreen, setCurrentScreen] = useState('dashboard');

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderScreen = () => {
    // RBAC Route Guard: Ledger, Analytics, and Settings are strictly Admin Only
    if (isCashier && ['region-ledger', '/region-ledger', 'analytics', 'settings'].includes(currentScreen)) {
      return <DashboardPage onNavigate={setCurrentScreen} />;
    }

    switch (currentScreen) {
      case 'dashboard':
        return <DashboardPage onNavigate={setCurrentScreen} />;
      case 'pos':
        return <POSPage />;
      case 'inventory':
        return <InventoryPage />;
      case 'expiry':
        return <ExpiryRadarPage />;
      case 'region-ledger':
      case '/region-ledger':
        return <RegionLedgerPage />;
      case 'suppliers':
        return <SuppliersPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage onNavigate={setCurrentScreen} />;
    }
  };

  return (
    <Layout currentScreen={currentScreen} setCurrentScreen={setCurrentScreen}>
      {renderScreen()}
    </Layout>
  );
};

export function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <PatientProvider>
          <InventoryProvider>
            <SupplierProvider>
              <SalesProvider>
                <CartProvider>
                  <AppContent />
                </CartProvider>
              </SalesProvider>
            </SupplierProvider>
          </InventoryProvider>
        </PatientProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
