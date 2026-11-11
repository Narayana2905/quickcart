import httpClient from './httpClient';

// Drop empty values so we never send ?q=&categoryId=
function cleanParams(params) {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined)
  );
}

// C1
export async function getCategories(signal) {
  const { data } = await httpClient.get('/api/v1/categories', { signal });
  return data; // Category[]
}

// C2
export async function getProducts({ q, categoryId, page, size, sort } = {}, signal) {
  const { data } = await httpClient.get('/api/v1/products', {
    params: cleanParams({ q, categoryId, page, size, sort }),
    signal,
  });
  return data; // Page<Product>
}

// C3
export async function getProduct(id, signal) {
  const { data } = await httpClient.get(`/api/v1/products/${id}`, { signal });
  return data; // Product
}