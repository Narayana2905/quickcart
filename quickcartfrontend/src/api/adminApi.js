import httpClient from './httpClient';

// R1
export async function getAdminOrders({ status, page = 0, size = 10 } = {}, signal) {
  const params = { page, size };
  if (status) params.status = status; // never send ?status=
  const { data } = await httpClient.get('/api/v1/admin/orders', { params, signal });
  return data; // Page<AdminOrderSummary>, newest first
}

// R2
export async function getAdminOrder(id, signal) {
  const { data } = await httpClient.get(`/api/v1/admin/orders/${id}`, { signal });
  return data; // AdminOrder (Order + userId)
}

// R3
export async function updateOrderStatus(id, status) {
  const { data } = await httpClient.patch(`/api/v1/admin/orders/${id}/status`, { status });
  return data; // Order (no userId)
}
const clean = (params) =>
  Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined)
  );

// ---- categories ----
// A1 (plain array, includes inactive)
export async function getAdminCategories(signal) {
  const { data } = await httpClient.get('/api/v1/admin/categories', { signal });
  return data;
}
// A2
export async function createCategory({ name, description, imageUrl }) {
  const { data } = await httpClient.post('/api/v1/admin/categories', { name, description, imageUrl });
  return data;
}
// A3
export async function updateCategory(id, { name, description, imageUrl }) {
  const { data } = await httpClient.put(`/api/v1/admin/categories/${id}`, { name, description, imageUrl });
  return data;
}
// A4
export async function setCategoryActive(id, active) {
  const { data } = await httpClient.patch(`/api/v1/admin/categories/${id}/status`, { active });
  return data;
}

// ---- products ----
// A5
export async function getAdminProducts({ q, categoryId, active, page = 0, size = 10 } = {}, signal) {
  const { data } = await httpClient.get('/api/v1/admin/products', {
    params: clean({ q, categoryId, active, page, size }),
    signal,
  });
  return data; // Page<AdminProduct>
}
// A6
export async function getAdminProduct(id, signal) {
  const { data } = await httpClient.get(`/api/v1/admin/products/${id}`, { signal });
  return data;
}
// A7
export async function createProduct(body) {
  const { data } = await httpClient.post('/api/v1/admin/products', body);
  return data;
}
// A8: details only. NO price, NO stock.
export async function updateProduct(id, { categoryId, name, description, unit, imageUrl }) {
  const { data } = await httpClient.put(`/api/v1/admin/products/${id}`, {
    categoryId, name, description, unit, imageUrl,
  });
  return data;
}
// A9
export async function updateProductPrice(id, price) {
  const { data } = await httpClient.patch(`/api/v1/admin/products/${id}/price`, { price });
  return data;
}
// A10
export async function setProductActive(id, active) {
  const { data } = await httpClient.patch(`/api/v1/admin/products/${id}/status`, { active });
  return data;
}

// ---- inventory ----
// A11
export async function getInventory({ q, page = 0, size = 10 } = {}, signal) {
  const { data } = await httpClient.get('/api/v1/admin/inventory', {
    params: clean({ q, page, size }),
    signal,
  });
  return data; // Page<InventoryItem>
}
// A12: an absolute quantity, not a delta
export async function setInventoryQuantity(productId, quantity) {
  const { data } = await httpClient.put(`/api/v1/admin/inventory/${productId}`, { quantity });
  return data; // InventoryItem
}