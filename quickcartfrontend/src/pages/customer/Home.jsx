import { Link } from 'react-router-dom';
import { getCategories, getProducts } from '../../api/catalogApi';
import useFetch from '../../utils/useFetch';
import Loader from '../../components/Loader';
import ErrorBanner from '../../components/ErrorBanner';
import EmptyState from '../../components/EmptyState';
import ProductCard from '../../components/ProductCard';

export default function Home() {
  // One fetch for both calls => one loading state, one error state, one Retry.
  const { data, loading, error, reload } = useFetch(async (signal) => {
    const [categories, products] = await Promise.all([
      getCategories(signal),
      getProducts({ page: 0, size: 12 }, signal),
    ]);
    return { categories, products };
  }, []);

  if (loading) return <Loader />;
  if (error) return <ErrorBanner message={error.message} onRetry={reload} />;
  if (!data) return null;

  const { categories, products } = data;

  return (
    <section>
      <h2>Shop by category</h2>
      <div className="chips">
        {categories.map((c) => (
          <Link key={c.id} to={`/products?categoryId=${c.id}`} className="chip">
            {c.name}
          </Link>
        ))}
      </div>

      <h2>Products</h2>
      {products.content.length === 0 ? (
        <EmptyState message="No products available yet." />
      ) : (
        <>
          <div className="product-grid">
            {products.content.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          <p><Link to="/products">View all products</Link></p>
        </>
      )}
    </section>
  );
}