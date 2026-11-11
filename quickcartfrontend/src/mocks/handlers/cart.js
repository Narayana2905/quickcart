import { http, HttpResponse, delay } from 'msw';
import { db } from '../db';
import { apiError } from '../errors';
import { readJson, requireRole } from '../request';

const DELIVERY_FEE = 25;
const FREE_DELIVERY_THRESHOLD = 200;
const MAX_LINE_QTY = 20;

const round2 = (n) => Math.round(n * 100) / 100;
const findProduct = (id) => db.products().find((p) => p.id === id);
const isVisible = (p) => p.active && Boolean(db.categories().find((c) => c.id === p.categoryId)?.active);
const isIntInRange = (v, min, max) => Number.isInteger(v) && v >= min && v <= max;

// One enriched line (contract O1 rules).
function toLine(item) {
  const p = findProduct(item.productId);
  const stock = p ? db.stock(p.id) : 0;
  const available = Boolean(p) && isVisible(p) && stock >= item.quantity;
  return {
    productId: item.productId,
    name: p ? p.name : 'Unavailable item',
    unit: p ? p.unit : null,
    imageUrl: p ? p.imageUrl : null,
    unitPrice: available ? p.price : 0,
    quantity: item.quantity,
    lineTotal: available ? round2(p.price * item.quantity) : 0,
    availableQuantity: stock,
    available,
  };
}

export function buildCart(userId) {
  const items = db.cartItems(userId).map(toLine);
  const purchasable = items.filter((l) => l.available);
  const subtotal = round2(purchasable.reduce((sum, l) => sum + l.lineTotal, 0));
  const itemCount = purchasable.reduce((sum, l) => sum + l.quantity, 0);
  // Empty cart => 0.00. Otherwise 25.00 below 200.00, free from 200.00.
  // OPEN QUESTION (Backend): cart with ONLY unavailable lines. Read literally => 25.00.
  const deliveryFee = items.length === 0 ? 0 : subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  return {
    items,
    itemCount,
    subtotal,
    deliveryFee,
    total: round2(subtotal + deliveryFee),
    hasUnavailableItems: items.some((l) => !l.available),
  };
}

const stockError = (request, productId, requested, available) =>
  apiError(request, 409, 'INSUFFICIENT_STOCK', 'Some items are not available in the requested quantity.', [
    { field: `productId:${productId}`, message: `Requested ${requested}, available ${available}` },
  ]);

export const cartHandlers = [
  // O1
  http.get('*/api/v1/cart', async ({ request }) => {
    await delay(300);
    const auth = requireRole(request, 'CUSTOMER');
    if (auth.response) return auth.response;
    return HttpResponse.json(buildCart(Number(auth.claims.sub)));
  }),

  // O2
  http.post('*/api/v1/cart/items', async ({ request }) => {
    await delay(300);
    const auth = requireRole(request, 'CUSTOMER');
    if (auth.response) return auth.response;
    const userId = Number(auth.claims.sub);

    const body = await readJson(request);
    if (!body) return apiError(request, 400, 'VALIDATION_ERROR', 'Malformed JSON request.');

    const details = [];
    if (!isIntInRange(body.productId, 1, Number.MAX_SAFE_INTEGER)) details.push({ field: 'productId', message: 'must be a positive number' });
    if (!isIntInRange(body.quantity, 1, MAX_LINE_QTY)) details.push({ field: 'quantity', message: `must be between 1 and ${MAX_LINE_QTY}` });
    if (details.length) return apiError(request, 400, 'VALIDATION_ERROR', 'Please correct the highlighted fields.', details);

    const product = findProduct(body.productId);
    if (!product || !isVisible(product)) {
      return apiError(request, 404, 'PRODUCT_NOT_FOUND', 'Product not found.');
    }

    const items = db.cartItems(userId);
    const existing = items.find((i) => i.productId === product.id);
    const resulting = (existing?.quantity ?? 0) + body.quantity;

    if (resulting > MAX_LINE_QTY) {
      return apiError(request, 400, 'VALIDATION_ERROR', `You can add at most ${MAX_LINE_QTY} of one item.`, [
        { field: 'quantity', message: `resulting quantity ${resulting} exceeds ${MAX_LINE_QTY}` },
      ]);
    }
    const stock = db.stock(product.id);
    if (resulting > stock) return stockError(request, product.id, resulting, stock);

    db.saveCartItems(
      userId,
      existing
        ? items.map((i) => (i.productId === product.id ? { ...i, quantity: resulting } : i))
        : [...items, { productId: product.id, quantity: resulting }]
    );
    return HttpResponse.json(buildCart(userId));
  }),

  // O3
  http.put('*/api/v1/cart/items/:productId', async ({ request, params }) => {
    await delay(300);
    const auth = requireRole(request, 'CUSTOMER');
    if (auth.response) return auth.response;
    const userId = Number(auth.claims.sub);

    const body = await readJson(request);
    if (!body) return apiError(request, 400, 'VALIDATION_ERROR', 'Malformed JSON request.');
    if (!isIntInRange(body.quantity, 1, MAX_LINE_QTY)) {
      return apiError(request, 400, 'VALIDATION_ERROR', 'Please correct the highlighted fields.', [
        { field: 'quantity', message: `must be between 1 and ${MAX_LINE_QTY}` },
      ]);
    }

    const productId = Number(params.productId);
    const items = db.cartItems(userId);
    if (!items.some((i) => i.productId === productId)) {
      return apiError(request, 404, 'CART_ITEM_NOT_FOUND', 'That item is not in your cart.');
    }
    const product = findProduct(productId);
    if (!product || !isVisible(product)) {
      return apiError(request, 404, 'PRODUCT_NOT_FOUND', 'Product not found.');
    }
    const stock = db.stock(productId);
    if (body.quantity > stock) return stockError(request, productId, body.quantity, stock);

    db.saveCartItems(userId, items.map((i) => (i.productId === productId ? { ...i, quantity: body.quantity } : i)));
    return HttpResponse.json(buildCart(userId));
  }),

  // O4
  http.delete('*/api/v1/cart/items/:productId', async ({ request, params }) => {
    await delay(300);
    const auth = requireRole(request, 'CUSTOMER');
    if (auth.response) return auth.response;
    const userId = Number(auth.claims.sub);

    const productId = Number(params.productId);
    const items = db.cartItems(userId);
    if (!items.some((i) => i.productId === productId)) {
      return apiError(request, 404, 'CART_ITEM_NOT_FOUND', 'That item is not in your cart.');
    }
    db.saveCartItems(userId, items.filter((i) => i.productId !== productId));
    return HttpResponse.json(buildCart(userId));
  }),

  // O5
  http.delete('*/api/v1/cart', async ({ request }) => {
    await delay(300);
    const auth = requireRole(request, 'CUSTOMER');
    if (auth.response) return auth.response;
    db.saveCartItems(Number(auth.claims.sub), []);
    return new HttpResponse(null, { status: 204 });
  }),
];