import { useState } from 'react';
import FormField from './FormField';
import ErrorBanner from './ErrorBanner';
import { parseApiError } from '../utils/errorMessage';
import { validateDeliveryFields, validateLabel } from '../utils/validators';

const FIELD_ORDER = ['label', 'recipientName', 'phone', 'line1', 'line2', 'city', 'state', 'pincode'];

export default function AddressForm({
  initialValues, defaultLocked = false, submitLabel = 'Save address', busy, onSubmit, onCancel,
}) {
  const [form, setForm] = useState(initialValues);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateDeliveryFields(form);
    const labelError = validateLabel(form.label);
    if (labelError) errors.label = labelError;
    setFieldErrors(errors);
    setFormError('');

    const firstInvalid = FIELD_ORDER.find((f) => errors[f]);
    if (firstInvalid) {
      document.getElementById(firstInvalid)?.focus(); // accessibility: focus the first error
      return;
    }

    try {
      // The parent owns the lock and decides what "success" does (close the form, reload).
      await onSubmit({
        label: form.label.trim(),
        recipientName: form.recipientName.trim(),
        phone: form.phone.trim(),
        line1: form.line1.trim(),
        line2: form.line2.trim() || null,
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        isDefault: form.isDefault,
      });
    } catch (err) {
      const { code, message, fieldErrors: serverErrors } = parseApiError(err);
      if (code === 'VALIDATION_ERROR' && Object.keys(serverErrors).length > 0) {
        setFieldErrors(serverErrors);
      } else {
        setFormError(message); // e.g. ADDRESS_LIMIT_REACHED, 503
      }
    }
  };

  const field = (id, label, extra = {}) => (
    <FormField id={id} label={label} value={form[id]} onChange={handleChange}
      error={fieldErrors[id]} {...extra} />
  );

  return (
    <form className="address-form" onSubmit={handleSubmit} noValidate>
      <ErrorBanner message={formError} />
      <div className="address-form__grid">
        {field('label', 'Label (e.g. Home)', { maxLength: 30 })}
        {field('recipientName', 'Recipient name', { autoComplete: 'name' })}
        {field('phone', 'Mobile number', { type: 'tel', inputMode: 'numeric', maxLength: 10 })}
        {field('line1', 'Address line 1', { autoComplete: 'address-line1' })}
        {field('line2', 'Address line 2 (optional)', { autoComplete: 'address-line2' })}
        {field('city', 'City')}
        {field('state', 'State')}
        {field('pincode', 'Pincode', { inputMode: 'numeric', maxLength: 6 })}
      </div>

      <label className="checkbox">
        <input type="checkbox" name="isDefault" checked={form.isDefault}
          onChange={handleChange} disabled={defaultLocked} />
        Use as my default address
      </label>
      {defaultLocked && (
        <p className="muted">
          This is already your default. To change it, set another address as default.
        </p>
      )}

      <div className="address-form__actions">
        <button type="submit" disabled={busy}>{busy ? 'Saving...' : submitLabel}</button>
        <button type="button" onClick={onCancel} disabled={busy}>Cancel</button>
      </div>
    </form>
  );
}