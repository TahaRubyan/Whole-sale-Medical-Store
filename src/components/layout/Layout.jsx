import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useHotkeys } from '../../hooks/useHotkeys';
import { useCart } from '../../context/CartContext';
import PatientRxDrawer from '../modals/PatientRxDrawer';
import ThermalReceiptModal from '../modals/ThermalReceiptModal';
import A4InvoiceModal from '../modals/A4InvoiceModal';
import NotificationToast from '../common/NotificationToast';

export const Layout = ({ currentScreen, setCurrentScreen, children }) => {
  const { openModal } = useCart();

  // Hotkey hook binding for navigation F1-F4, F9 (Thermal), F10 (A4 Invoice)
  useHotkeys({
    onNavigate: (screen) => setCurrentScreen(screen),
    onThermalReceipt: () => openModal('thermal'),
    onA4Invoice: () => openModal('a4')
  });

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar 
        currentScreen={currentScreen} 
        onNavigate={setCurrentScreen} 
      />

      {/* Main Content Area */}
      <div className="main-viewport">
        <Topbar 
          currentScreen={currentScreen} 
          onOpenThermalModal={() => openModal('thermal')}
          onOpenA4Modal={() => openModal('a4')}
        />

        <main className="content-area">
          {children}
        </main>
      </div>

      {/* Global Modals wired to CartContext */}
      <PatientRxDrawer />
      <ThermalReceiptModal />
      <A4InvoiceModal />

      {/* Global Notification Toast Container */}
      <NotificationToast />
    </div>
  );
};

export default Layout;
