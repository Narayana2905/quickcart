import { http, HttpResponse, delay } from 'msw';
import { db } from '../db';
import { apiError } from '../errors';
import { readJson, requireRole } from '../request';
import { intParam, toOrder } from './orders';

const STATUSES = ['PLACED', 'CONFIRMED', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];

// Contract 8.6, written separately from the client table on purpose:
// if the two ever disagree we want to find out here, not in production.
const ALLOWED = {
  PLACED: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PACKED', 'CANCELLED'],
  PACKED: ['OUT_FOR_DELIVERY'],
  OUT_FOR_DELIVERY: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

// Dev hook: pretend catalog-service is down, so releasing stock on cancel fails.
export const catalogControl = { down: false };

const toAdminSummary = (o) => ({
  id: o.id, orderNumber: o.orderNumber, userId: o.userId,
  recipientName: o.deliveryAddress.recipientName,
  status: o.status, paymentStatus: o.paymentStatus, total: o.total,
  itemCount: o.items.reduce((sum, i) => sum + i.quantity, 0), createdAt: o.createdAt,
});

const notFound = (request) => apiError(request, 404, 'NOT_FOUND', 'Order not found.');

export const adminOrderHandlers = [
  // R1
  http.get('*/api/v1/admin/orders', async ({ request }) => {
    await delay(300);
    const auth = requireRole(request, 'ADMIN');
    if (auth.response) return auth.response;

    const sp = new URL(request.url).searchParams;
    const page = intParam(sp.get('page'), 0);
    const size = intParam(sp.get('size'), 20);
    const status = sp.get('status');

    const details = [];
    if (Number.isNaN(page) || page < 0) details.push({ field: 'page', message: 'must be 0 or greater' });
    if (Number.isNaN(size) || size < 1 || size > 50) details.push({ field: 'size', message: 'must be between 1 and 50' });
    if (status !== null && !STATUSES.includes(status)) details.push({ field: 'status', message: 'must be a valid order status' });
    if (details.length) return apiError(request, 400, 'VALIDATION_ERROR', 'Invalid request parameters.', details);

    let list = [...db.allOrders()];
    if (status) list = list.filter((o) => o.status === status);
    list.sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id - a.id); // newest first

    return HttpResponse.json({
      content: list.slice(page * size, (page + 1) * size).map(toAdminSummary),
      page, size, totalElements: list.length, totalPages: Math.ceil(list.length / size),
    });
  }),

  // R2: any order, any customer
  http.get('*/api/v1/admin/orders/:id', async ({ request, params }) => {
    await delay(300);
    const auth = requireRole(request, 'ADMIN');
    if (auth.response) return auth.response;

    const order = db.findOrder(Number(params.id));
    if (!order) return notFound(request);
    return HttpResponse.json({ ...toOrder(order), userId: order.userId });
  }),

  // R3
  http.patch('*/api/v1/admin/orders/:id/status', async ({ request, params }) => {
    await delay(400);
    const auth = requireRole(request, 'ADMIN');
    if (auth.response) return auth.response;

    const body = await readJson(request);
    if (!body) return apiError(request, 400, 'VALIDATION_ERROR', 'Malformed JSON request.');
    if (!STATUSES.includes(body.status)) {
      return apiError(request, 400, 'VALIDATION_ERROR', 'Please correct the highlighted fields.',
        [{ field: 'status', message: 'must be a valid order status' }]);
    }

    const order = db.findOrder(Number(params.id));
    if (!order) return notFound(request);

    if (!(ALLOWED[order.status] ?? []).includes(body.status)) {
      return apiError(request, 409, 'INVALID_STATUS_TRANSITION',
        `An order that is ${order.status} cannot be moved to ${body.status}.`);
    }

    if (body.status === 'CANCELLED') {
      // I3: return the stock. If that call fails, nothing changes and the answer is 503.
      if (catalogControl.down) {
        return apiError(request, 503, 'SERVICE_UNAVAILABLE',
          'A dependent service is temporarily unavailable. Please try again.');
      }
      order.items.forEach((i) => db.setStock(i.productId, db.stock(i.productId) + i.quantity));
    }

    const updated = db.updateOrder(order.id, {
      status: body.status,
      // a COD order is paid when it is delivered
      paymentStatus: order.paymentMethod === 'COD' && body.status === 'DELIVERED' ? 'PAID' : order.paymentStatus,
      updatedAt: new Date().toISOString(),
    });
    return HttpResponse.json(toOrder(updated)); // Order, not AdminOrder: no userId
  }),
];