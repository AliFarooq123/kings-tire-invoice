const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-insecure-secret-change-me';
const TOKEN_EXPIRY = '8h';

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

app.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (
    process.env.SHOP_USERNAME &&
    username === process.env.SHOP_USERNAME &&
    password === process.env.SHOP_PASSWORD
  ) {
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
    return res.json({ success: true, token });
  }
  return res.status(401).json({ error: 'Invalid credentials' });
});

// Auth middleware — requires a valid JWT in the Authorization header
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'Missing authorization token' });
  }
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Protect all /invoices routes
app.use('/invoices', requireAuth);

function extractInvoiceFields(body) {
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
    items,
  } = body;
  return {
    fields: [
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
    ],
    items: items || [],
  };
}

const INVOICE_COLUMNS = `
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
`;

async function insertInvoiceItems(invoiceId, items) {
  for (const item of items) {
    await pool.query(
      `INSERT INTO invoice_items (invoice_id, qty, description, amount) VALUES ($1, $2, $3, $4)`,
      [invoiceId, item.qty, item.description, item.amount]
    );
  }
}

app.post('/invoices', async (req, res) => {
  const { fields, items } = extractInvoiceFields(req.body);
  const placeholders = fields.map((_, i) => `$${i + 1}`).join(',');

  try {
    const invoiceResult = await pool.query(
      `INSERT INTO invoices (${INVOICE_COLUMNS}) VALUES (${placeholders}) RETURNING id, ard_number`,
      fields
    );

    const { id: invoiceId, ard_number: ardNumber } = invoiceResult.rows[0];
    await insertInvoiceItems(invoiceId, items);

    res.json({ success: true, id: invoiceId, ard_number: ardNumber });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save invoice' });
  }
});

app.get('/invoices/search', async (req, res) => {
  const { q, start_date, end_date } = req.query;
  const conditions = [];
  const params = [];
  let idx = 1;

  const trimmed = (q || '').trim();
  if (trimmed) {
    conditions.push(`(
      customer_name ILIKE $${idx}
      OR license_plate ILIKE $${idx}
      OR vin ILIKE $${idx}
      OR phone ILIKE $${idx}
      OR (ard_number IS NOT NULL AND ard_number::text ILIKE $${idx})
      OR (ard_number IS NOT NULL AND ('ARD' || LPAD(ard_number::text, 8, '0')) ILIKE $${idx})
    )`);
    params.push(`%${trimmed}%`);
    idx += 1;
  }

  if (start_date) {
    conditions.push(`created_at >= $${idx}::date`);
    params.push(start_date);
    idx += 1;
  }

  if (end_date) {
    conditions.push(`created_at < ($${idx}::date + interval '1 day')`);
    params.push(end_date);
    idx += 1;
  }

  if (conditions.length === 0) {
    return res.json([]);
  }

  try {
    const result = await pool.query(
      `SELECT * FROM invoices WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC`,
      params
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Search failed' });
  }
});

app.delete('/invoices/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(`DELETE FROM invoice_items WHERE invoice_id = $1`, [id]);
    const result = await pool.query(`DELETE FROM invoices WHERE id = $1 RETURNING id`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete invoice' });
  }
});

app.get('/invoices/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const invoice = await pool.query(`SELECT * FROM invoices WHERE id = $1`, [id]);
    if (invoice.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    const items = await pool.query(`SELECT * FROM invoice_items WHERE invoice_id = $1`, [id]);
    res.json({ ...invoice.rows[0], items: items.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get invoice' });
  }
});

app.put('/invoices/:id', async (req, res) => {
  const { id } = req.params;
  const { fields, items } = extractInvoiceFields(req.body);
  const setClause = INVOICE_COLUMNS.split(',')
    .map((col, i) => `${col.trim()} = $${i + 1}`)
    .join(', ');

  try {
    const result = await pool.query(
      `UPDATE invoices SET ${setClause} WHERE id = $${fields.length + 1} RETURNING id, ard_number`,
      [...fields, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    await pool.query(`DELETE FROM invoice_items WHERE invoice_id = $1`, [id]);
    await insertInvoiceItems(id, items);

    res.json({ success: true, id: result.rows[0].id, ard_number: result.rows[0].ard_number });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update invoice' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
