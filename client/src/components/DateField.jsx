import { formatDisplayDate, toDateInputValue } from '../utils/dates';

export default function DateField({ mode, value, onChange }) {
  if (mode === 'view') {
    return <span className="field-value">{formatDisplayDate(value)}</span>;
  }
  return (
    <input
      type="date"
      className="date-input"
      value={toDateInputValue(value)}
      onChange={(e) => onChange(e.target.value)}
      title={formatDisplayDate(value)}
    />
  );
}
