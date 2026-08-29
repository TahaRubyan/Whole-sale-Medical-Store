import React, { useState, useEffect } from 'react';
import { Settings, Store, Printer, Users, Save, ShieldCheck, Calculator, CheckCircle, Plus, UserPlus, Trash2, Upload, Download, Image as ImageIcon, RotateCcw, FileText, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getTaxConfig, getWarrantyConfig, getStoreInfo, STORE_INFO } from '../data/mockData';
import PwaInstallButton from '../components/layout/PwaInstallButton';

export const SettingsPage = () => {
  const { isCashier, staffAccounts, setStaffAccounts } = useAuth();
  const [activeTab, setActiveTab] = useState('PROFILE');

  // Store Profile & Digital Signature State
  const initialStoreInfo = getStoreInfo();
  const [storeName, setStoreName] = useState(initialStoreInfo.name || '');
  const [storeAddress, setStoreAddress] = useState(initialStoreInfo.address || '');
  const [storePhone, setStorePhone] = useState(initialStoreInfo.phone || '');
  const [stnNumber, setStnNumber] = useState(initialStoreInfo.stnNumber || '');
  const [ntnNumber, setNtnNumber] = useState(initialStoreInfo.ntnNumber || '');
  const [form20, setForm20] = useState(initialStoreInfo.dslNumber || '');
  const [form21, setForm21] = useState(initialStoreInfo.dlNumber || '');
  const [gstin, setGstin] = useState(initialStoreInfo.gstin || '');
  const [signatoryName, setSignatoryName] = useState(initialStoreInfo.signatoryName || '');
  const [signatoryTitle, setSignatoryTitle] = useState(initialStoreInfo.signatoryTitle || '');
  const [signatureImage, setSignatureImage] = useState(initialStoreInfo.signatureImage || '');
  const [printerWidth, setPrinterWidth] = useState('80mm');

  // Purge any legacy pre-filled mock profile data from previous sessions
  useEffect(() => {
    const saved = localStorage.getItem('pharmalink_store_info');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (
          parsed &&
          (parsed.name === 'Idrees Medical Store' ||
           parsed.name === 'My Medical Store' ||
           parsed.address === 'Jalal Pur Jattan, Gujrat' ||
           parsed.address === 'Commercial Market' ||
           parsed.phone === '053-3724601, 053-3724602' ||
           parsed.signatoryName === 'M. Idrees')
        ) {
          localStorage.removeItem('pharmalink_store_info');
          setStoreName('');
          setStoreAddress('');
          setStorePhone('');
          setStnNumber('');
          setNtnNumber('');
          setForm20('');
          setForm21('');
          setGstin('');
          setSignatoryName('');
          setSignatoryTitle('');
          setSignatureImage('');
          window.dispatchEvent(new Event('store_info_updated'));
        }
      } catch (e) {}
    }
  }, []);

  // System-Wide Taxes State with Toggle Checkboxes
  const initialTaxes = getTaxConfig();
  const [enableSaleTax, setEnableSaleTax] = useState(initialTaxes.enableSaleTax !== false);
  const [saleTaxPercent, setSaleTaxPercent] = useState(initialTaxes.saleTaxPercent || 18);
  const [saleTaxName, setSaleTaxName] = useState(initialTaxes.saleTaxName || 'Sale Tax 18%');

  const [enableAdvTax, setEnableAdvTax] = useState(initialTaxes.enableAdvTax !== false);
  const [advTaxPercent, setAdvTaxPercent] = useState(initialTaxes.advTaxPercent !== undefined ? initialTaxes.advTaxPercent : 0.5);
  const [advTaxName, setAdvTaxName] = useState(initialTaxes.advTaxName || 'Adv Tax 0.5%');

  // Warranty & Invoice Notes State
  const initialWarranty = getWarrantyConfig();
  const [enableDrugActWarrantySetting, setEnableDrugActWarrantySetting] = useState(initialWarranty.enableDrugActWarranty !== false);
  const [enableDrapWarrantySetting, setEnableDrapWarrantySetting] = useState(initialWarranty.enableDrapWarranty !== false);
  const [drugActWarranty, setDrugActWarranty] = useState(initialWarranty.drugActWarranty);
  const [drapWarranty, setDrapWarranty] = useState(initialWarranty.drapWarranty);
  const [note1, setNote1] = useState(initialWarranty.noteItems[0] || '');
  const [note2, setNote2] = useState(initialWarranty.noteItems[1] || '');
  const [note3, setNote3] = useState(initialWarranty.noteItems[2] || '');
  const [note4, setNote4] = useState(initialWarranty.noteItems[3] || '');

  // New Staff Account Creation State (Restricted to Cashier / Delivery Employee ONLY)
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('Cashier'); // Restricted to Cashier or Delivery Employee
  const [newStaffPhone, setNewStaffPhone] = useState('');
  const [newStaffPin, setNewStaffPin] = useState('1234');

  const [savedSuccessMsg, setSavedSuccessMsg] = useState('');

  const showSaveSuccess = (msg) => {
    setSavedSuccessMsg(msg);
    setTimeout(() => {
      setSavedSuccessMsg('');
    }, 3500);
  };

  const handleSignatureUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSignatureImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetDefaultSignature = () => {
    setSignatureImage(STORE_INFO.signatureImage || '');
  };

  const handleClearAllProfile = () => {
    setStoreName('');
    setStoreAddress('');
    setStorePhone('');
    setStnNumber('');
    setNtnNumber('');
    setForm20('');
    setForm21('');
    setGstin('');
    setSignatoryName('');
    setSignatoryTitle('');
    setSignatureImage('');
    localStorage.removeItem('pharmalink_store_info');
    window.dispatchEvent(new Event('store_info_updated'));
    showSaveSuccess('All store profile fields have been cleared!');
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const info = {
      ...initialStoreInfo,
      name: storeName.trim(),
      address: storeAddress.trim(),
      phone: storePhone.trim(),
      stnNumber: stnNumber.trim(),
      ntnNumber: ntnNumber.trim(),
      dslNumber: form20.trim(),
      dlNumber: form21.trim(),
      gstin: gstin.trim() || stnNumber.trim(),
      signatoryName: signatoryName.trim(),
      signatoryTitle: signatoryTitle.trim(),
      signatureImage,
    };
    localStorage.setItem('pharmalink_store_info', JSON.stringify(info));
    window.dispatchEvent(new Event('store_info_updated'));
    showSaveSuccess('Pharmacy Store Profile & Digital Signature saved successfully!');
  };

  const handleSaveTaxes = (e) => {
    e.preventDefault();
    const taxConfig = {
      enableSaleTax,
      saleTaxPercent: Number(saleTaxPercent) || 0,
      saleTaxName: saleTaxName.trim() || 'Sale Tax 18%',
      enableAdvTax,
      advTaxPercent: Number(advTaxPercent) || 0,
      advTaxName: advTaxName.trim() || 'Adv Tax 0.5%',
    };
    localStorage.setItem('pharmalink_tax_config', JSON.stringify(taxConfig));
    window.dispatchEvent(new Event('tax_config_updated'));
    showSaveSuccess('System-Wide Global Tax Checkboxes & Percentage Configuration saved successfully!');
  };

  const handleSaveWarranty = (e) => {
    e.preventDefault();
    const warrantyConfig = {
      enableDrugActWarranty: enableDrugActWarrantySetting,
      enableDrapWarranty: enableDrapWarrantySetting,
      drugActWarranty,
      drapWarranty,
      noteItems: [note1, note2, note3, note4].filter(Boolean),
    };
    localStorage.setItem('pharmalink_warranty_config', JSON.stringify(warrantyConfig));
    window.dispatchEvent(new Event('warranty_config_updated'));
    showSaveSuccess('Legal Warranty Checkboxes & Invoice Notes updated successfully!');
  };

  const handleAddStaffAccount = (e) => {
    e.preventDefault();
    if (!newStaffName.trim()) return;

    const newStaff = {
      id: `EMP-00${(staffAccounts?.length || 2) + 1}`,
      name: newStaffName.trim(),
      role: newStaffRole, // Cashier or Delivery Employee
      status: 'Active',
      phone: newStaffPhone.trim(),
      pin: newStaffPin.trim()
    };

    if (setStaffAccounts) {
      setStaffAccounts(prev => [...(prev || []), newStaff]);
    }
    setNewStaffName('');
    setNewStaffPhone('');
    showSaveSuccess(`New ${newStaffRole} account created successfully!`);
  };

  const handleDeleteStaff = (staffId, staffName, role) => {
    if (role === 'Admin') {
      alert("Security Error: Admin account cannot be deleted.");
      return;
    }
    if (window.confirm(`Are you sure you want to delete staff account "${staffName}"?`)) {
      if (setStaffAccounts) {
        setStaffAccounts((prev) => (prev || []).filter((s) => s.id !== staffId));
      }
      showSaveSuccess(`Staff account "${staffName}" deleted successfully!`);
    }
  };

  const handleExportSystemBackup = () => {
    const backupObj = {
      backupDate: new Date().toISOString(),
      storeInfo: localStorage.getItem('pharmalink_store_info'),
      taxConfig: localStorage.getItem('pharmalink_tax_config'),
      warrantyConfig: localStorage.getItem('pharmalink_warranty_config'),
      medicines: localStorage.getItem('pharmalink_pk_medicines'),
      batches: localStorage.getItem('pharmalink_pk_batches'),
      invoices: localStorage.getItem('pharmalink_pk_invoices'),
      suppliers: localStorage.getItem('pharmalink_pk_suppliers'),
      purchaseOrders: localStorage.getItem('pharmalink_pk_purchase_orders'),
      rtvNotes: localStorage.getItem('pharmalink_pk_rtv_notes'),
      patients: localStorage.getItem('pharmalink_pk_patients'),
      auditLogs: localStorage.getItem('pharmalink_pk_audit_logs'),
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupObj, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `pharmalink_system_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showSaveSuccess('System JSON Backup downloaded successfully!');
  };

  const handleImportSystemBackup = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const backupObj = JSON.parse(event.target.result);
        if (backupObj) {
          if (backupObj.storeInfo) localStorage.setItem('pharmalink_store_info', backupObj.storeInfo);
          if (backupObj.taxConfig) localStorage.setItem('pharmalink_tax_config', backupObj.taxConfig);
          if (backupObj.warrantyConfig) localStorage.setItem('pharmalink_warranty_config', backupObj.warrantyConfig);
          if (backupObj.medicines) localStorage.setItem('pharmalink_pk_medicines', backupObj.medicines);
          if (backupObj.batches) localStorage.setItem('pharmalink_pk_batches', backupObj.batches);
          if (backupObj.invoices) localStorage.setItem('pharmalink_pk_invoices', backupObj.invoices);
          if (backupObj.suppliers) localStorage.setItem('pharmalink_pk_suppliers', backupObj.suppliers);
          if (backupObj.purchaseOrders) localStorage.setItem('pharmalink_pk_purchase_orders', backupObj.purchaseOrders);
          if (backupObj.rtvNotes) localStorage.setItem('pharmalink_pk_rtv_notes', backupObj.rtvNotes);
          if (backupObj.patients) localStorage.setItem('pharmalink_pk_patients', backupObj.patients);
          if (backupObj.auditLogs) localStorage.setItem('pharmalink_pk_audit_logs', backupObj.auditLogs);

          showSaveSuccess('System Data Restored Successfully! Reloading app...');
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }
      } catch (err) {
        alert('Invalid backup JSON file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Header Banner (Ocean Cyan Blue Theme) */}
      <div className="card" style={{ padding: '1.25rem', backgroundColor: '#0284C7', color: '#FFFFFF', border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Settings size={28} color="#FFFFFF" />
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Store Profile & System Settings</h2>
            <p style={{ fontSize: '0.8rem', color: '#E0F2FE', marginTop: '0.15rem' }}>
              Manage pharmacy licensing, global tax enable checkboxes, A4 invoice warranty text, and cashier staff accounts.
            </p>
          </div>
        </div>
        <PwaInstallButton style={{ backgroundColor: '#FFFFFF', color: '#0284C7', border: 'none', fontWeight: 900, padding: '0.65rem 1.15rem', borderRadius: '8px', fontSize: '0.825rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
      </div>

      {/* Success Notification Banner */}
      {savedSuccessMsg && (
        <div style={{ backgroundColor: '#D1FAE5', border: '1.5px solid #10B981', color: '#065F46', padding: '0.85rem 1.25rem', borderRadius: '8px', fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={20} /> {savedSuccessMsg}
        </div>
      )}

      {/* Navigation Sub-Tabs Bar */}
      <div className="card" style={{ padding: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', backgroundColor: '#FFFFFF' }}>
        <button
          onClick={() => setActiveTab('PROFILE')}
          className={`btn ${activeTab === 'PROFILE' ? 'btn-primary' : 'btn-outline'}`}
          style={{ fontSize: '0.825rem', fontWeight: 800 }}
        >
          <Store size={16} /> Store Profile & DSL
        </button>

        <button
          onClick={() => setActiveTab('TAXES')}
          className={`btn ${activeTab === 'TAXES' ? 'btn-primary' : 'btn-outline'}`}
          style={{ fontSize: '0.825rem', fontWeight: 800 }}
        >
          <Calculator size={16} /> Global Taxes Configuration
        </button>

        <button
          onClick={() => setActiveTab('WARRANTY')}
          className={`btn ${activeTab === 'WARRANTY' ? 'btn-primary' : 'btn-outline'}`}
          style={{ fontSize: '0.825rem', fontWeight: 800 }}
        >
          <ShieldCheck size={16} /> Warranty & Invoice Notes
        </button>

        <button
          onClick={() => setActiveTab('STAFF')}
          className={`btn ${activeTab === 'STAFF' ? 'btn-primary' : 'btn-outline'}`}
          style={{ fontSize: '0.825rem', fontWeight: 800 }}
        >
          <Users size={16} /> Cashier & Staff Accounts
        </button>

        <button
          onClick={() => setActiveTab('BACKUP')}
          className={`btn ${activeTab === 'BACKUP' ? 'btn-primary' : 'btn-outline'}`}
          style={{ fontSize: '0.825rem', fontWeight: 800, backgroundColor: activeTab === 'BACKUP' ? '#0369A1' : 'transparent' }}
        >
          <Download size={16} /> Backup & Restore Data
        </button>
      </div>

      {/* TAB 1: STORE PROFILE */}
      {activeTab === 'PROFILE' && (
        <form onSubmit={handleSaveProfile} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 900, color: '#0369A1' }}>Wholesale Pharmacy Profile</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>Store / Pharmacy Trade Name *:</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="Enter pharmacy / wholesale store name"
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)', fontWeight: 700 }}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>Contact Phone Number(s) *:</label>
              <input
                type="text"
                value={storePhone}
                onChange={(e) => setStorePhone(e.target.value)}
                placeholder="Enter contact phone number(s)"
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)', fontWeight: 700 }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>Full Business & Store Address *:</label>
            <input
              type="text"
              value={storeAddress}
              onChange={(e) => setStoreAddress(e.target.value)}
              placeholder="Enter full physical store address"
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)', fontWeight: 700 }}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>STN Registration #:</label>
              <input
                type="text"
                value={stnNumber}
                onChange={(e) => setStnNumber(e.target.value)}
                placeholder="Enter STN registration # (Optional)"
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)', fontFamily: 'var(--font-mono)' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>NTN Tax Number:</label>
              <input
                type="text"
                value={ntnNumber}
                onChange={(e) => setNtnNumber(e.target.value)}
                placeholder="Enter NTN tax # (Optional)"
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)', fontFamily: 'var(--font-mono)' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>GSTIN / Tax Reg #:</label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                placeholder="Enter GSTIN / Tax Reg # (Optional)"
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)', fontFamily: 'var(--font-mono)' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>Drug License (Form 20):</label>
              <input
                type="text"
                value={form20}
                onChange={(e) => setForm20(e.target.value)}
                placeholder="Enter Drug License Form 20 (Optional)"
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)', fontFamily: 'var(--font-mono)' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>Drug License (Form 21):</label>
              <input
                type="text"
                value={form21}
                onChange={(e) => setForm21(e.target.value)}
                placeholder="Enter Drug License Form 21 (Optional)"
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)', fontFamily: 'var(--font-mono)' }}
              />
            </div>
          </div>

          {/* DIGITAL SIGNATURE SELECTION & CONFIGURATION */}
          <div style={{ backgroundColor: '#F0F9FF', padding: '1.1rem', borderRadius: '8px', border: '1.5px solid #0284C7', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 900, color: '#0369A1', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ImageIcon size={18} /> Official PNG Digital Signature & Stamp Selection
              </h4>
              <p style={{ fontSize: '0.75rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>
                Upload or select a PNG digital signature image to automatically embed on printed A4 Invoices, Customer Ledger Statements, and Financial Reports.
              </p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.775rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.15rem' }}>Authorized Signatory Name *:</label>
                <input
                  type="text"
                  value={signatoryName}
                  onChange={(e) => setSignatoryName(e.target.value)}
                  placeholder="Enter authorized signatory name"
                  style={{ width: '100%', padding: '0.45rem', fontSize: '0.85rem', fontWeight: 800, borderRadius: '4px', border: '1px solid #CBD5E1' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.775rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.15rem' }}>Authorized Designation / Role *:</label>
                <input
                  type="text"
                  value={signatoryTitle}
                  onChange={(e) => setSignatoryTitle(e.target.value)}
                  placeholder="Enter designation / role"
                  style={{ width: '100%', padding: '0.45rem', fontSize: '0.85rem', fontWeight: 700, borderRadius: '4px', border: '1px solid #CBD5E1' }}
                  required
                />
              </div>
            </div>

            {/* PNG SIGNATURE FILE SELECTION & ACTION BUTTONS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', backgroundColor: '#FFFFFF', padding: '0.85rem', borderRadius: '6px', border: '1px solid #CBD5E1' }}>
              <label style={{ fontSize: '0.775rem', fontWeight: 800, color: '#0369A1', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Upload size={14} /> Upload New PNG Signature Image:
              </label>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={handleSignatureUpload}
                  style={{ fontSize: '0.8rem', padding: '0.3rem', borderRadius: '4px', border: '1px solid #CBD5E1', backgroundColor: '#F8FAFC', flex: 1 }}
                />

                <button
                  type="button"
                  onClick={handleResetDefaultSignature}
                  className="btn btn-outline"
                  style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem', color: '#475569', borderColor: '#94A3B8', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                >
                  <RotateCcw size={13} /> Reset Default PNG
                </button>

                {signatureImage && (
                  <a
                    href={signatureImage}
                    download="digital_signature.png"
                    className="btn btn-outline"
                    style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem', color: '#0284C7', borderColor: '#0284C7', textDecoration: 'none', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                  >
                    <Download size={13} /> Download Signature PNG
                  </a>
                )}
              </div>

              {/* LIVE ACTIVE SIGNATURE PREVIEW */}
              <div style={{ marginTop: '0.4rem', padding: '0.65rem', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1.5px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ fontWeight: 800, fontSize: '0.75rem', color: '#334155', minWidth: '110px' }}>Signature Preview:</div>
                {signatureImage ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                    <div style={{ backgroundColor: '#FFFFFF', padding: '6px 12px', borderRadius: '4px', border: '1px dashed #0284C7', display: 'inline-block' }}>
                      <img
                        src={signatureImage}
                        alt="Active Digital Signature"
                        style={{ height: '48px', maxHeight: '60px', maxWidth: '200px', objectFit: 'contain', display: 'block' }}
                      />
                    </div>
                    <span style={{ fontSize: '0.725rem', color: '#16A34A', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <CheckCircle size={14} /> PNG Signature Loaded & Active
                    </span>
                  </div>
                ) : (
                  <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontStyle: 'italic' }}>
                    No signature image loaded. System will fallback to styled text signature.
                  </span>
                )}
              </div>
            </div>

            <div style={{ fontSize: '0.725rem', color: '#0284C7', fontWeight: 700 }}>
              ✔ This PNG signature will be automatically rendered on all printed A4 Invoices, Customer Statements, and Financial Reports.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '0.5rem', flexWrap: 'wrap' }}>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.65rem 1.5rem', fontWeight: 900, backgroundColor: '#0284C7', color: '#FFF', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>
              <Save size={16} /> Save Store Profile & Signature
            </button>
            <button
              type="button"
              onClick={handleClearAllProfile}
              className="btn btn-outline"
              style={{ padding: '0.65rem 1.25rem', fontWeight: 800, color: '#DC2626', borderColor: '#DC2626', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', borderRadius: '6px', cursor: 'pointer' }}
            >
              <Trash2 size={16} /> Clear All Profile Fields
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: SYSTEM-WIDE GLOBAL TAX SETTINGS WITH TOGGLE CHECKBOXES */}
      {activeTab === 'TAXES' && (
        <form onSubmit={handleSaveTaxes} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0369A1', margin: 0 }}>
              📊 System-Wide Global Tax Percentage & Checkbox Configuration
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.2rem' }}>
              Check/uncheck which taxes should apply system-wide across POS billing and printed A4 invoices.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', backgroundColor: '#F0F9FF', padding: '1rem', borderRadius: '8px', border: '1.5px solid #0284C7' }}>
            {/* SALE TAX CONFIG WITH CHECKBOX */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', backgroundColor: '#FFFFFF', padding: '0.85rem', borderRadius: '6px', border: '1px solid #CBD5E1' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 800, color: '#0369A1', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={enableSaleTax}
                  onChange={(e) => setEnableSaleTax(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#0284C7' }}
                />
                <span>Enable Sales Tax 18%</span>
              </label>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.15rem' }}>Tax Heading Name:</label>
                <input
                  type="text"
                  value={saleTaxName}
                  onChange={(e) => setSaleTaxName(e.target.value)}
                  style={{ width: '100%', padding: '0.35rem', fontSize: '0.8rem', fontWeight: 700, borderRadius: '4px', border: '1px solid #CBD5E1' }}
                  disabled={!enableSaleTax}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.15rem' }}>Percentage (%):</label>
                <input
                  type="number"
                  step="0.1"
                  value={saleTaxPercent}
                  onChange={(e) => setSaleTaxPercent(e.target.value)}
                  style={{ width: '100%', padding: '0.35rem', fontSize: '0.95rem', fontWeight: 900, borderRadius: '4px', border: '1.5px solid #0284C7' }}
                  disabled={!enableSaleTax}
                />
              </div>
            </div>

            {/* ADV TAX CONFIG WITH CHECKBOX */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', backgroundColor: '#FFFFFF', padding: '0.85rem', borderRadius: '6px', border: '1px solid #CBD5E1' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 800, color: '#0369A1', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={enableAdvTax}
                  onChange={(e) => setEnableAdvTax(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#0284C7' }}
                />
                <span>Enable Advance Tax (Adv Tax) 0.5%</span>
              </label>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.15rem' }}>Tax Heading Name:</label>
                <input
                  type="text"
                  value={advTaxName}
                  onChange={(e) => setAdvTaxName(e.target.value)}
                  style={{ width: '100%', padding: '0.35rem', fontSize: '0.8rem', fontWeight: 700, borderRadius: '4px', border: '1px solid #CBD5E1' }}
                  disabled={!enableAdvTax}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.15rem' }}>Percentage (%):</label>
                <input
                  type="number"
                  step="0.01"
                  value={advTaxPercent}
                  onChange={(e) => setAdvTaxPercent(e.target.value)}
                  style={{ width: '100%', padding: '0.35rem', fontSize: '0.95rem', fontWeight: 900, borderRadius: '4px', border: '1.5px solid #0284C7' }}
                  disabled={!enableAdvTax}
                />
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '260px', padding: '0.75rem', fontWeight: 900, backgroundColor: '#0284C7', color: '#FFF' }}>
            <Save size={16} /> [Save Global Tax Rates]
          </button>
        </form>
      )}

      {/* TAB 3: WARRANTY & INVOICE FOOTER NOTES */}
      {activeTab === 'WARRANTY' && (
        <form onSubmit={handleSaveWarranty} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0369A1', margin: 0 }}>
              📜 Legal Warranty Texts & Custom Invoice Footer Notes
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.2rem' }}>
              Customize Drug Act Section 23 warranty text and custom invoice notes.
            </p>
          </div>

          {/* Warranty 1: Section 23 Drug Act 1976 */}
          <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #CBD5E1' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '0.5rem' }}>
              <input
                type="checkbox"
                checked={enableDrugActWarrantySetting}
                onChange={(e) => setEnableDrugActWarrantySetting(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#0284C7', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.9rem', fontWeight: 900, color: '#0F172A' }}>
                Enable Section 23 Drug Act 1976 Warranty (Form 2A) on Invoices
              </span>
            </label>
            <textarea
              rows={3}
              value={drugActWarranty}
              onChange={(e) => setDrugActWarranty(e.target.value)}
              style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.85rem', lineHeight: 1.5 }}
              disabled={!enableDrugActWarrantySetting}
            />
          </div>

          {/* Warranty 2: DRAP Rules 2014 Alternative Medicines */}
          <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #CBD5E1' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '0.5rem' }}>
              <input
                type="checkbox"
                checked={enableDrapWarrantySetting}
                onChange={(e) => setEnableDrapWarrantySetting(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#0284C7', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.9rem', fontWeight: 900, color: '#0F172A' }}>
                Enable DRAP Rules 2014 Alternative Medicines Warranty on Invoices
              </span>
            </label>
            <textarea
              rows={3}
              value={drapWarranty}
              onChange={(e) => setDrapWarranty(e.target.value)}
              style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.85rem', lineHeight: 1.5 }}
              disabled={!enableDrapWarrantySetting}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '280px', padding: '0.75rem', fontWeight: 900, backgroundColor: '#0284C7', color: '#FFF' }}>
            <Save size={16} /> [Save Legal Warranty Configurations]
          </button>
        </form>
      )}

      {/* TAB 4: STAFF ACCOUNTS WITH CASHIER / EMPLOYEE ONLY CREATION FORM */}
      {activeTab === 'STAFF' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Create New Staff Account Form (Restricted Role: Cashier or Delivery Employee Only) */}
          <form onSubmit={handleAddStaffAccount} className="card" style={{ padding: '1.25rem', backgroundColor: '#F0F9FF', border: '2px solid #0284C7' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
              <UserPlus size={20} color="#0284C7" />
              <h3 style={{ fontSize: '1rem', fontWeight: 900, color: '#0369A1', margin: 0 }}>
                ➕ Create New Cashier or Employee Account
              </h3>
            </div>
            
            <p style={{ fontSize: '0.775rem', color: '#0369A1', fontWeight: 700, marginBottom: '0.85rem' }}>
              ⚠️ Security Policy: Admins can only create Cashiers or Delivery Employees. Admins cannot generate another Admin account.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.15rem' }}>Staff Name *:</label>
                <input
                  type="text"
                  placeholder="Enter Full Name (e.g. Bilal Ahmed)"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  style={{ width: '100%', padding: '0.45rem', fontSize: '0.85rem', fontWeight: 700, borderRadius: '4px', border: '1px solid #CBD5E1' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.15rem' }}>Staff Role *:</label>
                <select
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value)}
                  style={{ width: '100%', padding: '0.45rem', fontSize: '0.85rem', fontWeight: 800, borderRadius: '4px', border: '1.5px solid #0284C7', backgroundColor: '#FFF' }}
                >
                  <option value="Cashier">👤 Cashier (POS & Invoicing)</option>
                  <option value="Delivery Employee">🚚 Delivery / Logistics Employee</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '0.15rem' }}>Phone #:</label>
                <input
                  type="text"
                  placeholder="+92 300 1234567"
                  value={newStaffPhone}
                  onChange={(e) => setNewStaffPhone(e.target.value)}
                  style={{ width: '100%', padding: '0.45rem', fontSize: '0.85rem', borderRadius: '4px', border: '1px solid #CBD5E1' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.5rem', fontWeight: 900, backgroundColor: '#0284C7', color: '#FFF' }}>
                  <Plus size={16} /> Add Staff
                </button>
              </div>
            </div>
          </form>

          {/* Active Staff List Table */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 900, color: '#0369A1', marginBottom: '1rem' }}>Registered Staff Accounts</h3>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Employee ID</th>
                    <th>Staff Name</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(staffAccounts || []).map((staff) => (
                    <tr key={staff.id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 800 }}>{staff.id}</td>
                      <td><strong>{staff.name}</strong></td>
                      <td>{staff.phone || '+92 300 0000000'}</td>
                      <td>
                        <span className={`badge ${staff.role === 'Admin' ? 'badge-primary' : 'badge-warning'}`}>
                          {staff.role}
                        </span>
                      </td>
                      <td><span className="badge badge-success">Active</span></td>
                      <td style={{ textAlign: 'center' }}>
                        {staff.role !== 'Admin' ? (
                          <button
                            onClick={() => handleDeleteStaff(staff.id, staff.name, staff.role)}
                            className="btn btn-outline"
                            style={{ padding: '0.25rem 0.55rem', fontSize: '0.725rem', fontWeight: 800, borderColor: '#DC2626', color: '#DC2626', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                            title={`Delete ${staff.name} account`}
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 700 }}>Protected Admin</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 5: BACKUP & DATA EXPORT */}
      {activeTab === 'BACKUP' && (
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0369A1', margin: 0 }}>
              💾 System Data Backup & Restore Utility
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.2rem' }}>
              Export a complete backup file of your testing invoices, stock inventory, supplier ledgers, and settings to save on your computer or transfer to another device.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* EXPORT BACKUP CARD */}
            <div style={{ backgroundColor: '#F0F9FF', padding: '1.25rem', borderRadius: '8px', border: '1.5px solid #0284C7', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0369A1', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Download size={18} /> Export System Backup (JSON)
              </div>
              <p style={{ fontSize: '0.775rem', color: '#475569', margin: 0 }}>
                Downloads all your created invoices, stock items, customer debts, and store profile settings as a `.json` backup file.
              </p>
              <button
                type="button"
                onClick={handleExportSystemBackup}
                className="btn btn-primary"
                style={{ padding: '0.65rem 1rem', fontWeight: 900, backgroundColor: '#0284C7', color: '#FFF', fontSize: '0.825rem', width: 'fit-content' }}
              >
                <Download size={16} /> Export Backup (.json)
              </button>
            </div>

            {/* RESTORE BACKUP CARD */}
            <div style={{ backgroundColor: '#F8FAFC', padding: '1.25rem', borderRadius: '8px', border: '1.5px solid #CBD5E1', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Upload size={18} /> Restore Backup File
              </div>
              <p style={{ fontSize: '0.775rem', color: '#475569', margin: 0 }}>
                Upload a previously downloaded `.json` backup file to restore all your invoices, stock data, and settings cleanly.
              </p>
              <label
                className="btn btn-outline"
                style={{ padding: '0.65rem 1rem', fontWeight: 900, borderColor: '#0284C7', color: '#0284C7', fontSize: '0.825rem', width: 'fit-content', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Upload size={16} /> Choose & Restore Backup File
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportSystemBackup}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>

          {/* COMPLETE FEATURES & TECHNICAL SPECIFICATION MANUAL CARD */}
          <div style={{ backgroundColor: '#F8FAFC', padding: '1.25rem', borderRadius: '8px', border: '1.5px solid #0284C7', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginTop: '0.5rem' }}>
            <div>
              <div style={{ fontWeight: 900, fontSize: '1rem', color: '#0369A1', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookOpen size={20} /> 📋 Complete System Features & Technical Product Manual
              </div>
              <p style={{ fontSize: '0.8rem', color: '#475569', margin: '0.25rem 0 0 0' }}>
                Download or view the comprehensive specification manual covering all modules: POS Fast Billing, Form 2 Invoices, Multi-Tenant SaaS, FBR Annexure-C Sales Tax, Expiry Radar, and RBAC Security.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <a
                href="/PHARMALINK_SYSTEM_FEATURES_CATALOG.html"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ padding: '0.6rem 1.15rem', fontWeight: 900, backgroundColor: '#0284C7', color: '#FFF', fontSize: '0.825rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <BookOpen size={16} /> Open & Print Interactive Manual
              </a>
              <a
                href="/PHARMALINK_COMPLETE_SYSTEM_FEATURES_DOCUMENTATION.md"
                download="PHARMALINK_COMPLETE_SYSTEM_FEATURES_DOCUMENTATION.md"
                className="btn btn-outline"
                style={{ padding: '0.6rem 1.15rem', fontWeight: 800, borderColor: '#0284C7', color: '#0284C7', fontSize: '0.825rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Download size={16} /> Download Markdown (.md)
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
