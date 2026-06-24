export type Provider = 'deepseek' | 'zhipu';

export const PROVIDERS: Provider[] = ['deepseek', 'zhipu'];

/** Patterns for valid API key formats. Lines not matching any pattern are silently dropped. */
const KEY_PATTERNS: RegExp[] = [
  /^sk-[a-f0-9]{32,}$/,              // DeepSeek: sk- + 32+ hex chars
  /^[a-f0-9]{32}\.[A-Za-z0-9]{8,}$/, // 智谱: 32 hex + dot + 8+ alphanumeric
];

export const isValidKeyFormat = (key: string): boolean =>
  KEY_PATTERNS.some((p) => p.test(key.trim()));

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

/** USD → CNY conversion rate */
const CNY_RATE = 6;

/** Extract a numeric balance value for sorting (higher is better). Returns -1 if unparseable. */
export const extractBalanceValue = (r: KeyCheckResult): number => {
  if (!r.balance) return -1;
  const nums = r.balance.match(/-?[\d.]+/g);
  if (!nums) return -1;
  return nums.reduce((sum, n) => sum + (parseFloat(n) || 0), 0);
};

interface ProviderConfig {
  id: Provider;
  name: string;
  baseUrl: string;
  hasBalanceApi: boolean;
  balancePath?: string;
  modelsPath: string;
  chatPath: string;
  defaultModel: string;
}

const PROVIDER_CONFIGS: Record<Provider, ProviderConfig> = {
  deepseek: {
    id: 'deepseek',
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com',
    hasBalanceApi: true,
    balancePath: '/user/balance',
    modelsPath: '/models',
    chatPath: '/chat/completions',
    defaultModel: 'deepseek-chat',
  },
  zhipu: {
    id: 'zhipu',
    name: '智谱',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    hasBalanceApi: false,
    modelsPath: '/models',
    chatPath: '/chat/completions',
    defaultModel: 'glm-5.1',
  },
};

export const PROVIDER_LABELS: Record<Provider, string> = {
  deepseek: 'DeepSeek',
  zhipu: '智谱',
};

export const maskKey = (key: string): string => {
  if (key.length <= 8) return key.slice(0, 4) + '****';
  return key.slice(0, 4) + '****' + key.slice(-4);
};

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
    // not JSON, use raw text
  }
  return { code: '', message: `(${res.status}) ${body.slice(0, 200)}` };
};

const errorToCheckResult = (parsed: ParsedError): CheckResult => {
  if (parsed.code === '1113') {
    return { valid: false, balance: '', message: '余额不足' };
  }
  return { valid: false, balance: '', message: '密钥无效' };
};

const checkViaBalance = async (apiKey: string, config: ProviderConfig): Promise<CheckResult> => {
  const res = await fetch(`${config.baseUrl}${config.balancePath}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) {
    return errorToCheckResult(await parseErrorResponse(res));
  }
  const data = await res.json() as Record<string, unknown>;
  const balanceInfo = extractBalance(config.id, data);
  const total = extractTotalBalance(config.id, data);
  if (total <= 0) {
    return { valid: false, balance: balanceInfo, message: '余额不足' };
  }
  return { valid: true, balance: balanceInfo, message: '密钥有效' };
};

const checkViaModelsAndChat = async (apiKey: string, config: ProviderConfig): Promise<CheckResult> => {
  // Step 1: get model list
  let model: string = config.defaultModel;
  try {
    const modelsRes = await fetch(`${config.baseUrl}${config.modelsPath}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (modelsRes.ok) {
      const data = await modelsRes.json() as Record<string, unknown>;
      const models = extractModelList(data);
      if (models.length > 0) model = models[models.length - 1];
    }
  } catch {
    // fall through to default model
  }

  // Step 2: try a minimal chat completion to verify auth
  const chatRes = await fetch(`${config.baseUrl}${config.chatPath}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: 'Hi' }],
      max_tokens: 5,
    }),
  });
  if (!chatRes.ok) {
    return errorToCheckResult(await parseErrorResponse(chatRes));
  }
  return { valid: true, balance: '', message: `密钥有效（已通过模型 ${model} 验证）` };
};

const extractTotalBalance = (provider: Provider, data: Record<string, unknown>): number => {
  if (provider === 'deepseek') {
    const infos = data['balance_infos'] as Array<Record<string, string>> | undefined;
    if (infos && infos.length > 0) {
      return infos.reduce((sum, b) => {
        const currency = b.currency ?? 'CNY';
        const val = parseFloat(b.total_balance ?? '0') || 0;
        return sum + (currency === 'USD' ? val * CNY_RATE : val);
      }, 0);
    }
  }
  return -1;
};

const extractBalance = (provider: Provider, data: Record<string, unknown>): string => {
  if (provider === 'deepseek') {
    const infos = data['balance_infos'] as Array<Record<string, string>> | undefined;
    if (infos && infos.length > 0) {
      return infos.map((b) => {
        const currency = b.currency ?? 'CNY';
        const val = parseFloat(b.total_balance ?? '0') || 0;
        if (currency === 'USD') {
          return `¥${(val * CNY_RATE).toFixed(2)}`;
        }
        return `¥${val.toFixed(2)}`;
      }).join('，');
    }
    return JSON.stringify(data);
  }
  return '';
};

const extractModelList = (data: Record<string, unknown>): string[] => {
  const list = data['data'];
  if (Array.isArray(list)) {
    return list
      .map((m: unknown) => (m as Record<string, unknown> | null)?.id)
      .filter((id: unknown): id is string => typeof id === 'string');
  }
  return [];
};

export const checkKey = async (apiKey: string, provider: Provider): Promise<CheckResult> => {
  const config = PROVIDER_CONFIGS[provider];
  if (config.hasBalanceApi) {
    return checkViaBalance(apiKey, config);
  }
  return checkViaModelsAndChat(apiKey, config);
};

export const batchCheckKeys = async (apiKeys: string[], provider: Provider): Promise<KeyCheckResult[]> => {
  // Filter out lines that don't look like valid API keys
  const validEntries: { raw: string; index: number }[] = [];
  for (let i = 0; i < apiKeys.length; i++) {
    const raw = apiKeys[i].trim();
    if (raw && isValidKeyFormat(raw)) {
      validEntries.push({ raw, index: i });
    }
  }

  if (validEntries.length === 0) return [];

  const tasks = validEntries.map(async ({ raw, index }) => {
    const result = await checkKey(raw, provider);
    return { ...result, index, maskedKey: maskKey(raw), rawKey: raw };
  });
  return Promise.all(tasks);
};
