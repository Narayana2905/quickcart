import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
} from 'react';
import {
  addCartItem, clearCart, getCart, removeCartItem, setCartItemQuantity,
} from '../api/cartApi';
import { parseApiError } from '../utils/errorMessage';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

// Contract: after O5 / after placing an order, show an empty cart locally.
// (Not exported: only this file needs it, and a file that exports components should export only components.)
const EMPTY_CART = {
  items: [], itemCount: 0, subtotal: 0, deliveryFee: 0, total: 0, hasUnavailableItems: false,
};

export function CartProvider({ children }) {
  const { user } = useAuth();
  // The key makes React discard ALL cart state whenever the logged-in user changes
  // (login, logout, switching accounts). User A's cart can never flash for user B.
  return <CartState key={user?.id ?? 'guest'}>{children}</CartState>;
}

function CartState({ children }) {
  const { isAuthenticated, isAdmin } = useAuth();
  const enabled = isAuthenticated && !isAdmin; // Mandate 7: admins never call O1-O5

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);
  const queue = useRef(Promise.resolve());

  // First load. The effect starts the request itself and only sets state when the answer
  // arrives (inside the promise callbacks), which is what the lint rule wants to see.
  useEffect(() => {
    if (!enabled) return undefined;

    let cancelled = false; // ignore answers that arrive after this cart was discarded
    getCart()
      .then((next) => {
        if (cancelled) return;
        setCart(next);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) setError(parseApiError(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  // Quiet refresh: keeps whatever is on screen, updates it when the answer arrives (O1).
  // Used by Retry, by Checkout on entry, and after stock conflicts.
  const refreshCart = useCallback(async () => {
    try {
      setCart(await getCart());
      setError(null);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  // Loud reload: used by Retry buttons, shows the spinner again.
  const reloadCart = useCallback(() => {
    setError(null);
    setLoading(true);
    return refreshCart();
  }, [refreshCart]);

  // Every mutation goes through here, one at a time.
  const mutate = useCallback(
    (call) => {
      const task = queue.current.then(async () => {
        try {
          const next = await call();
          setCart(next); // Mandate 3: replace with the response. No merging, no arithmetic.
          return next;
        } catch (err) {
          const { code } = parseApiError(err);
          if (code === 'INSUFFICIENT_STOCK' || code === 'PRODUCT_UNAVAILABLE') {
            refreshCart(); // Mandate 4: the cart is stale, re-fetch (O1)
          }
          throw err; // the caller shows the message
        }
      });
      queue.current = task.catch(() => {}); // a failure must not block the next mutation
      return task;
    },
    [refreshCart]
  );

  const addItem = useCallback(
    (productId, quantity) => mutate(() => addCartItem(productId, quantity)),
    [mutate]
  );
  const setQuantity = useCallback(
    (productId, quantity) => mutate(() => setCartItemQuantity(productId, quantity)),
    [mutate]
  );
  const removeItem = useCallback(
    (productId) => mutate(() => removeCartItem(productId)),
    [mutate]
  );
  const clear = useCallback(
    () => mutate(async () => { await clearCart(); return EMPTY_CART; }), // Mandate 3: O5 => empty locally
    [mutate]
  );
  // After a successful order the cart is empty. No re-fetch (Mandate 3).
  const resetCart = useCallback(() => setCart(EMPTY_CART), []);

  const value = useMemo(
    () => ({
      cart,
      loading,
      error,
      itemCount: cart?.itemCount ?? 0,
      reloadCart,
      refreshCart, // Checkout calls it quietly on entry
      addItem,
      setQuantity,
      removeItem,
      clear,
      resetCart,
    }),
    [cart, loading, error, reloadCart, refreshCart, addItem, setQuantity, removeItem, clear, resetCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- the hook deliberately lives next to its provider
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}