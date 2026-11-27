/**
 * The API returns both bare objects and the standard success envelope.
 * Preserve bare payloads and keep fallback errors independent of proxy HTML.
 */
export function unwrapResponse(payload: unknown): unknown {
  if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
    return payload.data;
  }
  return payload;
}

export function apiFailure(payload: unknown, status: number) {
  const fallback = { error: 'unknown_error', message: 'Request failed', status };
  if (!payload || typeof payload !== 'object') return fallback;

  return {
    error: 'error' in payload && typeof payload.error === 'string' ? payload.error : fallback.error,
    message: 'message' in payload && typeof payload.message === 'string' && payload.message.trim()
      ? payload.message : fallback.message,
    status,
  };
}

export function normalizeDomainPage<T>(
  payload: T[] | { items: T[]; total: number; page: number; per_page: number },
  params?: { page?: number; per_page?: number },
) {
  if (!Array.isArray(payload)) return payload;

  return {
    items: payload,
    total: payload.length,
    page: params?.page ?? 1,
    per_page: params?.per_page ?? Math.max(payload.length, 1),
  };
}
