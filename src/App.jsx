import React, { useState, Component } from 'react';
import { AuthProvider } from './context/AuthContext';
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
            maxWidth: '550px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <h2 style={{ color: '#DC2626', fontSize: '1.4rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>
              System Recovery Mode
            </h2>
            <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              An unexpected cache or state glitch occurred. Click below to clear stale cache and reload the application cleanly.
            </p>
            <div style={{
              backgroundColor: '#FEF2F2',
              color: '#991B1B',
              padding: '0.75rem',
              borderRadius: '6px',
              fontFamily: 'monospace',
              fontSize: '0.8rem',
              marginBottom: '1.5rem',
              textAlign: 'left',
              wordBreak: 'break-word'
            }}>
              {this.state.error?.toString() || 'Unknown Runtime Exception'}
            </div>
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
                fontWeight: 800,
                fontSize: '0.95rem',
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

export function App() {
  const [currentScreen, setCurrentScreen] = useState('dashboard');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <DashboardPage onNavigate={setCurrentScreen} />;
      case 'pos':
        return <POSPage />;
      case 'inventory':
        return <InventoryPage />;
      case 'expiry':
        return <ExpiryRadarPage />;
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
    <ErrorBoundary>
      <AuthProvider>
        <PatientProvider>
          <InventoryProvider>
            <SupplierProvider>
              <SalesProvider>
                <CartProvider>
                  <Layout currentScreen={currentScreen} setCurrentScreen={setCurrentScreen}>
                    {renderScreen()}
                  </Layout>
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
