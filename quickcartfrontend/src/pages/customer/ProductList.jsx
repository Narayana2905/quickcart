import { useSearchParams } from 'react-router-dom';
import { getCategories, getProducts } from '../../api/catalogApi';
import useFetch from '../../utils/useFetch';
import Loader from '../../components/Loader';
import ErrorBanner from '../../components/ErrorBanner';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';
import ProductCard from '../../components/ProductCard';

const PAGE_SIZE = 12;
const SORT_OPTIONS = [
  { value: 'name', label: 'Name (A-Z)' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
];
const VALID_SORTS = SORT_OPTIONS.map((o) => o.value);

export default function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read + sanitise state from the URL (people can edit URLs by hand).
  const q = searchParams.get('q') ?? '';
  const categoryId = searchParams.get('categoryId') ?? '';
  const rawPage = Number.parseInt(searchParams.get('page') ?? '0', 10);
  const page = Number.isNaN(rawPage) || rawPage < 0 ? 0 : rawPage;
  const rawSort = searchParams.get('sort');
  const sort = VALID_SORTS.includes(rawSort) ? rawSort : 'name';

  const categories = useFetch((signal) => getCategories(signal), []);
  const products = useFetch(
    (signal) => getProducts({ q, categoryId, page, size: PAGE_SIZE, sort }, signal),
    [q, categoryId, page, sort]
  );

  // Any change except an explicit page change resets to the first page.
  const updateParams = (changes) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(changes).forEach(([key, value]) => {
      if (value === '' || value === null || value === undefined) next.delete(key);
      else next.set(key, String(value));
    });
    if (!('page' in changes)) next.delete('page');
    setSearchParams(next);
  };

  const goToPage = (p) => {
    updateParams({ page: p === 0 ? '' : p });
    window.scrollTo(0, 0);
  };

  return (
    <section>
      <h2>{q ? `Results for "${q}"` : 'All products'}</h2>

      <ErrorBanner message={categories.error?.message} onRetry={categories.reload} />

      <div className="toolbar">
        <label>
          Category{' '}
          <select
            value={categoryId}
            onChange={(e) => updateParams({ categoryId: e.target.value })}
          >
            <option value="">All categories</option>
            {(categories.data ?? []).map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
        <label>
          Sort by{' '}
          <select value={sort} onChange={(e) => updateParams({ sort: e.target.value })}>
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>
      </div>

      {products.loading && <Loader />}

      {!products.loading && products.error && (
        <ErrorBanner message={products.error.message} onRetry={products.reload} />
      )}

      {!products.loading && !products.error && products.data && (
        products.data.content.length === 0 ? (
          <EmptyState message="No products match your search." />
        ) : (
          <>
            <div className="product-grid">
              {products.data.content.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            <Pagination
              page={products.data.page}
              totalPages={products.data.totalPages}
              onChange={goToPage}
            />
          </>
        )
      )}
    </section>
  );
}