import httpClient from './httpClient';

// O1
export async function getCart() {
  const { data } = await httpClient.get('/api/v1/cart');
  return data; // Cart
}

// O2: adds to the existing quantity
export async function addCartItem(productId, quantity) {
  const { data } = await httpClient.post('/api/v1/cart/items', { productId, quantity });
  return data; // Cart
}

// O3: absolute quantity, not a delta
export async function setCartItemQuantity(productId, quantity) {
  const { data } = await httpClient.put(`/api/v1/cart/items/${productId}`, { quantity });
  return data; // Cart
}

// O4
export async function removeCartItem(productId) {
  const { data } = await httpClient.delete(`/api/v1/cart/items/${productId}`);
  return data; // Cart
}

// O5: 204, no body
export async function clearCart() {
  await httpClient.delete('/api/v1/cart');
}