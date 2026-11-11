import { HttpResponse } from 'msw';

const REASONS = {
  400: 'Bad Request', 401: 'Unauthorized', 403: 'Forbidden', 404: 'Not Found',
  409: 'Conflict', 500: 'Internal Server Error', 503: 'Service Unavailable',
};

// Same shape as the real services. `details` is ALWAYS an array.
export function apiError(request, status, code, message, details = []) {
  return HttpResponse.json(
    {
      timestamp: new Date().toISOString(),
      status,
      error: REASONS[status],
      code,
      message,
      path: new URL(request.url).pathname,
      details,
    },
    { status }
  );
}