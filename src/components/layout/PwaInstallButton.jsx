import React, { useState, useEffect } from 'react';
import { Download, Monitor, Smartphone, CheckCircle, Info, X } from 'lucide-react';

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
      // Show PWA manual installation guidance modal for Chrome/Edge/Safari/Android
      setShowInstructionsModal(true);
    }
  };

  if (isInstalled) {
    return (
      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#059669', backgroundColor: '#D1FAE5', padding: '0.35rem 0.65rem', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
        <CheckCircle size={14} /> Desktop App Installed
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
        title="Install PharmaLink ERP as a Windows Desktop App or Mobile App"
      >
        <Download size={15} /> 📲 Install Desktop / Mobile App
      </button>

      {/* Manual Installation Guidance Modal */}
      {showInstructionsModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '480px', padding: '0', overflow: 'hidden', border: '1.5px solid #0284C7', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <div style={{ backgroundColor: '#0284C7', color: '#FFFFFF', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 900, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Monitor size={20} /> Install App on Windows Desktop or Phone
              </div>
              <button onClick={() => setShowInstructionsModal(false)} style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.825rem' }}>
              <p style={{ margin: 0, color: '#334155', fontWeight: 600 }}>
                You can install <strong>Idrees Medical Store ERP</strong> directly onto your computer or phone for 1-click desktop launch and offline POS counter access:
              </p>

              <div style={{ backgroundColor: '#F0F9FF', border: '1px solid #BAE6FD', padding: '0.85rem', borderRadius: '8px' }}>
                <div style={{ fontWeight: 800, color: '#0369A1', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Monitor size={16} /> On Windows PC (Chrome / Microsoft Edge):
                </div>
                <ol style={{ margin: 0, paddingLeft: '1.2rem', color: '#475569', lineHeight: 1.5 }}>
                  <li>Look at the top right of your browser address bar.</li>
                  <li>Click the <strong>Install Icon (⊕)</strong> or click the <strong>3 Dots (⋮)</strong> menu.</li>
                  <li>Select <strong>"Install PharmaLink ERP"</strong> or <strong>"Apps &gt; Install this site as an app"</strong>.</li>
                  <li>A desktop shortcut will be added to your Windows Desktop!</li>
                </ol>
              </div>

              <div style={{ backgroundColor: '#FEF3C7', border: '1px solid #FDE68A', padding: '0.85rem', borderRadius: '8px' }}>
                <div style={{ fontWeight: 800, color: '#92400E', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Smartphone size={16} /> On Mobile (Android / iPhone):
                </div>
                <ol style={{ margin: 0, paddingLeft: '1.2rem', color: '#78350F', lineHeight: 1.5 }}>
                  <li>Open the browser menu (3 dots in Chrome or Share button in Safari).</li>
                  <li>Tap <strong>"Add to Home Screen"</strong> or <strong>"Install App"</strong>.</li>
                </ol>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
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
