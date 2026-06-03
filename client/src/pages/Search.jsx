import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchInvoices } from '../api/invoices';
import { formatMoney, formatArdNumber } from '../utils/calculations';

function formatDate(row) {
  if (row.date) return row.date;
  if (row.created_at) {
    const d = new Date(row.created_at);
    return d.toLocaleDateString('en-US');
  }
  return '—';
}

function vehicleLabel(row) {
  const parts = [row.vehicle_year, row.vehicle_make, row.vehicle_model].filter(Boolean);
  return parts.length ? parts.join(' ') : '—';
}

export default function Search() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const runSearch = useCallback(async (q) => {
    const trimmed = q.trim();
    if (trimmed.length < 2) {
      setError('Enter at least 2 characters to search.');
      setResults([]);
      setSearched(false);
      return;
    }

    setError('');
    setLoading(true);
    setSearched(true);
    try {
      const rows = await searchInvoices(trimmed);
      setResults(rows);
    } catch (err) {
      setError(err.message || 'Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    runSearch(query);
  };

  return (
    <div className="search-page">
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
          <li key={row.id} onClick={() => navigate(`/invoices/${row.id}`)}>
            <strong>{row.customer_name || 'Unknown'}</strong>
            <div className="result-meta">
              {row.ard_number != null && (
                <span>{formatArdNumber(row.ard_number)} · </span>
              )}
              {formatDate(row)} · {vehicleLabel(row)}
              {row.license_plate ? ` · ${row.license_plate}` : ''} · $
              {formatMoney(row.total)}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
