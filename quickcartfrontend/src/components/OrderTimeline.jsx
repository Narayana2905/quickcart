import { TIMELINE, statusLabel } from '../utils/orderLabels';

export default function OrderTimeline({ status }) {
  // Contract: CANCELLED is shown separately, not as a step in the timeline.
  if (status === 'CANCELLED') {
    return <p className="timeline-cancelled" role="status">This order was cancelled.</p>;
  }

  const current = TIMELINE.indexOf(status);
  return (
    <ol className="timeline" aria-label="Order progress">
      {TIMELINE.map((step, i) => (
        <li
          key={step}
          className={i < current ? 'is-done' : i === current ? 'is-current' : ''}
          aria-current={i === current ? 'step' : undefined}
        >
          {statusLabel(step)}
        </li>
      ))}
    </ol>
  );
}