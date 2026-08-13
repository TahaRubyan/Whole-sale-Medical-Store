import React, { useState } from 'react';
import { Settings, Store, Printer, Users, Save, ShieldCheck, Calculator, CheckCircle, Plus, UserPlus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getTaxConfig, getWarrantyConfig } from '../data/mockData';

export const SettingsPage = () => {
  const { isCashier, staffAccounts, setStaffAccounts } = useAuth();
  const [activeTab, setActiveTab] = useState('PROFILE');

  // Store Profile State
  const [storeName, setStoreName] = useState('Idrees Medical Store');
  const [form20, setForm20] = useState('09-342-0139-045748D');
  const [form21, setForm21] = useState('09-342-0139-045748D');
  const [gstin, setGstin] = useState('3277876174544');
  const [printerWidth, setPrinterWidth] = useState('80mm');

  // System-Wide Taxes State with Toggle Checkboxes
  const initialTaxes = getTaxConfig();
  const [enableSaleTax, setEnableSaleTax] = useState(initialTaxes.enableSaleTax !== false);
  const [saleTaxPercent, setSaleTaxPercent] = useState(initialTaxes.saleTaxPercent || 18);
  const [saleTaxName, setSaleTaxName] = useState(initialTaxes.saleTaxName || 'Sale Tax 18%');

  const [enableAdTax, setEnableAdTax] = useState(initialTaxes.enableAdTax !== false);
  const [adTaxPercent, setAdTaxPercent] = useState(initialTaxes.adTaxPercent || 4);
  const [adTaxName, setAdTaxName] = useState(initialTaxes.adTaxName || 'AdTax 4%');

  const [enableAdvTax, setEnableAdvTax] = useState(initialTaxes.enableAdvTax !== false);
  const [advTaxPercent, setAdvTaxPercent] = useState(initialTaxes.advTaxPercent || 0.5);
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

  const handleSaveProfile = (e) => {
    e.preventDefault();
    showSaveSuccess('Pharmacy Store Profile & Licensing settings saved successfully!');
  };

  const handleSaveTaxes = (e) => {
    e.preventDefault();
    const taxConfig = {
      enableSaleTax,
      saleTaxPercent: Number(saleTaxPercent) || 0,
      saleTaxName: saleTaxName.trim() || 'Sale Tax 18%',
      enableAdTax,
      adTaxPercent: Number(adTaxPercent) || 0,
      adTaxName: adTaxName.trim() || 'AdTax 4%',
      enableAdvTax,
      advTaxPercent: Number(advTaxPercent) || 0,
      advTaxName: advTaxName.trim() || 'Adv Tax 0.5%',
    };
    localStorage.setItem('pharmalink_tax_config', JSON.stringify(taxConfig));
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Header Banner (Ocean Cyan Blue Theme) */}
      <div className="card" style={{ padding: '1.25rem', backgroundColor: '#0284C7', color: '#FFFFFF', border: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Settings size={28} color="#FFFFFF" />
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Store Profile & System Settings</h2>
            <p style={{ fontSize: '0.8rem', color: '#E0F2FE', marginTop: '0.15rem' }}>
              Manage pharmacy licensing, global tax enable checkboxes, A4 invoice warranty text, and cashier staff accounts.
            </p>
          </div>
        </div>
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
      </div>

      {/* TAB 1: STORE PROFILE */}
      {activeTab === 'PROFILE' && (
        <form onSubmit={handleSaveProfile} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 900, color: '#0369A1' }}>Wholesale Pharmacy Profile</h3>
          
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>Store Name:</label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)', fontWeight: 700 }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>Drug License (Form 20):</label>
              <input
                type="text"
                value={form20}
                onChange={(e) => setForm20(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)', fontFamily: 'var(--font-mono)' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>Drug License (Form 21):</label>
              <input
                type="text"
                value={form21}
                onChange={(e) => setForm21(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)', fontFamily: 'var(--font-mono)' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>GSTIN / Tax Registration Number:</label>
            <input
              type="text"
              value={gstin}
              onChange={(e) => setGstin(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)', fontFamily: 'var(--font-mono)' }}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '220px', padding: '0.65rem', fontWeight: 900, backgroundColor: '#0284C7', color: '#FFF' }}>
            <Save size={16} /> [Save Store Profile]
          </button>
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', backgroundColor: '#F0F9FF', padding: '1rem', borderRadius: '8px', border: '1.5px solid #0284C7' }}>
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

            {/* AD TAX CONFIG WITH CHECKBOX */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', backgroundColor: '#FFFFFF', padding: '0.85rem', borderRadius: '6px', border: '1px solid #CBD5E1' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 800, color: '#0369A1', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={enableAdTax}
                  onChange={(e) => setEnableAdTax(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#0284C7' }}
                />
                <span>Enable Additional Tax (AdTax) 4%</span>
              </label>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.15rem' }}>Tax Heading Name:</label>
                <input
                  type="text"
                  value={adTaxName}
                  onChange={(e) => setAdTaxName(e.target.value)}
                  style={{ width: '100%', padding: '0.35rem', fontSize: '0.8rem', fontWeight: 700, borderRadius: '4px', border: '1px solid #CBD5E1' }}
                  disabled={!enableAdTax}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.15rem' }}>Percentage (%):</label>
                <input
                  type="number"
                  step="0.1"
                  value={adTaxPercent}
                  onChange={(e) => setAdTaxPercent(e.target.value)}
                  style={{ width: '100%', padding: '0.35rem', fontSize: '0.95rem', fontWeight: 900, borderRadius: '4px', border: '1.5px solid #0284C7' }}
                  disabled={!enableAdTax}
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
    </div>
  );
};

export default SettingsPage;
