import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { createAddress, getAddresses } from '../../api/authApi';
import { placeOrder } from '../../api/orderApi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import useFetch from '../../utils/useFetch';
import useSubmitLock from '../../utils/useSubmitLock';
import { parseApiError } from '../../utils/errorMessage';
import { formatPrice } from '../../utils/formatPrice';
import { validateDeliveryFields, validateLabel } from '../../utils/validators';
import { PAYMENT_METHOD_LABELS } from '../../utils/orderLabels';
import Loader from '../../components/Loader';
import ErrorBanner from '../../components/ErrorBanner';
import FormField from '../../components/FormField';
import DeliveryFields from '../../components/DeliveryFields';

const MAX_ADDRESSES = 5;
const FIELD_ORDER = ['recipientName', 'phone', 'line1', 'line2', 'city', 'state', 'pincode', 'saveLabel'];
const BLANK = { recipientName: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '' };

// Saved address or form values -> the DeliveryAddress DTO (no id, label or isDefault).
const toDeliveryAddress = (s) => ({
  recipientName: s.recipientName.trim(),
  phone: s.phone.trim(),
  line1: s.line1.trim(),
  line2: (s.line2 ?? '').trim() || null,
  city: s.city.trim(),
  state: s.state.trim(),
  pincode: s.pincode.trim(),
});

// Server field names look like "deliveryAddress.phone"; our inputs are named "phone".
const stripPrefix = (errors) =>
  Object.fromEntries(
    Object.entries(errors).map(([key, msg]) => [key.replace(/^deliveryAddress\./, ''), msg])
  );

// "productId:11" -> "Toned Milk: Requested 5, available 2."
function describeProblems(message, fieldErrors, cart) {
  const parts = Object.entries(fieldErrors).map(([field, detail]) => {
    const line = cart.items.find((l) => `productId:${l.productId}` === field);
    return line ? `${line.name}: ${detail}.` : `${detail}.`;
  });
  return parts.length ? `${message} ${parts.join(' ')}` : message;
}

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, loading: cartLoading, error: cartError, reloadCart, refreshCart, resetCart } = useCart();
  const addresses = useFetch((signal) => getAddresses(signal), []);
  const { busy, run } = useSubmitLock();
  const placedRef = useRef(false); // second line of defence against duplicate orders

  const [placedOrderId, setPlacedOrderId] = useState(null);
  const [selection, setSelection] = useState(null); // a saved address id, 'new', or null = default
  const [form, setForm] = useState({ ...BLANK, recipientName: user?.fullName ?? '' });
  const [saveIt, setSaveIt] = useState(false);
  const [saveLabel, setSaveLabel] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('MOCK_PAYMENT');
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');

  // Contract data for this screen includes O1: refresh quietly so the summary is current.
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const saved = addresses.data ?? [];
  const defaultAddress = saved.find((a) => a.isDefault) ?? saved[0];
  const effectiveSelection = selection ?? defaultAddress?.id ?? 'new'; // derived, no effect needed
  const usingNew = effectiveSelection === 'new';
  const canSave = usingNew && !addresses.error && saved.length < MAX_ADDRESSES;

  // Navigating from state (not imperatively) avoids racing the empty-cart redirect below.
  if (placedOrderId) {
    return <Navigate to={`/orders/${placedOrderId}`} replace state={{ justPlaced: true }} />;
  }
  if (cartLoading) return <Loader />;
  if (!cart) {
    return <ErrorBanner message={cartError?.message ?? 'Could not load your cart.'} onRetry={reloadCart} />;
  }
  if (cart.items.length === 0) return <Navigate to="/cart" replace />;

  const handleFieldChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (placedRef.current) return undefined; // an order already went through

    return run(async () => {
      setFormError('');

      let deliveryAddress;
      if (usingNew) {
        const errors = validateDeliveryFields(form);
        if (saveIt && canSave) {
          const labelError = validateLabel(saveLabel);
          if (labelError) errors.saveLabel = labelError;
        }
        setFieldErrors(errors);
        const first = FIELD_ORDER.find((f) => errors[f]);
        if (first) {
          document.getElementById(first)?.focus();
          return;
        }
        deliveryAddress = toDeliveryAddress(form);
      } else {
        setFieldErrors({});
        const chosen = saved.find((a) => a.id === effectiveSelection);
        if (!chosen) {
          setFormError('Choose a delivery address.');
          return;
        }
        deliveryAddress = toDeliveryAddress(chosen);
      }

      try {
        const order = await placeOrder({ paymentMethod, deliveryAddress });
        placedRef.current = true;

        if (usingNew && saveIt && canSave) {
          // Best effort (Handoff): the order is already placed, so a failure here is ignored.
          createAddress({ label: saveLabel.trim(), ...deliveryAddress, isDefault: false }).catch(() => {});
        }

        resetCart(); // Mandate 3: empty locally, no re-fetch
        setPlacedOrderId(order.id);
      } catch (err) {
        const { code, message, fieldErrors: serverErrors } = parseApiError(err);

        if (code === 'VALIDATION_ERROR') {
          setFieldErrors(stripPrefix(serverErrors));
          setFormError(message);
        } else if (code === 'CART_EMPTY') {
          refreshCart();
          navigate('/cart', { replace: true, state: { notice: message } });
        } else if (code === 'PRODUCT_UNAVAILABLE') {
          const notice = describeProblems(message, serverErrors, cart);
          refreshCart(); // Mandate 4
          navigate('/cart', { state: { notice } }); // Handoff: send the user back to /cart
        } else if (code === 'INSUFFICIENT_STOCK') {
          setFormError(describeProblems(message, serverErrors, cart));
          refreshCart(); // Mandate 4
        } else if (code === 'NETWORK_ERROR') {
          setFormError(`${message} Your order may have been placed, so check My orders before trying again.`);
        } else {
          setFormError(message); // includes 503: the cart and order are unchanged, so retrying is safe
        }
      }
    });
  };

  return (
    <form className="checkout-layout" onSubmit={handleSubmit} noValidate>
      <div>
        <h2>Checkout</h2>
        <ErrorBanner message={formError} />

        <fieldset className="checkout-section" disabled={busy}>
          <legend>Delivery address</legend>

          {addresses.loading && <Loader />}
          {addresses.error && (
            <ErrorBanner message={addresses.error.message} onRetry={addresses.reload} />
          )}

          {!addresses.loading && (
            <>
              {saved.map((a) => (
                <label key={a.id} className="radio-card">
                  <input type="radio" name="address" checked={effectiveSelection === a.id}
                    onChange={() => setSelection(a.id)} />
                  <span>
                    <strong>{a.label}</strong>{a.isDefault && <span className="tag">Default</span>}
                    <br />{a.recipientName} · {a.phone}
                    <br />{a.line1}{a.line2 ? `, ${a.line2}` : ''}, {a.city}, {a.state} {a.pincode}
                  </span>
                </label>
              ))}

              <label className="radio-card">
                <input type="radio" name="address" checked={usingNew}
                  onChange={() => setSelection('new')} />
                <span><strong>Use a new address</strong></span>
              </label>

              {usingNew && (
                <DeliveryFields form={form} errors={fieldErrors} onChange={handleFieldChange} />
              )}

              {canSave && (
                <>
                  <label className="checkbox">
                    <input type="checkbox" checked={saveIt} onChange={(e) => setSaveIt(e.target.checked)} />
                    Save this address for next time
                  </label>
                  {saveIt && (
                    <FormField id="saveLabel" label="Label (e.g. Home)" maxLength={30}
                      value={saveLabel} onChange={(e) => setSaveLabel(e.target.value)}
                      error={fieldErrors.saveLabel} />
                  )}
                </>
              )}
            </>
          )}
        </fieldset>

        <fieldset className="checkout-section" disabled={busy}>
          <legend>Payment</legend>
          {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
            <label key={value} className="radio-card">
              <input type="radio" name="paymentMethod" value={value}
                checked={paymentMethod === value} onChange={() => setPaymentMethod(value)} />
              <span>{label}</span>
            </label>
          ))}
        </fieldset>
      </div>

      <aside className="cart-summary">
        <h3>Order summary</h3>
        <ul className="summary-lines">
          {cart.items.map((l) => (
            <li key={l.productId}>
              <span>{l.name} × {l.quantity}</span>
              <span>{l.available ? formatPrice(l.lineTotal) : 'Unavailable'}</span>
            </li>
          ))}
        </ul>
        <dl>
          <div><dt>Subtotal</dt><dd>{formatPrice(cart.subtotal)}</dd></div>
          <div><dt>Delivery fee</dt><dd>{formatPrice(cart.deliveryFee)}</dd></div>
          <div className="cart-summary__total"><dt>Total</dt><dd>{formatPrice(cart.total)}</dd></div>
        </dl>

        {cart.hasUnavailableItems && (
          <p className="cart-summary__warning">
            Some items are unavailable. <Link to="/cart">Review your cart</Link>
          </p>
        )}

        <button type="submit" disabled={busy || cart.hasUnavailableItems}>
          {busy ? 'Placing order...' : 'Place order'}
        </button>
      </aside>
    </form>
  );
}