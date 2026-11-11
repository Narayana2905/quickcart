import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { TOKEN_KEY } from '../api/httpClient';
import { loginUser } from '../api/authApi';
import { AuthProvider } from '../context/AuthContext';
import GuestRoute from '../components/GuestRoute';
import Login from '../pages/auth/Login';
import { admin, apiFailure, customer } from './fixtures';

vi.mock('../api/authApi');

function renderLogin() {
  const user = userEvent.setup();
  render(
    <MemoryRouter initialEntries={['/login']}>
      <AuthProvider>
        <Routes>
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<Login />} />
          </Route>
          <Route path="/" element={<p>home page</p>} />
          <Route path="/admin/orders" element={<p>admin orders page</p>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
  return user;
}

async function fillAndSubmit(user) {
  await user.type(screen.getByLabelText('Email'), 'someone@example.com');
  await user.type(screen.getByLabelText('Password'), 'Passw0rd123');
  await user.click(screen.getByRole('button', { name: 'Log in' }));
}

const authResponse = (u) => ({ accessToken: 'jwt-123', tokenType: 'Bearer', expiresIn: 3600, user: u });

describe('Login', () => {
  it('stores the token and sends a customer to the home page', async () => {
    loginUser.mockResolvedValue(authResponse(customer));
    const user = renderLogin();

    await fillAndSubmit(user);

    expect(await screen.findByText('home page')).toBeInTheDocument();
    expect(localStorage.getItem(TOKEN_KEY)).toBe('jwt-123');
    expect(loginUser).toHaveBeenCalledWith({ email: 'someone@example.com', password: 'Passw0rd123' });
  });

  it('sends an admin to /admin/orders', async () => {
    loginUser.mockResolvedValue(authResponse(admin));
    const user = renderLogin();

    await fillAndSubmit(user);

    expect(await screen.findByText('admin orders page')).toBeInTheDocument();
  });

  it('shows the server message when the credentials are wrong', async () => {
    loginUser.mockRejectedValue(apiFailure(401, 'INVALID_CREDENTIALS', 'Invalid email or password.'));
    const user = renderLogin();

    await fillAndSubmit(user);

    expect(await screen.findByText('Invalid email or password.')).toBeInTheDocument();
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(screen.queryByText('home page')).not.toBeInTheDocument();
  });

  it('validates on the client before calling the API', async () => {
    const user = renderLogin();

    await user.click(screen.getByRole('button', { name: 'Log in' }));

    expect(await screen.findByText('Email is required.')).toBeInTheDocument();
    expect(loginUser).not.toHaveBeenCalled();
  });
});