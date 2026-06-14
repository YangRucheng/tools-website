const CHARS = '0123456789abcdefghijklmnopqrstuvwxyz';
const CHUNK_BYTES = 4;

export type Base36Method = 'text' | 'number';

export interface Base36Result {
  success: boolean;
  data?: string;
  error?: string;
}

// ---- Text encoding (binary → base36 with chunking) ----

export const encodeBase36 = (text: string): Base36Result => {
  if (!text) return { success: false, error: '输入为空' };
  try {
    const bytes = new TextEncoder().encode(text);
    const parts: string[] = [];
    for (let i = 0; i < bytes.length; i += CHUNK_BYTES) {
      const chunk = bytes.slice(i, i + CHUNK_BYTES);
      let val = BigInt(0);
      for (const b of chunk) {
        val = (val << BigInt(8)) | BigInt(b);
      }
      parts.push(val.toString(36));
    }
    return { success: true, data: parts.join(':') };
  } catch (e) {
    return { success: false, error: `编码失败: ${String(e)}` };
  }
};

export const decodeBase36 = (encoded: string): Base36Result => {
  if (!encoded.trim()) return { success: false, error: '输入为空' };
  try {
    const parts = encoded.trim().split(':');
    const allBytes: number[] = [];
    for (let pi = 0; pi < parts.length; pi++) {
      let val = BigInt(0);
      const str = parts[pi];
      for (let i = 0; i < str.length; i++) {
        const idx = CHARS.indexOf(str[i]);
        if (idx === -1) return { success: false, error: `无效的 Base36 字符: "${str[i]}"` };
        val = val * BigInt(36) + BigInt(idx);
      }
      const chunkBytes: number[] = [];
      let v = val;
      if (v === BigInt(0)) {
        chunkBytes.push(0);
      }
      while (v > BigInt(0)) {
        chunkBytes.unshift(Number(v & BigInt(255)));
        v >>= BigInt(8);
      }
      const expectedLen = pi < parts.length - 1 ? CHUNK_BYTES : 0;
      while (chunkBytes.length < expectedLen) {
        chunkBytes.unshift(0);
      }
      allBytes.push(...chunkBytes);
    }
    return { success: true, data: new TextDecoder().decode(new Uint8Array(allBytes)) };
  } catch (e) {
    return { success: false, error: `解码失败: ${String(e)}` };
  }
};

// ---- Number conversion (decimal ↔ base36) ----

export const encodeNumberToBase36 = (numStr: string): Base36Result => {
  if (!numStr.trim()) return { success: false, error: '输入为空' };
  try {
    const val = BigInt(numStr.trim());
    if (val < 0) return { success: false, error: '暂不支持负数' };
    return { success: true, data: val.toString(36) };
  } catch {
    return { success: false, error: '无效的数字' };
  }
};

export const decodeBase36ToNumber = (base36Str: string): Base36Result => {
  if (!base36Str.trim()) return { success: false, error: '输入为空' };
  const str = base36Str.trim().toLowerCase();
  for (let i = 0; i < str.length; i++) {
    if (CHARS.indexOf(str[i]) === -1) {
      return { success: false, error: `无效的 Base36 字符: "${str[i]}"` };
    }
  }
  try {
    let val = BigInt(0);
    for (let i = 0; i < str.length; i++) {
      val = val * BigInt(36) + BigInt(CHARS.indexOf(str[i]));
    }
    return { success: true, data: val.toString() };
  } catch (e) {
    return { success: false, error: `解码失败: ${String(e)}` };
  }
};
