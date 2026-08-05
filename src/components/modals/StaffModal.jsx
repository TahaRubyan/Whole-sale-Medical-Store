import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { UserPlus, Edit3 } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const StaffModal = ({ isOpen, onClose, onSave, staffToEdit = null }) => {
  const { addToast } = useCart() || {};

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('Cashier');
  const [pin, setPin] = useState('');
  const [status, setStatus] = useState('Active');
  const [title, setTitle] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (staffToEdit) {
      setName(staffToEdit.name || '');
      setUsername(staffToEdit.username || staffToEdit.email || '');
      setRole(staffToEdit.role || 'Cashier');
      setPin(staffToEdit.pin || staffToEdit.passcode || '');
      setStatus(staffToEdit.status || 'Active');
      setTitle(staffToEdit.title || '');
      setPhone(staffToEdit.phone || '');
    } else {
      setName('');
      setUsername('');
      setRole('Cashier');
      setPin('');
      setStatus('Active');
      setTitle('');
      setPhone('');
    }
  }, [staffToEdit, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      if (addToast) addToast('Validation Error', 'Staff name is required.', 'warning');
      return;
    }
    if (!username.trim()) {
      if (addToast) addToast('Validation Error', 'Username / Email is required.', 'warning');
      return;
    }

    const staffData = {
      name: name.trim(),
      username: username.trim(),
      email: username.trim(),
      role,
      pin: pin.trim() || '1234',
      passcode: pin.trim() || '1234',
      status,
      title: title.trim() || (role === 'Admin' ? 'Managing Pharmacist & Admin' : 'Billing Cashier'),
      phone: phone.trim()
    };

    if (onSave) {
      onSave(staffData, staffToEdit ? staffToEdit.id : null);
    }

    onClose();
  };

  const isEditing = Boolean(staffToEdit);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Staff Account (${staffToEdit?.id})` : 'Add New Staff Account'}
      subtitle={isEditing ? 'Update employee credentials, RBAC role, and account status' : 'Create new staff or cashier credentials with assigned RBAC privileges'}
      icon={isEditing ? Edit3 : UserPlus}
      maxWidth="560px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.25rem' }}>
              Full Name <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Rajesh Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                fontSize: '0.85rem'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.25rem' }}>
              Username / Email <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. rsharma@pharmalink.com"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                fontSize: '0.85rem'
              }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.25rem' }}>
              Role <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                fontSize: '0.85rem',
                fontWeight: 600
              }}
            >
              <option value="Admin">Admin</option>
              <option value="Cashier">Cashier</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.25rem' }}>
              Passcode / PIN
            </label>
            <input
              type="password"
              placeholder="e.g. 1234"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-mono)'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.25rem' }}>
              Account Status <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                fontSize: '0.85rem'
              }}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.25rem' }}>
              Title / Position
            </label>
            <input
              type="text"
              placeholder="e.g. Junior Pharmacist & Billing"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                fontSize: '0.85rem'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.25rem' }}>
              Contact Phone
            </label>
            <input
              type="tel"
              placeholder="e.g. +91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                fontSize: '0.85rem'
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {isEditing ? <Edit3 size={16} /> : <UserPlus size={16} />}
            {isEditing ? 'Save Staff Changes' : 'Create Staff Account'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default StaffModal;
