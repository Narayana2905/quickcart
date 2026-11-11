import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getAdminOrder, updateOrderStatus } from '../../api/adminApi';
import useFetch from '../../utils/useFetch';
import useSubmitLock from '../../utils/useSubmitLock';
import { messageWithDetails, parseApiError } from '../../utils/errorMessage';
import { formatDateTime } from '../../utils/formatDate';
import { nextStatuses, statusLabel } from '../../utils/orderLabels';
import Loader from '../../components/Loader';
import ErrorBanner from '../../components/ErrorBanner';
import EmptyState from '../../components/EmptyState';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import OrderTimeline from '../../components/OrderTimeline';
import OrderBody from '../../components/OrderBody';
import ConfirmDialog from '../../components/ConfirmDialog';

const notFound = (
  <EmptyState message="Order not found." action={<Link to="/admin/orders">Back to orders</Link>} />
);

export default function AdminOrderDetail() {
  const { id } = useParams();
  if (!/^\d+$/.test(id)) return notFound; // plain numbers only in API paths
  return <AdminOrderDetailContent key={id} id={Number(id)} />;
}

function AdminOrderDetailContent({ id }) {
  const { data, loading, error, reload } = useFetch((signal) => getAdminOrder(id, signal), [id]);
  const { busy, run } = useSubmitLock();

  const [updated, setUpdated] = useState(null); // the latest Order returned by R3
  const [nextStatus, setNextStatus] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [notice, setNotice] = useState('');
  const [actionError, setActionError] = useState('');
  const [retryStatus, setRetryStatus] = useState(null);

  if (loading) return <Loader />;
  if (error) {
    if (error.code === 'NOT_FOUND') return notFound;
    return <ErrorBanner message={error.message} onRetry={reload} />;
  }
  if (!data) return null;

  // R3 returns an Order without userId, so lay it over the AdminOrder we already loaded.
  const order = updated ? { ...data, ...updated } : data;
  const options = nextStatuses(order.status); // Mandate 9: the table is the only source

  const applyStatus = (status) =>
    run(async () => {
      setActionError('');
      setNotice('');
      setRetryStatus(null);
      try {
        const result = await updateOrderStatus(id, status);
        setUpdated(result);
        setNextStatus('');
        setNotice(`Status updated to ${statusLabel(result.status)}.`);
      } catch (err) {
        const { code, message, fieldErrors } = parseApiError(err);
        setActionError(messageWithDetails({ message, fieldErrors }));
        if (code === 'INVALID_STATUS_TRANSITION') {
          // Handoff: show the message, then reload. Someone else moved this order first.
          setUpdated(null);
          setNextStatus('');
          reload();
        } else if (code === 'SERVICE_UNAVAILABLE') {
          setRetryStatus(status); // status is unchanged on the server: offer Retry
        }
      } finally {
        setConfirming(false);
      }
    });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!options.includes(nextStatus)) return;
    if (nextStatus === 'CANCELLED') setConfirming(true); // destructive: ask first
    else applyStatus(nextStatus);
  };

  return (
    <article className="order-detail">
      <p><Link to="/admin/orders">← All orders</Link></p>

      <header className="order-detail__header">
        <div>
          <h2>Order {order.orderNumber}</h2>
          <p className="muted">
            Placed on {formatDateTime(order.createdAt)} · Customer: user #{order.userId}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </header>

      <OrderTimeline status={order.status} />

      {notice && <p className="notice" role="status">{notice}</p>}
      <ErrorBanner
        message={actionError}
        onRetry={retryStatus ? () => applyStatus(retryStatus) : undefined}
      />

      {options.length > 0 ? (
        <form className="status-panel" onSubmit={handleSubmit}>
          <label>
            Move order to{' '}
            <select value={nextStatus} onChange={(e) => setNextStatus(e.target.value)} disabled={busy}>
              <option value="">Choose next status</option>
              {options.map((s) => (
                <option key={s} value={s}>{statusLabel(s)}</option>
              ))}
            </select>
          </label>
          <button type="submit" disabled={busy || !nextStatus}>
            {busy ? 'Updating...' : 'Update status'}
          </button>
        </form>
      ) : (
        // DELIVERED and CANCELLED are terminal: no control at all (Mandate 9)
        <p className="muted">No further status changes are possible for this order.</p>
      )}

      <OrderBody order={order} />

      <ConfirmDialog
        open={confirming}
        title="Cancel this order?"
        message={`Order ${order.orderNumber} will be cancelled and its items returned to stock. This cannot be undone.`}
        confirmLabel="Cancel order"
        cancelLabel="Keep order"
        busy={busy}
        onConfirm={() => applyStatus('CANCELLED')}
        onCancel={() => !busy && setConfirming(false)}
      />
    </article>
  );
}