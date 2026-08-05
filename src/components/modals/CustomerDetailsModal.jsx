import React, { useState } from 'react';
import { UserCheck, X, CheckCircle } from 'lucide-react';

export const CustomerDetailsModal = ({ customerDetails, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    customerName: customerDetails?.customerName || 'M/S Idrees Pharmacy / 280073',
    region: customerDetails?.region || 'Jalapur Jattan',
    address: customerDetails?.address || 'Main Bazar, Near HBL Bank, Jalal Pur Jattan',
    customerPhone: customerDetails?.customerPhone || '053-3724601',
    customerLicenseNo: customerDetails?.customerLicenseNo || '09-342-0139-98309',
    customerNtn: customerDetails?.customerNtn || '34202-0723603-5',
    customerGst: customerDetails?.customerGst || '34202-0723603-5',
    fbrStatus: customerDetails?.fbrStatus || 'FILER As Per FBR On 03-11-2025',
    bookingMan: customerDetails?.bookingMan || 'Naeem Shah',
    referenceNo: customerDetails?.referenceNo || 'Naeem Shah',
    deliveryMan: customerDetails?.deliveryMan || 'Awais Ijaz',
    shipTo: customerDetails?.shipTo || 'Jalal Pur Jattan',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div className="card" style={{ width: '90%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem', position: 'relative', backgroundColor: '#FFFFFF', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
        <button onClick={onClose} style={{ position: 'absolute', right: '1rem', top: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}>
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', borderBottom: '2px solid #E2E8F0', paddingBottom: '0.75rem' }}>
          <UserCheck size={24} color="#0284C7" />
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1F2937', margin: 0 }}>
              Wholesale Customer & Logistics Metadata
            </h2>
            <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0 }}>
              Enter customer license, NTN, tax filer status and booking details for A4 Tax Invoice.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {/* Row 1: Customer Name & Region */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.775rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>
                Customer / Business Name *:
              </label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                placeholder="e.g. M/S Idrees Pharmacy / 280073"
                style={{ width: '100%', padding: '0.45rem', fontSize: '0.85rem', fontWeight: 700, borderRadius: '4px', border: '1px solid #CBD5E1' }}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.775rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>
                Region / Territory:
              </label>
              <input
                type="text"
                name="region"
                value={formData.region}
                onChange={handleChange}
                placeholder="e.g. Jalapur Jattan"
                style={{ width: '100%', padding: '0.45rem', fontSize: '0.85rem', borderRadius: '4px', border: '1px solid #CBD5E1' }}
              />
            </div>
          </div>

          {/* Row 2: Address */}
          <div>
            <label style={{ fontSize: '0.775rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>
              Business Address:
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="e.g. Main Bazar, Near HBL Bank, Jalal Pur Jattan"
              style={{ width: '100%', padding: '0.45rem', fontSize: '0.85rem', borderRadius: '4px', border: '1px solid #CBD5E1' }}
            />
          </div>

          {/* Row 3: License # & NTN # & GST # */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.775rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>
                Cust. License #:
              </label>
              <input
                type="text"
                name="customerLicenseNo"
                value={formData.customerLicenseNo}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', fontFamily: 'monospace', borderRadius: '4px', border: '1px solid #CBD5E1' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.775rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>
                Cust. NTN #:
              </label>
              <input
                type="text"
                name="customerNtn"
                value={formData.customerNtn}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', fontFamily: 'monospace', borderRadius: '4px', border: '1px solid #CBD5E1' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.775rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>
                Cust. GST #:
              </label>
              <input
                type="text"
                name="customerGst"
                value={formData.customerGst}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', fontFamily: 'monospace', borderRadius: '4px', border: '1px solid #CBD5E1' }}
              />
            </div>
          </div>

          {/* Row 4: FBR Status & Phone */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.775rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>
                FBR Tax Filer Status:
              </label>
              <input
                type="text"
                name="fbrStatus"
                value={formData.fbrStatus}
                onChange={handleChange}
                placeholder="FILER As Per FBR On 03-11-2025"
                style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', fontWeight: 700, borderRadius: '4px', border: '1px solid #CBD5E1' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.775rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>
                Contact Phone:
              </label>
              <input
                type="text"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleChange}
                placeholder="053-3724601"
                style={{ width: '100%', padding: '0.45rem', fontSize: '0.85rem', borderRadius: '4px', border: '1px solid #CBD5E1' }}
              />
            </div>
          </div>

          {/* Row 5: Booking Man, Reference No & Delivery Man */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.775rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>
                Booking Man:
              </label>
              <input
                type="text"
                name="bookingMan"
                value={formData.bookingMan}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid #CBD5E1' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.775rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>
                Reference No:
              </label>
              <input
                type="text"
                name="referenceNo"
                value={formData.referenceNo}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid #CBD5E1' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.775rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>
                Delivery Man:
              </label>
              <input
                type="text"
                name="deliveryMan"
                value={formData.deliveryMan}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid #CBD5E1' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
            <button type="button" onClick={onClose} className="btn btn-outline" style={{ flex: 1 }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1, backgroundColor: '#0284C7', color: '#FFF', fontWeight: 800 }}>
              <CheckCircle size={16} /> Save Customer Details
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerDetailsModal;
