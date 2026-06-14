import { describe, it, expect } from 'vitest';
import { computeHash, computeHmac } from './hashUtils';

describe('computeHash', () => {
  it('computes MD5', () => {
    const result = computeHash('hello', 'MD5');
    expect(result.success).toBe(true);
    expect(result.data).toBe('5d41402abc4b2a76b9719d911017c592');
  });

  it('computes SHA-256', () => {
    const result = computeHash('hello', 'SHA-256');
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(64);
  });

  it('computes SHA-1', () => {
    const result = computeHash('hello', 'SHA-1');
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(40);
  });

  it('computes SHA-512', () => {
    const result = computeHash('hello', 'SHA-512');
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(128);
  });

  it('handles empty string', () => {
    const result = computeHash('', 'MD5');
    expect(result.success).toBe(false);
  });

  it('handles Unicode', () => {
    const result = computeHash('你好', 'SHA-256');
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(64);
  });
});

describe('computeHmac', () => {
  it('computes HMAC-SHA256', () => {
    const result = computeHmac('hello', 'secret', 'SHA-256');
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(64);
  });

  it('requires input', () => {
    const result = computeHmac('', 'key', 'SHA-256');
    expect(result.success).toBe(false);
  });

  it('requires key', () => {
    const result = computeHmac('hello', '', 'SHA-256');
    expect(result.success).toBe(false);
  });
});
