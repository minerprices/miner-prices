-- PostgreSQL Schema for Miner Prices Platform

-- Vendors table
CREATE TABLE vendors (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255),
  contact_phone VARCHAR(20),
  website VARCHAR(255),
  approved BOOLEAN DEFAULT FALSE,
  pre_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Miners table (from WhattoMine)
CREATE TABLE miners (
  id SERIAL PRIMARY KEY,
  whattomine_id INTEGER UNIQUE,
  name VARCHAR(255) NOT NULL,
  algorithm VARCHAR(100),
  power_consumption DECIMAL(10, 2),
  price DECIMAL(12, 2),
  manufacturer VARCHAR(255),
  description TEXT,
  image_url VARCHAR(500),
  specs JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  last_synced_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Hosting Locations table
CREATE TABLE locations (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  city VARCHAR(100),
  country VARCHAR(100),
  cooling_type VARCHAR(100),
  power_cost_per_kwh DECIMAL(10, 4),
  bandwidth_included_mbps INTEGER,
  setup_fee DECIMAL(12, 2),
  hosting_fee_per_kwh DECIMAL(10, 4),
  available_power_kw DECIMAL(10, 2),
  description TEXT,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  website VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vendor Approvals Log (audit trail)
CREATE TABLE approvals (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  admin_id INTEGER,
  action VARCHAR(50) NOT NULL,
  reason TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sync Log (WhattoMine sync history)
CREATE TABLE sync_log (
  id SERIAL PRIMARY KEY,
  sync_type VARCHAR(50),
  miners_added INTEGER DEFAULT 0,
  miners_updated INTEGER DEFAULT 0,
  miners_total INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'success',
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Password reset tokens
CREATE TABLE password_resets (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin accounts (for dashboard access)
CREATE TABLE admins (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'admin',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_vendors_approved ON vendors(approved);
CREATE INDEX idx_vendors_pre_approved ON vendors(pre_approved);
CREATE INDEX idx_miners_algorithm ON miners(algorithm);
CREATE INDEX idx_miners_is_active ON miners(is_active);
CREATE INDEX idx_locations_vendor_id ON locations(vendor_id);
CREATE INDEX idx_locations_is_active ON locations(is_active);
CREATE INDEX idx_approvals_vendor_id ON approvals(vendor_id);
CREATE INDEX idx_approvals_status ON approvals(status);
CREATE INDEX idx_sync_log_created_at ON sync_log(created_at);
CREATE INDEX idx_password_resets_vendor_id ON password_resets(vendor_id);
