export interface UrlResult {
  success: boolean;
  data?: string;
  error?: string;
}

export const encodeUrl = (text: string, fullEncode: boolean = false): UrlResult => {
  if (!text) return { success: false, error: '输入为空' };
  try {
    if (fullEncode) {
      let result = encodeURIComponent(text);
      // Also encode RFC 3986 unreserved characters
      result = result.replace(/[!'()*\-._~]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0'));
      return { success: true, data: result };
    }
    return { success: true, data: encodeURIComponent(text) };
  } catch (e) {
    return { success: false, error: `编码失败: ${String(e)}` };
  }
};

export const decodeUrl = (encoded: string): UrlResult => {
  if (!encoded.trim()) return { success: false, error: '输入为空' };
  try {
    return { success: true, data: decodeURIComponent(encoded.trim()) };
  } catch {
    return { success: false, error: '解码失败: 无效的 URL 编码字符串' };
  }
};
