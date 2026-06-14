import { describe, it, expect } from 'vitest';
import { generateUuidV4, generateUuidV1, generateUuids, validateUuid, formatUuid } from './uuidUtils';

describe('generateUuidV4', () => {
  it('generates a UUID v4 format string', () => {
    const uuid = generateUuidV4();
    expect(validateUuid(uuid)).toBe(true);
  });

  it('returns 36-character string', () => {
    expect(generateUuidV4()).toHaveLength(36);
  });

  it('has version nibble set to 4', () => {
    const uuid = generateUuidV4();
    expect(uuid.charAt(14)).toBe('4');
  });
});

describe('generateUuidV1', () => {
  it('generates a UUID v1 format string', () => {
    const uuid = generateUuidV1();
    expect(validateUuid(uuid)).toBe(true);
  });

  it('returns 36-character string', () => {
    expect(generateUuidV1()).toHaveLength(36);
  });

  it('has version nibble set to 1', () => {
    const uuid = generateUuidV1();
    expect(uuid.charAt(14)).toBe('1');
  });

  it('generates unique values', () => {
    const uuids = Array.from({ length: 50 }, () => generateUuidV1());
    expect(new Set(uuids).size).toBe(50);
  });
});

describe('generateUuids', () => {
  it('generates the requested count (v4)', () => {
    const uuids = generateUuids(5, 'v4');
    expect(uuids).toHaveLength(5);
    uuids.forEach((u) => expect(u.charAt(14)).toBe('4'));
  });

  it('generates the requested count (v1)', () => {
    const uuids = generateUuids(5, 'v1');
    expect(uuids).toHaveLength(5);
    uuids.forEach((u) => expect(u.charAt(14)).toBe('1'));
  });

  it('generates unique values (v4)', () => {
    const uuids = generateUuids(100, 'v4');
    expect(new Set(uuids).size).toBe(100);
  });

  it('generates unique values (v1)', () => {
    const uuids = generateUuids(100, 'v1');
    expect(new Set(uuids).size).toBe(100);
  });
});

describe('validateUuid', () => {
  it('accepts valid UUID v4', () => {
    expect(validateUuid('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
  });

  it('accepts valid UUID v1', () => {
    expect(validateUuid('f47ac10b-58cc-1372-8567-0e02b2c3d479')).toBe(true);
  });

  it('version-specific: v4 passes v4 check', () => {
    expect(validateUuid('550e8400-e29b-41d4-a716-446655440000', 'v4')).toBe(true);
  });

  it('version-specific: v4 fails v1 check', () => {
    expect(validateUuid('550e8400-e29b-41d4-a716-446655440000', 'v1')).toBe(false);
  });

  it('version-specific: v1 passes v1 check', () => {
    expect(validateUuid('f47ac10b-58cc-1372-8567-0e02b2c3d479', 'v1')).toBe(true);
  });

  it('version-specific: v1 fails v4 check', () => {
    expect(validateUuid('f47ac10b-58cc-1372-8567-0e02b2c3d479', 'v4')).toBe(false);
  });

  it('rejects invalid UUID', () => {
    expect(validateUuid('not-a-uuid')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(validateUuid('')).toBe(false);
  });
});

describe('formatUuid', () => {
  const uuid = '550e8400-e29b-41d4-a716-446655440000';

  it('uppercases', () => {
    expect(formatUuid(uuid, true, false)).toBe(uuid.toUpperCase());
  });

  it('removes dashes', () => {
    expect(formatUuid(uuid, false, true)).not.toContain('-');
  });

  it('combines options', () => {
    const result = formatUuid(uuid, true, true);
    expect(result).toBe(result.toUpperCase());
    expect(result).not.toContain('-');
  });
});
