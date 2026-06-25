import { useState, useCallback } from 'react';
import { todayISO, toDateInputValue } from '../utils/dates';
import { MIN_LINE_ROWS } from '../constants/receipt';
import { filterItemsForSave, parseNum } from '../utils/calculations';

const PAYMENT_FIELDS = [
  'payment_cash',
  'payment_charge',
  'payment_check',
  'payment_finance',
];

export function emptyItem() {
  return { qty: '', description: '', amount: '' };
}

export function initialInvoice() {
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
    subtotal: '',
    sales_tax: '',
    new_tire_fee: '',
    tire_oil_disposal: '',
    total: '',
    deposit: '',
    balance_due: '',
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

export function padLineItems(items, minRows = MIN_LINE_ROWS) {
  const padded = items.map((item) => ({
    qty: item.qty ?? '',
    description: item.description ?? '',
    amount: item.amount ?? '',
  }));
  while (padded.length < minRows) {
    padded.push(emptyItem());
  }
  return padded;
}

export function invoiceFromApi(apiData) {
  const { items = [], ...rest } = apiData;
  const data = { ...initialInvoice(), ...rest };
  const moneyFields = [
    'labor',
    'subtotal',
    'sales_tax',
    'new_tire_fee',
    'tire_oil_disposal',
    'total',
    'deposit',
    'balance_due',
  ];
  moneyFields.forEach((f) => {
    if (data[f] != null && data[f] !== '') data[f] = String(data[f]);
  });
  if (data.date) data.date = toDateInputValue(data.date);
  return {
    data,
    items: padLineItems(items.length ? items : [emptyItem()]),
  };
}

export function buildInvoicePayload(data, items) {
  const filtered = filterItemsForSave(items);
  return {
    ...data,
    labor: parseNum(data.labor),
    subtotal: parseNum(data.subtotal),
    sales_tax: parseNum(data.sales_tax),
    new_tire_fee: parseNum(data.new_tire_fee),
    tire_oil_disposal: parseNum(data.tire_oil_disposal),
    total: parseNum(data.total),
    deposit: parseNum(data.deposit),
    balance_due: parseNum(data.balance_due),
    items: filtered.map((item) => ({
      qty: parseNum(item.qty),
      description: String(item.description).trim(),
      amount: parseNum(item.amount),
    })),
  };
}

export function useInvoiceForm(initialData = initialInvoice(), initialItems = null) {
  const [data, setData] = useState(initialData);
  const [items, setItems] = useState(
    () => initialItems ?? padLineItems(Array.from({ length: MIN_LINE_ROWS }, emptyItem))
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
  const removeRow = () => setItems((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));

  return {
    data,
    setData,
    items,
    setItems,
    onChange,
    onPaymentChange,
    onItemChange,
    addRow,
    removeRow,
  };
}
