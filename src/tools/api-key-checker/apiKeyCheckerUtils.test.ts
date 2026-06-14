import { describe, it, expect, vi, beforeEach } from 'vitest';
import { maskKey, checkKey, batchCheckKeys, isValidKeyFormat, extractBalanceValue } from './apiKeyCheckerUtils';
import type { KeyCheckResult } from './apiKeyCheckerUtils';

beforeEach(() => {
  vi.restoreAllMocks();
});

const mockFetch = (...responses: Array<Record<string, unknown>>): void => {
  const fn = vi.fn();
  for (const r of responses) fn.mockResolvedValueOnce(r);
  globalThis.fetch = fn as unknown as typeof fetch;
};

// Valid-format test keys
const DS_KEY_A = 'sk-abcdef1234567890abcdef1234567890'; // sk- + 32 hex
const DS_KEY_B = 'sk-00000000000000000000000000000000'; // sk- + 32 hex (zero)
const DS_KEY_C = 'sk-fedcba0987654321fedcba0987654321'; // sk- + 32 hex
const ZP_KEY_A = 'abcdef1234567890abcdef1234567890.Abcdef1234567890'; // 32 hex . 16 alphanum

describe('isValidKeyFormat', () => {
  it('accepts DeepSeek format: sk- + 32+ hex', () => {
    expect(isValidKeyFormat('sk-10be4828f06c48dbbda597af6380a371')).toBe(true);
    expect(isValidKeyFormat('sk-abcdef1234567890abcdef1234567890')).toBe(true);
  });

  it('accepts 智谱 format: 32 hex + dot + 8+ alphanumeric', () => {
    expect(isValidKeyFormat('09b6f7d4ef2b408a94c5ca7032a303ef.47A9zFs2tzQNChbr')).toBe(true);
    expect(isValidKeyFormat('abcdef1234567890abcdef1234567890.AbCdEf1234567890')).toBe(true);
  });

  it('rejects lines that do not match any known key pattern', () => {
    expect(isValidKeyFormat('not-a-key')).toBe(false);
    expect(isValidKeyFormat('sk-short')).toBe(false);
    expect(isValidKeyFormat('just some random text')).toBe(false);
    expect(isValidKeyFormat('')).toBe(false);
    expect(isValidKeyFormat('sk-test-key-12345678')).toBe(false); // has non-hex chars
  });
});

describe('extractBalanceValue', () => {
  const mk = (balance: string): KeyCheckResult =>
    ({ index: 0, maskedKey: 'sk-a****f', rawKey: 'sk-abc', valid: true, balance, message: '' });

  it('parses single balance', () => {
    expect(extractBalanceValue(mk('CNY 100.00'))).toBe(100);
  });

  it('parses multiple balance infos summing them', () => {
    expect(extractBalanceValue(mk('CNY 50.00，USD 30.00'))).toBe(80);
  });

  it('returns -1 for empty balance', () => {
    expect(extractBalanceValue(mk(''))).toBe(-1);
  });
});

describe('maskKey', () => {
  it('masks a long key showing first 4 and last 4 chars', () => {
    const result = maskKey('sk-abcdefgh12345678');
    expect(result).toBe('sk-a****5678');
  });

  it('masks a short key (<=8 chars) showing only first 4', () => {
    const result = maskKey('sk-abcd');
    expect(result).toBe('sk-a****');
  });
});

describe('checkKey', () => {
  it('returns valid=true with balance for DeepSeek when balance > 0', async () => {
    mockFetch({
      ok: true,
      json: async () => ({
        is_available: true,
        balance_infos: [{ currency: 'CNY', total_balance: '100.00' }],
      }),
    });

    const result = await checkKey(DS_KEY_A, 'deepseek');
    expect(result.valid).toBe(true);
    expect(result.balance).toContain('100.00');
    expect(result.message).toBe('密钥有效');
  });

  it('returns valid=false and 余额不足 when DeepSeek balance is 0', async () => {
    mockFetch({
      ok: true,
      json: async () => ({
        is_available: true,
        balance_infos: [{ currency: 'CNY', total_balance: '0.00' }],
      }),
    });

    const result = await checkKey(DS_KEY_B, 'deepseek');
    expect(result.valid).toBe(false);
    expect(result.message).toBe('余额不足');
    expect(result.balance).toContain('0.00');
  });

  it('returns valid=false with JSON error message for DeepSeek auth failure', async () => {
    mockFetch({
      ok: false,
      status: 401,
      text: async () => JSON.stringify({
        error: {
          message: 'Authentication Fails, Your api key: ****b667 is invalid',
          type: 'authentication_error',
          code: 'invalid_request_error',
        },
      }),
    });

    const result = await checkKey(DS_KEY_A, 'deepseek');
    expect(result.valid).toBe(false);
    expect(result.message).toBe('密钥无效');
  });

  it('returns valid=false with raw text when error body is not JSON', async () => {
    mockFetch({
      ok: false,
      status: 403,
      text: async () => 'Forbidden',
    });

    const result = await checkKey(DS_KEY_A, 'deepseek');
    expect(result.valid).toBe(false);
    expect(result.message).toBe('密钥无效');
  });

  it('returns valid=true for Zhipu when models and chat API succeed', async () => {
    mockFetch(
      {
        ok: true,
        json: async () => ({ data: [{ id: 'glm-4-flash' }, { id: 'glm-4-plus' }] }),
      },
      { ok: true },
    );

    const result = await checkKey(ZP_KEY_A, 'zhipu');
    expect(result.valid).toBe(true);
    expect(result.message).toContain('glm-4-plus');
  });

  it('falls back to default model when Zhipu models endpoint fails', async () => {
    mockFetch(
      { ok: false, status: 500, text: async () => '{}' },
      { ok: true },
    );

    const result = await checkKey(ZP_KEY_A, 'zhipu');
    expect(result.valid).toBe(true);
    expect(result.message).toContain('glm-5.1');
  });

  it('returns 余额不足 for Zhipu when chat API returns code 1113', async () => {
    mockFetch(
      {
        ok: true,
        json: async () => ({ data: [{ id: 'glm-4-flash' }] }),
      },
      {
        ok: false,
        status: 429,
        text: async () => JSON.stringify({ error: { code: '1113', message: '余额不足或无可用资源包,请充值。' } }),
      },
    );

    const result = await checkKey(ZP_KEY_A, 'zhipu');
    expect(result.valid).toBe(false);
    expect(result.message).toBe('余额不足');
  });

  it('returns 密钥无效 for Zhipu when chat API returns code 1000', async () => {
    mockFetch(
      {
        ok: true,
        json: async () => ({ data: [{ id: 'glm-4-flash' }] }),
      },
      {
        ok: false,
        status: 401,
        text: async () => JSON.stringify({ error: { code: '1000', message: '身份验证失败。' } }),
      },
    );

    const result = await checkKey(ZP_KEY_A, 'zhipu');
    expect(result.valid).toBe(false);
    expect(result.message).toBe('密钥无效');
  });

  it('returns 密钥无效 for Zhipu when chat API returns JSON error without code', async () => {
    mockFetch(
      {
        ok: true,
        json: async () => ({ data: [{ id: 'glm-4-flash' }] }),
      },
      {
        ok: false,
        status: 401,
        text: async () => JSON.stringify({ error: { message: 'Invalid API key' } }),
      },
    );

    const result = await checkKey(ZP_KEY_A, 'zhipu');
    expect(result.valid).toBe(false);
    expect(result.message).toBe('密钥无效');
  });
});

describe('batchCheckKeys', () => {
  it('checks multiple valid-format keys concurrently and includes rawKey', async () => {
    mockFetch(
      {
        ok: true,
        json: async () => ({ is_available: true, balance_infos: [{ currency: 'CNY', total_balance: '50' }] }),
      },
      {
        ok: false,
        status: 401,
        text: async () => JSON.stringify({ error: { message: 'Invalid key' } }),
      },
    );

    const results = await batchCheckKeys([DS_KEY_A, DS_KEY_C], 'deepseek');
    expect(results).toHaveLength(2);
    expect(results[0].valid).toBe(true);
    expect(results[0].maskedKey).toBe('sk-a****7890');
    expect(results[0].rawKey).toBe(DS_KEY_A);
    expect(results[0].balance).toContain('50');
    expect(results[1].valid).toBe(false);
    expect(results[1].rawKey).toBe(DS_KEY_C);
    expect(results[1].message).toBe('密钥无效');
  });

  it('filters out lines that do not match valid key format', async () => {
    const results = await batchCheckKeys(['not a key', 'just text', '   '], 'deepseek');
    expect(results).toHaveLength(0);
  });

  it('only processes valid-format keys, skipping invalid ones', async () => {
    mockFetch({
      ok: true,
      json: async () => ({ is_available: true, balance_infos: [{ currency: 'CNY', total_balance: '50' }] }),
    });

    const results = await batchCheckKeys(['not a key', DS_KEY_A, 'also not a key', ''], 'deepseek');
    expect(results).toHaveLength(1);
    expect(results[0].rawKey).toBe(DS_KEY_A);
    expect(results[0].index).toBe(1); // preserves original index
  });

  it('returns empty results for empty array', async () => {
    const results = await batchCheckKeys([], 'deepseek');
    expect(results).toHaveLength(0);
  });
});
