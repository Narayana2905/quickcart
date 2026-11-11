import { Link } from 'react-router-dom';
import { formatPrice } from '../utils/formatPrice';
import ProductImage from './ProductImage';
import AddToCartButton from './AddToCartButton';

export default function ProductCard({ product }) {
  return (
    <article className="product-card">
      <Link to={`/products/${product.id}`} className="product-card__link">
        <ProductImage src={product.imageUrl} name={product.name} />
        <h3>{product.name}</h3>
        <p className="muted">{product.unit}</p>
      </Link>
      <div className="product-card__footer">
        <strong>{formatPrice(product.price)}</strong>
        <AddToCartButton product={product} />
      </div>
    </article>
  );
}