import { useEffect } from 'react';

/**
 * Custom hook to register global function key hotkeys for PharmaLink ERP & POS.
 * 
 * @param {Object} handlers - Map of key handlers
 * @param {Function} handlers.onNavigate - Callback when F1-F4 screen navigation is triggered
 * @param {Function} handlers.onThermalReceipt - Callback when F9 is pressed
 * @param {Function} handlers.onA4Invoice - Callback when F10 is pressed
 */
export const useHotkeys = ({
  onNavigate,
  onThermalReceipt,
  onA4Invoice
}) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ignore if user is inside an editable input/textarea unless specifically handled
      const targetTag = event.target.tagName.toLowerCase();
      const isInput = targetTag === 'input' || targetTag === 'textarea' || targetTag === 'select';

      switch (event.key) {
        case 'F1':
          event.preventDefault();
          if (onNavigate) onNavigate('dashboard');
          break;
        case 'F2':
          event.preventDefault();
          if (onNavigate) onNavigate('pos');
          break;
        case 'F3':
          event.preventDefault();
          if (onNavigate) onNavigate('inventory');
          break;
        case 'F4':
          event.preventDefault();
          if (onNavigate) onNavigate('expiry');
          break;
        case 'F9':
          event.preventDefault();
          if (onThermalReceipt) onThermalReceipt();
          break;
        case 'F10':
          event.preventDefault();
          if (onA4Invoice) onA4Invoice();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onNavigate, onThermalReceipt, onA4Invoice]);
};

export default useHotkeys;
