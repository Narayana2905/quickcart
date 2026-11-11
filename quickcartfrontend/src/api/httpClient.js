import axios from 'axios';

export const TOKEN_KEY = 'quickcart.token';
export const USER_KEY = 'quickcart.user';

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '',
  timeout: 15000, // suggestion: a catalog outage can take 2-7 s to surface as 503
  headers: { 'Content-Type': 'application/json' },
});

httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const AUTH_PATHS = ['/api/v1/auth/login', '/api/v1/auth/register'];
let redirecting = false; // Mandate 6: several parallel 401s must redirect once

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    const isAuthCall = AUTH_PATHS.some((p) => url.includes(p));

    if (status === 401 && !isAuthCall && !redirecting) {
      redirecting = true;
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      window.location.assign('/login?expired=1');
    }
    return Promise.reject(error);
  }
);

export default httpClient;