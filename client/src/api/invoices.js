import { getToken, clearToken } from '../auth/storage';

const base = import.meta.env.VITE_API_URL ?? '';

function authHeaders(extra = {}) {
  const token = getToken();
  return {
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse(res, fallbackMessage) {
  if (res.status === 401) {
    clearToken();
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    throw new Error('Session expired. Please log in again.');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || fallbackMessage);
  }
  return res.json();
}

export async function saveInvoice(payload) {
  const res = await fetch(`${base}/invoices`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
  });
  return handleResponse(res, 'Failed to save invoice');
}

export async function updateInvoice(id, payload) {
  const res = await fetch(`${base}/invoices/${id}`, {
    method: 'PUT',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
  });
  return handleResponse(res, 'Failed to update invoice');
}

export async function searchInvoices({ q = '', startDate = '', endDate = '' } = {}) {
  const params = new URLSearchParams();
  if (q.trim()) params.set('q', q.trim());
  if (startDate) params.set('start_date', startDate);
  if (endDate) params.set('end_date', endDate);
  const res = await fetch(`${base}/invoices/search?${params.toString()}`, {
    headers: authHeaders(),
  });
  return handleResponse(res, 'Search failed');
}

export async function getInvoice(id) {
  const res = await fetch(`${base}/invoices/${id}`, {
    headers: authHeaders(),
  });
  return handleResponse(res, 'Failed to get invoice');
}

export async function deleteInvoice(id) {
  const res = await fetch(`${base}/invoices/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return handleResponse(res, 'Delete failed');
}