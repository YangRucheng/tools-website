import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  maskKey,
  checkKey,
  batchCheckKeys,
  isValidKeyFormat,
  extractBalanceValue,
  getSupplierConfig,
  SUPPLIERS_BY_INTERFACE,
} from './apiKeyCheckerUtils';
import type { KeyCheckResult, CheckOptions } from './apiKeyCheckerUtils';

beforeEach(() => {
  vi.restoreAllMocks();
});

const mockFetch = (...responses: Array<Record<string, unknown>>): void => {
  const fn = vi.fn();
  for (const r of responses) fn.mockResolvedValueOnce(r);
  globalThis.fetch = fn as unknown as typeof fetch;
};

// 合法规格的测试密钥
const DS_KEY_A = 'sk-abcdef1234567890abcdef1234567890'; // sk- + 32 hex
const DS_KEY_B = 'sk-00000000000000000000000000000000'; // sk- + 32 hex (zero)
const DS_KEY_C = 'sk-fedcba0987654321fedcba0987654321'; // sk- + 32 hex
const ZP_KEY_A = 'abcdef1234567890abcdef1234567890.Abcdef1234567890'; // 32 hex . 16 alphanum
const AN_KEY_A = 'sk-ant-api03-abcDEF1234567890abcDEF1234567890ghij'; // sk-ant- + key body
const CUSTOM_KEY = 'any-random-string-12345'; // 自定义端点：任意非空

// 构造 CheckOptions
const opts = (over: Partial<CheckOptions> = {}): CheckOptions => ({
  interfaceType: 'openai',
  supplier: 'deepseek',
  baseUrl: 'https://api.deepseek.com',
  testModel: 'deepseek-chat',
  balancePath: '/user/balance',
  ...over,
});

describe('isValidKeyFormat', () => {
  it('accepts DeepSeek format: sk- + 32+ hex', () => {
    expect(isValidKeyFormat('sk-10be4828f06c48dbbda597af6380a371', 'deepseek')).toBe(true);
    expect(isValidKeyFormat('sk-abcdef1234567890abcdef1234567890', 'deepseek')).toBe(true);
  });

  it('accepts 智谱 format: 32 hex + dot + 8+ alphanumeric', () => {
    expect(isValidKeyFormat('09b6f7d4ef2b408a94c5ca7032a303ef.47A9zFs2tzQNChbr', 'zhipu')).toBe(true);
    expect(isValidKeyFormat('abcdef1234567890abcdef1234567890.AbCdEf1234567890', 'zhipu')).toBe(true);
  });

  it('accepts Anthropic format: sk-ant- + 20+ key chars', () => {
    expect(isValidKeyFormat('sk-ant-api03-abcDEF1234567890abcDEF1234567890ghij', 'anthropic')).toBe(true);
    expect(isValidKeyFormat('sk-ant-admin01-AbCd_1234-EfGh5678IjKl', 'anthropic')).toBe(true);
  });

  it('accepts any non-empty string for custom supplier', () => {
    expect(isValidKeyFormat('any-random-string-12345', 'custom')).toBe(true);
    expect(isValidKeyFormat('sk-ant-xxx', 'custom')).toBe(true);
    expect(isValidKeyFormat('not-a-key', 'custom')).toBe(true);
  });

  it('rejects empty / whitespace for custom supplier', () => {
    expect(isValidKeyFormat('', 'custom')).toBe(false);
    expect(isValidKeyFormat('   ', 'custom')).toBe(false);
  });

  it('rejects lines that do not match the supplier pattern', () => {
    expect(isValidKeyFormat('not-a-key', 'deepseek')).toBe(false);
    expect(isValidKeyFormat('sk-short', 'deepseek')).toBe(false);
    expect(isValidKeyFormat('just some random text', 'anthropic')).toBe(false);
    expect(isValidKeyFormat('', 'zhipu')).toBe(false);
    expect(isValidKeyFormat('sk-test-key-12345678', 'deepseek')).toBe(false); // 含非 hex 字符
  });

  it('does not cross-match supplier patterns', () => {
    // DeepSeek 密钥不符合智谱格式
    expect(isValidKeyFormat(DS_KEY_A, 'zhipu')).toBe(false);
    // 智谱密钥不符合 DeepSeek 格式
    expect(isValidKeyFormat(ZP_KEY_A, 'deepseek')).toBe(false);
    // Anthropic 密钥不符合 DeepSeek 格式
    expect(isValidKeyFormat(AN_KEY_A, 'deepseek')).toBe(false);
  });
});

describe('getSupplierConfig', () => {
  it('returns known baseUrl and defaultModel for deepseek', () => {
    const c = getSupplierConfig('deepseek');
    expect(c.baseUrl).toBe('https://api.deepseek.com');
    expect(c.defaultModel).toBe('deepseek-v4-flash');
    expect(c.balancePath).toBe('/user/balance');
  });

  it('returns empty baseUrl with default model for custom', () => {
    const c = getSupplierConfig('custom');
    expect(c.baseUrl).toBe('');
    expect(c.defaultModel).toBe('gpt-5.6-luna');
    expect(c.balancePath).toBeUndefined();
  });
});

describe('SUPPLIERS_BY_INTERFACE', () => {
  it('excludes anthropic from openai and vice versa', () => {
    expect(SUPPLIERS_BY_INTERFACE.openai).not.toContain('anthropic');
    expect(SUPPLIERS_BY_INTERFACE.anthropic).not.toContain('deepseek');
    expect(SUPPLIERS_BY_INTERFACE.anthropic).not.toContain('zhipu');
  });

  it('always includes custom', () => {
    expect(SUPPLIERS_BY_INTERFACE.openai).toContain('custom');
    expect(SUPPLIERS_BY_INTERFACE.anthropic).toContain('custom');
    expect(SUPPLIERS_BY_INTERFACE.balance).toContain('custom');
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

describe('checkKey — OpenAI 格式', () => {
  it('returns valid=true for DeepSeek when chat API succeeds', async () => {
    mockFetch({ ok: true, json: async () => ({ id: 'chatcmpl-1' }) });

    const result = await checkKey(DS_KEY_A, opts({ supplier: 'deepseek' }));
    expect(result.valid).toBe(true);
    expect(result.message).toBe('密钥有效');
  });

  it('returns 密钥无效 for DeepSeek auth failure', async () => {
    mockFetch({
      ok: false,
      status: 401,
      text: async () => JSON.stringify({ error: { message: 'invalid api key' } }),
    });

    const result = await checkKey(DS_KEY_A, opts({ supplier: 'deepseek' }));
    expect(result.valid).toBe(false);
    expect(result.message).toBe('密钥无效');
  });

  it('returns 余额不足 for Zhipu when chat API returns code 1113', async () => {
    mockFetch({
      ok: false,
      status: 429,
      text: async () => JSON.stringify({ error: { code: '1113', message: '余额不足或无可用资源包,请充值。' } }),
    });

    const result = await checkKey(ZP_KEY_A, opts({
      supplier: 'zhipu',
      baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
      testModel: 'glm-5.1',
    }));
    expect(result.valid).toBe(false);
    expect(result.message).toBe('余额不足');
  });

  it('does not leak the test model into the success message', async () => {
    mockFetch({ ok: true, json: async () => ({}) });

    const result = await checkKey(ZP_KEY_A, opts({
      supplier: 'zhipu',
      baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
      testModel: 'glm-4-plus',
    }));
    expect(result.valid).toBe(true);
    expect(result.message).toBe('密钥有效');
    expect(result.message).not.toContain('glm-4-plus');
  });

  it('returns 密钥无效 when error body is not JSON', async () => {
    mockFetch({ ok: false, status: 403, text: async () => 'Forbidden' });

    const result = await checkKey(DS_KEY_A, opts({ supplier: 'deepseek' }));
    expect(result.valid).toBe(false);
    expect(result.message).toBe('密钥无效');
  });
});

describe('checkKey — Anthropic 格式', () => {
  const anOpts = (): CheckOptions => opts({
    interfaceType: 'anthropic',
    supplier: 'anthropic',
    baseUrl: 'https://api.anthropic.com',
    testModel: 'claude-opus-4-8',
  });

  it('returns valid=true when the messages API succeeds', async () => {
    mockFetch({ ok: true, json: async () => ({ id: 'msg_1', content: [{ type: 'text', text: 'Hi' }] }) });

    const result = await checkKey(AN_KEY_A, anOpts());
    expect(result.valid).toBe(true);
    expect(result.message).toBe('密钥有效');
  });

  it('returns 密钥无效 on authentication error', async () => {
    mockFetch({
      ok: false,
      status: 401,
      text: async () => JSON.stringify({
        type: 'error',
        error: { type: 'authentication_error', message: 'invalid x-api-key' },
      }),
    });

    const result = await checkKey(AN_KEY_A, anOpts());
    expect(result.valid).toBe(false);
    expect(result.message).toBe('密钥无效');
  });

  it('returns 余额不足 when credit balance is too low', async () => {
    mockFetch({
      ok: false,
      status: 400,
      text: async () => JSON.stringify({
        type: 'error',
        error: { type: 'invalid_request_error', message: 'Your credit balance is too low to access the Anthropic API.' },
      }),
    });

    const result = await checkKey(AN_KEY_A, anOpts());
    expect(result.valid).toBe(false);
    expect(result.message).toBe('余额不足');
  });
});

describe('checkKey — 余额查询', () => {
  it('returns valid=true with balance for DeepSeek when balance > 0', async () => {
    mockFetch({
      ok: true,
      json: async () => ({
        is_available: true,
        balance_infos: [{ currency: 'CNY', total_balance: '100.00' }],
      }),
    });

    const result = await checkKey(DS_KEY_A, opts({ interfaceType: 'balance', supplier: 'deepseek' }));
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

    const result = await checkKey(DS_KEY_B, opts({ interfaceType: 'balance', supplier: 'deepseek' }));
    expect(result.valid).toBe(false);
    expect(result.message).toBe('余额不足');
    expect(result.balance).toContain('0.00');
  });

  it('returns 密钥无效 for DeepSeek auth failure', async () => {
    mockFetch({
      ok: false,
      status: 401,
      text: async () => JSON.stringify({ error: { message: 'Authentication Fails' } }),
    });

    const result = await checkKey(DS_KEY_A, opts({ interfaceType: 'balance', supplier: 'deepseek' }));
    expect(result.valid).toBe(false);
    expect(result.message).toBe('密钥无效');
  });

  it('returns valid=true with extracted number for custom balance endpoint (top-level field)', async () => {
    mockFetch({
      ok: true,
      json: async () => ({ balance: 42.5 }),
    });

    const result = await checkKey(CUSTOM_KEY, opts({
      interfaceType: 'balance',
      supplier: 'custom',
      baseUrl: 'https://custom.example.com',
      balancePath: '/v1/balance',
    }));
    expect(result.valid).toBe(true);
    expect(result.balance).toBe('42.5');
  });

  it('returns valid=true with extracted number for custom balance endpoint (nested data field)', async () => {
    mockFetch({
      ok: true,
      json: async () => ({ data: { total_balance: '88' } }),
    });

    const result = await checkKey(CUSTOM_KEY, opts({
      interfaceType: 'balance',
      supplier: 'custom',
      baseUrl: 'https://custom.example.com',
      balancePath: '/balance',
    }));
    expect(result.valid).toBe(true);
    expect(result.balance).toBe('88');
  });

  it('returns valid=true with 余额格式未知 when custom balance shape is unrecognized', async () => {
    mockFetch({
      ok: true,
      json: async () => ({ unrelated: true, nothing_here: 'abc' }),
    });

    const result = await checkKey(CUSTOM_KEY, opts({
      interfaceType: 'balance',
      supplier: 'custom',
      baseUrl: 'https://custom.example.com',
      balancePath: '/balance',
    }));
    expect(result.valid).toBe(true);
    expect(result.message).toContain('余额格式未知');
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

    const results = await batchCheckKeys([DS_KEY_A, DS_KEY_C], opts({ interfaceType: 'balance', supplier: 'deepseek' }));
    expect(results).toHaveLength(2);
    expect(results[0].valid).toBe(true);
    expect(results[0].maskedKey).toBe('sk-a****7890');
    expect(results[0].rawKey).toBe(DS_KEY_A);
    expect(results[0].balance).toContain('50');
    expect(results[1].valid).toBe(false);
    expect(results[1].rawKey).toBe(DS_KEY_C);
    expect(results[1].message).toBe('密钥无效');
  });

  it('filters out lines that do not match valid key format (known supplier)', async () => {
    const results = await batchCheckKeys(['not a key', 'just text', '   '], opts({ supplier: 'deepseek' }));
    expect(results).toHaveLength(0);
  });

  it('only processes valid-format keys, skipping invalid ones', async () => {
    mockFetch({
      ok: true,
      json: async () => ({ is_available: true, balance_infos: [{ currency: 'CNY', total_balance: '50' }] }),
    });

    const results = await batchCheckKeys(['not a key', DS_KEY_A, 'also not a key', ''], opts({ interfaceType: 'balance', supplier: 'deepseek' }));
    expect(results).toHaveLength(1);
    expect(results[0].rawKey).toBe(DS_KEY_A);
    expect(results[0].index).toBe(1); // 保留原始索引
  });

  it('passes through all non-empty lines for custom supplier', async () => {
    mockFetch(
      { ok: true, json: async () => ({ id: '1' }) },
      { ok: true, json: async () => ({ id: '2' }) },
      { ok: true, json: async () => ({ id: '3' }) },
    );

    const results = await batchCheckKeys(
      ['weird-key-1', 'another!key', CUSTOM_KEY],
      opts({ supplier: 'custom', baseUrl: 'https://custom.example.com', testModel: 'gpt-4o' }),
    );
    expect(results).toHaveLength(3);
    expect(results[0].rawKey).toBe('weird-key-1');
    expect(results[2].rawKey).toBe(CUSTOM_KEY);
  });

  it('returns empty results for empty array', async () => {
    const results = await batchCheckKeys([], opts({ supplier: 'deepseek' }));
    expect(results).toHaveLength(0);
  });
});
