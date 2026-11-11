import httpClient from './httpClient';
// U1
export async function registerUser({ fullName, email, password, phone }) {
  const { data } = await httpClient.post('/api/v1/auth/register', {
    fullName,
    email,
    password,
    phone,
  });
  return data; // AuthResponse
}

// U2
export async function loginUser({ email, password }) {
  const { data } = await httpClient.post('/api/v1/auth/login', { email, password });
  return data; // AuthResponse
}
// U3
export async function getProfile(signal) {
  const { data } = await httpClient.get('/api/v1/users/me', { signal });
  return data; // UserProfile
}

// U4
export async function updateProfile({ fullName, phone }) {
  const { data } = await httpClient.put('/api/v1/users/me', { fullName, phone });
  return data; // UserProfile
}

// U5 (plain array, default address first)
export async function getAddresses(signal) {
  const { data } = await httpClient.get('/api/v1/users/me/addresses', { signal });
  return data; // Address[]
}

// U6
export async function createAddress(address) {
  const { data } = await httpClient.post('/api/v1/users/me/addresses', address);
  return data; // Address
}

// U7: full replacement body, same shape as U6
export async function updateAddress(id, address) {
  const { data } = await httpClient.put(`/api/v1/users/me/addresses/${id}`, address);
  return data; // Address
}

// U8: 204
export async function deleteAddress(id) {
  await httpClient.delete(`/api/v1/users/me/addresses/${id}`);
}