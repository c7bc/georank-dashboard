import assert from 'node:assert/strict';
import { test } from 'node:test';
import { apiFailure, unwrapResponse } from '../src/lib/api/response.ts';

test('reads both bare response bodies and success envelopes', () => {
  const bare = { keywords: [] };
  assert.equal(unwrapResponse(bare), bare);
  assert.equal(unwrapResponse({ success: true, data: false }), false);
  assert.equal(unwrapResponse({ success: true, data: null }), null);
});

test('keeps the HTTP status authoritative when parsing an error', () => {
  assert.deepEqual(apiFailure({ error: 'not_found', message: 'Keyword not found', status: 200 }, 404), {
    error: 'not_found', message: 'Keyword not found', status: 404,
  });
});

test('provides a stable error for invalid response bodies', () => {
  for (const payload of [null, '<html>', [], { error: {}, message: ' ' }]) {
    assert.deepEqual(apiFailure(payload, 502), {
      error: 'unknown_error', message: 'Request failed', status: 502,
    });
  }
});
