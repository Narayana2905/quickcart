import { screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import { createAddress, getAddresses } from '../api/authApi';
import { getCart } from '../api/cartApi';
import { placeOrder } from '../api/orderApi';
import Checkout from '../pages/customer/Checkout';
import { address, apiFailure, cart, customer, order } from './fixtures';
import { renderApp } from './renderApp';

vi.mock('../api/authApi');
vi.mock('../api/cartApi');
vi.mock('../api/orderApi');

const renderCheckout = () =>
  renderApp(
    <Routes>
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/orders/:id" element={<p>order page</p>} />
      <Route path="/cart" element={<p>cart page</p>} />
    </Routes>,
    { route: '/checkout', as: customer }
  );

beforeEach(() => {
  getCart.mockResolvedValue(cart);
  getAddresses.mockResolvedValue([address]);
  createAddress.mockResolvedValue(address);
});

describe('Checkout', () => {
  it('places the order with the saved address and goes to the order page', async () => {
    placeOrder.mockResolvedValue(order);
    const { user } = renderCheckout();

    await screen.findByText('Home'); // wait until the saved address is on screen
    await user.click(screen.getByRole('button', { name: 'Place order' }));

    expect(await screen.findByText('order page')).toBeInTheDocument();
    // Exactly the DeliveryAddress DTO: no id, no label, no isDefault. And no prices anywhere.
    expect(placeOrder).toHaveBeenCalledWith({
      paymentMethod: 'MOCK_PAYMENT',
      deliveryAddress: {
        recipientName: 'Asha Rao', phone: '9876543210', line1: '12 MG Road', line2: null,
        city: 'Hyderabad', state: 'Telangana', pincode: '500001',
      },
    });
  });

  it('shows validation errors and sends nothing when the new address is invalid', async () => {
    getAddresses.mockResolvedValue([]); // no saved addresses => the new-address form
    const { user } = renderCheckout();

    await screen.findByLabelText('Mobile number');
    await user.click(screen.getByRole('button', { name: 'Place order' }));

    expect(await screen.findByText('Enter a valid 10-digit mobile number.')).toBeInTheDocument();
    expect(screen.getByText('Enter a valid 6-digit pincode.')).toBeInTheDocument();
    expect(placeOrder).not.toHaveBeenCalled();
  });

  it('shows the stock problem by product name and refreshes the cart', async () => {
    placeOrder.mockRejectedValue(
      apiFailure(409, 'INSUFFICIENT_STOCK', 'Some items are not available in the requested quantity.', [
        { field: 'productId:11', message: 'Requested 5, available 2' },
      ])
    );
    const { user } = renderCheckout();

    await screen.findByText('Home');
    await user.click(screen.getByRole('button', { name: 'Place order' }));

    expect(await screen.findByText(/Toned Milk: Requested 5, available 2/)).toBeInTheDocument();
    expect(screen.queryByText('order page')).not.toBeInTheDocument();
    // Mandate 4: provider load + checkout entry + the refresh after the conflict
    await waitFor(() => expect(getCart.mock.calls.length).toBeGreaterThanOrEqual(3));
  });

  it('sends the user back to the cart when a product is unavailable', async () => {
    placeOrder.mockRejectedValue(
      apiFailure(409, 'PRODUCT_UNAVAILABLE', 'Some items in your cart are no longer available.')
    );
    const { user } = renderCheckout();

    await screen.findByText('Home');
    await user.click(screen.getByRole('button', { name: 'Place order' }));

    expect(await screen.findByText('cart page')).toBeInTheDocument();
  });

  it('sends one request when the button is double-clicked', async () => {
    placeOrder.mockReturnValue(new Promise(() => {})); // slow server
    const { user } = renderCheckout();

    await screen.findByText('Home');
    await user.dblClick(screen.getByRole('button', { name: 'Place order' }));

    expect(placeOrder).toHaveBeenCalledTimes(1);
  });
});