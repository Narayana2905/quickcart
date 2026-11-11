import { Link, useSearchParams } from 'react-router-dom';
import { getAdminOrders } from '../../api/adminApi';
import useFetch from '../../utils/useFetch';
import { readPage } from '../../utils/pageParam';
import { formatDateTime } from '../../utils/formatDate';
import { formatPrice } from '../../utils/formatPrice';
import { ORDER_STATUSES, PAYMENT_STATUS_LABELS, statusLabel } from '../../utils/orderLabels';
import Loader from '../../components/Loader';
import ErrorBanner from '../../components/ErrorBanner';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';
import OrderStatusBadge from '../../components/OrderStatusBadge';

const PAGE_SIZE = 10;

export default function AdminOrders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = readPage(searchParams);
  const rawStatus = searchParams.get('status') ?? '';
  const status = ORDER_STATUSES.includes(rawStatus) ? rawStatus : ''; // ignore junk in the URL

  const { data, loading, error, reload } = useFetch(
    (signal) => getAdminOrders({ status, page, size: PAGE_SIZE }, signal),
    [status, page]
  );

  const changeStatus = (value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set('status', value);
    else next.delete('status');
    next.delete('page'); // a new filter starts at the first page
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
      <h2>Orders</h2>

      {/* The filter stays visible in every state, so an empty result never traps you */}
      <div className="toolbar">
        <label>
          Status{' '}
          <select value={status} onChange={(e) => changeStatus(e.target.value)}>
            <option value="">All statuses</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>{statusLabel(s)}</option>
            ))}
          </select>
        </label>
      </div>

      {loading && <Loader />}
      {!loading && error && <ErrorBanner message={error.message} onRetry={reload} />}

      {!loading && !error && data && (
        data.totalElements === 0 ? (
          <EmptyState message="No orders found." />
        ) : (
          <>
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th scope="col">Order</th>
                    <th scope="col">Customer</th>
                    <th scope="col">Date</th>
                    <th scope="col">Status</th>
                    <th scope="col">Payment</th>
                    <th scope="col">Items</th>
                    <th scope="col">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.content.map((o) => (
                    <tr key={o.id}>
                      <td><Link to={`/admin/orders/${o.id}`}>{o.orderNumber}</Link></td>
                      <td>{o.recipientName} <span className="muted">(user #{o.userId})</span></td>
                      <td>{formatDateTime(o.createdAt)}</td>
                      <td><OrderStatusBadge status={o.status} /></td>
                      <td>{PAYMENT_STATUS_LABELS[o.paymentStatus] ?? o.paymentStatus}</td>
                      <td>{o.itemCount}</td>
                      <td>{formatPrice(o.total)}</td>
                    </tr>
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