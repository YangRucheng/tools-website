import { describe, it, expect } from 'vitest';
import { generateRandomKey, generateRandomKeys } from './randomKeyUtils';

const UPPER_PATTERN = /^[A-Z0-9]+$/;
const LOWER_PATTERN = /^[a-z0-9]+$/;

describe('generateRandomKey', () => {
  it('generates a 32-char uppercase key by default', () => {
    const key = generateRandomKey(32, true);
    expect(key).toHaveLength(32);
    expect(UPPER_PATTERN.test(key)).toBe(true);
  });

  it('generates a 48-char uppercase key', () => {
    const key = generateRandomKey(48, true);
    expect(key).toHaveLength(48);
  });

  it('generates a 64-char uppercase key', () => {
    const key = generateRandomKey(64, true);
    expect(key).toHaveLength(64);
  });

  it('generates lowercase when uppercase=false', () => {
    const key = generateRandomKey(32, false);
    expect(key).toHaveLength(32);
    expect(LOWER_PATTERN.test(key)).toBe(true);
  });

  it('produces varied output (statistically)', () => {
    const keys = new Set(Array.from({ length: 20 }, () => generateRandomKey(32, true)));
    expect(keys.size).toBe(20);
  });
});

describe('generateRandomKeys', () => {
  it('generates the requested number of keys', () => {
    const keys = generateRandomKeys(10, 32, true);
    expect(keys).toHaveLength(10);
    keys.forEach((k) => {
      expect(k).toHaveLength(32);
      expect(UPPER_PATTERN.test(k)).toBe(true);
    });
  });

  it('returns empty array for count 0', () => {
    expect(generateRandomKeys(0, 32, true)).toEqual([]);
  });
});
