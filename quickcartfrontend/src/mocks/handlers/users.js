import { http, HttpResponse, delay } from 'msw';
import { db } from '../db';
import { apiError } from '../errors';
import { readJson, requireRole } from '../request';

const PHONE_RE = /^[6-9][0-9]{9}$/;
const PINCODE_RE = /^[1-9][0-9]{5}$/;
const MAX_ADDRESSES = 5;

const str = (v) => (typeof v === 'string' ? v.trim() : '');
const inRange = (s, min, max) => s.length >= min && s.length <= max;
const userIdOf = (auth) => Number(auth.claims.sub);

const toProfile = (u) => ({
  id: u.id, fullName: u.fullName, email: u.email, phone: u.phone, role: u.role, createdAt: u.createdAt,
});

// Exactly the Address DTO (no userId leaks out).
const toAddress = (a) => ({
  id: a.id, label: a.label, recipientName: a.recipientName, phone: a.phone, line1: a.line1,
  line2: a.line2, city: a.city, state: a.state, pincode: a.pincode, isDefault: a.isDefault,
});

function validateAddress(b) {
  const d = [];
  if (!inRange(str(b.label), 1, 30)) d.push({ field: 'label', message: 'size must be between 1 and 30' });
  if (!inRange(str(b.recipientName), 2, 100)) d.push({ field: 'recipientName', message: 'size must be between 2 and 100' });
  if (!PHONE_RE.test(str(b.phone))) d.push({ field: 'phone', message: 'must be a valid 10-digit mobile number' });
  if (!inRange(str(b.line1), 3, 150)) d.push({ field: 'line1', message: 'size must be between 3 and 150' });
  if (b.line2 != null && (typeof b.line2 !== 'string' || b.line2.trim().length > 150)) {
    d.push({ field: 'line2', message: 'size must be at most 150' });
  }
  if (!inRange(str(b.city), 2, 60)) d.push({ field: 'city', message: 'size must be between 2 and 60' });
  if (!inRange(str(b.state), 2, 60)) d.push({ field: 'state', message: 'size must be between 2 and 60' });
  if (!PINCODE_RE.test(str(b.pincode))) d.push({ field: 'pincode', message: 'must be a valid 6-digit pincode' });
  if (b.isDefault != null && typeof b.isDefault !== 'boolean') d.push({ field: 'isDefault', message: 'must be true or false' });
  return d;
}

const fieldsFrom = (b) => ({
  label: str(b.label), recipientName: str(b.recipientName), phone: str(b.phone),
  line1: str(b.line1), line2: str(b.line2) || null, city: str(b.city),
  state: str(b.state), pincode: str(b.pincode),
});

const notFound = (request) => apiError(request, 404, 'NOT_FOUND', 'Address not found.');
const badBody = (request, details = []) =>
  apiError(request, 400, 'VALIDATION_ERROR', details.length ? 'Please correct the highlighted fields.' : 'Malformed JSON request.', details);

export const userHandlers = [
  // U3 (any role)
  http.get('*/api/v1/users/me', async ({ request }) => {
    await delay(300);
    const auth = requireRole(request);
    if (auth.response) return auth.response;
    const user = db.findUserById(userIdOf(auth));
    if (!user) return apiError(request, 401, 'UNAUTHORIZED', 'Authentication is required.');
    return HttpResponse.json(toProfile(user));
  }),

  // U4 (any role): name and phone only
  http.put('*/api/v1/users/me', async ({ request }) => {
    await delay(300);
    const auth = requireRole(request);
    if (auth.response) return auth.response;

    const body = await readJson(request);
    if (!body) return badBody(request);
    const details = [];
    if (!inRange(str(body.fullName), 2, 100)) details.push({ field: 'fullName', message: 'size must be between 2 and 100' });
    if (!PHONE_RE.test(str(body.phone))) details.push({ field: 'phone', message: 'must be a valid 10-digit mobile number' });
    if (details.length) return badBody(request, details);

    const user = db.updateUser(userIdOf(auth), { fullName: str(body.fullName), phone: str(body.phone) });
    if (!user) return apiError(request, 401, 'UNAUTHORIZED', 'Authentication is required.');
    return HttpResponse.json(toProfile(user));
  }),

  // U5: default first, then oldest first
  http.get('*/api/v1/users/me/addresses', async ({ request }) => {
    await delay(300);
    const auth = requireRole(request, 'CUSTOMER');
    if (auth.response) return auth.response;
    const list = [...db.addressesOf(userIdOf(auth))].sort(
      (a, b) => Number(b.isDefault) - Number(a.isDefault) || a.id - b.id
    );
    return HttpResponse.json(list.map(toAddress));
  }),

  // U6
  http.post('*/api/v1/users/me/addresses', async ({ request }) => {
    await delay(300);
    const auth = requireRole(request, 'CUSTOMER');
    if (auth.response) return auth.response;
    const userId = userIdOf(auth);

    const body = await readJson(request);
    if (!body) return badBody(request);
    const details = validateAddress(body);
    if (details.length) return badBody(request, details);

    const list = db.addressesOf(userId);
    if (list.length >= MAX_ADDRESSES) {
      return apiError(request, 409, 'ADDRESS_LIMIT_REACHED', `You can save up to ${MAX_ADDRESSES} addresses.`);
    }

    const makeDefault = list.length === 0 || body.isDefault === true; // first one is always default
    const address = { id: db.nextAddressId(), userId, ...fieldsFrom(body), isDefault: makeDefault };
    db.saveAddresses(userId, [...list.map((a) => (makeDefault ? { ...a, isDefault: false } : a)), address]);
    return HttpResponse.json(toAddress(address), { status: 201 });
  }),

  // U7
  http.put('*/api/v1/users/me/addresses/:id', async ({ request, params }) => {
    await delay(300);
    const auth = requireRole(request, 'CUSTOMER');
    if (auth.response) return auth.response;
    const userId = userIdOf(auth);

    const body = await readJson(request);
    if (!body) return badBody(request);
    const details = validateAddress(body);
    if (details.length) return badBody(request, details);

    const id = Number(params.id);
    const list = db.addressesOf(userId);
    if (!list.some((a) => a.id === id)) return notFound(request); // also hides other users' addresses

    const makeDefault = body.isDefault === true;
    let updated;
    const next = list.map((a) => {
      if (a.id === id) {
        // isDefault:false on the current default is ignored (Handoff rule)
        updated = { ...a, ...fieldsFrom(body), isDefault: a.isDefault || makeDefault };
        return updated;
      }
      return makeDefault ? { ...a, isDefault: false } : a;
    });
    db.saveAddresses(userId, next);
    return HttpResponse.json(toAddress(updated));
  }),

  // U8
  http.delete('*/api/v1/users/me/addresses/:id', async ({ request, params }) => {
    await delay(300);
    const auth = requireRole(request, 'CUSTOMER');
    if (auth.response) return auth.response;
    const userId = userIdOf(auth);

    const id = Number(params.id);
    const list = db.addressesOf(userId);
    const target = list.find((a) => a.id === id);
    if (!target) return notFound(request);

    let remaining = list.filter((a) => a.id !== id);
    if (target.isDefault && remaining.length > 0) {
      // deleting the default makes the oldest remaining address the default
      const oldest = remaining.reduce((min, a) => (a.id < min.id ? a : min));
      remaining = remaining.map((a) => (a.id === oldest.id ? { ...a, isDefault: true } : a));
    }
    db.saveAddresses(userId, remaining);
    return new HttpResponse(null, { status: 204 });
  }),
];