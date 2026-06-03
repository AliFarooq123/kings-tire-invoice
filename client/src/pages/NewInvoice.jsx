import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ReceiptLayout from '../components/ReceiptLayout';
import { saveInvoice } from '../api/invoices';
import {
  calculateTotals,
  filterItemsForSave,
  parseNum,
} from '../utils/calculations';

const PAYMENT_FIELDS = [
  'payment_cash',
  'payment_charge',
  'payment_check',
  'payment_finance',
];

function emptyItem() {
  return { qty: '', description: '', amount: '' };
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function initialInvoice() {
  return {
    customer_name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    date: todayISO(),
    vehicle_year: '',
    vehicle_make: '',
    vehicle_model: '',
    license_plate: '',
    vin: '',
    mileage: '',
    payment_cash: false,
    payment_charge: false,
    payment_check: false,
    payment_finance: false,
    labor: '',
    subtotal: 0,
    sales_tax: 0,
    new_tire_fee: '',
    tire_oil_disposal: '',
    total: 0,
    deposit: '',
    balance_due: 0,
    special_tire_pressure: false,
    special_valve_stem: false,
    special_torque_lugs: false,
    special_alignment: false,
    special_alignment_initial: '',
    special_flat_repair: false,
    special_rotation: false,
    special_no_warranty: false,
    special_checked_water: false,
    special_no_read_hazardous: false,
    special_no_warranty_low_profile: false,
    special_no_warranty_used_tire: false,
    special_not_aligned: false,
    special_new_or_used_shown: false,
    special_installed_customer_request: false,
    customer_inspected_initial: '',
    customer_read_initial: '',
  };
}

export default function NewInvoice() {
  const navigate = useNavigate();
  const [data, setData] = useState(initialInvoice);
  const [items, setItems] = useState(() => Array.from({ length: 10 }, emptyItem));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const totals = useMemo(
    () =>
      calculateTotals(
        items,
        data.labor,
        data.new_tire_fee,
        data.tire_oil_disposal,
        data.deposit
      ),
    [items, data.labor, data.new_tire_fee, data.tire_oil_disposal, data.deposit]
  );

  const displayData = useMemo(
    () => ({
      ...data,
      subtotal: totals.subtotal,
      sales_tax: totals.sales_tax,
      total: totals.total,
      balance_due: totals.balance_due,
    }),
    [data, totals]
  );

  const onChange = useCallback((field, value) => {
    setData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const onPaymentChange = useCallback((field, checked) => {
    setData((prev) => {
      const next = { ...prev };
      PAYMENT_FIELDS.forEach((f) => {
        next[f] = false;
      });
      next[field] = checked;
      return next;
    });
  }, []);

  const onItemChange = useCallback((index, field, value) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }, []);

  const addRow = () => setItems((prev) => [...prev, emptyItem()]);

  const removeRow = () => {
    setItems((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  };

  const handleSave = async () => {
    setError('');
    const name = String(data.customer_name || '').trim();
    if (!name) {
      setError('Customer name is required.');
      return;
    }

    const filtered = filterItemsForSave(items);
    if (filtered.length === 0) {
      setError('Add at least one line item with description and quantity or amount.');
      return;
    }

    const payload = {
      ...data,
      ...totals,
      labor: parseNum(data.labor),
      new_tire_fee: parseNum(data.new_tire_fee),
      tire_oil_disposal: parseNum(data.tire_oil_disposal),
      deposit: parseNum(data.deposit),
      items: filtered.map((item) => ({
        qty: parseNum(item.qty),
        description: String(item.description).trim(),
        amount: parseNum(item.amount),
      })),
    };

    setSaving(true);
    try {
      const result = await saveInvoice(payload);
      navigate(`/invoices/${result.id}?print=1`);
    } catch (err) {
      setError(err.message || 'Failed to save invoice');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-wrap">
      <div className="page-toolbar no-print">
        <button type="button" className="btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save & Print'}
        </button>
        {error && <span className="error-msg">{error}</span>}
      </div>

      <ReceiptLayout
        mode="edit"
        data={displayData}
        items={items}
        onChange={onChange}
        onItemChange={onItemChange}
        onPaymentChange={onPaymentChange}
      />

      <div className="receipt-item-controls no-print">
        <button type="button" onClick={addRow}>
          Add row
        </button>
        <button type="button" onClick={removeRow}>
          Remove row
        </button>
      </div>
    </div>
  );
}
