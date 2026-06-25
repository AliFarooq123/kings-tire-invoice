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

function ResultsList({ results, searched, loading, error, onOpen, onDelete, deletingId }) {
  if (error) return <p className="error-msg">{error}</p>;
  if (loading) return <p className="loading-text">Searching…</p>;
  if (searched && results.length === 0) {
    return <p className="loading-text">No invoices found.</p>;
  }
  return (
    <ul className="search-results">
      {results.map((row) => (
        <li key={row.id} className="search-result-row">
          <div className="search-result-body" onClick={() => onOpen(row.id)}>
            <strong>{row.customer_name || 'Unknown'}</strong>
            <div className="result-meta">
              {row.ard_number != null && <span>{formatArdNumber(row.ard_number)} · </span>}
              {formatDate(row)} · {vehicleLabel(row)}
              {row.license_plate ? ` · ${row.license_plate}` : ''} · $
              {formatMoney(row.total)}
            </div>
          </div>
          <button
            type="button"
            className="btn-delete no-print"
            onClick={(e) => onDelete(e, row.id)}
            disabled={deletingId === row.id}
          >
            {deletingId === row.id ? 'Deleting…' : 'Delete'}
          </button>
        </li>
      ))}
    </ul>
  );
}

export default function Search() {
  const navigate = useNavigate();

  // Date range search (left)
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dateResults, setDateResults] = useState([]);
  const [dateLoading, setDateLoading] = useState(false);
  const [dateError, setDateError] = useState('');
  const [dateSearched, setDateSearched] = useState(false);

  // Text search (right)
  const [query, setQuery] = useState('');
  const [textResults, setTextResults] = useState([]);
  const [textLoading, setTextLoading] = useState(false);
  const [textError, setTextError] = useState('');
  const [textSearched, setTextSearched] = useState(false);

  const [deletingId, setDeletingId] = useState(null);

  const handleDateSearch = useCallback(
    async (e) => {
      e.preventDefault();
      if (!startDate && !endDate) {
        setDateError('Select a From and/or To date.');
        setDateResults([]);
        setDateSearched(false);
        return;
      }
      setDateError('');
      setDateLoading(true);
      setDateSearched(true);
      try {
        const rows = await searchInvoices({ startDate, endDate });
        setDateResults(rows);
      } catch (err) {
        setDateError(err.message || 'Search failed');
        setDateResults([]);
      } finally {
        setDateLoading(false);
      }
    },
    [startDate, endDate]
  );

  const handleTextSearch = useCallback(
    async (e) => {
      e.preventDefault();
      const trimmed = query.trim();
      if (trimmed.length < 2) {
        setTextError('Enter at least 2 characters to search.');
        setTextResults([]);
        setTextSearched(false);
        return;
      }
      setTextError('');
      setTextLoading(true);
      setTextSearched(true);
      try {
        const rows = await searchInvoices({ q: trimmed });
        setTextResults(rows);
      } catch (err) {
        setTextError(err.message || 'Search failed');
        setTextResults([]);
      } finally {
        setTextLoading(false);
      }
    },
    [query]
  );

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this invoice?')) return;
    setDeletingId(id);
    try {
      await deleteInvoice(id);
      setDateResults((prev) => prev.filter((r) => r.id !== id));
      setTextResults((prev) => prev.filter((r) => r.id !== id));
    } catch {
      alert('Failed to delete invoice. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const openInvoice = (id) => navigate(`/invoices/${id}`);

  return (
    <div className="search-page">
      <div className="search-sections">
        <section className="search-section">
          <h2>Search by Date Range</h2>
          <form className="search-form no-print" onSubmit={handleDateSearch}>
            <div className="date-range-fields">
              <label>
                From
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </label>
              <label>
                To
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </label>
            </div>
            <button type="submit" className="btn-primary" disabled={dateLoading}>
              {dateLoading ? 'Searching…' : 'Search'}
            </button>
          </form>
          <ResultsList
            results={dateResults}
            searched={dateSearched}
            loading={dateLoading}
            error={dateError}
            onOpen={openInvoice}
            onDelete={handleDelete}
            deletingId={deletingId}
          />
        </section>

        <section className="search-section">
          <h2>Search by Name / Phone / Plate / VIN</h2>
          <form className="search-form no-print" onSubmit={handleTextSearch}>
            <input
              type="search"
              placeholder="Name, phone, plate, VIN, or ARD number…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" className="btn-primary" disabled={textLoading}>
              {textLoading ? 'Searching…' : 'Search'}
            </button>
          </form>
          <ResultsList
            results={textResults}
            searched={textSearched}
            loading={textLoading}
            error={textError}
            onOpen={openInvoice}
            onDelete={handleDelete}
            deletingId={deletingId}
          />
        </section>
      </div>
    </div>
  );
}
