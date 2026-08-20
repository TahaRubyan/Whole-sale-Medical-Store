-- ====================================================================
-- PHARMALINK ERP - MULTI-TENANT SUPABASE POSTGRESQL SCHEMA MIGRATION
-- ====================================================================

-- 1. TENANTS MASTER TABLE
CREATE TABLE IF NOT EXISTS tenants (
    id VARCHAR(64) PRIMARY KEY,
    store_name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(64),
    dsl_number VARCHAR(128),
    stn_number VARCHAR(128),
    ntn_number VARCHAR(128),
    status VARCHAR(32) DEFAULT 'ACTIVE', -- 'ACTIVE' | 'SUSPENDED'
    subscription_tier VARCHAR(32) DEFAULT 'STANDARD', -- 'STANDARD' | 'PREMIUM'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast tenant lookup
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);

-- 2. USERS TABLE (SUPERADMIN & TENANT USERS)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    username VARCHAR(128) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL, -- 'SUPERADMIN' | 'Admin' | 'Cashier'
    force_password_reset BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_tenant_role ON users(tenant_id, role);

-- 3. MEDICINES CATALOG TABLE
CREATE TABLE IF NOT EXISTS medicines (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    brand_name VARCHAR(255) NOT NULL,
    generic_formula VARCHAR(255),
    category VARCHAR(128),
    manufacturer VARCHAR(255),
    rack_location VARCHAR(128),
    reorder_level INT DEFAULT 20,
    tablets_per_box INT DEFAULT 200,
    box_price NUMERIC(12, 2) DEFAULT 0,
    purchase_price_box NUMERIC(12, 2) DEFAULT 0,
    barcode VARCHAR(128),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_medicines_tenant ON medicines(tenant_id, brand_name);

-- 4. BATCHES & STOCK INVENTORY TABLE
CREATE TABLE IF NOT EXISTS batches (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    medicine_id VARCHAR(64) NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
    batch_number VARCHAR(128) NOT NULL,
    mfg_date DATE,
    expiry_date DATE NOT NULL,
    total_boxes_available INT DEFAULT 0,
    total_tablets_available INT DEFAULT 0,
    distributor_name VARCHAR(255),
    status VARCHAR(32) DEFAULT 'In Stock',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_batches_tenant_exp ON batches(tenant_id, expiry_date);

-- 5. INVOICES & SALES TABLE
CREATE TABLE IF NOT EXISTS invoices (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    invoice_no VARCHAR(128) NOT NULL,
    sale_date DATE NOT NULL,
    cashier_name VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255),
    shop_name VARCHAR(255),
    region VARCHAR(128),
    subtotal NUMERIC(12, 2) DEFAULT 0,
    discount NUMERIC(12, 2) DEFAULT 0,
    tax NUMERIC(12, 2) DEFAULT 0,
    net_total NUMERIC(12, 2) DEFAULT 0,
    remaining_debt NUMERIC(12, 2) DEFAULT 0,
    payment_status VARCHAR(64) DEFAULT 'PAID',
    items JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_invoices_tenant_date ON invoices(tenant_id, sale_date);

-- 6. SUPPORT TICKETS TABLE (100% FREE ISSUE TRACKER FOR SUPER-ADMIN)
CREATE TABLE IF NOT EXISTS support_tickets (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    reported_by VARCHAR(255) NOT NULL,
    issue_title VARCHAR(255) NOT NULL,
    issue_details TEXT NOT NULL,
    screen VARCHAR(128),
    status VARCHAR(32) DEFAULT 'OPEN', -- 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tickets_tenant_status ON support_tickets(tenant_id, status);
