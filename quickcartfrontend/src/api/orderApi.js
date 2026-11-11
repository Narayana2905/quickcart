import httpClient from './httpClient';

// O6
export async function placeOrder({ paymentMethod, deliveryAddress }) {
  const { data } = await httpClient.post('/api/v1/orders', { paymentMethod, deliveryAddress });
  return data; // Order (201). Send NO prices: the server owns them.
}

// O7
export async function getOrders({ page = 0, size = 10 } = {}, signal) {
  const { data } = await httpClient.get('/api/v1/orders', { params: { page, size }, signal });
  return data; // Page<OrderSummary>, newest first
}

// O8
export async function getOrder(id, signal) {
  const { data } = await httpClient.get(`/api/v1/orders/${id}`, { signal });
  return data; // Order
}