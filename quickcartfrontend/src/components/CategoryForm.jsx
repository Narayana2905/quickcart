import { useState } from 'react';
import FormField from './FormField';
import ErrorBanner from './ErrorBanner';
import { parseApiError } from '../utils/errorMessage';
import { validateCategoryName, validateMaxLength } from '../utils/validators';

export default function CategoryForm({ initialValues, submitLabel, busy, onSubmit, onCancel }) {
  const [form, setForm] = useState(initialValues);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = {};
    const add = (field, msg) => { if (msg) errors[field] = msg; };
    add('name', validateCategoryName(form.name));
    add('description', validateMaxLength(form.description, 255, 'Description'));
    add('imageUrl', validateMaxLength(form.imageUrl, 500, 'Image URL'));
    setFieldErrors(errors);
    setFormError('');
    const first = ['name', 'description', 'imageUrl'].find((f) => errors[f]);
    if (first) {
      document.getElementById(first)?.focus();
      return;
    }

    try {
      await onSubmit({
        name: form.name.trim(),
        description: form.description.trim() || null,
        imageUrl: form.imageUrl.trim() || null,
      });
    } catch (err) {
      const { code, message, fieldErrors: serverErrors } = parseApiError(err);
      if (code === 'VALIDATION_ERROR' && Object.keys(serverErrors).length > 0) {
        setFieldErrors(serverErrors);
      } else if (code === 'CATEGORY_ALREADY_EXISTS') {
        setFieldErrors({ name: message }); // a field problem belongs next to the field
      } else {
        setFormError(message);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <ErrorBanner message={formError} />
      <FormField id="name" label="Name" autoFocus value={form.name}
        onChange={handleChange} error={fieldErrors.name} />
      <FormField id="description" label="Description (optional)" as="textarea" rows={3}
        value={form.description} onChange={handleChange} error={fieldErrors.description} />
      <FormField id="imageUrl" label="Image URL (optional)" value={form.imageUrl}
        onChange={handleChange} error={fieldErrors.imageUrl} />
      <div className="address-form__actions">
        <button type="submit" disabled={busy}>{busy ? 'Saving...' : submitLabel}</button>
        <button type="button" onClick={onCancel} disabled={busy}>Cancel</button>
      </div>
    </form>
  );
}