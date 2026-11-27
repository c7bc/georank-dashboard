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
