import { useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { parseApiError } from '../../utils/errorMessage';
import { validateEmail } from '../../utils/validators';
import FormField from '../../components/FormField';
import ErrorBanner from '../../components/ErrorBanner';

export default function Login() {
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const expired = searchParams.get('expired') === '1';

  const [form, setForm] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const inFlight = useRef(false); // Mandate 5: a ref is synchronous, state is not

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (inFlight.current) return;

    const errors = {};
    const emailError = validateEmail(form.email);
    if (emailError) errors.email = emailError;
    if (!form.password) errors.password = 'Password is required.';
    setFieldErrors(errors);
    setFormError('');
    if (Object.keys(errors).length > 0) return;

    inFlight.current = true;
    setSubmitting(true);
    try {
      await login(form.email, form.password);
      // No navigate() here: GuestRoute redirects once the session is saved.
    } catch (err) {
      const { code, message, fieldErrors: serverErrors } = parseApiError(err);
      if (code === 'VALIDATION_ERROR' && Object.keys(serverErrors).length > 0) {
        setFieldErrors(serverErrors);
      } else {
        setFormError(message);
      }
      inFlight.current = false;
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-card">
      <h2>Log in</h2>
      {expired && (
        <p className="notice" role="status">Session expired. Please log in again.</p>
      )}
      <ErrorBanner message={formError} />
      <form onSubmit={handleSubmit} noValidate>
        <FormField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={handleChange}
          error={fieldErrors.email}
        />
        <FormField
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          value={form.password}
          onChange={handleChange}
          error={fieldErrors.password}
        />
        <button type="submit" disabled={submitting}>
          {submitting ? 'Logging in...' : 'Log in'}
        </button>
      </form>
      <p>
        New here? <Link to="/register">Create an account</Link>
      </p>
    </section>
  );
}