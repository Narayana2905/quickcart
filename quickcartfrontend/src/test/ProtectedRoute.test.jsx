import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import { AuthProvider } from '../context/AuthContext';
import { loginAs } from './renderApp';
import { admin, customer } from './fixtures';

function renderAt(route) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<p>home page</p>} />
          <Route path="/login" element={<p>login page</p>} />
          <Route element={<ProtectedRoute role="CUSTOMER" />}>
            <Route path="/cart" element={<p>cart page</p>} />
          </Route>
          <Route element={<ProtectedRoute role="ADMIN" />}>
            <Route path="/admin/orders" element={<p>admin orders page</p>} />
          </Route>
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  it('sends a guest to the login page', () => {
    renderAt('/cart');
    expect(screen.getByText('login page')).toBeInTheDocument();
  });

  it('sends a guest away from admin routes too', () => {
    renderAt('/admin/orders');
    expect(screen.getByText('login page')).toBeInTheDocument();
  });

  it('blocks a customer from admin routes', () => {
    loginAs(customer);
    renderAt('/admin/orders');
    expect(screen.getByText('home page')).toBeInTheDocument();
    expect(screen.queryByText('admin orders page')).not.toBeInTheDocument();
  });

  it('lets an admin into admin routes', () => {
    loginAs(admin);
    renderAt('/admin/orders');
    expect(screen.getByText('admin orders page')).toBeInTheDocument();
  });

  it('keeps admins out of customer routes (Section 10.5)', () => {
    loginAs(admin);
    renderAt('/cart');
    expect(screen.getByText('admin orders page')).toBeInTheDocument();
  });

  it('lets a customer into customer routes', () => {
    loginAs(customer);
    renderAt('/cart');
    expect(screen.getByText('cart page')).toBeInTheDocument();
  });
});