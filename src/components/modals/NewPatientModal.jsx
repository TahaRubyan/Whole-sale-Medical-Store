import React, { useState } from 'react';
import { usePatient } from '../../context/PatientContext';
import { UserPlus, CheckCircle, X } from 'lucide-react';

export const NewPatientModal = ({ isOpen, onClose }) => {
  const { addPatient } = usePatient();

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');
  const [prescribingDoctor, setPrescribingDoctor] = useState('');
  const [address, setAddress] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name || !age || !phone || !prescribingDoctor) {
      alert('Please fill all mandatory fields: Name, Age, Phone, and Prescribing Doctor Name.');
      return;
    }

    addPatient({
      name,
      age: Number(age),
      phone,
      prescribingDoctor,
      address,
    });

    alert(`Patient ${name} registered successfully!`);
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div className="card" style={{ width: '90%', maxWidth: '500px', padding: '1.5rem', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', right: '1rem', top: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}>
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
          <UserPlus size={24} color="#10B981" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>New Patient Registration</h2>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>Patient Name *:</label>
            <input
              type="text"
              placeholder="e.g. Muhammad Ali"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>Age (Years) *:</label>
              <input
                type="number"
                placeholder="e.g. 45"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>Phone Number *:</label>
              <input
                type="text"
                placeholder="e.g. 0300-1234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>Prescribing Doctor Name *:</label>
            <input
              type="text"
              placeholder="e.g. Dr. Aamir Khan (PMC-45812)"
              value={prescribingDoctor}
              onChange={(e) => setPrescribingDoctor(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>Address (Optional):</label>
            <input
              type="text"
              placeholder="e.g. House 45, Street 8, F-7/2, Islamabad"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', fontWeight: 800, backgroundColor: '#10B981', color: '#FFF', marginTop: '0.5rem' }}
          >
            <CheckCircle size={18} /> [Save & Confirm Patient]
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewPatientModal;
