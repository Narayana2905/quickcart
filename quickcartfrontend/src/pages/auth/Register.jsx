import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { parseApiError } from '../../utils/errorMessage';
import {
  validateEmail,
  validateFullName,
  validatePassword,
  validatePhone,
} from '../../utils/validators';
import FormField from '../../components/FormField';
import ErrorBanner from '../../components/ErrorBanner';

const EMPTY = { fullName: '', email: '', phone: '', password: '' };

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState(EMPTY);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const inFlight = useRef(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    const errors = {};
    const checks = {
      fullName: validateFullName(form.fullName),
      email: validateEmail(form.email),
      phone: validatePhone(form.phone),
      password: validatePassword(form.password),
    };
    Object.entries(checks).forEach(([field, msg]) => {
      if (msg) errors[field] = msg;
    });
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (inFlight.current) return;

    const errors = validate();
    setFieldErrors(errors);
    setFormError('');
    if (Object.keys(errors).length > 0) return;

    inFlight.current = true;
    setSubmitting(true);
    try {
      await register(form);
      // GuestRoute redirects once the session is saved (user is logged in immediately).
    } catch (err) {
      const { code, message, fieldErrors: serverErrors } = parseApiError(err);
      if (code === 'VALIDATION_ERROR' && Object.keys(serverErrors).length > 0) {
        setFieldErrors(serverErrors);
      } else if (code === 'EMAIL_ALREADY_EXISTS') {
        setFieldErrors({ email: message });
      } else {
        setFormError(message);
      }
      inFlight.current = false;
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-card">
      <h2>Create account</h2>
      <ErrorBanner message={formError} />
      <form onSubmit={handleSubmit} noValidate>
        <FormField id="fullName" label="Full name" autoComplete="name"
          value={form.fullName} onChange={handleChange} error={fieldErrors.fullName} />
        <FormField id="email" label="Email" type="email" autoComplete="email"
          value={form.email} onChange={handleChange} error={fieldErrors.email} />
        <FormField id="phone" label="Mobile number" type="tel" inputMode="numeric"
          maxLength={10} autoComplete="tel"
          value={form.phone} onChange={handleChange} error={fieldErrors.phone} />
        <FormField id="password" label="Password" type="password"
          autoComplete="new-password"
          value={form.password} onChange={handleChange} error={fieldErrors.password} />
        <button type="submit" disabled={submitting}>
          {submitting ? 'Creating account...' : 'Register'}
        </button>
      </form>
      <p>
        Already registered? <Link to="/login">Log in</Link>
      </p>
    </section>
  );
}