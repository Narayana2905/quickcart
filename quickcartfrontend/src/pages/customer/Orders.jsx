import { Link, useSearchParams } from 'react-router-dom';
import { getOrders } from '../../api/orderApi';
import useFetch from '../../utils/useFetch';
import { readPage } from '../../utils/pageParam';
import { formatDateTime } from '../../utils/formatDate';
import { formatPrice } from '../../utils/formatPrice';
import Loader from '../../components/Loader';
import ErrorBanner from '../../components/ErrorBanner';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';
import OrderStatusBadge from '../../components/OrderStatusBadge';

const PAGE_SIZE = 10;

export default function Orders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = readPage(searchParams);
  const { data, loading, error, reload } = useFetch(
    (signal) => getOrders({ page, size: PAGE_SIZE }, signal),
    [page]
  );

  const goToPage = (p) => {
    const next = new URLSearchParams(searchParams);
    if (p === 0) next.delete('page');
    else next.set('page', String(p));
    setSearchParams(next);
    window.scrollTo(0, 0);
  };

  if (loading) return <Loader />;
  if (error) return <ErrorBanner message={error.message} onRetry={reload} />;
  if (!data) return null;

  if (data.totalElements === 0) {
    return (
      <EmptyState
        message="You haven't placed any orders yet."
        action={<Link to="/products">Start shopping</Link>}
      />
    );
  }

  return (
    <section>
      <h2>My orders</h2>
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Order</th>
              <th scope="col">Date</th>
              <th scope="col">Status</th>
              <th scope="col">Items</th>
              <th scope="col">Total</th>
            </tr>
          </thead>
          <tbody>
            {data.content.map((o) => (
              <tr key={o.id}>
                <td><Link to={`/orders/${o.id}`}>{o.orderNumber}</Link></td>
                <td>{formatDateTime(o.createdAt)}</td>
                <td><OrderStatusBadge status={o.status} /></td>
                <td>{o.itemCount}</td>
                <td>{formatPrice(o.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={data.page} totalPages={data.totalPages} onChange={goToPage} />
    </section>
  );
}