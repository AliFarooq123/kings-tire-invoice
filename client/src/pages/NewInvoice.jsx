import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReceiptLayout from '../components/ReceiptLayout';
import SuggestionPanel from '../components/SuggestionPanel';
import { saveInvoice } from '../api/invoices';
import {
  useInvoiceForm,
  buildInvoicePayload,
  initialInvoice,
} from '../hooks/useInvoiceForm';
import { filterItemsForSave } from '../utils/calculations';
import { MIN_LINE_ROWS } from '../constants/receipt';

export default function NewInvoice() {
  const navigate = useNavigate();
  const {
    data,
    items,
    onChange,
    onPaymentChange,
    onItemChange,
    addRow,
    removeRow,
  } = useInvoiceForm(initialInvoice());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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

    const payload = buildInvoicePayload(data, items);

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
        data={data}
        items={items}
        onChange={onChange}
        onItemChange={onItemChange}
        onPaymentChange={onPaymentChange}
      />

      <SuggestionPanel
        items={items}
        labor={data.labor}
        newTireFee={data.new_tire_fee}
        tireOilDisposal={data.tire_oil_disposal}
        deposit={data.deposit}
      />

      <div className="receipt-item-controls no-print">
        <button type="button" onClick={addRow}>
          Add row
        </button>
        <button type="button" onClick={removeRow} disabled={items.length <= MIN_LINE_ROWS}>
          Remove row
        </button>
      </div>
    </div>
  );
}
