import React from 'react';
import { X, FileText, User, Phone, Stethoscope, Tag, Calendar, ExternalLink, Activity } from 'lucide-react';

export const PatientHistoryDrawer = ({
  isOpen = false,
  onClose,
  patient = null,
  onSelectTransaction
}) => {
  if (!isOpen || !patient) return null;

  const rxLogs = patient.rxLogs || [];
  const chronicConditions = patient.chronicConditions || patient.chronicMedicines || [];

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'flex-end'
      }}
    >
      <div
        className="card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '520px',
          height: '100vh',
          borderRadius: 0,
          display: 'flex',
          flexDirection: 'column',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-xl)',
          animation: 'slideInRight 250ms ease-out',
          overflowY: 'auto'
        }}
      >
        {/* Drawer Header */}
        <div
          className="flex-between"
          style={{
            paddingBottom: '1rem',
            borderBottom: '1px solid var(--color-border)',
            marginBottom: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                backgroundColor: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                padding: '0.5rem',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <FileText size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-text-main)' }}>
                Prescription History & Dispensing Log
              </h3>
              <p style={{ fontSize: '0.775rem', color: 'var(--color-text-muted)', marginTop: '0.1rem' }}>
                Schedule H logs and Rx records for patient
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close drawer"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-muted)',
              padding: '0.35rem',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Patient Profile Card Header */}
        <div
          style={{
            backgroundColor: 'var(--color-primary-subtle)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginBottom: '1.25rem'
          }}
        >
          <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-primary)' }}>
              {patient.name}
            </span>
            <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
              ID: {patient.id}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--color-text-main)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Phone size={14} color="var(--color-text-muted)" />
              <span>{patient.phone || 'No phone'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <User size={14} color="var(--color-text-muted)" />
              <span>{patient.gender || 'Unspecified'}, {patient.age ? `${patient.age} yrs` : '-'}</span>
            </div>
            <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
              <Stethoscope size={14} color="var(--color-primary)" />
              <strong>Doctor:</strong> {patient.doctorName || 'Not recorded'}
            </div>
          </div>

          {chronicConditions.length > 0 && (
            <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Activity size={12} /> Chronic Conditions & Long-Term Meds:
              </div>
              <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                {chronicConditions.map((cond, idx) => (
                  <span key={idx} className="badge badge-outline" style={{ fontSize: '0.7rem' }}>
                    {cond}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Prescription Logs List */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Dispensed Rx History ({rxLogs.length})</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--color-text-muted)' }}>
              Total Visits: {patient.totalVisits || 1}
            </span>
          </h4>

          {rxLogs.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {rxLogs.map((log) => (
                <div
                  key={log.id || log.invoiceNo}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  {/* Log Card Top Row */}
                  <div className="flex-between" style={{ marginBottom: '0.5rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontWeight: 700 }}>
                      <Calendar size={14} color="var(--color-primary)" />
                      <span>{log.date}</span>
                    </div>
                    {log.invoiceNo && (
                      <span className="badge badge-success" style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                        #{log.invoiceNo}
                      </span>
                    )}
                  </div>

                  {/* Doctor Info */}
                  <div style={{ fontSize: '0.775rem', color: 'var(--color-text-main)', marginBottom: '0.5rem' }}>
                    <strong>Prescribed by:</strong> {log.doctorName || patient.doctorName || 'Registered Medical Practitioner'}
                    {log.doctorRegNo && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginLeft: '0.5rem' }}>
                        (Reg: {log.doctorRegNo})
                      </span>
                    )}
                  </div>

                  {/* Medicines Dispensed */}
                  <div style={{ marginBottom: '0.5rem' }}>
                    <div style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
                      Medicines Dispensed:
                    </div>
                    <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                      {(log.medicines || []).map((med, i) => (
                        <span key={i} className="badge badge-primary" style={{ fontSize: '0.725rem' }}>
                          {med}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Notes if present */}
                  {log.notes && (
                    <div style={{ fontSize: '0.725rem', color: '#475569', backgroundColor: '#F8FAFC', padding: '0.4rem 0.6rem', borderRadius: '4px', marginBottom: '0.5rem', fontStyle: 'italic' }}>
                      "{log.notes}"
                    </div>
                  )}

                  {/* View Invoice Button */}
                  {log.invoiceNo && onSelectTransaction && (
                    <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                      <button
                        type="button"
                        className="btn btn-outline"
                        style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                        onClick={() => onSelectTransaction(log.invoiceNo)}
                      >
                        <ExternalLink size={12} /> View Invoice #{log.invoiceNo}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '2.5rem 1rem',
                backgroundColor: 'var(--color-surface-hover)',
                borderRadius: 'var(--radius-md)',
                border: '1px dashed var(--color-border)',
                color: 'var(--color-text-muted)'
              }}
            >
              <FileText size={36} style={{ opacity: 0.4, marginBottom: '0.5rem' }} />
              <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>No Prescription History Logs</p>
              <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                This patient does not have any recorded Schedule H dispensing history yet.
              </p>
            </div>
          )}
        </div>

        {/* Footer Close */}
        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)', textAlign: 'right' }}>
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Close History (Esc)
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientHistoryDrawer;
