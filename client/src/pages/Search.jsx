import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchInvoices, deleteInvoice } from '../api/invoices';
import { formatMoney, formatArdNumber } from '../utils/calculations';
import { formatDisplayDate } from '../utils/dates';

function formatDate(row) {
  if (row.date) return formatDisplayDate(row.date);
  if (row.created_at) return formatDisplayDate(row.created_at);
  return '—';
}

function vehicleLabel(row) {
  const parts = [row.vehicle_year, row.vehicle_make, row.vehicle_model].filter(Boolean);
  return parts.length ? parts.join(' ') : '—';
}

export default function Search() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const runSearch = useCallback(async () => {
    const trimmed = query.trim();
    const hasText = trimmed.length >= 2;
    const hasDates = startDate || endDate;

    if (!hasText && !hasDates) {
      setError('Enter at least 2 characters to search, or select a date range.');
      setResults([]);
      setSearched(false);
      return;
    }

    setError('');
    setLoading(true);
    setSearched(true);
    try {
      const rows = await searchInvoices({
        q: hasText ? trimmed : '',
        startDate,
        endDate,
      });
      setResults(rows);
    } catch (err) {
      setError(err.message || 'Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query, startDate, endDate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    runSearch();
  };

  const handleDelete = async (e, rowId) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this invoice?')) return;
    setDeletingId(rowId);
    try {
      await deleteInvoice(rowId);
      setResults((prev) => prev.filter((r) => r.id !== rowId));
    } catch {
      alert('Failed to delete invoice. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="search-page">
      <div className="search-layout">
        <aside className="search-filters no-print">
          <h2>Date Range</h2>
          <label htmlFor="start-date">From</label>
          <input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <label htmlFor="end-date">To</label>
          <input
            id="end-date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </aside>

        <div className="search-main">
          <h1>Search Invoices</h1>
          <form className="search-form no-print" onSubmit={handleSubmit}>
            <input
              type="search"
              placeholder="Name, phone, plate, VIN, or ARD number…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Searching…' : 'Search'}
            </button>
          </form>

          {error && <p className="error-msg">{error}</p>}
          {loading && <p className="loading-text">Searching…</p>}
          {!loading && searched && results.length === 0 && !error && (
            <p className="loading-text">No invoices found.</p>
          )}

          <ul className="search-results">
            {results.map((row) => (
              <li
                key={row.id}
                className="search-result-row"
              >
                <div
                  className="search-result-body"
                  onClick={() => navigate(`/invoices/${row.id}`)}
                >
                  <strong>{row.customer_name || 'Unknown'}</strong>
                  <div className="result-meta">
                    {row.ard_number != null && (
                      <span>{formatArdNumber(row.ard_number)} · </span>
                    )}
                    {formatDate(row)} · {vehicleLabel(row)}
                    {row.license_plate ? ` · ${row.license_plate}` : ''} · $
                    {formatMoney(row.total)}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-delete no-print"
                  onClick={(e) => handleDelete(e, row.id)}
                  disabled={deletingId === row.id}
                >
                  {deletingId === row.id ? 'Deleting…' : 'Delete'}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
