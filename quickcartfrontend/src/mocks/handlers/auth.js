import { http, HttpResponse, delay } from 'msw';
import { db } from '../db';
import { apiError } from '../errors';
import { signToken } from '../token';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[6-9][0-9]{9}$/;

function authResponse(user) {
  return {
    accessToken: signToken(user),
    tokenType: 'Bearer',
    expiresIn: 3600,
    user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role },
  };
}

// Server-side validation, written independently of the client validators on purpose:
// if the two ever disagree, we find out here instead of in production.
function validateRegister(b) {
  const d = [];
  const name = typeof b.fullName === 'string' ? b.fullName.trim() : '';
  if (name.length < 2 || name.length > 100) d.push({ field: 'fullName', message: 'size must be between 2 and 100' });
  const email = typeof b.email === 'string' ? b.email.trim() : '';
  if (!EMAIL_RE.test(email) || email.length > 150) d.push({ field: 'email', message: 'must be a well-formed email address' });
  const pw = typeof b.password === 'string' ? b.password : '';
  if (pw.length < 8 || pw.length > 72 || !/[A-Za-z]/.test(pw) || !/[0-9]/.test(pw)) {
    d.push({ field: 'password', message: 'must be 8-72 characters with at least one letter and one digit' });
  }
  if (!PHONE_RE.test(typeof b.phone === 'string' ? b.phone.trim() : '')) {
    d.push({ field: 'phone', message: 'must be a valid 10-digit mobile number' });
  }
  return d;
}

function validateLogin(b) {
  const d = [];
  if (typeof b.email !== 'string' || !EMAIL_RE.test(b.email.trim())) d.push({ field: 'email', message: 'must be a well-formed email address' });
  if (typeof b.password !== 'string' || !b.password) d.push({ field: 'password', message: 'must not be blank' });
  return d;
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export const authHandlers = [
  // U1
  http.post('*/api/v1/auth/register', async ({ request }) => {
    await delay(400); // lets you SEE the loading state and test double-submit
    const body = await readJson(request);
    if (!body) return apiError(request, 400, 'VALIDATION_ERROR', 'Malformed JSON request.');

    const details = validateRegister(body);
    if (details.length) {
      return apiError(request, 400, 'VALIDATION_ERROR', 'Please correct the highlighted fields.', details);
    }

    const email = body.email.trim().toLowerCase();
    if (db.findUserByEmail(email)) {
      return apiError(request, 409, 'EMAIL_ALREADY_EXISTS', 'An account with this email already exists.');
    }

    const user = db.addUser({
      fullName: body.fullName.trim(), email, password: body.password, phone: body.phone.trim(),
    });
    return HttpResponse.json(authResponse(user), { status: 201 });
  }),

  // U2
  http.post('*/api/v1/auth/login', async ({ request }) => {
    await delay(400);
    const body = await readJson(request);
    if (!body) return apiError(request, 400, 'VALIDATION_ERROR', 'Malformed JSON request.');

    const details = validateLogin(body);
    if (details.length) {
      return apiError(request, 400, 'VALIDATION_ERROR', 'Please correct the highlighted fields.', details);
    }

    const user = db.findUserByEmail(body.email.trim().toLowerCase());
    // Contract: same message for wrong email, wrong password and inactive user.
    if (!user || user.password !== body.password || !user.active) {
      return apiError(request, 401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
    }
    return HttpResponse.json(authResponse(user), { status: 200 });
  }),
];