// === 接口类型与供应商 ===

export type InterfaceType = 'openai' | 'anthropic' | 'balance';
export type Supplier = 'zhipu' | 'deepseek' | 'anthropic' | 'custom';

export const INTERFACE_TYPES: InterfaceType[] = ['openai', 'anthropic', 'balance'];
export const SUPPLIERS: Supplier[] = ['zhipu', 'deepseek', 'anthropic', 'custom'];

export const INTERFACE_LABELS: Record<InterfaceType, string> = {
  openai: 'OpenAI 格式',
  anthropic: 'Anthropic 格式',
  balance: '余额查询',
};

export const SUPPLIER_LABELS: Record<Supplier, string> = {
  zhipu: '智谱',
  deepseek: 'DeepSeek',
  anthropic: 'Anthropic',
  custom: '自定义端点',
};

/**
 * 每种接口类型下可选的供应商。切换接口类型时据此过滤，避免无效组合
 * （如 智谱 + Anthropic 格式）。自定义端点始终可选。
 */
export const SUPPLIERS_BY_INTERFACE: Record<InterfaceType, Supplier[]> = {
  openai: ['deepseek', 'zhipu', 'custom'],
  anthropic: ['anthropic', 'custom'],
  balance: ['deepseek', 'custom'],
};

interface SupplierConfig {
  baseUrl: string;
  defaultModel: string;
  balancePath?: string;
}

const SUPPLIER_CONFIGS: Record<Supplier, SupplierConfig> = {
  zhipu: { baseUrl: 'https://open.bigmodel.cn/api/paas/v4', defaultModel: 'glm-5.2' },
  deepseek: { baseUrl: 'https://api.deepseek.com', defaultModel: 'deepseek-v4-flash', balancePath: '/user/balance' },
  anthropic: { baseUrl: 'https://api.anthropic.com', defaultModel: 'claude-sonnet-4-8' },
  custom: { baseUrl: '', defaultModel: 'gpt-5.6-luna' },
};

/** 已知供应商的内置端点配置。custom 的 baseUrl 由用户填充，defaultModel 提供默认测试模型。 */
export const getSupplierConfig = (supplier: Supplier): SupplierConfig => SUPPLIER_CONFIGS[supplier];

// === 密钥格式校验 ===

/** 已知供应商的合法密钥正则。custom 不在此列——任何非空行都视为候选。 */
const KEY_PATTERNS: Partial<Record<Supplier, RegExp[]>> = {
  deepseek: [/^sk-[a-f0-9]{32,}$/],              // sk- + 32+ hex
  zhipu: [/^[a-f0-9]{32}\.[A-Za-z0-9]{8,}$/],    // 32 hex + dot + 8+ alphanumeric
  anthropic: [/^sk-ant-[A-Za-z0-9_-]{20,}$/],    // sk-ant- + key body
};

/** 按供应商判定密钥格式是否合法。custom 端点密钥格式未知，任何非空行均放行。 */
export const isValidKeyFormat = (key: string, supplier: Supplier): boolean => {
  const trimmed = key.trim();
  const patterns = KEY_PATTERNS[supplier];
  if (!patterns) return trimmed.length > 0;
  return patterns.some((p) => p.test(trimmed));
};

// === 结果类型 ===

interface CheckResult {
  valid: boolean;
  balance: string;
  message: string;
}

export interface KeyCheckResult extends CheckResult {
  index: number;
  maskedKey: string;
  rawKey: string;
}

/** 可注入的请求执行器：默认用 fetch，油猴脚本激活时替换为 GM_xmlhttpRequest 代发。 */
export type HttpTransport = (url: string, init: RequestInit) => Promise<Response>;

export interface CheckOptions {
  interfaceType: InterfaceType;
  supplier: Supplier;
  baseUrl: string;
  testModel: string;
  balancePath?: string;
  transport?: HttpTransport;
}

// === 余额数值与展示 ===

/** USD → CNY 换算近似汇率 */
const CNY_RATE = 6;

/** 从余额展示串中提取数值用于排序（越大越优）。无法解析返回 -1。 */
export const extractBalanceValue = (r: KeyCheckResult): number => {
  if (!r.balance) return -1;
  const nums = r.balance.match(/-?[\d.]+/g);
  if (!nums) return -1;
  return nums.reduce((sum, n) => sum + (parseFloat(n) || 0), 0);
};

export const maskKey = (key: string): string => {
  if (key.length <= 8) return key.slice(0, 4) + '****';
  return key.slice(0, 4) + '****' + key.slice(-4);
};

// === 错误解析 ===

interface ParsedError {
  code: string;
  message: string;
}

const parseErrorResponse = async (res: Response): Promise<ParsedError> => {
  const body = await res.text().catch(() => '');
  try {
    const json = JSON.parse(body) as Record<string, unknown>;
    const err = json['error'] as Record<string, unknown> | undefined;
    if (err) {
      return {
        code: String(err['code'] ?? ''),
        message: String(err['message'] ?? ''),
      };
    }
  } catch {
    // 非 JSON，使用原始文本
  }
  return { code: '', message: `(${res.status}) ${body.slice(0, 200)}` };
};

const errorToCheckResult = (parsed: ParsedError): CheckResult => {
  // 智谱余额不足错误码
  if (parsed.code === '1113') {
    return { valid: false, balance: '', message: '余额不足' };
  }
  return { valid: false, balance: '', message: '密钥无效' };
};

// === 余额提取 ===

interface BalanceInfo {
  balance: string;
  total: number;
  known: boolean;
}

/** DeepSeek 余额接口字段：balance_infos 数组，含 currency + total_balance。 */
const extractDeepSeekBalance = (data: Record<string, unknown>): BalanceInfo => {
  const infos = data['balance_infos'] as Array<Record<string, string>> | undefined;
  if (!infos || infos.length === 0) {
    return { balance: '', total: -1, known: false };
  }
  const total = infos.reduce((sum, b) => {
    const currency = b.currency ?? 'CNY';
    const val = parseFloat(b.total_balance ?? '0') || 0;
    return sum + (currency === 'USD' ? val * CNY_RATE : val);
  }, 0);
  const balance = infos.map((b) => {
    const currency = b.currency ?? 'CNY';
    const val = parseFloat(b.total_balance ?? '0') || 0;
    if (currency === 'USD') return `¥${(val * CNY_RATE).toFixed(2)}`;
    return `¥${val.toFixed(2)}`;
  }).join('，');
  return { balance, total, known: true };
};

/** 通用余额字段名（含 data.* 嵌套尝试）。 */
const BALANCE_KEYS = ['total_balance', 'balance', 'amount', 'credit', 'credits', 'remaining', 'available_balance'];

/** 通用余额提取：先尝试 DeepSeek 格式，再扫描常见字段名。命中返回数值，否则 null。 */
const findNumericBalance = (data: unknown): number | null => {
  if (!data || typeof data !== 'object') return null;
  const obj = data as Record<string, unknown>;

  // DeepSeek 格式优先
  if (Array.isArray(obj['balance_infos']) && obj['balance_infos'].length > 0) {
    const ds = extractDeepSeekBalance(obj);
    if (ds.known) return ds.total;
  }

  const candidates: unknown[] = [obj];
  const nestedData = obj['data'];
  if (nestedData && typeof nestedData === 'object') {
    candidates.push(nestedData as Record<string, unknown>);
  }

  for (const c of candidates) {
    const rec = c as Record<string, unknown>;
    for (const k of BALANCE_KEYS) {
      const v = rec[k];
      if (typeof v === 'number') return v;
      if (typeof v === 'string') {
        const n = parseFloat(v);
        if (!Number.isNaN(n)) return n;
      }
    }
  }
  return null;
};

/** 按供应商提取余额信息。deepseek 用专用逻辑，custom 用通用提取。 */
const extractBalanceInfo = (supplier: Supplier, data: Record<string, unknown>): BalanceInfo => {
  if (supplier === 'deepseek') {
    return extractDeepSeekBalance(data);
  }
  const total = findNumericBalance(data);
  if (total === null) {
    return { balance: JSON.stringify(data).slice(0, 100), total: -1, known: false };
  }
  return { balance: String(total), total, known: true };
};

// === 各接口类型的检查实现 ===

const doFetch = async (
  url: string,
  init: RequestInit,
  transport?: HttpTransport,
): Promise<Response> => {
  if (transport) return transport(url, init);
  return fetch(url, init);
};

const checkOpenAI = async (apiKey: string, opts: CheckOptions): Promise<CheckResult> => {
  const res = await doFetch(
    `${opts.baseUrl}/chat/completions`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: opts.testModel,
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 5,
      }),
    },
    opts.transport,
  );
  if (res.ok) {
    return { valid: true, balance: '', message: '密钥有效' };
  }
  return errorToCheckResult(await parseErrorResponse(res));
};

// Anthropic 用 x-api-key 鉴权，需 anthropic-version，并通过
// anthropic-dangerous-direct-browser-access 头让浏览器侧请求绕过 CORS。
const checkAnthropic = async (apiKey: string, opts: CheckOptions): Promise<CheckResult> => {
  const res = await doFetch(
    `${opts.baseUrl}/v1/messages`,
    {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: opts.testModel,
        max_tokens: 1,
        messages: [{ role: 'user', content: 'Hi' }],
      }),
    },
    opts.transport,
  );
  if (res.ok) {
    return { valid: true, balance: '', message: '密钥有效' };
  }
  const parsed = await parseErrorResponse(res);
  // 鉴权通过但余额不足时返回 400 且 message 提及 credit balance——归为余额不足。
  if (/credit balance/i.test(parsed.message)) {
    return { valid: false, balance: '', message: '余额不足' };
  }
  return errorToCheckResult(parsed);
};

const checkBalance = async (apiKey: string, opts: CheckOptions): Promise<CheckResult> => {
  const res = await doFetch(
    `${opts.baseUrl}${opts.balancePath ?? ''}`,
    {
      headers: { Authorization: `Bearer ${apiKey}` },
    },
    opts.transport,
  );
  if (!res.ok) {
    return errorToCheckResult(await parseErrorResponse(res));
  }
  const data = await res.json() as Record<string, unknown>;
  const info = extractBalanceInfo(opts.supplier, data);
  if (info.known && info.total <= 0) {
    return { valid: false, balance: info.balance, message: '余额不足' };
  }
  return {
    valid: true,
    balance: info.balance,
    message: info.known ? '密钥有效' : '密钥有效（余额格式未知）',
  };
};

export const checkKey = async (apiKey: string, opts: CheckOptions): Promise<CheckResult> => {
  if (opts.interfaceType === 'anthropic') return checkAnthropic(apiKey, opts);
  if (opts.interfaceType === 'balance') return checkBalance(apiKey, opts);
  return checkOpenAI(apiKey, opts);
};

export const batchCheckKeys = async (
  apiKeys: string[],
  opts: CheckOptions,
): Promise<KeyCheckResult[]> => {
  // 过滤掉不符合当前供应商密钥格式的行
  const validEntries: { raw: string; index: number }[] = [];
  for (let i = 0; i < apiKeys.length; i++) {
    const raw = apiKeys[i].trim();
    if (raw && isValidKeyFormat(raw, opts.supplier)) {
      validEntries.push({ raw, index: i });
    }
  }

  if (validEntries.length === 0) return [];

  const tasks = validEntries.map(async ({ raw, index }) => {
    const result = await checkKey(raw, opts);
    return { ...result, index, maskedKey: maskKey(raw), rawKey: raw };
  });
  return Promise.all(tasks);
};
