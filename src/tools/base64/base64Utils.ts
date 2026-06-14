export interface Base64Result {
  success: boolean;
  data?: string;
  error?: string;
}

export const encodeBase64 = (text: string): Base64Result => {
  if (!text) return { success: false, error: '输入为空' };
  try {
    const bytes = new TextEncoder().encode(text);
    let binary = '';
    for (const b of bytes) binary += String.fromCharCode(b);
    return { success: true, data: btoa(binary) };
  } catch {
    return { success: false, error: '编码失败: 输入包含无法处理的字符' };
  }
};

export const decodeBase64 = (encoded: string): Base64Result => {
  if (!encoded.trim()) return { success: false, error: '输入为空' };
  try {
    const binary = atob(encoded.trim());
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return { success: true, data: new TextDecoder().decode(bytes) };
  } catch {
    return { success: false, error: `解码失败: 无效的 Base64 字符串` };
  }
};
