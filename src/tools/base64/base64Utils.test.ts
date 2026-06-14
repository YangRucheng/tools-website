import { describe, it, expect } from 'vitest';
import { encodeBase64, decodeBase64 } from './base64Utils';

describe('encodeBase64', () => {
  it('encodes ASCII text', () => {
    const result = encodeBase64('hello');
    expect(result.success).toBe(true);
    expect(result.data).toBe('aGVsbG8=');
  });

  it('encodes Unicode (emoji + CJK)', () => {
    const result = encodeBase64('你好👍');
    expect(result.success).toBe(true);
    const decoded = decodeBase64(result.data!);
    expect(decoded.data).toBe('你好👍');
  });

  it('returns error for empty input', () => {
    const result = encodeBase64('');
    expect(result.success).toBe(false);
  });
});

describe('decodeBase64', () => {
  it('decodes valid base64', () => {
    const result = decodeBase64('aGVsbG8=');
    expect(result.success).toBe(true);
    expect(result.data).toBe('hello');
  });

  it('roundtrips Unicode', () => {
    const encoded = encodeBase64('中文测试🎉');
    const decoded = decodeBase64(encoded.data!);
    expect(decoded.data).toBe('中文测试🎉');
  });

  it('returns error for invalid base64', () => {
    const result = decodeBase64('!!!not-valid!!!');
    expect(result.success).toBe(false);
  });
});
