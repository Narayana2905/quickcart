// Looks like the real thing (header.payload.signature, same claims as contract 9.2),
// but the signature is fake. Only the mock server ever reads it.
const b64 = (obj) =>
  btoa(JSON.stringify(obj)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');

export function signToken(user) {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: String(user.id),
    email: user.email,
    role: user.role,
    iss: 'quickcart-user-service',
    iat: now,
    exp: now + 3600,
  };
  return `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64(payload)}.mock-signature`;
}

// Returns the payload, or null if missing/invalid/expired.
export function readToken(request) {
  const header = request.headers.get('Authorization') || '';
  if (!header.startsWith('Bearer ')) return null;
  try {
    const part = header.slice(7).split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(part));
    return payload.exp * 1000 > Date.now() ? payload : null;
  } catch {
    return null;
  }
}