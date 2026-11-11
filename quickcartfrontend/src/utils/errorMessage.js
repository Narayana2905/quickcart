// Mandate 2: the ONLY place that interprets API errors.
export function parseApiError(error) {
  // if (!error?.response) {
  //   return {
  //     code: 'NETWORK_ERROR',
  //     message: 'Cannot reach the server. Please retry.',
  //     fieldErrors: {},
  //   };
  // }

  const data = error.response.data || {};
  const fieldErrors = {};
  if (Array.isArray(data.details)) {
    data.details.forEach((d) => {
      if (d?.field && !(d.field in fieldErrors)) fieldErrors[d.field] = d.message;
    });
  }
  // Axios error with no HTTP response = the network or server is down.
  if (error?.isAxiosError && !error.response) {
    return {
      code: 'NETWORK_ERROR',
      message: 'Cannot reach the server. Please retry.',
      fieldErrors: {},
    };
  }

  // Not an Axios error at all: a bug in our own code. Never show it to the user,
  // but never swallow it silently either.
  if (!error?.response) {
    console.error('Unexpected client error:', error);
    return {
      code: 'CLIENT_ERROR',
      message: 'Something went wrong. Please try again.',
      fieldErrors: {},
    };
  }

  // ...the rest of the function stays exactly as it was

  return {
    code: data.code || 'UNKNOWN_ERROR',
    message: data.message || 'Something went wrong. Please try again.',
    fieldErrors,
  };
}
// Message plus per-item details, e.g. "Some items ... Requested 5, available 2"
export function messageWithDetails({ message, fieldErrors }) {
  const extra = Object.values(fieldErrors);
  return extra.length ? `${message} ${extra.join(' ')}` : message;
}