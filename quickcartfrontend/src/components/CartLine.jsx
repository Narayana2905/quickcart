import { formatPrice } from '../utils/formatPrice';
import ProductImage from './ProductImage';
import QuantityStepper from './QuantityStepper';

export default function CartLine({ line, busy, onQuantityChange, onRemove }) {
  return (
    <li className={`cart-line${line.available ? '' : ' cart-line--unavailable'}`}>
      <ProductImage src={line.imageUrl} name={line.name} />

      <div className="cart-line__info">
        <strong>{line.name}</strong>
        {/* Mandate 11: unit is null on "Unavailable item" lines */}
        {line.unit && <span className="muted">{line.unit}</span>}

        {line.available ? (
          <span>{formatPrice(line.unitPrice)}</span>
        ) : (
          <span className="cart-line__warning">
            Unavailable. Remove to continue.
            {line.availableQuantity > 0 && ` Only ${line.availableQuantity} in stock.`}
          </span>
        )}
      </div>

      {line.available && (
        <div className="cart-line__controls">
          <QuantityStepper
            value={line.quantity}
            onChange={(n) => n !== line.quantity && onQuantityChange(n)}
            disabled={busy}
            inputReadOnly
            label={`Quantity of ${line.name}`}
          />
          <strong>{formatPrice(line.lineTotal)}</strong>
        </div>
      )}

      <button type="button" onClick={onRemove} disabled={busy}
        aria-label={`Remove ${line.name}`}>
        Remove
      </button>
    </li>
  );
}