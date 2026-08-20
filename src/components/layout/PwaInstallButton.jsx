import React, { useState, useEffect } from 'react';
import { Download, Monitor, CheckCircle, Info, X } from 'lucide-react';

export const PwaInstallButton = ({ style, className, variant = 'button' }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);

  useEffect(() => {
    // Check if app is running as standalone PWA
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      // Show PWA desktop installation guidance modal
      setShowInstructionsModal(true);
    }
  };

  if (isInstalled) {
    return (
      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#059669', backgroundColor: '#D1FAE5', padding: '0.35rem 0.65rem', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
        <CheckCircle size={14} /> Windows Desktop App Active
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        className={className || "btn"}
        style={style || {
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.4rem 0.75rem',
          borderRadius: '6px',
          border: '1.5px solid #0284C7',
          backgroundColor: '#F0F9FF',
          color: '#0284C7',
          fontWeight: 800,
          fontSize: '0.8rem',
          cursor: 'pointer'
        }}
        title="Install PharmaLink ERP as a 1-Click Windows Desktop Application"
      >
        <Download size={15} /> 💻 Install Windows Desktop App
      </button>

      {/* Desktop Installation Guidance Modal */}
      {showInstructionsModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '0', overflow: 'hidden', border: '1.5px solid #0284C7', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <div style={{ backgroundColor: '#0284C7', color: '#FFFFFF', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 900, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Monitor size={20} /> Install App on Windows PC / Laptop
              </div>
              <button onClick={() => setShowInstructionsModal(false)} style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.825rem' }}>
              <div style={{ backgroundColor: '#F0F9FF', border: '1px solid #BAE6FD', padding: '0.85rem', borderRadius: '8px' }}>
                <div style={{ fontWeight: 800, color: '#0369A1', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Monitor size={16} /> 1-Click Windows Desktop Installation:
                </div>
                <p style={{ margin: '0 0 0.5rem 0', color: '#475569', lineHeight: 1.4 }}>
                  Instead of downloading a heavy file, Progressive Web Apps install directly into Windows from your browser address bar:
                </p>
                <ol style={{ margin: 0, paddingLeft: '1.2rem', color: '#334155', lineHeight: 1.5, fontWeight: 700 }}>
                  <li>Look at the top right of your browser address bar (Chrome / Microsoft Edge).</li>
                  <li>Click the <strong>Install Icon (⊕ or 💻)</strong> or click the <strong>3 Dots (⋮)</strong> menu.</li>
                  <li>Select <strong>"Install PharmaLink ERP"</strong> or <strong>"Save and Share &gt; Install app"</strong>.</li>
                  <li>A dedicated shortcut icon will be placed directly onto your <strong>Windows Desktop & Taskbar</strong>!</li>
                </ol>
              </div>

              <div style={{ backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', padding: '0.75rem', borderRadius: '8px', color: '#065F46', fontSize: '0.775rem', fontWeight: 700 }}>
                ⚡ Once installed, double-clicking the Windows Desktop Icon opens PharmaLink ERP in a clean standalone window with offline POS counter access!
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.35rem' }}>
                <button
                  onClick={() => setShowInstructionsModal(false)}
                  className="btn btn-primary"
                  style={{ backgroundColor: '#0284C7', color: '#FFF', fontWeight: 900, fontSize: '0.825rem', padding: '0.5rem 1.25rem' }}
                >
                  Got It, Thanks!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PwaInstallButton;
