import { describe, it, expect } from 'vitest';
import { formatJson, minifyJson, validateJson } from './jsonUtils';

describe('formatJson', () => {
  it('formats valid JSON with default 2-space indent', () => {
    const result = formatJson('{"a":1,"b":[2,3]}');
    expect(result.success).toBe(true);
    expect(result.data).toBe('{\n  "a": 1,\n  "b": [\n    2,\n    3\n  ]\n}');
  });

  it('handles arrays', () => {
    const result = formatJson('[1,2,3]');
    expect(result.success).toBe(true);
    expect(result.data).toBe('[\n  1,\n  2,\n  3\n]');
  });

  it('returns error for invalid JSON', () => {
    const result = formatJson('{invalid}');
    expect(result.success).toBe(false);
    expect(result.error).toContain('JSON 解析失败');
  });

  it('returns error for empty input', () => {
    const result = formatJson('');
    expect(result.success).toBe(false);
    expect(result.error).toBe('输入为空');
  });

  it('handles Unicode', () => {
    const result = formatJson('{"key":"中文👍"}');
    expect(result.success).toBe(true);
    expect(result.data).toContain('中文👍');
  });

  it('handles null', () => {
    const result = formatJson('null');
    expect(result.success).toBe(true);
    expect(result.data).toBe('null');
  });
});

describe('minifyJson', () => {
  it('minifies formatted JSON', () => {
    const result = minifyJson('{\n  "a": 1,\n  "b": 2\n}');
    expect(result.success).toBe(true);
    expect(result.data).toBe('{"a":1,"b":2}');
  });

  it('returns error for invalid JSON', () => {
    const result = minifyJson('not json');
    expect(result.success).toBe(false);
  });
});

describe('validateJson', () => {
  it('validates a JSON object', () => {
    const result = validateJson('{"x": 1}');
    expect(result.success).toBe(true);
    expect(result.data).toContain('✅');
  });

  it('validates a JSON array', () => {
    const result = validateJson('[1,2]');
    expect(result.success).toBe(true);
    expect(result.data).toContain('数组');
  });

  it('reports invalid JSON', () => {
    const result = validateJson('{bad}');
    expect(result.success).toBe(false);
  });
});
