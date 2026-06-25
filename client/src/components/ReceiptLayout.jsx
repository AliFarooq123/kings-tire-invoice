import kingsLogo from '../assets/kings-logo.svg';
import DateField from './DateField';
import { MIN_LINE_ROWS } from '../constants/receipt';
import {
  formatMoney,
  formatArdNumber,
  lineTotal,
} from '../utils/calculations';
import { padLineItems } from '../hooks/useInvoiceForm';

const LEGAL_TEXT = `CUSTOMERS: PLEASE NOTE: NOT RESPONSIBLE FOR BROKEN OR LOST HUB CAPS, VALVE STEM CAPS, ANTENNAS, OR ANY OTHER PARTS LEFT IN OR ON VEHICLE. NOT RESPONSIBLE FOR ANY DAMAGES TO VEHICLE AFTER IT HAS LEFT THE SHOP. NOT RESPONSIBLE FOR DAMAGES CAUSED BY IMPROPER INSTALLATION OF CUSTOMER SUPPLIED PARTS. WARRANTY ON PARTS AND LABOR AS STATED ABOVE ONLY. ALL WARRANTIES VOID IF VEHICLE IS TOWED, JUMPED, OR WORKED ON BY ANOTHER SHOP. CUSTOMER IS RESPONSIBLE FOR PAYMENT IN FULL. MECHANIC'S LIEN MAY BE ENFORCED FOR NON-PAYMENT.`;

const NO_RETURNS =
  'NO RETURNS ON ANY ITEMS SOLD BY KINGS TIRE WHEELS & AUTO REPAIR • NO CASH REFUND';

function splitAmount(value) {
  const formatted = formatMoney(value);
  const parts = formatted.split('.');
  return { dollars: parts[0], cents: parts[1] || '00' };
}

function Cell({ label, children, className = '' }) {
  return (
    <div className={`cell ${className}`}>
      {label && <label>{label}</label>}
      {children}
    </div>
  );
}

function FieldInput({ mode, value, onChange, type = 'text' }) {
  if (mode === 'view') {
    return <span className="field-value">{value ?? ''}</span>;
  }
  return (
    <input
      type={type}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function CheckboxField({ mode, checked, onChange, label, children }) {
  if (mode === 'view') {
    return (
      <div className="special-row">
        <span className={`view-checkbox ${checked ? 'checked' : ''}`} />
        <span className="special-label">{label}</span>
        {children}
      </div>
    );
  }
  return (
    <div className="special-row">
      <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="special-label">{label}</span>
      {children}
    </div>
  );
}

function PaymentOption({ mode, label, field, data, onPaymentChange }) {
  if (mode === 'view') {
    return (
      <label className="payment-option">
        <span className={`view-checkbox ${data[field] ? 'checked' : ''}`} />
        {label}
      </label>
    );
  }
  return (
    <label className="payment-option">
      <input
        type="checkbox"
        checked={!!data[field]}
        onChange={(e) => onPaymentChange(field, e.target.checked)}
      />
      {label}
    </label>
  );
}

function AmountDisplay({ value }) {
  const { dollars, cents } = splitAmount(value || 0);
  return (
    <div className="amount-split">
      <span className="amount-dollars">{dollars}</span>
      <span className="amount-cents-divider">{cents}</span>
    </div>
  );
}

export default function ReceiptLayout({
  mode = 'view',
  data,
  items = [],
  ardNumber,
  onChange,
  onItemChange,
  onPaymentChange,
}) {
  const isEdit = mode === 'edit';
  const displayItems = padLineItems(
    items.length > 0 ? items : Array.from({ length: MIN_LINE_ROWS }, () => ({
      qty: '',
      description: '',
      amount: '',
    })),
    MIN_LINE_ROWS
  );

  const handleField = (field) => (val) => onChange?.(field, val);
  const displayArd = formatArdNumber(ardNumber ?? data?.ard_number);

  const renderTotalRow = (label, field) => (
    <div className="total-row">
      <label>{label}</label>
      {isEdit ? (
        <input
          className="total-input"
          type="text"
          inputMode="decimal"
          value={data[field] ?? ''}
          onChange={(e) => onChange(field, e.target.value)}
        />
      ) : (
        <div className="total-value">
          <AmountDisplay value={data[field]} />
        </div>
      )}
    </div>
  );

  return (
    <div className="receipt">
      <header className="receipt-header">
        <div className="receipt-logo">
          <img src={kingsLogo} alt="King's Tire" />
        </div>
        <div className="receipt-shop-block">
          <h1 className="receipt-shop-title">TIRE WHEELS &amp; AUTO REPAIR</h1>
          <p className="receipt-shop-info">
            6150 Watt Ave., North Highlands, CA 95660 • Tel: (916) 571-5051
          </p>
          <p className="receipt-shop-info">kingstirewheels@gmail.com</p>
        </div>
        <div className="receipt-invoice-label">
          <h2>INVOICE</h2>
          <div className="receipt-ard-box" aria-label="ARD number">
            {displayArd}
          </div>
        </div>
      </header>

      <div className="receipt-banner">CUSTOMER: PLEASE FILL IN ALL THE INFORMATION BELOW</div>

      <div className="receipt-customer-section">
        <div className="receipt-customer-row row-1">
          <Cell label="Name:">
            <FieldInput
              mode={mode}
              value={data.customer_name}
              onChange={handleField('customer_name')}
            />
          </Cell>
          <Cell label="Phone:">
            <FieldInput mode={mode} value={data.phone} onChange={handleField('phone')} />
          </Cell>
          <Cell label="Date:">
            {isEdit ? (
              <DateField mode="edit" value={data.date} onChange={handleField('date')} />
            ) : (
              <DateField mode="view" value={data.date} />
            )}
          </Cell>
        </div>
        <div className="receipt-customer-row row-2">
          <Cell label="Address:">
            <FieldInput mode={mode} value={data.address} onChange={handleField('address')} />
          </Cell>
          <Cell label="Year - Make:">
            <span className="field-value year-make-fields">
              {isEdit ? (
                <>
                  <input
                    value={data.vehicle_year ?? ''}
                    onChange={(e) => onChange('vehicle_year', e.target.value)}
                    placeholder="Year"
                    className="year-input"
                  />
                  <input
                    value={data.vehicle_make ?? ''}
                    onChange={(e) => onChange('vehicle_make', e.target.value)}
                    placeholder="Make"
                    className="make-input"
                  />
                </>
              ) : (
                `${data.vehicle_year ?? ''} ${data.vehicle_make ?? ''}`.trim()
              )}
            </span>
          </Cell>
        </div>
        <div className="receipt-customer-row row-3">
          <Cell label="City:">
            <FieldInput mode={mode} value={data.city} onChange={handleField('city')} />
          </Cell>
          <Cell label="State:">
            <FieldInput mode={mode} value={data.state} onChange={handleField('state')} />
          </Cell>
          <Cell label="Zip:">
            <FieldInput mode={mode} value={data.zip} onChange={handleField('zip')} />
          </Cell>
          <Cell label="Model:">
            <FieldInput
              mode={mode}
              value={data.vehicle_model}
              onChange={handleField('vehicle_model')}
            />
          </Cell>
        </div>
        <div className="receipt-customer-row row-4">
          <Cell label="Vehicle ID NO">
            <FieldInput mode={mode} value={data.vin} onChange={handleField('vin')} />
          </Cell>
          <Cell label="License NO:">
            <FieldInput
              mode={mode}
              value={data.license_plate}
              onChange={handleField('license_plate')}
            />
          </Cell>
        </div>
      </div>

      <div className="receipt-payment-row">
        <PaymentOption
          mode={mode}
          label="CASH"
          field="payment_cash"
          data={data}
          onPaymentChange={onPaymentChange}
        />
        <PaymentOption
          mode={mode}
          label="CHARGE"
          field="payment_charge"
          data={data}
          onPaymentChange={onPaymentChange}
        />
        <PaymentOption
          mode={mode}
          label="CHECK"
          field="payment_check"
          data={data}
          onPaymentChange={onPaymentChange}
        />
        <PaymentOption
          mode={mode}
          label="FINANCE"
          field="payment_finance"
          data={data}
          onPaymentChange={onPaymentChange}
        />
        <div className="receipt-mileage-cell">
          <label>Mileage:</label>
          <FieldInput mode={mode} value={data.mileage} onChange={handleField('mileage')} />
        </div>
      </div>

      <table className="receipt-items-table">
        <thead>
          <tr>
            <th className="col-qty">QTY.</th>
            <th>DESCRIPTION</th>
            <th className="col-amount">AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          {displayItems.map((item, i) => {
            const extended = mode === 'view' ? lineTotal(item.qty, item.amount) : null;
            return (
              <tr key={i}>
                <td>
                  {isEdit ? (
                    <input
                      value={item.qty ?? ''}
                      onChange={(e) => onItemChange(i, 'qty', e.target.value)}
                    />
                  ) : (
                    item.qty
                  )}
                </td>
                <td>
                  {isEdit ? (
                    <input
                      value={item.description ?? ''}
                      onChange={(e) => onItemChange(i, 'description', e.target.value)}
                    />
                  ) : (
                    item.description
                  )}
                </td>
                <td className="cell-amount">
                  {isEdit ? (
                    <input
                      value={item.amount ?? ''}
                      onChange={(e) => onItemChange(i, 'amount', e.target.value)}
                      placeholder="unit $"
                    />
                  ) : (
                    <AmountDisplay value={extended} />
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="receipt-warranty-note">
        We provide a 50 mile warranty only on the work we&apos;ve performed on your vehicle.
      </div>

      <div className="receipt-bottom">
        <div className="receipt-specials">
          <h3>SPECIAL ORDER: NO REFUNDS AND NO EXCHANGE</h3>

          <CheckboxField
            mode={mode}
            checked={data.special_tire_pressure}
            onChange={(v) => onChange?.('special_tire_pressure', v)}
            label="TIRE PRESSURE SET ACCORDING TO FACTORY SPECIFICATIONS ___________"
          />
          <CheckboxField
            mode={mode}
            checked={data.special_valve_stem}
            onChange={(v) => onChange?.('special_valve_stem', v)}
            label="New Valve Stem Installed"
          />
          <CheckboxField
            mode={mode}
            checked={data.special_torque_lugs}
            onChange={(v) => onChange?.('special_torque_lugs', v)}
            label="Torgue All Lugunts by Factory Specifications"
          />
          <CheckboxField
            mode={mode}
            checked={data.special_alignment}
            onChange={(v) => onChange?.('special_alignment', v)}
            label="Performed Alignment on Customer Request - Initial:"
          >
            {isEdit ? (
              <input
                type="text"
                value={data.special_alignment_initial ?? ''}
                onChange={(e) => onChange('special_alignment_initial', e.target.value)}
              />
            ) : (
              <span>{data.special_alignment_initial || '________'}</span>
            )}
          </CheckboxField>

          <div className="special-grid-3">
            <CheckboxField
              mode={mode}
              checked={data.special_flat_repair}
              onChange={(v) => onChange?.('special_flat_repair', v)}
              label="Flat Repair"
            />
            <CheckboxField
              mode={mode}
              checked={data.special_rotation}
              onChange={(v) => onChange?.('special_rotation', v)}
              label="Rotation (5000 miles)"
            />
            <CheckboxField
              mode={mode}
              checked={data.special_no_warranty}
              onChange={(v) => onChange?.('special_no_warranty', v)}
              label="No Warranty _________"
            />
          </div>

          <div className="special-grid-2">
            <CheckboxField
              mode={mode}
              checked={data.special_no_read_hazardous}
              onChange={(v) => onChange?.('special_no_read_hazardous', v)}
              label="No Read Hazardous"
            />
            <CheckboxField
              mode={mode}
              checked={data.special_checked_water}
              onChange={(v) => onChange?.('special_checked_water', v)}
              label="Checked in water"
            />
            <CheckboxField
              mode={mode}
              checked={data.special_no_warranty_low_profile}
              onChange={(v) => onChange?.('special_no_warranty_low_profile', v)}
              label="No Warranty on Low Profile Tire"
            />
            <CheckboxField
              mode={mode}
              checked={data.special_no_warranty_used_tire}
              onChange={(v) => onChange?.('special_no_warranty_used_tire', v)}
              label="No Warranty on Used Tire"
            />
          </div>

          <CheckboxField
            mode={mode}
            checked={data.special_not_aligned}
            onChange={(v) => onChange?.('special_not_aligned', v)}
            label="Vehicle Was Not Aligned Property At Time Of Installment"
          />

          <div className="special-grid-2">
            <CheckboxField
              mode={mode}
              checked={data.special_new_or_used_shown}
              onChange={(v) => onChange?.('special_new_or_used_shown', v)}
              label="New or Used Tiree Shown to Customer Before Installation"
            />
            <CheckboxField
              mode={mode}
              checked={data.special_installed_customer_request}
              onChange={(v) => onChange?.('special_installed_customer_request', v)}
              label="Installed on Customer Request: Initial _________"
            />
          </div>
        </div>

        <div className="receipt-totals">
          {renderTotalRow('LABOR', 'labor')}
          {renderTotalRow('SUB TOTAL', 'subtotal')}
          {renderTotalRow('SALES TAX', 'sales_tax')}
          {renderTotalRow('NEW TIRE FEE', 'new_tire_fee')}
          {renderTotalRow('TIRE / OIL DISPOSAL', 'tire_oil_disposal')}
          {renderTotalRow('TOTAL', 'total')}
          {renderTotalRow('DEPOSIT', 'deposit')}
          {renderTotalRow('BALANCE DUE', 'balance_due')}
        </div>
      </div>

      <div className="receipt-legal">{LEGAL_TEXT}</div>

      <div className="receipt-initials-block">
        <div className="init-line">
          <span>Customer has inspected the car prior to leaving - Initial:</span>
          {isEdit ? (
            <input
              value={data.customer_inspected_initial ?? ''}
              onChange={(e) => onChange('customer_inspected_initial', e.target.value)}
            />
          ) : (
            <span>{data.customer_inspected_initial || '________'}</span>
          )}
        </div>
        <div className="init-line">
          <span>
            I have read all information above carefully. Kings Tire Wheels &amp; Auto Repair is
            not liable for any damages incurred after vehicle has left the shop - Initial:
          </span>
          {isEdit ? (
            <input
              value={data.customer_read_initial ?? ''}
              onChange={(e) => onChange('customer_read_initial', e.target.value)}
            />
          ) : (
            <span>{data.customer_read_initial || '________'}</span>
          )}
        </div>
      </div>

      <div className="receipt-no-returns">{NO_RETURNS}</div>

      <div className="receipt-footer">
        <div className="receipt-footer-signature">
          <span className="sig-label">CUSTOMER SIGNATURE</span>
          <div className="sig-line" aria-hidden="true" />
        </div>
        <div className="receipt-footer-note">
          Kings Tire Wheels &amp; Auto Repair will not be responsible for any item left over 3
          days.
        </div>
      </div>
    </div>
  );
}
