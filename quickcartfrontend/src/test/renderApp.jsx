import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { TOKEN_KEY, USER_KEY } from '../api/httpClient';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';

export function loginAs(user) {
  localStorage.setItem(TOKEN_KEY, 'test-token');
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// Renders `ui` inside the same providers the real app has.
// NOTE: a logged-in CUSTOMER makes CartProvider call getCart(), so any test that uses
// `as: customer` must vi.mock('../api/cartApi') and give getCart an answer.
export function renderApp(ui, { route = '/', as = null } = {}) {
  if (as) loginAs(as);
  return {
    user: userEvent.setup(),
    ...render(
      <MemoryRouter initialEntries={[route]}>
        <AuthProvider>
          <CartProvider>{ui}</CartProvider>
        </AuthProvider>
      </MemoryRouter>
    ),
  };
}