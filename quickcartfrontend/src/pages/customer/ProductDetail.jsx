import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getProduct } from '../../api/catalogApi';
import { useAuth } from '../../context/AuthContext';
import useFetch from '../../utils/useFetch';
import { formatPrice } from '../../utils/formatPrice';
import Loader from '../../components/Loader';
import ErrorBanner from '../../components/ErrorBanner';
import EmptyState from '../../components/EmptyState';
import ProductImage from '../../components/ProductImage';
import QuantityStepper from '../../components/QuantityStepper';
import AddToCartButton from '../../components/AddToCartButton';

const notFound = (
  <EmptyState
    message="Product not found."
    action={<Link to="/products">Back to products</Link>}
  />
);

export default function ProductDetail() {
  const { id } = useParams();
  // Mandates: path ids must be plain numbers. Hooks can't sit behind an early return,
  // so the guard lives in this wrapper and the hooks live in the child.
  if (!/^\d+$/.test(id)) return notFound;
  return <ProductDetailContent key={id} id={Number(id)} />;
}

function ProductDetailContent({ id }) {
  const { isAdmin } = useAuth();
  const { data: product, loading, error, reload } = useFetch(
    (signal) => getProduct(id, signal),
    [id]
  );
  const [quantity, setQuantity] = useState(1);

  if (loading) return <Loader />;
  if (error) {
    if (error.code === 'NOT_FOUND') return notFound;
    return <ErrorBanner message={error.message} onRetry={reload} />;
  }
  if (!product) return null;

  return (
    <article className="product-detail">
      <ProductImage src={product.imageUrl} name={product.name} />
      <div className="product-detail__info">
        <p className="muted">{product.categoryName}</p>
        <h2>{product.name}</h2>
        <p className="muted">{product.unit}</p>
        {product.description && <p>{product.description}</p>}
        <p className="product-detail__price">{formatPrice(product.price)}</p>
        <p className={product.inStock ? 'in-stock' : 'out-of-stock'}>
          {product.inStock ? 'In stock' : 'Out of stock'}
        </p>

        {!isAdmin && product.inStock && (
          <div className="product-detail__actions">
            <QuantityStepper value={quantity} onChange={setQuantity} />
            {/* <AddToCartButton product={product} /> */}
            {/* <AddToCartButton product={product} quantity={quantity} /> */}
            <AddToCartButton product={product} quantity={quantity} />
          </div>
        )}
      </div>
    </article>
  );
}