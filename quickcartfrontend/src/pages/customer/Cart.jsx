import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import useSubmitLock from '../../utils/useSubmitLock';
import { messageWithDetails, parseApiError } from '../../utils/errorMessage';
import { formatPrice } from '../../utils/formatPrice';
import Loader from '../../components/Loader';
import ErrorBanner from '../../components/ErrorBanner';
import EmptyState from '../../components/EmptyState';
import CartLine from '../../components/CartLine';
import { useLocation } from 'react-router-dom';

export default function Cart() {
  const { cart, loading, error, reloadCart, setQuantity, removeItem, clear } = useCart();
  const { busy, run } = useSubmitLock(); // one lock for the whole page: every control waits
  const [actionError, setActionError] = useState('');
  const { state } = useLocation();
  const perform = (task) =>
    run(async () => {
      setActionError('');
      try {
        await task();
      } catch (err) {
        setActionError(messageWithDetails(parseApiError(err)));
      }
    });

  if (loading) return <Loader />;
  if (!cart) {
    return <ErrorBanner message={error?.message ?? 'Could not load your cart.'} onRetry={reloadCart} />;
  }
  if (cart.items.length === 0) {
    return (
      <EmptyState
        message="Your cart is empty."
        action={<Link to="/products">Browse products</Link>}
      />
    );
  }

  const canCheckout = !cart.hasUnavailableItems && !busy;

  return (
    <section>
      <h2>Your cart</h2>
      <ErrorBanner message={state?.notice} />
      <ErrorBanner message={actionError} />
      {error && <ErrorBanner message={error.message} onRetry={reloadCart} />}

      <div className="cart-layout">
        <ul className="cart-lines">
          {cart.items.map((line) => (
            <CartLine
              key={line.productId}
              line={line}
              busy={busy}
              onQuantityChange={(qty) => perform(() => setQuantity(line.productId, qty))}
              onRemove={() => perform(() => removeItem(line.productId))}
            />
          ))}
        </ul>

        <aside className="cart-summary">
          <h3>Order summary</h3>
          <dl>
            <div><dt>Items</dt><dd>{cart.itemCount}</dd></div>
            <div><dt>Subtotal</dt><dd>{formatPrice(cart.subtotal)}</dd></div>
            <div><dt>Delivery fee</dt><dd>{formatPrice(cart.deliveryFee)}</dd></div>
            <div className="cart-summary__total"><dt>Total</dt><dd>{formatPrice(cart.total)}</dd></div>
          </dl>

          {cart.hasUnavailableItems && (
            <p className="cart-summary__warning">Remove unavailable items to continue.</p>
          )}

          {canCheckout ? (
            <Link to="/checkout" className="button">Checkout</Link>
          ) : (
            <button type="button" disabled>Checkout</button>
          )}

          <button type="button" className="link-button" disabled={busy}
            onClick={() => perform(clear)}>
            Clear cart
          </button>
        </aside>
      </div>
    </section>
  );
}