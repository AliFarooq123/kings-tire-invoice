const TAX_RATE = 0.0775;

export function parseNum(value) {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

export function roundMoney(n) {
  return Math.round(n * 100) / 100;
}

export function lineTotal(qty, amount) {
  return roundMoney(parseNum(qty) * parseNum(amount));
}

export function calculateTotals(items, labor, newTireFee, tireOilDisposal, deposit) {
  const subtotal = roundMoney(
    items.reduce((sum, item) => sum + lineTotal(item.qty, item.amount), 0)
  );
  const sales_tax = roundMoney(subtotal * TAX_RATE);
  const laborVal = roundMoney(parseNum(labor));
  const newTireFeeVal = roundMoney(parseNum(newTireFee));
  const tireOilDisposalVal = roundMoney(parseNum(tireOilDisposal));
  const total = roundMoney(
    subtotal + sales_tax + laborVal + newTireFeeVal + tireOilDisposalVal
  );
  const balance_due = roundMoney(total - roundMoney(parseNum(deposit)));

  return {
    subtotal,
    sales_tax,
    total,
    balance_due,
  };
}

export function filterItemsForSave(items) {
  return items.filter(
    (item) =>
      String(item.description || '').trim() !== '' &&
      (parseNum(item.qty) > 0 || parseNum(item.amount) > 0)
  );
}

export function formatMoney(value) {
  const n = parseNum(value);
  return n.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Format DB ard_number as ARD00289317 style label */
export function formatArdNumber(ardNumber) {
  if (ardNumber == null || ardNumber === '') return '';
  const n = parseInt(String(ardNumber), 10);
  if (!Number.isFinite(n)) return String(ardNumber);
  return `ARD${String(n).padStart(8, '0')}`;
}
