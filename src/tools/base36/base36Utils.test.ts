import { describe, it, expect } from 'vitest';
import { encodeBase36, decodeBase36, encodeNumberToBase36, decodeBase36ToNumber } from './base36Utils';

describe('encodeBase36 (text)', () => {
  it('encodes simple text', () => {
    const result = encodeBase36('hi');
    expect(result.success).toBe(true);
    expect(result.data).toBeTruthy();
  });

  it('returns error for empty input', () => {
    const result = encodeBase36('');
    expect(result.success).toBe(false);
  });
});

describe('decodeBase36 (text)', () => {
  it('roundtrips text', () => {
    const result = encodeBase36('hello world');
    expect(result.success).toBe(true);
    if (result.data) {
      const decoded = decodeBase36(result.data);
      expect(decoded.data).toBe('hello world');
    }
  });

  it('returns error for empty input', () => {
    const result = decodeBase36('');
    expect(result.success).toBe(false);
  });
});

describe('encodeNumberToBase36', () => {
  it('converts number to base36', () => {
    const result = encodeNumberToBase36('1234567890');
    expect(result.success).toBe(true);
    expect(result.data).toBe('kf12oi');
  });

  it('returns error for empty input', () => {
    const result = encodeNumberToBase36('');
    expect(result.success).toBe(false);
  });

  it('returns error for negative numbers', () => {
    const result = encodeNumberToBase36('-5');
    expect(result.success).toBe(false);
  });
});

describe('decodeBase36ToNumber', () => {
  it('roundtrips number', () => {
    const encoded = encodeNumberToBase36('1234567890');
    expect(encoded.success).toBe(true);
    if (encoded.data) {
      const decoded = decodeBase36ToNumber(encoded.data);
      expect(decoded.success).toBe(true);
      expect(decoded.data).toBe('1234567890');
    }
  });

  it('returns error for empty input', () => {
    const result = decodeBase36ToNumber('');
    expect(result.success).toBe(false);
  });

  it('returns error for invalid characters', () => {
    const result = decodeBase36ToNumber('xyz!');
    expect(result.success).toBe(false);
  });
});
