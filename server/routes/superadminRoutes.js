const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { JWT_SECRET, verifySuperAdmin } = require('../middleware/authMiddleware');

// In-Memory Fallback State for Server Testing (Synced with DB in Production)
let TENANTS_STORE = [
  {
    id: 'TNT-1001',
    storeName: 'Idrees Medical Store',
    address: 'Jalal Pur Jattan, Gujrat',
    phone: '053-3724601',
    dslNumber: '09-342-0139-045748D',
    adminUsername: 'idrees_admin',
    status: 'ACTIVE',
    subscriptionTier: 'STANDARD',
    createdAt: '2026-08-12T10:00:00Z',
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
    createdAt: '2026-08-15T14:30:00Z',
  },
];

let SUPPORT_TICKETS_STORE = [
  {
    id: 'TCK-901',
    tenantId: 'TNT-1001',
    storeName: 'Idrees Medical Store',
    reportedBy: 'Ali (Cashier)',
    issueTitle: 'Thermal printer receipt alignment on 80mm roll',
    issueDetails: 'When printing 80mm thermal receipts, bottom margin cuts off driver signature line.',
    screen: 'POS Billing',
    status: 'OPEN',
    createdAt: '2026-08-17T09:15:00Z',
  },
];

// 1. SUPER-ADMIN LOGIN ROUTE (username: rubyan, password: 1234)
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  const cleanUser = (username || '').trim().toLowerCase();
  const cleanPass = (password || '').trim();

  // Validate Super-Admin credentials: "rubyan" / "1234"
  if (cleanUser === 'rubyan' && cleanPass === '1234') {
    const token = jwt.sign(
      { username: 'rubyan', role: 'SUPERADMIN', name: 'Master SaaS Admin (rubyan)' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      success: true,
      token,
      user: {
        username: 'rubyan',
        name: 'Master SaaS Admin',
        role: 'SUPERADMIN',
      },
    });
  }

  return res.status(401).json({ error: 'Invalid Super-Admin username or password' });
});

// 2. GET ALL CLIENT TENANTS
router.get('/tenants', verifySuperAdmin, (req, res) => {
  res.json({ success: true, tenants: TENANTS_STORE });
});

// 3. ONBOARD NEW CLIENT TENANT
router.post('/tenants', verifySuperAdmin, async (req, res) => {
  const { storeName, address, phone, dslNumber, adminUsername, tempPassword } = req.body;

  if (!storeName || !adminUsername || !tempPassword) {
    return res.status(400).json({ error: 'Store Name, Admin Username, and Temporary Password are required.' });
  }

  const newTenantId = `TNT-${1000 + TENANTS_STORE.length + 1}`;
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(tempPassword, salt);

  const newTenant = {
    id: newTenantId,
    storeName: storeName.trim(),
    address: (address || '').trim(),
    phone: (phone || '').trim(),
    dslNumber: (dslNumber || '').trim(),
    adminUsername: adminUsername.trim().toLowerCase(),
    status: 'ACTIVE',
    subscriptionTier: 'STANDARD',
    createdAt: new Date().toISOString(),
  };

  TENANTS_STORE.unshift(newTenant);

  res.json({
    success: true,
    message: `Client Tenant "${storeName}" onboarded successfully!`,
    tenant: newTenant,
    credentials: {
      tenantId: newTenantId,
      username: adminUsername,
      tempPassword,
      forcePasswordReset: true,
    },
  });
});

// 4. TOGGLE TENANT ACCOUNT STATUS (ACTIVE / SUSPENDED)
router.patch('/tenants/:id/status', verifySuperAdmin, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const tenant = TENANTS_STORE.find((t) => t.id === id);
  if (!tenant) {
    return res.status(404).json({ error: 'Tenant account not found' });
  }

  tenant.status = status === 'SUSPENDED' ? 'SUSPENDED' : 'ACTIVE';
  res.json({ success: true, message: `Tenant status updated to ${tenant.status}`, tenant });
});

// 5. GET ALL FREE SUPPORT TICKETS
router.get('/tickets', verifySuperAdmin, (req, res) => {
  res.json({ success: true, tickets: SUPPORT_TICKETS_STORE });
});

// 6. RESOLVE SUPPORT TICKET
router.patch('/tickets/:id/status', verifySuperAdmin, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const ticket = SUPPORT_TICKETS_STORE.find((t) => t.id === id);
  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  ticket.status = status || 'RESOLVED';
  res.json({ success: true, message: `Ticket ${id} marked as ${ticket.status}`, ticket });
});

module.exports = router;
