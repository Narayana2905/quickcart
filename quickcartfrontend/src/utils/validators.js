// Mirrors the Handoff section 4. The server is still authoritative.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[6-9][0-9]{9}$/;

export function validateEmail(value) {
  const v = value.trim();
  if (!v) return 'Email is required.';
  if (v.length > 150 || !EMAIL_RE.test(v)) return 'Enter a valid email address.';
  return '';
}

export function validatePassword(value) {
  if (value.length < 8 || value.length > 72) return 'Password must be 8-72 characters.';
  if (!/[A-Za-z]/.test(value) || !/[0-9]/.test(value)) {
    return 'Password must contain at least one letter and one digit.';
  }
  return '';
}

export function validateFullName(value) {
  const v = value.trim();
  if (v.length < 2 || v.length > 100) return 'Name must be 2-100 characters.';
  return '';
}

export function validatePhone(value) {
  if (!PHONE_RE.test(value.trim())) return 'Enter a valid 10-digit mobile number.';
  return '';
}
const PINCODE_RE = /^[1-9][0-9]{5}$/;
const within = (v, min, max) => v.length >= min && v.length <= max;

export function validateLabel(value) {
  return within(value.trim(), 1, 30) ? '' : 'Label must be 1-30 characters.';
}
export function validateLine1(value) {
  return within(value.trim(), 3, 150) ? '' : 'Address line must be 3-150 characters.';
}
export function validateLine2(value) {
  return value.trim().length <= 150 ? '' : 'Line 2 must be at most 150 characters.';
}
export function validateCityOrState(value, what) {
  return within(value.trim(), 2, 60) ? '' : `${what} must be 2-60 characters.`;
}
export function validatePincode(value) {
  return PINCODE_RE.test(value.trim()) ? '' : 'Enter a valid 6-digit pincode.';
}

// The seven fields shared by saved addresses and (Step 6) the checkout delivery address.
// Returns { fieldName: message } for the invalid ones only.
export function validateDeliveryFields(f) {
  const checks = {
    recipientName: validateFullName(f.recipientName),
    phone: validatePhone(f.phone),
    line1: validateLine1(f.line1),
    line2: validateLine2(f.line2),
    city: validateCityOrState(f.city, 'City'),
    state: validateCityOrState(f.state, 'State'),
    pincode: validatePincode(f.pincode),
  };
  return Object.fromEntries(Object.entries(checks).filter(([, msg]) => msg));
}
export function validateCategoryName(value) {
  return within(value.trim(), 2, 80) ? '' : 'Name must be 2-80 characters.';
}
export function validateMaxLength(value, max, what) {
  return value.trim().length <= max ? '' : `${what} must be at most ${max} characters.`;
}
export function validateProductName(value) {
  return within(value.trim(), 2, 150) ? '' : 'Name must be 2-150 characters.';
}
export function validateUnit(value) {
  return within(value.trim(), 1, 30) ? '' : 'Unit must be 1-30 characters.';
}

// Price is validated as TEXT: up to 5 whole digits, at most 2 decimals, not zero.
// That already guarantees 0 < price <= 99999.99, with no floating-point maths (Mandate 1).
export function validatePrice(value) {
  const t = value.trim();
  if (!/^\d{1,5}(\.\d{1,2})?$/.test(t) || !/[1-9]/.test(t)) {
    return 'Enter a price above 0, up to 99999.99, with at most 2 decimals.';
  }
  return '';
}

export function validateQuantity(value) {
  const t = value.trim();
  return /^\d{1,6}$/.test(t) && Number(t) <= 100000
    ? ''
    : 'Quantity must be a whole number from 0 to 100000.';
}