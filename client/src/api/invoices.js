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

export async function updateInvoice(id, payload) {
  const res = await fetch(`/invoices/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update invoice');
  }
  return res.json();
}

export async function searchInvoices({ q = '', startDate = '', endDate = '' } = {}) {
  const params = new URLSearchParams();
  if (q.trim()) params.set('q', q.trim());
  if (startDate) params.set('start_date', startDate);
  if (endDate) params.set('end_date', endDate);
  const res = await fetch(`/invoices/search?${params.toString()}`);
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

export async function deleteInvoice(id) {
  const res = await fetch(`/invoices/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Delete failed');
  return res.json();
}
