import { Link, useLocation, useParams } from 'react-router-dom';
import { getOrder } from '../../api/orderApi';
import useFetch from '../../utils/useFetch';
import { formatDateTime } from '../../utils/formatDate';
// import { formatPrice } from '../../utils/formatPrice';
// import { PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS } from '../../utils/orderLabels';
import Loader from '../../components/Loader';
import ErrorBanner from '../../components/ErrorBanner';
import EmptyState from '../../components/EmptyState';
import OrderBody from '../../components/OrderBody';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import OrderTimeline from '../../components/OrderTimeline';

const notFound = (
  <EmptyState message="Order not found." action={<Link to="/orders">Back to my orders</Link>} />
);

export default function OrderDetail() {
  const { id } = useParams();
  if (!/^\d+$/.test(id)) return notFound; // plain numbers only in API paths
  return <OrderDetailContent key={id} id={Number(id)} />;
}

function OrderDetailContent({ id }) {
  const { state } = useLocation();
  const { data: order, loading, error, reload } = useFetch((signal) => getOrder(id, signal), [id]);

  if (loading) return <Loader />;
  if (error) {
    if (error.code === 'NOT_FOUND') return notFound; // also what another user's order returns
    return <ErrorBanner message={error.message} onRetry={reload} />;
  }
  if (!order) return null;

  // const a = order.deliveryAddress;

  return (
    <article className="order-detail">
      {state?.justPlaced && (
        <p className="notice" role="status">Order placed successfully. Thank you!</p>
      )}

      <header className="order-detail__header">
        <div>
          <h2>Order {order.orderNumber}</h2>
          <p className="muted">Placed on {formatDateTime(order.createdAt)}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </header>

      <OrderTimeline status={order.status} />
      <OrderBody order={order} />

      {/* <div className="table-scroll">
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
      </div> */}

      {/* <div className="order-detail__grid">
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
      </div> */}
    </article>
  );
}