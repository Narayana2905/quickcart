import { http, HttpResponse, delay } from 'msw';
import { db } from '../db';
import { apiError } from '../errors';

const SORTS = ['name', 'price_asc', 'price_desc'];

const categoryOf = (id) => db.categories().find((c) => c.id === id);

// Customer visibility rule (contract C2/C3): product AND its category must be active.
function isVisible(p) {
  const c = categoryOf(p.categoryId);
  return p.active && Boolean(c?.active);
}

// Exactly the Product DTO from Handoff section 5. No extra fields.
function toProduct(p) {
  const qty = db.stock(p.id);
  return {
    id: p.id,
    categoryId: p.categoryId,
    categoryName: categoryOf(p.categoryId).name,
    name: p.name,
    description: p.description,
    price: p.price,
    unit: p.unit,
    imageUrl: p.imageUrl,
    availableQuantity: qty,
    inStock: qty > 0,
  };
}

// null when absent, NaN when present but not an integer
function intParam(value, fallback) {
  if (value === null) return fallback;
  return /^-?\d+$/.test(value) ? Number(value) : NaN;
}

export const catalogHandlers = [
  // C1
  http.get('*/api/v1/categories', async () => {
    await delay(300);
    const list = db
      .categories()
      .filter((c) => c.active)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(({ id, name, description, imageUrl, active }) => ({ id, name, description, imageUrl, active }));
    return HttpResponse.json(list);
  }),

  // C2
  http.get('*/api/v1/products', async ({ request }) => {
    await delay(300);
    const sp = new URL(request.url).searchParams;

    const page = intParam(sp.get('page'), 0);
    const size = intParam(sp.get('size'), 20);
    const sort = sp.get('sort') ?? 'name';
    const categoryId = intParam(sp.get('categoryId'), null);

    const details = [];
    if (Number.isNaN(page) || page < 0) details.push({ field: 'page', message: 'must be 0 or greater' });
    if (Number.isNaN(size) || size < 1 || size > 50) details.push({ field: 'size', message: 'must be between 1 and 50' });
    if (!SORTS.includes(sort)) details.push({ field: 'sort', message: 'must be one of name, price_asc, price_desc' });
    if (Number.isNaN(categoryId)) details.push({ field: 'categoryId', message: 'must be a number' });
    if (details.length) {
      return apiError(request, 400, 'VALIDATION_ERROR', 'Invalid request parameters.', details);
    }

    const q = (sp.get('q') ?? '').trim().toLowerCase();
    let list = db.products().filter(isVisible);
    if (categoryId !== null) list = list.filter((p) => p.categoryId === categoryId);
    if (q) list = list.filter((p) => p.name.toLowerCase().includes(q));

    const byName = (a, b) => a.name.localeCompare(b.name);
    if (sort === 'price_asc') list.sort((a, b) => a.price - b.price || byName(a, b));
    else if (sort === 'price_desc') list.sort((a, b) => b.price - a.price || byName(a, b));
    else list.sort(byName);

    return HttpResponse.json({
      content: list.slice(page * size, (page + 1) * size).map(toProduct),
      page,
      size,
      totalElements: list.length,
      totalPages: Math.ceil(list.length / size),
    });
  }),

  // C3
  http.get('*/api/v1/products/:id', async ({ request, params }) => {
    await delay(300);
    const id = Number(params.id);
    const product = Number.isInteger(id) ? db.products().find((p) => p.id === id) : undefined;
    if (!product || !isVisible(product)) {
      return apiError(request, 404, 'NOT_FOUND', 'Product not found.');
    }
    return HttpResponse.json(toProduct(product));
  }),
];