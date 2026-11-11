import { http, HttpResponse, delay } from 'msw';
import { db } from '../db';
import { apiError } from '../errors';
import { readJson, requireRole } from '../request';
import { intParam } from './orders';

const SEED_TIME = '2026-11-01T00:00:00.000Z'; // seed rows carry no timestamps

const str = (v) => (typeof v === 'string' ? v.trim() : '');
const len = (s, min, max) => s.length >= min && s.length <= max;
const optionalText = (v, max) => v == null || (typeof v === 'string' && v.trim().length <= max);
const isInt = (v, min, max) => Number.isInteger(v) && v >= min && v <= max;
const validPrice = (v) =>
  typeof v === 'number' && Number.isFinite(v) && v > 0 && v <= 99999.99 && Math.round(v * 100) / 100 === v;

const findCategory = (id) => db.categories().find((c) => c.id === id);
const findProduct = (id) => db.products().find((p) => p.id === id);
const nameTaken = (name, exceptId) =>
  db.categories().some((c) => c.id !== exceptId && c.name.toLowerCase() === name.toLowerCase());

const toCategory = ({ id, name, description, imageUrl, active }) => ({ id, name, description, imageUrl, active });

// Exactly the AdminProduct DTO: Product + active, createdAt, updatedAt.
function toAdminProduct(p) {
  const qty = db.stock(p.id);
  return {
    id: p.id, categoryId: p.categoryId, categoryName: findCategory(p.categoryId).name,
    name: p.name, description: p.description, price: p.price, unit: p.unit, imageUrl: p.imageUrl,
    availableQuantity: qty, inStock: qty > 0,
    active: p.active, createdAt: p.createdAt ?? SEED_TIME, updatedAt: p.updatedAt ?? p.createdAt ?? SEED_TIME,
  };
}

const toInventoryItem = (p) => ({
  productId: p.id, productName: p.name, unit: p.unit, quantity: db.stock(p.id),
  updatedAt: db.inventoryUpdatedAt(p.id) ?? p.updatedAt ?? SEED_TIME,
});

const badBody = (request, details = []) =>
  apiError(request, 400, 'VALIDATION_ERROR',
    details.length ? 'Please correct the highlighted fields.' : 'Malformed JSON request.', details);

function validateCategory(b) {
  const d = [];
  if (!len(str(b.name), 2, 80)) d.push({ field: 'name', message: 'size must be between 2 and 80' });
  if (!optionalText(b.description, 255)) d.push({ field: 'description', message: 'size must be at most 255' });
  if (!optionalText(b.imageUrl, 500)) d.push({ field: 'imageUrl', message: 'size must be at most 500' });
  return d;
}
const categoryFields = (b) => ({
  name: str(b.name), description: str(b.description) || null, imageUrl: str(b.imageUrl) || null,
});

function validateProductDetails(b, creating) {
  const d = [];
  if (!isInt(b.categoryId, 1, Number.MAX_SAFE_INTEGER)) d.push({ field: 'categoryId', message: 'must be a positive number' });
  if (!len(str(b.name), 2, 150)) d.push({ field: 'name', message: 'size must be between 2 and 150' });
  if (!optionalText(b.description, 1000)) d.push({ field: 'description', message: 'size must be at most 1000' });
  if (!len(str(b.unit), 1, 30)) d.push({ field: 'unit', message: 'size must be between 1 and 30' });
  if (!optionalText(b.imageUrl, 500)) d.push({ field: 'imageUrl', message: 'size must be at most 500' });
  if (creating) {
    if (!validPrice(b.price)) d.push({ field: 'price', message: 'must be above 0, at most 99999.99, with up to 2 decimals' });
    if (b.initialQuantity != null && !isInt(b.initialQuantity, 0, 100000)) {
      d.push({ field: 'initialQuantity', message: 'must be between 0 and 100000' });
    }
  }
  return d;
}
const productFields = (b) => ({
  categoryId: b.categoryId, name: str(b.name), description: str(b.description) || null,
  unit: str(b.unit), imageUrl: str(b.imageUrl) || null,
});

function pageOf(list, page, size) {
  return {
    content: list.slice(page * size, (page + 1) * size),
    page, size, totalElements: list.length, totalPages: Math.ceil(list.length / size),
  };
}

// Shared by every handler: admin only, else 401/403.
const admin = (request) => requireRole(request, 'ADMIN');
const byName = (a, b) => a.name.localeCompare(b.name);

export const adminCatalogHandlers = [
  // A1
  http.get('*/api/v1/admin/categories', async ({ request }) => {
    await delay(300);
    const auth = admin(request);
    if (auth.response) return auth.response;
    return HttpResponse.json([...db.categories()].sort(byName).map(toCategory));
  }),

  // A2
  http.post('*/api/v1/admin/categories', async ({ request }) => {
    await delay(300);
    const auth = admin(request);
    if (auth.response) return auth.response;
    const body = await readJson(request);
    if (!body) return badBody(request);
    const details = validateCategory(body);
    if (details.length) return badBody(request, details);
    const fields = categoryFields(body);
    if (nameTaken(fields.name)) {
      return apiError(request, 409, 'CATEGORY_ALREADY_EXISTS', 'A category with this name already exists.');
    }
    return HttpResponse.json(toCategory(db.addCategory(fields)), { status: 201 });
  }),

  // A3
  http.put('*/api/v1/admin/categories/:id', async ({ request, params }) => {
    await delay(300);
    const auth = admin(request);
    if (auth.response) return auth.response;
    const body = await readJson(request);
    if (!body) return badBody(request);
    const details = validateCategory(body);
    if (details.length) return badBody(request, details);
    const id = Number(params.id);
    if (!findCategory(id)) return apiError(request, 404, 'NOT_FOUND', 'Category not found.');
    const fields = categoryFields(body);
    if (nameTaken(fields.name, id)) {
      return apiError(request, 409, 'CATEGORY_ALREADY_EXISTS', 'A category with this name already exists.');
    }
    return HttpResponse.json(toCategory(db.updateCategory(id, fields)));
  }),

  // A4
  http.patch('*/api/v1/admin/categories/:id/status', async ({ request, params }) => {
    await delay(300);
    const auth = admin(request);
    if (auth.response) return auth.response;
    const body = await readJson(request);
    if (!body) return badBody(request);
    if (typeof body.active !== 'boolean') return badBody(request, [{ field: 'active', message: 'must be true or false' }]);
    const id = Number(params.id);
    if (!findCategory(id)) return apiError(request, 404, 'NOT_FOUND', 'Category not found.');
    return HttpResponse.json(toCategory(db.updateCategory(id, { active: body.active })));
  }),

  // A5
  http.get('*/api/v1/admin/products', async ({ request }) => {
    await delay(300);
    const auth = admin(request);
    if (auth.response) return auth.response;

    const sp = new URL(request.url).searchParams;
    const page = intParam(sp.get('page'), 0);
    const size = intParam(sp.get('size'), 20);
    const categoryId = intParam(sp.get('categoryId'), null);
    const active = sp.get('active');
    const details = [];
    if (Number.isNaN(page) || page < 0) details.push({ field: 'page', message: 'must be 0 or greater' });
    if (Number.isNaN(size) || size < 1 || size > 50) details.push({ field: 'size', message: 'must be between 1 and 50' });
    if (Number.isNaN(categoryId)) details.push({ field: 'categoryId', message: 'must be a number' });
    if (active !== null && active !== 'true' && active !== 'false') details.push({ field: 'active', message: 'must be true or false' });
    if (details.length) return apiError(request, 400, 'VALIDATION_ERROR', 'Invalid request parameters.', details);

    const q = (sp.get('q') ?? '').trim().toLowerCase();
    let list = [...db.products()];
    if (q) list = list.filter((p) => p.name.toLowerCase().includes(q));
    if (categoryId !== null) list = list.filter((p) => p.categoryId === categoryId);
    if (active !== null) list = list.filter((p) => p.active === (active === 'true'));
    list.sort(byName);

    const result = pageOf(list, page, size);
    return HttpResponse.json({ ...result, content: result.content.map(toAdminProduct) });
  }),

  // A6
  http.get('*/api/v1/admin/products/:id', async ({ request, params }) => {
    await delay(300);
    const auth = admin(request);
    if (auth.response) return auth.response;
    const product = findProduct(Number(params.id));
    if (!product) return apiError(request, 404, 'NOT_FOUND', 'Product not found.');
    return HttpResponse.json(toAdminProduct(product));
  }),

  // A7
  http.post('*/api/v1/admin/products', async ({ request }) => {
    await delay(400);
    const auth = admin(request);
    if (auth.response) return auth.response;
    const body = await readJson(request);
    if (!body) return badBody(request);
    const details = validateProductDetails(body, true);
    if (details.length) return badBody(request, details);
    if (!findCategory(body.categoryId)) return apiError(request, 404, 'NOT_FOUND', 'Category not found.');

    const product = db.addProduct({ ...productFields(body), price: body.price }, body.initialQuantity ?? 0);
    return HttpResponse.json(toAdminProduct(product), { status: 201 });
  }),

  // A8: details only. A price or a quantity in the body is ignored, as the contract says.
  http.put('*/api/v1/admin/products/:id', async ({ request, params }) => {
    await delay(300);
    const auth = admin(request);
    if (auth.response) return auth.response;
    const body = await readJson(request);
    if (!body) return badBody(request);
    const details = validateProductDetails(body, false);
    if (details.length) return badBody(request, details);
    const id = Number(params.id);
    if (!findProduct(id)) return apiError(request, 404, 'NOT_FOUND', 'Product not found.');
    if (!findCategory(body.categoryId)) return apiError(request, 404, 'NOT_FOUND', 'Category not found.');
    return HttpResponse.json(toAdminProduct(db.updateProduct(id, productFields(body))));
  }),

  // A9
  http.patch('*/api/v1/admin/products/:id/price', async ({ request, params }) => {
    await delay(300);
    const auth = admin(request);
    if (auth.response) return auth.response;
    const body = await readJson(request);
    if (!body) return badBody(request);
    if (!validPrice(body.price)) {
      return badBody(request, [{ field: 'price', message: 'must be above 0, at most 99999.99, with up to 2 decimals' }]);
    }
    const id = Number(params.id);
    if (!findProduct(id)) return apiError(request, 404, 'NOT_FOUND', 'Product not found.');
    return HttpResponse.json(toAdminProduct(db.updateProduct(id, { price: body.price })));
  }),

  // A10
  http.patch('*/api/v1/admin/products/:id/status', async ({ request, params }) => {
    await delay(300);
    const auth = admin(request);
    if (auth.response) return auth.response;
    const body = await readJson(request);
    if (!body) return badBody(request);
    if (typeof body.active !== 'boolean') return badBody(request, [{ field: 'active', message: 'must be true or false' }]);
    const id = Number(params.id);
    if (!findProduct(id)) return apiError(request, 404, 'NOT_FOUND', 'Product not found.');
    return HttpResponse.json(toAdminProduct(db.updateProduct(id, { active: body.active })));
  }),

  // A11
  http.get('*/api/v1/admin/inventory', async ({ request }) => {
    await delay(300);
    const auth = admin(request);
    if (auth.response) return auth.response;

    const sp = new URL(request.url).searchParams;
    const page = intParam(sp.get('page'), 0);
    const size = intParam(sp.get('size'), 20);
    const details = [];
    if (Number.isNaN(page) || page < 0) details.push({ field: 'page', message: 'must be 0 or greater' });
    if (Number.isNaN(size) || size < 1 || size > 50) details.push({ field: 'size', message: 'must be between 1 and 50' });
    if (details.length) return apiError(request, 400, 'VALIDATION_ERROR', 'Invalid request parameters.', details);

    const q = (sp.get('q') ?? '').trim().toLowerCase();
    let list = [...db.products()];
    if (q) list = list.filter((p) => p.name.toLowerCase().includes(q));
    list.sort(byName);

    const result = pageOf(list, page, size);
    return HttpResponse.json({ ...result, content: result.content.map(toInventoryItem) });
  }),

  // A12: absolute quantity
  http.put('*/api/v1/admin/inventory/:productId', async ({ request, params }) => {
    await delay(300);
    const auth = admin(request);
    if (auth.response) return auth.response;
    const body = await readJson(request);
    if (!body) return badBody(request);
    if (!isInt(body.quantity, 0, 100000)) {
      return badBody(request, [{ field: 'quantity', message: 'must be a whole number between 0 and 100000' }]);
    }
    const product = findProduct(Number(params.productId));
    if (!product) return apiError(request, 404, 'NOT_FOUND', 'Product not found.');
    db.setStock(product.id, body.quantity);
    return HttpResponse.json(toInventoryItem(product));
  }),
];