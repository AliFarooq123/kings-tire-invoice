export async function saveInvoice(payload) {
  const res = await fetch('/invoices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to save invoice');
  }
  return res.json();
}

export async function searchInvoices(q) {
  const res = await fetch(`/invoices/search?q=${encodeURIComponent(q)}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Search failed');
  }
  return res.json();
}

export async function getInvoice(id) {
  const res = await fetch(`/invoices/${id}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to get invoice');
  }
  return res.json();
}
