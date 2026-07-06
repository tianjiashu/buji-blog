import { getPublicErrorResponse } from './errors.js';

export function jsonResponse(body: unknown, init?: ResponseInit): Response {
  return Response.json(body, {
    ...init,
    headers: {
      'Cache-Control': 'no-store',
      ...init?.headers,
    },
  });
}

export function errorResponse(message: string, status = 400): Response {
  return jsonResponse(
    {
      ok: false,
      error: message,
    },
    { status },
  );
}

export function unknownErrorResponse(error: unknown): Response {
  const publicError = getPublicErrorResponse(error);
  return errorResponse(publicError.message, publicError.status);
}
