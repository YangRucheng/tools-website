import { describe, it, expect } from 'vitest';
import { timestampToDate, dateToTimestamp, getCurrentTimestamp } from './timestampUtils';

describe('timestampToDate', () => {
  it('converts seconds timestamp', () => {
    const info = timestampToDate(1609459200); // 2021-01-01 00:00:00 UTC
    expect(info.unixSeconds).toBe(1609459200);
    expect(info.utc).toContain('2021-01-01');
  });

  it('auto-detects milliseconds', () => {
    const info = timestampToDate(1609459200000);
    expect(info.unixSeconds).toBe(1609459200);
  });

  it('handles future dates', () => {
    const info = timestampToDate(1893456000);
    expect(info.unixSeconds).toBe(1893456000);
  });

  it('generates relative time', () => {
    const now = getCurrentTimestamp();
    const info = timestampToDate(now);
    expect(info.relative).toBeTruthy();
  });
});

describe('dateToTimestamp', () => {
  it('parses ISO 8601 date', () => {
    const result = dateToTimestamp('2021-01-01');
    expect(result.success).toBe(true);
    // Just verify it returns a reasonable value (timezone-dependent)
    expect((result as { data: number }).data).toBeGreaterThan(1609400000);
    expect((result as { data: number }).data).toBeLessThan(1609500000);
  });

  it('returns error for invalid date', () => {
    const result = dateToTimestamp('not a date');
    expect(result.success).toBe(false);
  });

  it('returns error for empty input', () => {
    const result = dateToTimestamp('');
    expect(result.success).toBe(false);
  });
});
