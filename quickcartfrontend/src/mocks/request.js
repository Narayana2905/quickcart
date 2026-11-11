import { apiError } from './errors';
import { readToken } from './token';

export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

// Plays the part of gateway + service checks. Returns { claims } or { response }.
// export function requireRole(request, role) {
//   const claims = readToken(request);
//   if (!claims) {
//     return { response: apiError(request, 401, 'UNAUTHORIZED', 'Authentication is required or your session has expired.') };
//   }
//   if (claims.role !== role) {
//     return { response: apiError(request, 403, 'FORBIDDEN', 'You are not allowed to perform this action.') };
//   }
//   return { claims };
// }
export function requireRole(request, role) {
  const claims = readToken(request);
  if (!claims) {
    return { response: apiError(request, 401, 'UNAUTHORIZED', 'Authentication is required or your session has expired.') };
  }
  if (role && claims.role !== role) { // no role given = any authenticated user
    return { response: apiError(request, 403, 'FORBIDDEN', 'You are not allowed to perform this action.') };
  }
  return { claims };
}