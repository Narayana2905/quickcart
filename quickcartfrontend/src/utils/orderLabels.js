// Exact enum strings from the Handoff, with human labels.
export const TIMELINE = ['PLACED', 'CONFIRMED', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED'];

export const STATUS_LABELS = {
  PLACED: 'Placed',
  CONFIRMED: 'Confirmed',
  PACKED: 'Packed',
  OUT_FOR_DELIVERY: 'Out for delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

export const PAYMENT_METHOD_LABELS = {
  MOCK_PAYMENT: 'Mock payment (instant)',
  COD: 'Cash on delivery',
};

export const PAYMENT_STATUS_LABELS = { PAID: 'Paid', PENDING: 'Pending' };

// An unknown enum value must not crash the screen: fall back to the raw string.
export const statusLabel = (status) => STATUS_LABELS[status] ?? status;

export const ORDER_STATUSES = [...TIMELINE, 'CANCELLED'];

// Handoff section 7, verbatim. The dropdown is built from THIS table and nothing else (Mandate 9).
export const ALLOWED_TRANSITIONS = {
  PLACED: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PACKED', 'CANCELLED'],
  PACKED: ['OUT_FOR_DELIVERY'],
  OUT_FOR_DELIVERY: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

// Unknown status => no options => the control stays hidden. Failing closed is the safe default.
export const nextStatuses = (status) => ALLOWED_TRANSITIONS[status] ?? [];