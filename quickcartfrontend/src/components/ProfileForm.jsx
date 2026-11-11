import { useState } from 'react';
import { getProfile, updateProfile } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import useFetch from '../utils/useFetch';
import useSubmitLock from '../utils/useSubmitLock';
import { parseApiError } from '../utils/errorMessage';
import { validateFullName, validatePhone } from '../utils/validators';
import Loader from './Loader';
import ErrorBanner from './ErrorBanner';
import FormField from './FormField';

// Wrapper handles loading/error; the editor starts from loaded data.
export default function ProfileForm() {
  const { data: profile, loading, error, reload } = useFetch((signal) => getProfile(signal), []);

  if (loading) return <Loader />;
  if (error) return <ErrorBanner message={error.message} onRetry={reload} />;
  if (!profile) return null;
  return <ProfileEditor profile={profile} />;
}

function ProfileEditor({ profile }) {
  const { updateFullName } = useAuth();
  const { busy, run } = useSubmitLock();
  const [form, setForm] = useState({ fullName: profile.fullName, phone: profile.phone });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    setSaved(false);
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    return run(async () => {
      const errors = {};
      const nameError = validateFullName(form.fullName);
      const phoneError = validatePhone(form.phone);
      if (nameError) errors.fullName = nameError;
      if (phoneError) errors.phone = phoneError;
      setFieldErrors(errors);
      setFormError('');
      setSaved(false);
      if (Object.keys(errors).length > 0) return;

      try {
        const updated = await updateProfile({
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
        });
        setForm({ fullName: updated.fullName, phone: updated.phone }); // show what the server stored
        updateFullName(updated.fullName);
        setSaved(true);
      } catch (err) {
        const { code, message, fieldErrors: serverErrors } = parseApiError(err);
        if (code === 'VALIDATION_ERROR' && Object.keys(serverErrors).length > 0) {
          setFieldErrors(serverErrors);
        } else {
          setFormError(message);
        }
      }
    });
  };

  return (
    <form className="profile-form" onSubmit={handleSubmit} noValidate>
      <ErrorBanner message={formError} />
      <FormField id="email" label="Email" value={profile.email} readOnly disabled />
      <FormField id="fullName" label="Full name" autoComplete="name" value={form.fullName}
        onChange={handleChange} error={fieldErrors.fullName} />
      <FormField id="phone" label="Mobile number" type="tel" inputMode="numeric" maxLength={10}
        value={form.phone} onChange={handleChange} error={fieldErrors.phone} />
      <button type="submit" disabled={busy}>{busy ? 'Saving...' : 'Save profile'}</button>
      {saved && <p className="notice" role="status">Profile updated.</p>}
    </form>
  );
}