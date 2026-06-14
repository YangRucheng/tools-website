import CryptoJS from 'crypto-js';

export type HashAlgorithm = 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-512';

export const ALGORITHMS: HashAlgorithm[] = ['MD5', 'SHA-1', 'SHA-256', 'SHA-512'];

export interface HashResult {
  success: boolean;
  data?: string;
  error?: string;
}

const algoFn: Record<HashAlgorithm, (input: CryptoJS.lib.WordArray) => CryptoJS.lib.WordArray> = {
  'MD5': (i) => CryptoJS.MD5(i),
  'SHA-1': (i) => CryptoJS.SHA1(i),
  'SHA-256': (i) => CryptoJS.SHA256(i),
  'SHA-512': (i) => CryptoJS.SHA512(i),
};

export const computeHash = (input: string, algorithm: HashAlgorithm): HashResult => {
  if (!input) return { success: false, error: '输入为空' };
  try {
    const result = algoFn[algorithm](CryptoJS.enc.Utf8.parse(input));
    return { success: true, data: result.toString(CryptoJS.enc.Hex) };
  } catch (e) {
    return { success: false, error: `哈希计算失败: ${String(e)}` };
  }
};

export const computeHmac = (input: string, key: string, algorithm: HashAlgorithm): HashResult => {
  if (!input) return { success: false, error: '输入为空' };
  if (!key) return { success: false, error: '密钥为空' };
  try {
    const hmacMap: Record<string, { fn: (msg: string, key: string) => string }> = {
      'SHA-1': { fn: (msg, k) => CryptoJS.HmacSHA1(msg, k).toString() },
      'SHA-256': { fn: (msg, k) => CryptoJS.HmacSHA256(msg, k).toString() },
      'SHA-512': { fn: (msg, k) => CryptoJS.HmacSHA512(msg, k).toString() },
    };
    // MD5 HMAC
    if (algorithm === 'MD5') {
      const hmac = CryptoJS.HmacMD5(input, key).toString();
      return { success: true, data: hmac };
    }
    const hmac = hmacMap[algorithm]?.fn(input, key);
    if (hmac) return { success: true, data: hmac };
    return { success: false, error: `不支持的 HMAC 算法: ${algorithm}` };
  } catch (e) {
    return { success: false, error: `HMAC 计算失败: ${String(e)}` };
  }
};
