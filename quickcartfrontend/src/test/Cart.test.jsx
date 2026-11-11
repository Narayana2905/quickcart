import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { getCart, setCartItemQuantity } from '../api/cartApi';
import Cart from '../pages/customer/Cart';
import { cart, cartLine, cartWithUnavailable, customer, emptyCart } from './fixtures';
import { renderApp } from './renderApp';

vi.mock('../api/cartApi');

const renderCart = () =>
  renderApp(
    <Routes>
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<p>checkout page</p>} />
    </Routes>,
    { route: '/cart', as: customer }
  );

describe('Cart', () => {
  it('shows the empty state', async () => {
    getCart.mockResolvedValue(emptyCart);
    renderCart();
    expect(await screen.findByText('Your cart is empty.')).toBeInTheDocument();
  });

  it('calls the API when the quantity changes and shows the server totals', async () => {
    getCart.mockResolvedValue(cart);
    setCartItemQuantity.mockResolvedValue({
      ...cart,
      items: [{ ...cartLine, quantity: 3, lineTotal: 84.0 }],
      itemCount: 3, subtotal: 84.0, deliveryFee: 25.0, total: 109.0,
    });
    const { user } = renderCart();

    await user.click(await screen.findByRole('button', { name: /increase quantity/i }));

    await waitFor(() => expect(setCartItemQuantity).toHaveBeenCalledWith(11, 3));
    // Not computed by us: this number only exists because the (fake) server sent it.
    expect(await screen.findByText('₹109.00')).toBeInTheDocument();
  });

  it('disables Checkout while an unavailable line exists', async () => {
    getCart.mockResolvedValue(cartWithUnavailable);
    renderCart();

    expect(await screen.findByText(/remove to continue/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Checkout' })).toBeDisabled();
    expect(screen.queryByRole('link', { name: 'Checkout' })).not.toBeInTheDocument();
  });

  it('offers Checkout as a link when everything is available', async () => {
    getCart.mockResolvedValue(cart);
    renderCart();

    const link = await screen.findByRole('link', { name: 'Checkout' });
    expect(link).toHaveAttribute('href', '/checkout');
  });
});