import { describe, it, expect } from 'vitest';
import { encodeUrl, decodeUrl } from './urlUtils';

describe('encodeUrl', () => {
  it('encodes special characters', () => {
    const result = encodeUrl('hello world');
    expect(result.success).toBe(true);
    expect(result.data).toContain('%20');
  });

  it('encodes Chinese characters', () => {
    const result = encodeUrl('你好');
    expect(result.success).toBe(true);
    expect(result.data).toBe('%E4%BD%A0%E5%A5%BD');
  });

  it('full encode mode encodes unreserved chars', () => {
    const result = encodeUrl('a-b.c~d', true);
    expect(result.success).toBe(true);
    expect(result.data).toContain('%');
  });

  it('returns error for empty input', () => {
    const result = encodeUrl('');
    expect(result.success).toBe(false);
  });
});

describe('decodeUrl', () => {
  it('decodes percent-encoded string', () => {
    const result = decodeUrl('%E4%BD%A0%E5%A5%BD');
    expect(result.success).toBe(true);
    expect(result.data).toBe('你好');
  });

  it('roundtrips', () => {
    const result = encodeUrl('hello world & more');
    expect(result.success).toBe(true);
    const decoded = decodeUrl(result.data!);
    expect(decoded.data).toBe('hello world & more');
  });

  it('returns error for invalid encoding', () => {
    const result = decodeUrl('%ZZ');
    expect(result.success).toBe(false);
  });
});
