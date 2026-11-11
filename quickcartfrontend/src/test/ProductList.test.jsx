import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { getCategories, getProducts } from '../api/catalogApi';
import ProductList from '../pages/customer/ProductList';
import SearchBox from '../components/SearchBox';
import { apiFailure, category, emptyProductPage, productPage } from './fixtures';
import { renderApp } from './renderApp';

vi.mock('../api/catalogApi');

const renderList = (route = '/products') =>
  renderApp(
    <Routes>
      <Route path="/products" element={<ProductList />} />
    </Routes>,
    { route }
  );

describe('ProductList states', () => {
  it('shows a loader while products load', () => {
    getCategories.mockResolvedValue([category]);
    getProducts.mockReturnValue(new Promise(() => {})); // never answers
    renderList();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows the empty state', async () => {
    getCategories.mockResolvedValue([category]);
    getProducts.mockResolvedValue(emptyProductPage);
    renderList();
    expect(await screen.findByText('No products match your search.')).toBeInTheDocument();
  });

  it('shows the error and recovers with Retry', async () => {
    getCategories.mockResolvedValue([category]);
    getProducts
      .mockRejectedValueOnce(apiFailure(500, 'INTERNAL_ERROR', 'Something broke.'))
      .mockResolvedValueOnce(productPage);
    const { user } = renderList();

    expect(await screen.findByText('Something broke.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Retry' }));

    expect(await screen.findByText('Toned Milk')).toBeInTheDocument();
    expect(getProducts).toHaveBeenCalledTimes(2);
  });

  it('shows the products, formatted by the formatter and not by us', async () => {
    getCategories.mockResolvedValue([category]);
    getProducts.mockResolvedValue(productPage);
    renderList();

    expect(await screen.findByText('Toned Milk')).toBeInTheDocument();
    expect(screen.getByText('500 ml')).toBeInTheDocument();
    expect(screen.getByText('₹28.00')).toBeInTheDocument();
  });

  it('reads q, categoryId, sort and page from the URL', async () => {
    getCategories.mockResolvedValue([category]);
    getProducts.mockResolvedValue(productPage);
    renderList('/products?q=milk&categoryId=2&sort=price_desc&page=1');

    await screen.findByText('Toned Milk');
    expect(getProducts).toHaveBeenCalledWith(
      { q: 'milk', categoryId: '2', page: 1, size: 12, sort: 'price_desc' },
      expect.anything()
    );
  });
});

describe('SearchBox', () => {
  afterEach(() => vi.useRealTimers());

  function Probe() {
    const { pathname, search } = useLocation();
    return <p data-testid="where">{pathname}{search}</p>;
  }

  it('waits for the typing to pause, then puts q in the URL', async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="*" element={<><SearchBox /><Probe /></>} />
        </Routes>
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText('Search products'), 'milk');
    expect(screen.getByTestId('where')).not.toHaveTextContent('q=milk'); // still debouncing

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.getByTestId('where')).toHaveTextContent('/products?q=milk');
  });

  it('searches immediately on Enter', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="*" element={<><SearchBox /><Probe /></>} />
        </Routes>
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText('Search products'), 'curd{Enter}');
    expect(screen.getByTestId('where')).toHaveTextContent('/products?q=curd');
  });
});