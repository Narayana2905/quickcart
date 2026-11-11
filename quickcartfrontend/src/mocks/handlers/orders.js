import { http, HttpResponse, delay } from 'msw';
import { db } from '../db';
import { apiError } from '../errors';
import { readJson, requireRole } from '../request';
import { buildCart } from './cart';

const PAYMENT_METHODS = ['MOCK_PAYMENT', 'COD'];
const PHONE_RE = /^[6-9][0-9]{9}$/;
const PINCODE_RE = /^[1-9][0-9]{5}$/;

// Dev hook: simulates another shopper buying the last stock between our checks.
export const raceControl = { productId: null };

const str = (v) => (typeof v === 'string' ? v.trim() : '');
const inRange = (s, min, max) => s.length >= min && s.length <= max;
const userIdOf = (auth) => Number(auth.claims.sub);

function validatePlaceOrder(b) {
  const d = [];
  if (!PAYMENT_METHODS.includes(b.paymentMethod)) {
    d.push({ field: 'paymentMethod', message: 'must be MOCK_PAYMENT or COD' });
  }
  const a = b.deliveryAddress;
  if (!a || typeof a !== 'object') {
    d.push({ field: 'deliveryAddress', message: 'must not be null' });
    return d;
  }
  const p = 'deliveryAddress.';
  if (!inRange(str(a.recipientName), 2, 100)) d.push({ field: `${p}recipientName`, message: 'size must be between 2 and 100' });
  if (!PHONE_RE.test(str(a.phone))) d.push({ field: `${p}phone`, message: 'must be a valid 10-digit mobile number' });
  if (!inRange(str(a.line1), 3, 150)) d.push({ field: `${p}line1`, message: 'size must be between 3 and 150' });
  if (a.line2 != null && (typeof a.line2 !== 'string' || a.line2.trim().length > 150)) {
    d.push({ field: `${p}line2`, message: 'size must be at most 150' });
  }
  if (!inRange(str(a.city), 2, 60)) d.push({ field: `${p}city`, message: 'size must be between 2 and 60' });
  if (!inRange(str(a.state), 2, 60)) d.push({ field: `${p}state`, message: 'size must be between 2 and 60' });
  if (!PINCODE_RE.test(str(a.pincode))) d.push({ field: `${p}pincode`, message: 'must be a valid 6-digit pincode' });
  return d;
}

export const toOrder = (o) => ({
  id: o.id, orderNumber: o.orderNumber, status: o.status,
  paymentMethod: o.paymentMethod, paymentStatus: o.paymentStatus,
  subtotal: o.subtotal, deliveryFee: o.deliveryFee, total: o.total,
  deliveryAddress: { ...o.deliveryAddress },
  items: o.items.map((i) => ({ ...i })),
  createdAt: o.createdAt, updatedAt: o.updatedAt,
});

const toSummary = (o) => ({
  id: o.id, orderNumber: o.orderNumber, status: o.status, total: o.total,
  itemCount: o.items.reduce((sum, i) => sum + i.quantity, 0), createdAt: o.createdAt,
});

export function intParam(value, fallback) {
  if (value === null) return fallback;
  return /^-?\d+$/.test(value) ? Number(value) : NaN;
}

export const orderHandlers = [
  // O6
  http.post('*/api/v1/orders', async ({ request }) => {
    await delay(500);
    const auth = requireRole(request, 'CUSTOMER');
    if (auth.response) return auth.response;
    const userId = userIdOf(auth);

    const body = await readJson(request);
    if (!body) return apiError(request, 400, 'VALIDATION_ERROR', 'Malformed JSON request.');
    const details = validatePlaceOrder(body);
    if (details.length) {
      return apiError(request, 400, 'VALIDATION_ERROR', 'Please correct the highlighted fields.', details);
    }

    // Rule 1 and 2: empty cart, then unavailable lines (same enrichment as O1).
    const cart = buildCart(userId);
    if (cart.items.length === 0) {
      return apiError(request, 409, 'CART_EMPTY', 'Your cart is empty.');
    }
    const unavailable = cart.items.filter((l) => !l.available);
    if (unavailable.length > 0) {
      return apiError(request, 409, 'PRODUCT_UNAVAILABLE', 'Some items in your cart are no longer available.',
        unavailable.map((l) => ({ field: `productId:${l.productId}`, message: 'Currently unavailable' })));
    }

    if (raceControl.productId !== null) {
      db.setStock(raceControl.productId, 0); // someone else got there first
      raceControl.productId = null;
    }

    // Rule 3: reserve (I2): all or nothing, nothing changes on failure.
    const shortages = [...cart.items]
      .sort((a, b) => a.productId - b.productId)
      .filter((l) => db.stock(l.productId) < l.quantity)
      .map((l) => ({
        field: `productId:${l.productId}`,
        message: `Requested ${l.quantity}, available ${db.stock(l.productId)}`,
      }));
    if (shortages.length > 0) {
      return apiError(request, 409, 'INSUFFICIENT_STOCK',
        'Some items are not available in the requested quantity.', shortages);
    }
    cart.items.forEach((l) => db.setStock(l.productId, db.stock(l.productId) - l.quantity));

    // Rules 4 and 5: price snapshot from the server, payment status, PLACED, cart cleared.
    const a = body.deliveryAddress;
    const createdAt = new Date().toISOString();
    const { id, orderNumber } = db.reserveOrderIdentity(createdAt);
    const order = {
      id, orderNumber, userId,
      status: 'PLACED',
      paymentMethod: body.paymentMethod,
      paymentStatus: body.paymentMethod === 'MOCK_PAYMENT' ? 'PAID' : 'PENDING',
      subtotal: cart.subtotal, deliveryFee: cart.deliveryFee, total: cart.total,
      deliveryAddress: {
        recipientName: str(a.recipientName), phone: str(a.phone), line1: str(a.line1),
        line2: str(a.line2) || null, city: str(a.city), state: str(a.state), pincode: str(a.pincode),
      },
      items: cart.items.map((l) => ({
        productId: l.productId, productName: l.name, unitPrice: l.unitPrice,
        quantity: l.quantity, lineTotal: l.lineTotal,
      })),
      createdAt, updatedAt: createdAt,
    };
    db.addOrder(order);
    db.saveCartItems(userId, []);
    return HttpResponse.json(toOrder(order), { status: 201 });
  }),

  // O7
  http.get('*/api/v1/orders', async ({ request }) => {
    await delay(300);
    const auth = requireRole(request, 'CUSTOMER');
    if (auth.response) return auth.response;

    const sp = new URL(request.url).searchParams;
    const page = intParam(sp.get('page'), 0);
    const size = intParam(sp.get('size'), 20);
    const details = [];
    if (Number.isNaN(page) || page < 0) details.push({ field: 'page', message: 'must be 0 or greater' });
    if (Number.isNaN(size) || size < 1 || size > 50) details.push({ field: 'size', message: 'must be between 1 and 50' });
    if (details.length) return apiError(request, 400, 'VALIDATION_ERROR', 'Invalid request parameters.', details);

    const list = [...db.ordersOf(userIdOf(auth))].sort(
      (a, b) => b.createdAt.localeCompare(a.createdAt) || b.id - a.id // newest first
    );
    return HttpResponse.json({
      content: list.slice(page * size, (page + 1) * size).map(toSummary),
      page, size, totalElements: list.length, totalPages: Math.ceil(list.length / size),
    });
  }),

  // O8
  http.get('*/api/v1/orders/:id', async ({ request, params }) => {
    await delay(300);
    const auth = requireRole(request, 'CUSTOMER');
    if (auth.response) return auth.response;

    const order = db.findOrder(Number(params.id));
    // Someone else's order looks exactly like a missing one.
    if (!order || order.userId !== userIdOf(auth)) {
      return apiError(request, 404, 'NOT_FOUND', 'Order not found.');
    }
    return HttpResponse.json(toOrder(order));
  }),
];