import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import useSubmitLock from '../utils/useSubmitLock';
import { messageWithDetails, parseApiError } from '../utils/errorMessage';

export default function AddToCartButton({ product, quantity = 1 }) {
  const { isAuthenticated, isAdmin } = useAuth();
  const { addItem } = useCart();
  const { busy, run } = useSubmitLock();
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  if (isAdmin) return null; // Mandate 7: admins never see cart buttons

  if (!product.inStock) {
    return <button type="button" disabled>Out of stock</button>;
  }

  if (!isAuthenticated) {
    return (
      <button
        type="button"
        onClick={() =>
          navigate('/login', { state: { from: location.pathname + location.search } })
        }
      >
        Add
      </button>
    );
  }

  const handleAdd = () =>
    run(async () => {
      setError('');
      try {
        await addItem(product.id, quantity);
      } catch (err) {
        // 409 INSUFFICIENT_STOCK shows "Requested 5, available 2"; 503 shows a retry hint.
        setError(messageWithDetails(parseApiError(err)));
      }
    });

  return (
    <span className="add-to-cart">
      <button type="button" onClick={handleAdd} disabled={busy}>
        {busy ? 'Adding...' : 'Add'}
      </button>
      {error && <span className="add-to-cart__error" role="alert">{error}</span>}
    </span>
  );
}