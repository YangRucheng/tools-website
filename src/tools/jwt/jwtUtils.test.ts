import { describe, it, expect } from 'vitest';
import { decodeJwt, isJwtExpired } from './jwtUtils';

// A test JWT: {"sub":"123","name":"test","iat":1516239022}
const TEST_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJuYW1lIjoidGVzdCIsImlhdCI6MTUxNjIzOTAyMn0.abc123';

describe('decodeJwt', () => {
  it('decodes a valid JWT', () => {
    const result = decodeJwt(TEST_JWT);
    expect(result.success).toBe(true);
    expect(result.data?.payload).toHaveProperty('sub', '123');
  });

  it('has header', () => {
    const result = decodeJwt(TEST_JWT);
    expect(result.data?.header).toHaveProperty('alg', 'HS256');
  });

  it('has signature', () => {
    const result = decodeJwt(TEST_JWT);
    expect(result.data?.signature).toBe('abc123');
  });

  it('returns error for invalid token', () => {
    const result = decodeJwt('not.a.jwt');
    expect(result.success).toBe(false);
  });

  it('returns error for empty input', () => {
    const result = decodeJwt('');
    expect(result.success).toBe(false);
  });
});

describe('isJwtExpired', () => {
  it('returns false for future exp', () => {
    const future = Math.floor(Date.now() / 1000) + 3600;
    expect(isJwtExpired({ exp: future })).toBe(false);
  });

  it('returns true for past exp', () => {
    const past = Math.floor(Date.now() / 1000) - 3600;
    expect(isJwtExpired({ exp: past })).toBe(true);
  });

  it('returns false when no exp claim', () => {
    expect(isJwtExpired({})).toBe(false);
  });
});
