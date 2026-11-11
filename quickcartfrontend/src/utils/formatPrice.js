const formatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
});

// Mandate 1: format only. Never add, multiply or compare prices here.
export function formatPrice(value) {
  if (value === null || value === undefined) return '';
  return formatter.format(value);
}