import React, { useState } from 'react';
import { Settings, Store, Printer, Users, Save, ShieldCheck, Calculator, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getTaxConfig, getWarrantyConfig } from '../data/mockData';

export const SettingsPage = () => {
  const { isCashier } = useAuth();
  const [activeTab, setActiveTab] = useState('PROFILE');

  // Store Profile State
  const [storeName, setStoreName] = useState('Idrees Medical Store');
  const [form20, setForm20] = useState('09-342-0139-045748D');
  const [form21, setForm21] = useState('09-342-0139-045748D');
  const [gstin, setGstin] = useState('3277876174544');
  const [printerWidth, setPrinterWidth] = useState('80mm');

  // System-Wide Taxes State
  const initialTaxes = getTaxConfig();
  const [saleTaxPercent, setSaleTaxPercent] = useState(initialTaxes.saleTaxPercent);
  const [saleTaxName, setSaleTaxName] = useState(initialTaxes.saleTaxName || 'Sale Tax 18%');
  const [adTaxPercent, setAdTaxPercent] = useState(initialTaxes.adTaxPercent);
  const [adTaxName, setAdTaxName] = useState(initialTaxes.adTaxName || 'AdTax 4%');
  const [advTaxPercent, setAdvTaxPercent] = useState(initialTaxes.advTaxPercent);
  const [advTaxName, setAdvTaxName] = useState(initialTaxes.advTaxName || 'Adv Tax 0.5%');

  // Warranty & Invoice Notes State
  const initialWarranty = getWarrantyConfig();
  const [drugActWarranty, setDrugActWarranty] = useState(initialWarranty.drugActWarranty);
  const [drapWarranty, setDrapWarranty] = useState(initialWarranty.drapWarranty);
  const [note1, setNote1] = useState(initialWarranty.noteItems[0] || '');
  const [note2, setNote2] = useState(initialWarranty.noteItems[1] || '');
  const [note3, setNote3] = useState(initialWarranty.noteItems[2] || '');
  const [note4, setNote4] = useState(initialWarranty.noteItems[3] || '');

  const [savedSuccessMsg, setSavedSuccessMsg] = useState('');

  const showSaveSuccess = (msg) => {
    setSavedSuccessMsg(msg);
    setTimeout(() => {
      setSavedSuccessMsg('');
    }, 3000);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    showSaveSuccess('Pharmacy Store Profile & Licensing settings saved successfully!');
  };

  const handleSaveTaxes = (e) => {
    e.preventDefault();
    const taxConfig = {
      saleTaxPercent: Number(saleTaxPercent) || 0,
      saleTaxName: saleTaxName.trim() || 'Sale Tax 18%',
      adTaxPercent: Number(adTaxPercent) || 0,
      adTaxName: adTaxName.trim() || 'AdTax 4%',
      advTaxPercent: Number(advTaxPercent) || 0,
      advTaxName: advTaxName.trim() || 'Adv Tax 0.5%',
    };
    localStorage.setItem('pharmalink_tax_config', JSON.stringify(taxConfig));
    showSaveSuccess('System-Wide Global Tax Rates & Column Headings updated successfully! POS & Invoices will display these names.');
  };

  const handleSaveWarranty = (e) => {
    e.preventDefault();
    const warrantyConfig = {
      drugActWarranty,
      drapWarranty,
      noteItems: [note1, note2, note3, note4].filter(Boolean),
    };
    localStorage.setItem('pharmalink_warranty_config', JSON.stringify(warrantyConfig));
    showSaveSuccess('Legal Warranty & Invoice Notes updated successfully! A4 printed tax invoices will reflect these changes.');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Header Banner (Ocean Cyan Blue Theme) */}
      <div className="card" style={{ padding: '1.25rem', backgroundColor: '#0284C7', color: '#FFFFFF', border: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Settings size={28} color="#FFFFFF" />
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>System Settings & Commercial Tax Configuration</h2>
            <p style={{ fontSize: '0.8rem', color: '#E0F2FE', marginTop: '0.15rem' }}>
              Configure Store Licensing, System-Wide Global Tax Rates, Legal Warranties & Invoice Footer Notes.
            </p>
          </div>
        </div>
      </div>

      {/* Save Success Banner */}
      {savedSuccessMsg && (
        <div style={{ backgroundColor: '#D1FAE5', color: '#065F46', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid #10B981', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={18} /> {savedSuccessMsg}
        </div>
      )}

      {/* NAVBAR TABS BAR */}
      <div className="card" style={{ padding: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('PROFILE')}
          className={`btn ${activeTab === 'PROFILE' ? 'btn-primary' : 'btn-outline'}`}
          style={{ fontSize: '0.85rem', fontWeight: 800, backgroundColor: activeTab === 'PROFILE' ? '#0284C7' : 'transparent', color: activeTab === 'PROFILE' ? '#FFF' : 'inherit' }}
        >
          <Store size={16} /> Store Profile & Drug Licensing
        </button>

        <button
          onClick={() => setActiveTab('TAXES')}
          className={`btn ${activeTab === 'TAXES' ? 'btn-primary' : 'btn-outline'}`}
          style={{ fontSize: '0.85rem', fontWeight: 800, backgroundColor: activeTab === 'TAXES' ? '#0284C7' : 'transparent', color: activeTab === 'TAXES' ? '#FFF' : 'inherit' }}
        >
          <Calculator size={16} /> System-Wide Global Tax Rates
        </button>

        <button
          onClick={() => setActiveTab('WARRANTY')}
          className={`btn ${activeTab === 'WARRANTY' ? 'btn-primary' : 'btn-outline'}`}
          style={{ fontSize: '0.85rem', fontWeight: 800, backgroundColor: activeTab === 'WARRANTY' ? '#0284C7' : 'transparent', color: activeTab === 'WARRANTY' ? '#FFF' : 'inherit' }}
        >
          <ShieldCheck size={16} /> Warranty & Invoice Footer Notes
        </button>

        <button
          onClick={() => setActiveTab('PRINTER')}
          className={`btn ${activeTab === 'PRINTER' ? 'btn-primary' : 'btn-outline'}`}
          style={{ fontSize: '0.85rem', fontWeight: 800, backgroundColor: activeTab === 'PRINTER' ? '#0284C7' : 'transparent', color: activeTab === 'PRINTER' ? '#FFF' : 'inherit' }}
        >
          <Printer size={16} /> POS Thermal Printer Setup
        </button>

        <button
          onClick={() => setActiveTab('STAFF')}
          className={`btn ${activeTab === 'STAFF' ? 'btn-primary' : 'btn-outline'}`}
          style={{ fontSize: '0.85rem', fontWeight: 800, backgroundColor: activeTab === 'STAFF' ? '#0284C7' : 'transparent', color: activeTab === 'STAFF' ? '#FFF' : 'inherit' }}
        >
          <Users size={16} /> Staff User Accounts
        </button>
      </div>

      {/* TAB 1: STORE PROFILE */}
      {activeTab === 'PROFILE' && (
        <form onSubmit={handleSaveProfile} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 900, color: '#0369A1' }}>Pharmacy Legal Profile</h3>

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

      {/* TAB 2: SYSTEM-WIDE GLOBAL TAX SETTINGS (NEW NAVBAR TAB) */}
      {activeTab === 'TAXES' && (
        <form onSubmit={handleSaveTaxes} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0369A1', margin: 0 }}>
              📊 System-Wide Global Tax Percentage Configuration
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.2rem' }}>
              Configure global tax percentages. Updates saved here dynamically apply to all POS billing line items and invoice calculations.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', backgroundColor: '#F0F9FF', padding: '1rem', borderRadius: '6px', border: '1.5px solid #0284C7' }}>
            {/* SALE TAX CONFIG */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.825rem', fontWeight: 800, color: '#0369A1' }}>
                Sale Tax Heading Name:
              </label>
              <input
                type="text"
                value={saleTaxName}
                onChange={(e) => setSaleTaxName(e.target.value)}
                placeholder="e.g. Sale Tax 18% / Sales Tax"
                style={{ width: '100%', padding: '0.45rem', fontSize: '0.85rem', fontWeight: 700, borderRadius: '4px', border: '1px solid #CBD5E1' }}
                required
              />

              <label style={{ fontSize: '0.825rem', fontWeight: 800, color: '#0369A1', marginTop: '0.3rem' }}>
                Sale Tax Percentage (%):
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={saleTaxPercent}
                onChange={(e) => setSaleTaxPercent(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', fontSize: '1.1rem', fontWeight: 900, borderRadius: '4px', border: '2px solid #0284C7' }}
                required
              />
            </div>

            {/* AD TAX CONFIG */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.825rem', fontWeight: 800, color: '#0369A1' }}>
                AdTax Heading Name:
              </label>
              <input
                type="text"
                value={adTaxName}
                onChange={(e) => setAdTaxName(e.target.value)}
                placeholder="e.g. AdTax 4% / Additional Tax"
                style={{ width: '100%', padding: '0.45rem', fontSize: '0.85rem', fontWeight: 700, borderRadius: '4px', border: '1px solid #CBD5E1' }}
                required
              />

              <label style={{ fontSize: '0.825rem', fontWeight: 800, color: '#0369A1', marginTop: '0.3rem' }}>
                Additional Tax (AdTax) (%):
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={adTaxPercent}
                onChange={(e) => setAdTaxPercent(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', fontSize: '1.1rem', fontWeight: 900, borderRadius: '4px', border: '2px solid #0284C7' }}
                required
              />
            </div>

            {/* ADV TAX CONFIG */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.825rem', fontWeight: 800, color: '#0369A1' }}>
                Adv Tax Heading Name:
              </label>
              <input
                type="text"
                value={advTaxName}
                onChange={(e) => setAdvTaxName(e.target.value)}
                placeholder="e.g. Adv Tax 0.5% / Advance Tax"
                style={{ width: '100%', padding: '0.45rem', fontSize: '0.85rem', fontWeight: 700, borderRadius: '4px', border: '1px solid #CBD5E1' }}
                required
              />

              <label style={{ fontSize: '0.825rem', fontWeight: 800, color: '#0369A1', marginTop: '0.3rem' }}>
                Advance Tax (Adv Tax) (%):
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={advTaxPercent}
                onChange={(e) => setAdvTaxPercent(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', fontSize: '1.1rem', fontWeight: 900, borderRadius: '4px', border: '2px solid #0284C7' }}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '260px', padding: '0.75rem', fontWeight: 900, backgroundColor: '#0284C7', color: '#FFF' }}>
            <Save size={16} /> [Save Global Tax Rates]
          </button>
        </form>
      )}

      {/* TAB 3: WARRANTY & INVOICE FOOTER NOTES (NEW SECTION) */}
      {activeTab === 'WARRANTY' && (
        <form onSubmit={handleSaveWarranty} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0369A1', margin: 0 }}>
              📜 Legal Warranty Texts & Custom Invoice Footer Notes
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.2rem' }}>
              Customize Drug Act Section 23, DRAP Alternative Medicines warranty text, and custom invoice notes. Changes apply to all printed A4 tax invoices.
            </p>
          </div>

          {/* DRUG ACT 1976 SECTION 23 WARRANTY TEXT */}
          <div>
            <label style={{ fontSize: '0.825rem', fontWeight: 800, display: 'block', marginBottom: '0.25rem', color: '#1F2937' }}>
              Section 23 Drug Act 1976 Warranty Text (Form 2A):
            </label>
            <textarea
              rows={4}
              value={drugActWarranty}
              onChange={(e) => setDrugActWarranty(e.target.value)}
              style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.85rem', lineHeight: 1.5, fontFamily: 'sans-serif' }}
              required
            />
          </div>

          {/* DRAP 2014 ALTERNATIVE MEDICINES WARRANTY TEXT */}
          <div>
            <label style={{ fontSize: '0.825rem', fontWeight: 800, display: 'block', marginBottom: '0.25rem', color: '#1F2937' }}>
              DRAP 2014 Alternative Medicines Warranty Text:
            </label>
            <textarea
              rows={3}
              value={drapWarranty}
              onChange={(e) => setDrapWarranty(e.target.value)}
              style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.85rem', lineHeight: 1.5, fontFamily: 'sans-serif' }}
              required
            />
          </div>

          {/* 4 CUSTOM INVOICE FOOTER NOTES */}
          <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '6px', border: '1px solid #CBD5E1', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 900, color: '#0369A1' }}>📌 Custom Invoice Footer Notes (Numbered 1-4):</span>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.15rem' }}>Note 1:</label>
              <input
                type="text"
                value={note1}
                onChange={(e) => setNote1(e.target.value)}
                style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid #CBD5E1' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.15rem' }}>Note 2:</label>
              <input
                type="text"
                value={note2}
                onChange={(e) => setNote2(e.target.value)}
                style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid #CBD5E1' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.15rem' }}>Note 3:</label>
              <input
                type="text"
                value={note3}
                onChange={(e) => setNote3(e.target.value)}
                style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid #CBD5E1' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.15rem' }}>Note 4:</label>
              <input
                type="text"
                value={note4}
                onChange={(e) => setNote4(e.target.value)}
                style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid #CBD5E1' }}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '280px', padding: '0.75rem', fontWeight: 900, backgroundColor: '#0284C7', color: '#FFF' }}>
            <Save size={16} /> [Save Warranty & Invoice Notes]
          </button>
        </form>
      )}

      {/* TAB 4: PRINTER CONFIG */}
      {activeTab === 'PRINTER' && (
        <form onSubmit={handleSaveProfile} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 900, color: '#0369A1' }}>POS Thermal Printer Setup</h3>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>Paper Format:</label>
            <select
              value={printerWidth}
              onChange={(e) => setPrinterWidth(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
            >
              <option value="80mm">Standard 80mm Customer Thermal Receipt</option>
              <option value="58mm">Mini 58mm Mobile Receipt</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '220px', padding: '0.65rem', fontWeight: 900, backgroundColor: '#0284C7', color: '#FFF' }}>
            <Save size={16} /> [Save Hardware Setup]
          </button>
        </form>
      )}

      {/* TAB 5: STAFF ACCOUNTS */}
      {activeTab === 'STAFF' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 900, color: '#0369A1', marginBottom: '1rem' }}>Active Staff User Accounts</h3>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Staff Name</th>
                  <th>Role</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>EMP-001</td>
                  <td><strong>Dr. Idrees</strong></td>
                  <td><span className="badge badge-primary">Admin</span></td>
                  <td><span className="badge badge-success">Active</span></td>
                </tr>
                <tr>
                  <td>EMP-002</td>
                  <td><strong>Usman Tariq</strong></td>
                  <td><span className="badge badge-warning">Cashier</span></td>
                  <td><span className="badge badge-success">Active</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
