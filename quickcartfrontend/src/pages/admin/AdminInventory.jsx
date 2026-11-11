import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getInventory, setInventoryQuantity } from '../../api/adminApi';
import useFetch from '../../utils/useFetch';
import useSubmitLock from '../../utils/useSubmitLock';
import { parseApiError } from '../../utils/errorMessage';
import { readPage } from '../../utils/pageParam';
import { formatDateTime } from '../../utils/formatDate';
import { validateQuantity } from '../../utils/validators';
import Loader from '../../components/Loader';
import ErrorBanner from '../../components/ErrorBanner';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';

const PAGE_SIZE = 10;

export default function AdminInventory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = readPage(searchParams);
  const q = searchParams.get('q') ?? '';

  const { data, loading, error, reload } = useFetch(
    (signal) => getInventory({ q, page, size: PAGE_SIZE }, signal),
    [q, page]
  );

  const setQuery = (value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set('q', value);
    else next.delete('q');
    next.delete('page');
    setSearchParams(next);
  };

  const goToPage = (p) => {
    const next = new URLSearchParams(searchParams);
    if (p === 0) next.delete('page');
    else next.set('page', String(p));
    setSearchParams(next);
    window.scrollTo(0, 0);
  };

  return (
    <section>
      <h2>Inventory</h2>

      <div className="toolbar">
        <form
          key={q}
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            setQuery(String(new FormData(e.currentTarget).get('q') ?? '').trim());
          }}
        >
          <label>
            Search{' '}
            <input type="search" name="q" defaultValue={q} placeholder="Product name" />
          </label>{' '}
          <button type="submit">Search</button>
        </form>
      </div>

      {loading && <Loader />}
      {!loading && error && <ErrorBanner message={error.message} onRetry={reload} />}

      {!loading && !error && data && (
        data.totalElements === 0 ? (
          <EmptyState message="No products found." />
        ) : (
          <>
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th scope="col">Product</th>
                    <th scope="col">Unit</th>
                    <th scope="col">Quantity</th>
                    <th scope="col">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {data.content.map((item) => (
                    // The key includes the server values: a refetch with new numbers resets the row.
                    <InventoryRow key={`${item.productId}:${item.quantity}:${item.updatedAt}`} item={item} />
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={data.page} totalPages={data.totalPages} onChange={goToPage} />
          </>
        )
      )}
    </section>
  );
}

// Each row edits and saves on its own, so one slow save never blocks the others.
function InventoryRow({ item }) {
  const { busy, run } = useSubmitLock();
  const [current, setCurrent] = useState(item);
  const [draft, setDraft] = useState(String(item.quantity));
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const dirty = draft.trim() !== String(current.quantity);

  const handleSave = (e) => {
    e.preventDefault();
    return run(async () => {
      setError('');
      setSaved(false);
      const msg = validateQuantity(draft);
      if (msg) {
        setError(msg);
        return;
      }
      try {
        const result = await setInventoryQuantity(current.productId, Number(draft.trim()));
        setCurrent(result); // show what the server stored
        setDraft(String(result.quantity));
        setSaved(true);
      } catch (err) {
        const { message, fieldErrors } = parseApiError(err);
        setError(fieldErrors.quantity ?? message);
      }
    });
  };

  return (
    <tr>
      <td>{current.productName}</td>
      <td>{current.unit}</td>
      <td>
        <form className="inline-form" onSubmit={handleSave} noValidate>
          <input
            aria-label={`Quantity for ${current.productName}`}
            inputMode="numeric"
            value={draft}
            disabled={busy}
            aria-invalid={error ? 'true' : 'false'}
            onChange={(e) => { setSaved(false); setDraft(e.target.value); }}
          />
          <button type="submit" disabled={busy || !dirty}>{busy ? 'Saving...' : 'Save'}</button>
          {saved && <span className="tag" role="status">Saved</span>}
        </form>
        {error && <p className="form-field__error" role="alert">{error}</p>}
      </td>
      <td>{formatDateTime(current.updatedAt)}</td>
    </tr>
  );
}