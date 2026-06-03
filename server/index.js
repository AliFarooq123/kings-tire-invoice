const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function ensureSchema() {
  await pool.query(`
    ALTER TABLE invoices
    ADD COLUMN IF NOT EXISTS ard_number SERIAL UNIQUE
  `);
}

ensureSchema().catch((err) => {
  console.error('Schema check failed (is DATABASE_URL set?):', err.message);
});

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Kings Tire API is running' });
});

// Save a new invoice
app.post('/invoices', async (req, res) => {
  const {
    customer_name, phone, address, city, state, zip, date,
    vehicle_year, vehicle_make, vehicle_model, license_plate, vin, mileage,
    payment_cash, payment_charge, payment_check, payment_finance,
    labor, subtotal, sales_tax, new_tire_fee, tire_oil_disposal,
    total, deposit, balance_due,
    special_tire_pressure, special_valve_stem, special_torque_lugs,
    special_alignment, special_alignment_initial, special_flat_repair,
    special_rotation, special_no_warranty, special_checked_water,
    special_no_read_hazardous, special_no_warranty_low_profile,
    special_no_warranty_used_tire, special_not_aligned,
    special_new_or_used_shown, special_installed_customer_request,
    customer_inspected_initial, customer_read_initial,
    items
  } = req.body;

  try {
    const invoiceResult = await pool.query(
      `INSERT INTO invoices (
        customer_name, phone, address, city, state, zip, date,
        vehicle_year, vehicle_make, vehicle_model, license_plate, vin, mileage,
        payment_cash, payment_charge, payment_check, payment_finance,
        labor, subtotal, sales_tax, new_tire_fee, tire_oil_disposal,
        total, deposit, balance_due,
        special_tire_pressure, special_valve_stem, special_torque_lugs,
        special_alignment, special_alignment_initial, special_flat_repair,
        special_rotation, special_no_warranty, special_checked_water,
        special_no_read_hazardous, special_no_warranty_low_profile,
        special_no_warranty_used_tire, special_not_aligned,
        special_new_or_used_shown, special_installed_customer_request,
        customer_inspected_initial, customer_read_initial
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,
        $18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,
        $33,$34,$35,$36,$37,$38,$39,$40,$41,$42
      ) RETURNING id, ard_number`,
      [
        customer_name, phone, address, city, state, zip, date,
        vehicle_year, vehicle_make, vehicle_model, license_plate, vin, mileage,
        payment_cash, payment_charge, payment_check, payment_finance,
        labor, subtotal, sales_tax, new_tire_fee, tire_oil_disposal,
        total, deposit, balance_due,
        special_tire_pressure, special_valve_stem, special_torque_lugs,
        special_alignment, special_alignment_initial, special_flat_repair,
        special_rotation, special_no_warranty, special_checked_water,
        special_no_read_hazardous, special_no_warranty_low_profile,
        special_no_warranty_used_tire, special_not_aligned,
        special_new_or_used_shown, special_installed_customer_request,
        customer_inspected_initial, customer_read_initial
      ]
    );

    const { id: invoiceId, ard_number: ardNumber } = invoiceResult.rows[0];

    for (const item of items) {
      await pool.query(
        `INSERT INTO invoice_items (invoice_id, qty, description, amount) VALUES ($1, $2, $3, $4)`,
        [invoiceId, item.qty, item.description, item.amount]
      );
    }

    res.json({ success: true, id: invoiceId, ard_number: ardNumber });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save invoice' });
  }
});

// Search invoices
app.get('/invoices/search', async (req, res) => {
  const { q } = req.query;
  try {
    const result = await pool.query(
      `SELECT * FROM invoices 
       WHERE customer_name ILIKE $1 
       OR license_plate ILIKE $1 
       OR vin ILIKE $1
       OR phone ILIKE $1
       OR ard_number::text ILIKE $1
       OR ('ARD' || LPAD(ard_number::text, 8, '0')) ILIKE $1
       ORDER BY created_at DESC`,
      [`%${q}%`]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Get one invoice by id
app.get('/invoices/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const invoice = await pool.query(`SELECT * FROM invoices WHERE id = $1`, [id]);
    const items = await pool.query(`SELECT * FROM invoice_items WHERE invoice_id = $1`, [id]);
    res.json({ ...invoice.rows[0], items: items.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get invoice' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});