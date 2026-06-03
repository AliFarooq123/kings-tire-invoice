-- Kings Tire invoices schema / migrations
-- Run manually: psql $DATABASE_URL -f schema.sql

CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  ard_number SERIAL UNIQUE,
  customer_name TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  date DATE,
  vehicle_year TEXT,
  vehicle_make TEXT,
  vehicle_model TEXT,
  license_plate TEXT,
  vin TEXT,
  mileage TEXT,
  payment_cash BOOLEAN DEFAULT FALSE,
  payment_charge BOOLEAN DEFAULT FALSE,
  payment_check BOOLEAN DEFAULT FALSE,
  payment_finance BOOLEAN DEFAULT FALSE,
  labor NUMERIC(10, 2),
  subtotal NUMERIC(10, 2),
  sales_tax NUMERIC(10, 2),
  new_tire_fee NUMERIC(10, 2),
  tire_oil_disposal NUMERIC(10, 2),
  total NUMERIC(10, 2),
  deposit NUMERIC(10, 2),
  balance_due NUMERIC(10, 2),
  special_tire_pressure BOOLEAN DEFAULT FALSE,
  special_valve_stem BOOLEAN DEFAULT FALSE,
  special_torque_lugs BOOLEAN DEFAULT FALSE,
  special_alignment BOOLEAN DEFAULT FALSE,
  special_alignment_initial TEXT,
  special_flat_repair BOOLEAN DEFAULT FALSE,
  special_rotation BOOLEAN DEFAULT FALSE,
  special_no_warranty BOOLEAN DEFAULT FALSE,
  special_checked_water BOOLEAN DEFAULT FALSE,
  special_no_read_hazardous BOOLEAN DEFAULT FALSE,
  special_no_warranty_low_profile BOOLEAN DEFAULT FALSE,
  special_no_warranty_used_tire BOOLEAN DEFAULT FALSE,
  special_not_aligned BOOLEAN DEFAULT FALSE,
  special_new_or_used_shown BOOLEAN DEFAULT FALSE,
  special_installed_customer_request BOOLEAN DEFAULT FALSE,
  customer_inspected_initial TEXT,
  customer_read_initial TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoice_items (
  id SERIAL PRIMARY KEY,
  invoice_id INTEGER REFERENCES invoices(id) ON DELETE CASCADE,
  qty NUMERIC(10, 2),
  description TEXT,
  amount NUMERIC(10, 2)
);

-- For existing databases created before ard_number existed
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS ard_number SERIAL UNIQUE;
