import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import ReceiptLayout from '../components/ReceiptLayout';
import { getInvoice } from '../api/invoices';

function InvoiceDetailContent({ id, shouldPrint }) {
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const printedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    getInvoice(id)
      .then((data) => {
        if (!cancelled) setInvoice(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Failed to load invoice');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!loading && invoice && shouldPrint && !printedRef.current) {
      printedRef.current = true;
      const t = setTimeout(() => window.print(), 300);
      return () => clearTimeout(t);
    }
  }, [loading, invoice, shouldPrint]);

  if (loading) {
    return (
      <div className="page-wrap">
        <p className="loading-text">Loading invoice…</p>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="page-wrap">
        <p className="error-msg">{error || 'Invoice not found'}</p>
        <button type="button" className="no-print" onClick={() => navigate('/')}>
          New Invoice
        </button>
      </div>
    );
  }

  const { items = [], ...data } = invoice;

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
      </div>

      <ReceiptLayout mode="view" data={data} items={items} invoiceId={id} />
    </div>
  );
}

export default function InvoiceDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const shouldPrint = searchParams.get('print') === '1';

  return <InvoiceDetailContent key={id} id={id} shouldPrint={shouldPrint} />;
}
