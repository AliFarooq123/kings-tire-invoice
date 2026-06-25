import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import ReceiptLayout from '../components/ReceiptLayout';
import SuggestionPanel from '../components/SuggestionPanel';
import { getInvoice, updateInvoice } from '../api/invoices';
import {
  useInvoiceForm,
  invoiceFromApi,
  buildInvoicePayload,
} from '../hooks/useInvoiceForm';
import { filterItemsForSave } from '../utils/calculations';
import { MIN_LINE_ROWS } from '../constants/receipt';

function InvoiceDetailContent({ id, shouldPrint }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [ardNumber, setArdNumber] = useState(null);
  const printedRef = useRef(false);

  const {
    data,
    setData,
    items,
    setItems,
    onChange,
    onPaymentChange,
    onItemChange,
    addRow,
    removeRow,
  } = useInvoiceForm();

  useEffect(() => {
    let cancelled = false;

    getInvoice(id)
      .then((apiData) => {
        if (cancelled) return;
        const { data: loaded, items: loadedItems } = invoiceFromApi(apiData);
        setData(loaded);
        setItems(loadedItems);
        setArdNumber(apiData.ard_number);
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadFailed(true);
          setError(err.message || 'Failed to load invoice');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, setData, setItems]);

  useEffect(() => {
    if (!loading && !loadFailed && shouldPrint && !printedRef.current) {
      printedRef.current = true;
      const t = setTimeout(() => window.print(), 300);
      return () => clearTimeout(t);
    }
  }, [loading, loadFailed, shouldPrint]);

  const handleSave = async () => {
    setError('');
    setSuccess('');
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
      const result = await updateInvoice(id, payload);
      setArdNumber(result.ard_number);
      setSuccess('Invoice saved successfully.');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to save invoice');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrap">
        <p className="loading-text">Loading invoice…</p>
      </div>
    );
  }

  if (loadFailed) {
    return (
      <div className="page-wrap">
        <p className="error-msg">{error || 'Invoice not found'}</p>
        <button type="button" className="no-print" onClick={() => navigate('/')}>
          New Invoice
        </button>
      </div>
    );
  }

  return (
    <div className="page-wrap">
      <div className="page-toolbar no-print">
        <button type="button" onClick={() => navigate(-1)}>
          Back
        </button>
        <button type="button" onClick={() => navigate('/search')}>
          Search
        </button>
        <button type="button" className="btn-primary" onClick={() => window.print()}>
          Print
        </button>
        <button type="button" className="btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
        {error && <span className="error-msg">{error}</span>}
        {success && <span className="success-msg">{success}</span>}
      </div>

      <ReceiptLayout
        mode="edit"
        data={data}
        items={items}
        ardNumber={ardNumber}
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

export default function InvoiceDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const shouldPrint = searchParams.get('print') === '1';

  return <InvoiceDetailContent key={id} id={id} shouldPrint={shouldPrint} />;
}
