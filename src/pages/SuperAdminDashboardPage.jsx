import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Store, 
  Plus, 
  CheckCircle, 
  AlertCircle, 
  X, 
  LifeBuoy, 
  Key, 
  Activity, 
  LogOut,
  Download,
  Search,
  Filter,
  DollarSign,
  Calendar,
  CreditCard,
  Clock
} from 'lucide-react';

const INITIAL_TENANTS_LIST = [
  {
    id: 'TNT-1001',
    storeName: 'Idrees Medical Store',
    address: 'Jalal Pur Jattan, Gujrat',
    phone: '053-3724601',
    dslNumber: '09-342-0139-045748D',
    adminUsername: 'idrees_admin',
    status: 'ACTIVE',
    subscriptionTier: 'STANDARD',
    createdAt: '2026-07-15',
    activatedAt: '2026-07-15',
    nextBillingDate: '2026-08-15', // Passed 1 month -> Membership Due!
    monthlyFee: 15000,
    paymentStatus: 'DEBT_DUE', // 'PAID' | 'PARTIAL_PAID' | 'DEBT_DUE'
  },
  {
    id: 'TNT-1002',
    storeName: 'Al-Razi Pharmacy',
    address: 'Main Commercial Market, Karianwala',
    phone: '0300-8451122',
    dslNumber: '09-342-0139-088912P',
    adminUsername: 'alrazi_admin',
    status: 'ACTIVE',
    subscriptionTier: 'PREMIUM',
    createdAt: '2026-08-01',
    activatedAt: '2026-08-01',
    nextBillingDate: '2026-09-01',
    monthlyFee: 15000,
    paymentStatus: 'PAID',
  },
];

const INITIAL_TICKETS_LIST = [
  {
    id: 'TCK-901',
    tenantId: 'TNT-1001',
    storeName: 'Idrees Medical Store',
    reportedBy: 'Ali (Cashier)',
    issueTitle: 'Thermal printer receipt alignment on 80mm roll',
    issueDetails: 'When printing 80mm thermal receipts, bottom margin cuts off driver signature line.',
    screen: 'POS Billing',
    status: 'OPEN',
    createdAt: '2026-08-17 09:15 AM',
  },
];

export const SuperAdminDashboardPage = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('TENANTS'); // 'TENANTS' | 'TICKETS'
  const [tenants, setTenants] = useState(() => {
    const saved = localStorage.getItem('pharmalink_superadmin_tenants');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return INITIAL_TENANTS_LIST;
  });

  const [tickets, setTickets] = useState(() => {
    const saved = localStorage.getItem('pharmalink_superadmin_tickets');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return INITIAL_TICKETS_LIST;
  });

  // Modal State for New Client Tenant Onboarding
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [newStoreName, setNewStoreName] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newDslNumber, setNewDslNumber] = useState('');
  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [newTempPassword, setNewTempPassword] = useState('1234');
  const [newMonthlyFee, setNewMonthlyFee] = useState(15000);
  const [newPaymentStatus, setNewPaymentStatus] = useState('PAID');
  
  const [successMsg, setSuccessMsg] = useState('');
  const [tenantSearchQuery, setTenantSearchQuery] = useState('');

  const showNotification = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => {
      setSuccessMsg('');
    }, 3500);
  };

  const calculateNextBillingDate = (startDateStr) => {
    const startDate = new Date(startDateStr || Date.now());
    startDate.setDate(startDate.getDate() + 30);
    return startDate.toISOString().split('T')[0];
  };

  const isMembershipDue = (tenant) => {
    if (!tenant.nextBillingDate) return false;
    const todayStr = new Date().toISOString().split('T')[0];
    return tenant.nextBillingDate <= todayStr && tenant.paymentStatus !== 'PAID';
  };

  const handleOnboardTenant = (e) => {
    e.preventDefault();
    if (!newStoreName.trim() || !newAdminUsername.trim()) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const nextBillStr = calculateNextBillingDate(todayStr);

    const newTenant = {
      id: `TNT-${1000 + tenants.length + 1}`,
      storeName: newStoreName.trim(),
      address: newAddress.trim() || 'Commercial Market',
      phone: newPhone.trim() || '0300-0000000',
      dslNumber: newDslNumber.trim() || 'DSL-2026-PENDING',
      adminUsername: newAdminUsername.trim().toLowerCase(),
      status: 'ACTIVE',
      subscriptionTier: 'STANDARD',
      createdAt: todayStr,
      activatedAt: todayStr,
      nextBillingDate: nextBillStr,
      monthlyFee: Number(newMonthlyFee) || 15000,
      paymentStatus: newPaymentStatus,
      tempPassword: newTempPassword,
      forcePasswordReset: true,
    };

    const updated = [newTenant, ...tenants];
    setTenants(updated);
    localStorage.setItem('pharmalink_superadmin_tenants', JSON.stringify(updated));

    // Reset Form
    setNewStoreName('');
    setNewAddress('');
    setNewPhone('');
    setNewDslNumber('');
    setNewAdminUsername('');
    setNewTempPassword('1234');
    setNewMonthlyFee(15000);
    setNewPaymentStatus('PAID');
    setIsOnboardModalOpen(false);

    showNotification(`Client Tenant "${newTenant.storeName}" (${newTenant.id}) onboarded! 1-Month Billing cycle set to ${nextBillStr}.`);
  };

  const handleRecordPayment = (tenantId) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const nextBillStr = calculateNextBillingDate(todayStr);

    const updated = tenants.map((t) => {
      if (t.id === tenantId) {
        return {
          ...t,
          paymentStatus: 'PAID',
          activatedAt: todayStr,
          nextBillingDate: nextBillStr,
          status: 'ACTIVE'
        };
      }
      return t;
    });

    setTenants(updated);
    localStorage.setItem('pharmalink_superadmin_tenants', JSON.stringify(updated));
    showNotification(`Payment recorded for Tenant ${tenantId}! Membership extended 30 days to ${nextBillStr}.`);
  };

  const handleUpdatePaymentStatus = (tenantId, newStatus) => {
    const updated = tenants.map((t) => (t.id === tenantId ? { ...t, paymentStatus: newStatus } : t));
    setTenants(updated);
    localStorage.setItem('pharmalink_superadmin_tenants', JSON.stringify(updated));
    showNotification(`Tenant ${tenantId} payment status updated to ${newStatus}.`);
  };

  const handleToggleTenantStatus = (tenantId, currentStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const updated = tenants.map((t) => (t.id === tenantId ? { ...t, status: nextStatus } : t));
    setTenants(updated);
    localStorage.setItem('pharmalink_superadmin_tenants', JSON.stringify(updated));
    showNotification(`Tenant ${tenantId} status updated to ${nextStatus}.`);
  };

  const handleResolveTicket = (ticketId) => {
    const updated = tickets.map((tk) => (tk.id === ticketId ? { ...tk, status: 'RESOLVED' } : tk));
    setTickets(updated);
    localStorage.setItem('pharmalink_superadmin_tickets', JSON.stringify(updated));
    showNotification(`Support Ticket ${ticketId} marked as RESOLVED.`);
  };

  const filteredTenants = tenants.filter((t) => {
    if (!tenantSearchQuery.trim()) return true;
    const q = tenantSearchQuery.toLowerCase().trim();
    return (
      t.id.toLowerCase().includes(q) ||
      t.storeName.toLowerCase().includes(q) ||
      t.adminUsername.toLowerCase().includes(q) ||
      (t.dslNumber && t.dslNumber.toLowerCase().includes(q))
    );
  });

  const dueMembershipsCount = tenants.filter((t) => isMembershipDue(t)).length;
  const totalMonthlyFeeSum = tenants.reduce((sum, t) => sum + (Number(t.monthlyFee) || 15000), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem', backgroundColor: '#F8FAFC', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* 1. MASTER OCEAN CYAN BLUE HEADER BANNER */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
        color: '#FFFFFF',
        padding: '1.5rem 1.75rem',
        border: 'none',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '10px',
            backgroundColor: '#FFFFFF',
            color: '#0284C7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <ShieldCheck size={26} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>
              Super-Admin Control Panel — Welcome back, rubyan 👋
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#E0F2FE', marginTop: '0.2rem', margin: 0 }}>
              Master SaaS Multi-Tenant Management & 30-Day Client Subscription Billing System.
            </p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="btn"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            color: '#FFFFFF',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            fontWeight: 800,
            fontSize: '0.825rem',
            padding: '0.5rem 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            borderRadius: '6px'
          }}
        >
          <LogOut size={16} /> Sign Out (rubyan)
        </button>
      </div>

      {/* SUCCESS NOTIFICATION */}
      {successMsg && (
        <div style={{ backgroundColor: '#D1FAE5', border: '1.5px solid #10B981', color: '#065F46', padding: '0.85rem 1.25rem', borderRadius: '8px', fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={20} /> {successMsg}
        </div>
      )}

      {/* 2. KPI METRICS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        {/* Metric 1: Active Tenants */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 700, color: '#64748B' }}>Active Client Tenants</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '6px', backgroundColor: '#E0F2FE', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Store size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#0F172A' }}>
            {tenants.filter(t => t.status === 'ACTIVE').length} Tenants
          </div>
          <div style={{ fontSize: '0.75rem', color: '#0284C7', fontWeight: 700, marginTop: '0.2rem' }}>
            Fully Isolated Databases
          </div>
        </div>

        {/* Metric 2: Monthly Membership Dues Alert */}
        <div className="card" style={{ padding: '1.25rem', border: dueMembershipsCount > 0 ? '1.5px solid #EF4444' : '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 700, color: '#64748B' }}>Monthly Membership Due</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '6px', backgroundColor: dueMembershipsCount > 0 ? '#FEF2F2' : '#F1F5F9', color: dueMembershipsCount > 0 ? '#DC2626' : '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 900, color: dueMembershipsCount > 0 ? '#DC2626' : '#059669' }}>
            {dueMembershipsCount} Clients Due
          </div>
          <div style={{ fontSize: '0.75rem', color: dueMembershipsCount > 0 ? '#DC2626' : '#059669', fontWeight: 700, marginTop: '0.2rem' }}>
            {dueMembershipsCount > 0 ? '🚨 Contact Clients to Collect Fee' : 'All Accounts Up to Date'}
          </div>
        </div>

        {/* Metric 3: Total Monthly SaaS Run-Rate */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 700, color: '#64748B' }}>Monthly Subscription Volume</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '6px', backgroundColor: '#D1FAE5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#059669' }}>
            Rs. {totalMonthlyFeeSum.toLocaleString()}/mo
          </div>
          <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700, marginTop: '0.2rem' }}>
            30-Day Recurring Memberships
          </div>
        </div>

        {/* Metric 4: Unresolved Tickets */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 700, color: '#64748B' }}>Support Tickets Desk</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '6px', backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LifeBuoy size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#D97706' }}>
            {tickets.filter(tk => tk.status === 'OPEN').length} Issues
          </div>
          <div style={{ fontSize: '0.75rem', color: '#D97706', fontWeight: 700, marginTop: '0.2rem' }}>
            100% Free Support Logs
          </div>
        </div>
      </div>

      {/* 3. SUB-TABS NAVIGATION BAR */}
      <div className="card" style={{ padding: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('TENANTS')}
            className={`btn ${activeTab === 'TENANTS' ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: '0.825rem', fontWeight: 800 }}
          >
            <Store size={16} /> Client Tenants & Membership Billing ({tenants.length})
          </button>

          <button
            onClick={() => setActiveTab('TICKETS')}
            className={`btn ${activeTab === 'TICKETS' ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: '0.825rem', fontWeight: 800 }}
          >
            <LifeBuoy size={16} /> Free Client Support Tickets ({tickets.length})
          </button>
        </div>

        {activeTab === 'TENANTS' && (
          <button
            onClick={() => setIsOnboardModalOpen(true)}
            className="btn btn-primary"
            style={{ fontSize: '0.825rem', fontWeight: 900, backgroundColor: '#0284C7', color: '#FFF' }}
          >
            <Plus size={16} /> [Onboard New Client Tenant]
          </button>
        )}
      </div>

      {/* TAB 1: CLIENT TENANT DIRECTORY & MONTHLY BILLING */}
      {activeTab === 'TENANTS' && (
        <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0369A1', margin: 0 }}>
                🏢 Active Client Tenants & 30-Day Subscription Ledger
              </h3>
              <p style={{ fontSize: '0.775rem', color: '#64748B', marginTop: '0.15rem', margin: 0 }}>
                Track monthly payment statuses, dues, and record membership renewal collections.
              </p>
            </div>
            
            <div style={{ position: 'relative', width: '280px' }}>
              <Search size={15} style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
              <input
                type="text"
                value={tenantSearchQuery}
                onChange={(e) => setTenantSearchQuery(e.target.value)}
                placeholder="Search tenant ID or store name..."
                style={{ width: '100%', padding: '0.4rem 0.65rem 0.4rem 2.2rem', fontSize: '0.8rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontWeight: 700 }}
              />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ fontSize: '0.825rem', width: '100%' }}>
              <thead>
                <tr style={{ backgroundColor: '#F1F5F9' }}>
                  <th>Tenant ID</th>
                  <th>Store / Pharmacy Name</th>
                  <th>Contact Phone</th>
                  <th>Admin User</th>
                  <th>Monthly Fee</th>
                  <th>Payment Status</th>
                  <th>Next Billing Due</th>
                  <th>Account Status</th>
                  <th style={{ textAlign: 'center' }}>Billing & Status Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTenants.length > 0 ? (
                  filteredTenants.map((t) => {
                    const due = isMembershipDue(t);
                    return (
                      <tr key={t.id} style={{ backgroundColor: due ? '#FFFBEB' : 'transparent' }}>
                        <td style={{ fontFamily: 'monospace', fontWeight: 900, color: '#0284C7' }}>{t.id}</td>
                        <td>
                          <strong>{t.storeName}</strong>
                          <span style={{ fontSize: '0.7rem', color: '#64748B', display: 'block' }}>DSL: {t.dslNumber || 'N/A'}</span>
                        </td>
                        <td>{t.phone}</td>
                        <td><span style={{ fontWeight: 800, color: '#0369A1' }}>{t.adminUsername}</span></td>
                        <td style={{ fontWeight: 800, color: '#0F172A' }}>
                          Rs. {(Number(t.monthlyFee) || 15000).toLocaleString()}/mo
                        </td>
                        <td>
                          {t.paymentStatus === 'PAID' && (
                            <span className="badge badge-success">
                              ✔ PAID FULL
                            </span>
                          )}
                          {t.paymentStatus === 'PARTIAL_PAID' && (
                            <span className="badge badge-warning">
                              ⚠️ PAID IN HALF
                            </span>
                          )}
                          {t.paymentStatus === 'DEBT_DUE' && (
                            <span className="badge badge-danger">
                              🚨 DEBT DUE
                            </span>
                          )}
                        </td>
                        <td>
                          <div style={{ fontWeight: 800, color: due ? '#DC2626' : '#334155' }}>
                            {t.nextBillingDate || 'N/A'}
                          </div>
                          {due && (
                            <span style={{ fontSize: '0.675rem', fontWeight: 900, color: '#DC2626', backgroundColor: '#FEE2E2', padding: '0.15rem 0.4rem', borderRadius: '4px', display: 'inline-block', marginTop: '0.15rem' }}>
                              🚨 MEMBERSHIP DUE — CONTACT CLIENT!
                            </span>
                          )}
                        </td>
                        <td>
                          <span className={`badge ${t.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                            {t.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', alignItems: 'center' }}>
                            {/* Record Payment Button */}
                            <button
                              onClick={() => handleRecordPayment(t.id)}
                              className="btn"
                              style={{
                                padding: '0.3rem 0.65rem',
                                fontSize: '0.725rem',
                                fontWeight: 900,
                                backgroundColor: '#10B981',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '4px',
                                width: '100%',
                                cursor: 'pointer'
                              }}
                              title="Record payment collection and extend 30 days"
                            >
                              💳 Record Fee Paid (+30 Days)
                            </button>

                            <div style={{ display: 'flex', gap: '0.25rem', width: '100%' }}>
                              <button
                                onClick={() => handleUpdatePaymentStatus(t.id, t.paymentStatus === 'PARTIAL_PAID' ? 'DEBT_DUE' : 'PARTIAL_PAID')}
                                className="btn btn-outline"
                                style={{ padding: '0.2rem 0.4rem', fontSize: '0.675rem', fontWeight: 800, flex: 1, borderColor: '#D97706', color: '#D97706' }}
                              >
                                {t.paymentStatus === 'PARTIAL_PAID' ? 'Set Debt Due' : 'Set Half Paid'}
                              </button>

                              <button
                                onClick={() => handleToggleTenantStatus(t.id, t.status)}
                                className="btn btn-outline"
                                style={{
                                  padding: '0.2rem 0.4rem',
                                  fontSize: '0.675rem',
                                  fontWeight: 800,
                                  flex: 1,
                                  borderColor: t.status === 'ACTIVE' ? '#DC2626' : '#059669',
                                  color: t.status === 'ACTIVE' ? '#DC2626' : '#059669'
                                }}
                              >
                                {t.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '1.5rem', color: '#94A3B8' }}>
                      No client tenants found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: FREE SUPPORT TICKET DESK */}
      {activeTab === 'TICKETS' && (
        <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0369A1', margin: 0 }}>
            📥 Client Support Tickets & Telemetry Error Log (100% Free)
          </h3>

          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ fontSize: '0.825rem', width: '100%' }}>
              <thead>
                <tr style={{ backgroundColor: '#F1F5F9' }}>
                  <th>Ticket ID</th>
                  <th>Tenant ID & Store</th>
                  <th>Reported By</th>
                  <th>Screen</th>
                  <th>Issue Summary & Details</th>
                  <th>Status</th>
                  <th>Date & Time</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {tickets.length > 0 ? (
                  tickets.map((tk) => (
                    <tr key={tk.id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 900, color: '#D97706' }}>{tk.id}</td>
                      <td>
                        <strong>{tk.storeName}</strong>
                        <span style={{ fontSize: '0.7rem', color: '#64748B', display: 'block' }}>{tk.tenantId}</span>
                      </td>
                      <td>{tk.reportedBy}</td>
                      <td><span style={{ fontWeight: 700, color: '#0284C7' }}>{tk.screen}</span></td>
                      <td style={{ maxWidth: '300px' }}>
                        <div style={{ fontWeight: 800, color: '#0F172A' }}>{tk.issueTitle}</div>
                        <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.15rem' }}>{tk.issueDetails}</div>
                      </td>
                      <td>
                        <span className={`badge ${tk.status === 'OPEN' ? 'badge-warning' : 'badge-success'}`}>
                          {tk.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.75rem', color: '#64748B' }}>{tk.createdAt}</td>
                      <td style={{ textAlign: 'center' }}>
                        {tk.status === 'OPEN' ? (
                          <button
                            onClick={() => handleResolveTicket(tk.id)}
                            className="btn btn-outline"
                            style={{ padding: '0.25rem 0.65rem', fontSize: '0.725rem', fontWeight: 800, borderColor: '#059669', color: '#059669' }}
                          >
                            Mark Resolved
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.725rem', color: '#059669', fontWeight: 800 }}>✔ Resolved</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '1.5rem', color: '#94A3B8' }}>
                      No support tickets reported.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. MODAL: ONBOARD NEW CLIENT TENANT */}
      {isOnboardModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '540px', padding: '0', overflow: 'hidden', border: '1.5px solid #0284C7' }}>
            <div style={{ backgroundColor: '#0284C7', color: '#FFFFFF', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 900, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Store size={20} /> Onboard New Client Tenant & Set 30-Day Membership
              </div>
              <button onClick={() => setIsOnboardModalOpen(false)} style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleOnboardTenant} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 800, display: 'block', marginBottom: '0.2rem' }}>Store / Pharmacy Name *:</label>
                <input
                  type="text"
                  value={newStoreName}
                  onChange={(e) => setNewStoreName(e.target.value)}
                  placeholder="e.g. Al-Madina Wholesale Pharmacy"
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #CBD5E1', fontWeight: 700 }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 800, display: 'block', marginBottom: '0.2rem' }}>Admin Username *:</label>
                  <input
                    type="text"
                    value={newAdminUsername}
                    onChange={(e) => setNewAdminUsername(e.target.value)}
                    placeholder="e.g. madina_admin"
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #CBD5E1', fontWeight: 700 }}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 800, display: 'block', marginBottom: '0.2rem' }}>Temporary Password *:</label>
                  <input
                    type="text"
                    value={newTempPassword}
                    onChange={(e) => setNewTempPassword(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #CBD5E1', fontWeight: 700, fontFamily: 'monospace' }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 800, display: 'block', marginBottom: '0.2rem' }}>Monthly Fee (Rs.) *:</label>
                  <input
                    type="number"
                    value={newMonthlyFee}
                    onChange={(e) => setNewMonthlyFee(e.target.value)}
                    placeholder="15000"
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #CBD5E1', fontWeight: 700 }}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 800, display: 'block', marginBottom: '0.2rem' }}>Initial Payment Status *:</label>
                  <select
                    value={newPaymentStatus}
                    onChange={(e) => setNewPaymentStatus(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #CBD5E1', fontWeight: 700 }}
                  >
                    <option value="PAID">✔ Paid Full</option>
                    <option value="PARTIAL_PAID">⚠️ Paid in Half</option>
                    <option value="DEBT_DUE">🚨 Debt Due</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 800, display: 'block', marginBottom: '0.2rem' }}>Contact Phone:</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="e.g. 0300-8899112"
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #CBD5E1', fontWeight: 700 }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 800, display: 'block', marginBottom: '0.2rem' }}>DSL License No.:</label>
                  <input
                    type="text"
                    value={newDslNumber}
                    onChange={(e) => setNewDslNumber(e.target.value)}
                    placeholder="e.g. 09-342-0139-99"
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #CBD5E1', fontWeight: 700 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 800, display: 'block', marginBottom: '0.2rem' }}>Store Address:</label>
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="e.g. Circular Road, Gujrat"
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #CBD5E1', fontWeight: 700 }}
                />
              </div>

              <div style={{ backgroundColor: '#F0F9FF', border: '1px solid #BAE6FD', padding: '0.65rem', borderRadius: '6px', fontSize: '0.75rem', color: '#0369A1', fontWeight: 700 }}>
                ✔ Automatically sets 30-day membership cycle. Next billing due date will be calculated 30 days from today.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsOnboardModalOpen(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ backgroundColor: '#0284C7', color: '#FFF', fontWeight: 900 }}
                >
                  Confirm & Provision Client Tenant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboardPage;
