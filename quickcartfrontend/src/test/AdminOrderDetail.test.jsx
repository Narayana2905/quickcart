import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { getAdminOrder, updateOrderStatus } from '../api/adminApi';
import AdminOrderDetail from '../pages/admin/AdminOrderDetail';
import { adminOrder, order } from './fixtures';

vi.mock('../api/adminApi');

function renderDetail(status) {
  getAdminOrder.mockResolvedValue({ ...adminOrder, status });
  const user = userEvent.setup();
  render(
    <MemoryRouter initialEntries={['/admin/orders/42']}>
      <Routes>
        <Route path="/admin/orders/:id" element={<AdminOrderDetail />} />
      </Routes>
    </MemoryRouter>
  );
  return user;
}

// The select also holds the "Choose next status" placeholder (empty value): leave it out.
const optionLabels = (select) =>
  within(select)
    .getAllByRole('option')
    .filter((o) => o.value !== '')
    .map((o) => o.textContent);

describe('AdminOrderDetail status control', () => {
  it.each([
    ['PLACED', ['Confirmed', 'Cancelled']],
    ['CONFIRMED', ['Packed', 'Cancelled']],
    ['PACKED', ['Out for delivery']],
    ['OUT_FOR_DELIVERY', ['Delivered']],
  ])('offers only the allowed next statuses for %s', async (status, expected) => {
    renderDetail(status);
    const select = await screen.findByRole('combobox');
    expect(optionLabels(select)).toEqual(expected);
  });

  it.each(['DELIVERED', 'CANCELLED'])('has no control at all for the terminal status %s', async (status) => {
    renderDetail(status);
    expect(await screen.findByText(/no further status changes/i)).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('asks for confirmation before cancelling, then calls the API', async () => {
    updateOrderStatus.mockResolvedValue({ ...order, status: 'CANCELLED' });
    const user = renderDetail('PLACED');

    await user.selectOptions(await screen.findByRole('combobox'), 'CANCELLED');
    await user.click(screen.getByRole('button', { name: 'Update status' }));

    const dialog = await screen.findByRole('alertdialog');
    expect(updateOrderStatus).not.toHaveBeenCalled(); // nothing yet: the admin must confirm

    await user.click(within(dialog).getByRole('button', { name: 'Cancel order' }));

    await waitFor(() => expect(updateOrderStatus).toHaveBeenCalledWith(42, 'CANCELLED'));
    expect(await screen.findByText('Status updated to Cancelled.')).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument(); // now terminal
  });

  it('does nothing when the admin backs out of the dialog', async () => {
    const user = renderDetail('PLACED');

    await user.selectOptions(await screen.findByRole('combobox'), 'CANCELLED');
    await user.click(screen.getByRole('button', { name: 'Update status' }));
    await screen.findByRole('alertdialog');

    await user.click(screen.getByRole('button', { name: 'Keep order' }));

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(updateOrderStatus).not.toHaveBeenCalled();
  });
});