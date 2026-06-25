import { useMemo } from 'react';
import { calculateTotals, formatMoney } from '../utils/calculations';

export default function SuggestionPanel({ items, labor, newTireFee, tireOilDisposal, deposit }) {
  const suggestions = useMemo(
    () => calculateTotals(items, labor, newTireFee, tireOilDisposal, deposit),
    [items, labor, newTireFee, tireOilDisposal, deposit]
  );

  return (
    <aside className="suggestion-panel no-print" aria-label="Suggested totals">
      <strong>Suggested totals</strong>
      <span>Subtotal: ${formatMoney(suggestions.subtotal)}</span>
      <span className="sep">|</span>
      <span>Tax: ${formatMoney(suggestions.sales_tax)}</span>
      <span className="sep">|</span>
      <span>Total: ${formatMoney(suggestions.total)}</span>
      <span className="sep">|</span>
      <span>Balance Due: ${formatMoney(suggestions.balance_due)}</span>
    </aside>
  );
}
