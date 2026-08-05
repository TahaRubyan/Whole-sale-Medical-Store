import React, { useState } from 'react';
import { Users, Search, UserPlus, Phone, Stethoscope, MapPin, ShoppingCart } from 'lucide-react';
import { usePatient } from '../context/PatientContext';
import { useCart } from '../context/CartContext';
import NewPatientModal from '../components/modals/NewPatientModal';

export const PatientsPage = ({ onNavigate }) => {
  const { patients, servePatientInPOS } = usePatient();
  const { setCustomerName, setDoctorName } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewPatientOpen, setIsNewPatientOpen] = useState(false);

  const filteredPatients = patients.filter((pat) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      pat.name.toLowerCase().includes(q) ||
      (pat.phone && pat.phone.includes(q)) ||
      (pat.prescribingDoctor && pat.prescribingDoctor.toLowerCase().includes(q))
    );
  });

  const handleServeInPOS = (patient) => {
    servePatientInPOS(patient);
    setCustomerName(patient.name || '');
    setDoctorName(patient.prescribingDoctor || '');
    if (onNavigate) {
      onNavigate('pos');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header Banner */}
      <div className="card" style={{ padding: '1.25rem', backgroundColor: '#0284C7', color: '#FFFFFF', border: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Users size={28} color="#FFF" />
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Pakistan Patient Directory & Prescription Records</h2>
              <p style={{ fontSize: '0.8rem', color: '#E0F2FE', marginTop: '0.15rem' }}>
                Mandatory Doctor Note tracking, Patient Age, Address & Direct POS Checkout Integration.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsNewPatientOpen(true)}
            className="btn btn-primary"
            style={{ backgroundColor: '#FFFFFF', color: '#0284C7', fontWeight: 800 }}
          >
            <UserPlus size={16} /> + New Patient Registration
          </button>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="card" style={{ padding: '0.85rem' }}>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
          <input
            type="text"
            placeholder="Search by Patient Name, Phone Number, or Prescribing Doctor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '0.55rem 0.75rem 0.55rem 2.4rem', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.9rem' }}
          />
        </div>
      </div>

      {/* Patient Table */}
      <div className="table-container card">
        <table className="table">
          <thead>
            <tr>
              <th>Patient Name & ID</th>
              <th>Age & Phone</th>
              <th>Prescribing Doctor (Required)</th>
              <th>Address (Optional)</th>
              <th>Total Spend</th>
              <th>Direct Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map((pat) => (
              <tr key={pat.id}>
                <td>
                  <div style={{ fontWeight: 800, color: 'var(--color-text-main)' }}>{pat.name}</div>
                  <div style={{ fontSize: '0.725rem', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)' }}>{pat.id}</div>
                </td>
                <td>
                  <div style={{ fontWeight: 700 }}>Age: {pat.age} yrs</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{pat.phone}</div>
                </td>
                <td>
                  <div style={{ fontWeight: 700, color: '#0369A1', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Stethoscope size={14} /> {pat.prescribingDoctor}
                  </div>
                </td>
                <td style={{ fontSize: '0.8rem', color: '#475569', maxWidth: '220px' }}>
                  {pat.address ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <MapPin size={13} color="#64748B" /> {pat.address}
                    </span>
                  ) : (
                    <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>No address specified</span>
                  )}
                </td>
                <td>
                  <strong style={{ fontSize: '0.9rem', color: '#059669' }}>
                    Rs. {pat.totalSpend.toLocaleString('en-PK')}
                  </strong>
                </td>
                <td>
                  <button
                    onClick={() => handleServeInPOS(pat)}
                    className="btn btn-primary"
                    style={{ fontSize: '0.775rem', padding: '0.35rem 0.75rem', fontWeight: 800, backgroundColor: '#0284C7' }}
                  >
                    <ShoppingCart size={14} /> 🛒 Serve Patient in POS
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New Patient Registration Modal */}
      {isNewPatientOpen && (
        <NewPatientModal
          isOpen={isNewPatientOpen}
          onClose={() => setIsNewPatientOpen(false)}
        />
      )}
    </div>
  );
};

export default PatientsPage;
