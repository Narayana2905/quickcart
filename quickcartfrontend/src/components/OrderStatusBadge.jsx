import { statusLabel } from '../utils/orderLabels';

export default function OrderStatusBadge({ status }) {
  return (
    <span className={`status status--${String(status).toLowerCase()}`}>
      {statusLabel(status)}
    </span>
  );
}