import assert from 'node:assert/strict';
import { test } from 'node:test';
import { apiFailure, normalizeDomainPage, unwrapResponse } from '../src/lib/api/response.ts';
import { readPageNumber } from '../src/lib/pagination.ts';

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

test('keeps paginated domains intact and normalizes the legacy list', () => {
  const items = [{ id: 1 }, { id: 2 }];
  const current = { items, total: 140, page: 2, per_page: 20 };
  assert.equal(normalizeDomainPage(current), current);
  assert.deepEqual(normalizeDomainPage(items, { page: 2, per_page: 20 }), {
    items, total: 2, page: 2, per_page: 20,
  });
  assert.deepEqual(normalizeDomainPage([]), { items: [], total: 0, page: 1, per_page: 1 });
});

test('accepts only positive safe integers as page numbers', () => {
  assert.equal(readPageNumber('12'), 12);
  for (const invalid of [null, '', '0', '-2', '1.5', '2junk', '1e3', '9007199254740992']) {
    assert.equal(readPageNumber(invalid), 1);
  }
});
