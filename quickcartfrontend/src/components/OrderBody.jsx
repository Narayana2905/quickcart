import { formatPrice } from '../utils/formatPrice';
import { PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS } from '../utils/orderLabels';

// Items, delivery address, payment and totals: everything below the status area.
export default function OrderBody({ order }) {
  const a = order.deliveryAddress;

  return (
    <>
      <div className="table-scroll">
        <table className="data-table" aria-label="Items in this order">
          <thead>
            <tr>
              <th scope="col">Item</th>
              <th scope="col">Price</th>
              <th scope="col">Qty</th>
              <th scope="col">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.productId}>
                <td>{item.productName}</td>
                <td>{formatPrice(item.unitPrice)}</td>
                <td>{item.quantity}</td>
                <td>{formatPrice(item.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="order-detail__grid">
        <section>
          <h3>Delivery address</h3>
          <p>{a.recipientName} · {a.phone}</p>
          <p>{a.line1}{a.line2 ? `, ${a.line2}` : ''}</p>
          <p>{a.city}, {a.state} {a.pincode}</p>
        </section>

        <section>
          <h3>Payment</h3>
          <p>{PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod}</p>
          <p>Status: {PAYMENT_STATUS_LABELS[order.paymentStatus] ?? order.paymentStatus}</p>
        </section>

        <section className="cart-summary">
          <h3>Totals</h3>
          <dl>
            <div><dt>Subtotal</dt><dd>{formatPrice(order.subtotal)}</dd></div>
            <div><dt>Delivery fee</dt><dd>{formatPrice(order.deliveryFee)}</dd></div>
            <div className="cart-summary__total"><dt>Total</dt><dd>{formatPrice(order.total)}</dd></div>
          </dl>
        </section>
      </div>
    </>
  );
}