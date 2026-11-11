import { useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { getAdminCategories, getAdminProducts, setProductActive } from '../../api/adminApi';
import useFetch from '../../utils/useFetch';
import useSubmitLock from '../../utils/useSubmitLock';
import { messageWithDetails, parseApiError } from '../../utils/errorMessage';
import { readPage } from '../../utils/pageParam';
import { formatPrice } from '../../utils/formatPrice';
import Loader from '../../components/Loader';
import ErrorBanner from '../../components/ErrorBanner';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';
import ConfirmDialog from '../../components/ConfirmDialog';

const PAGE_SIZE = 10;

export default function AdminProducts() {
  const { state } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read and sanitise state from the URL.
  const page = readPage(searchParams);
  const q = searchParams.get('q') ?? '';
  const rawCategory = searchParams.get('categoryId') ?? '';
  const categoryId = /^\d+$/.test(rawCategory) ? rawCategory : '';
  const rawActive = searchParams.get('active') ?? '';
  const active = rawActive === 'true' || rawActive === 'false' ? rawActive : '';

  const categories = useFetch((signal) => getAdminCategories(signal), []);
  const products = useFetch(
    (signal) => getAdminProducts({ q, categoryId, active, page, size: PAGE_SIZE }, signal),
    [q, categoryId, active, page]
  );
  const { busy, run } = useSubmitLock();
  const [confirming, setConfirming] = useState(null);
  const [notice, setNotice] = useState(state?.notice ?? ''); // e.g. "Product created." from the form
  const [actionError, setActionError] = useState('');

  const setParams = (changes) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(changes).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    next.delete('page'); // any filter change starts at the first page
    setSearchParams(next);
  };

  const goToPage = (p) => {
    const next = new URLSearchParams(searchParams);
    if (p === 0) next.delete('page');
    else next.set('page', String(p));
    setSearchParams(next);
    window.scrollTo(0, 0);
  };

  const applyActive = (product, nextActive) =>
    run(async () => {
      setActionError('');
      setNotice('');
      try {
        await setProductActive(product.id, nextActive);
        setNotice(`${product.name} ${nextActive ? 'activated' : 'deactivated'}.`);
      } catch (err) {
        setActionError(messageWithDetails(parseApiError(err)));
      } finally {
        setConfirming(null);
        products.reload(); // the server's list is the truth
      }
    });

  const data = products.data;

  return (
    <section>
      <div className="page-header">
        <h2>Products</h2>
        <Link to="/admin/products/new" className="button button--inline">Add product</Link>
      </div>

      {notice && <p className="notice" role="status">{notice}</p>}
      <ErrorBanner message={actionError} />
      <ErrorBanner message={categories.error?.message} onRetry={categories.reload} />

      <div className="toolbar">
        {/* key={q}: when the URL's q changes (Back button), the box resets itself */}
        <form
          key={q}
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            setParams({ q: String(new FormData(e.currentTarget).get('q') ?? '').trim() });
          }}
        >
          <label>
            Search{' '}
            <input type="search" name="q" defaultValue={q} placeholder="Product name" />
          </label>{' '}
          <button type="submit">Search</button>
        </form>

        <label>
          Category{' '}
          <select value={categoryId} onChange={(e) => setParams({ categoryId: e.target.value })}>
            <option value="">All categories</option>
            {(categories.data ?? []).map((c) => (
              <option key={c.id} value={c.id}>{c.name}{c.active ? '' : ' (inactive)'}</option>
            ))}
          </select>
        </label>

        <label>
          Status{' '}
          <select value={active} onChange={(e) => setParams({ active: e.target.value })}>
            <option value="">All</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </label>
      </div>

      {products.loading && !data && <Loader />}
      {!products.loading && products.error && (
        <ErrorBanner message={products.error.message} onRetry={products.reload} />
      )}

      {data && !products.error && (
        data.totalElements === 0 ? (
          <EmptyState message="No products found." />
        ) : (
          <>
            <div className={`table-scroll${products.loading ? ' is-refreshing' : ''}`}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Category</th>
                    <th scope="col">Price</th>
                    <th scope="col">Stock</th>
                    <th scope="col">Status</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.content.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <Link to={`/admin/products/${p.id}/edit`}>{p.name}</Link>
                        <div className="muted">{p.unit}</div>
                      </td>
                      <td>{p.categoryName}</td>
                      <td>{formatPrice(p.price)}</td>
                      <td>{p.availableQuantity}{!p.inStock && <span className="tag tag--muted">Out</span>}</td>
                      <td>
                        <span className={`tag${p.active ? '' : ' tag--muted'}`}>
                          {p.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="row-actions">
                        <Link to={`/admin/products/${p.id}/edit`}>Edit</Link>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => (p.active ? setConfirming(p) : applyActive(p, true))}
                        >
                          {p.active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={data.page} totalPages={data.totalPages} onChange={goToPage} />
          </>
        )
      )}

      <ConfirmDialog
        open={Boolean(confirming)}
        title="Deactivate product?"
        message={confirming
          ? `${confirming.name} will be hidden from customers, and carts that contain it will show it as unavailable. Existing orders are not affected. You can activate it again later.`
          : ''}
        confirmLabel="Deactivate"
        busy={busy}
        onConfirm={() => applyActive(confirming, false)}
        onCancel={() => !busy && setConfirming(null)}
      />
    </section>
  );
}