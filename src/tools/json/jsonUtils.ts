export interface JsonResult {
  success: boolean;
  data?: string;
  error?: string;
}

export const formatJson = (input: string, indent: number = 2): JsonResult => {
  if (!input.trim()) return { success: false, error: '输入为空' };
  try {
    const parsed = JSON.parse(input);
    return { success: true, data: JSON.stringify(parsed, null, indent) };
  } catch (e) {
    const msg = e instanceof SyntaxError ? e.message : '未知错误';
    return { success: false, error: `JSON 解析失败: ${msg}` };
  }
};

export const minifyJson = (input: string): JsonResult => {
  if (!input.trim()) return { success: false, error: '输入为空' };
  try {
    const parsed = JSON.parse(input);
    return { success: true, data: JSON.stringify(parsed) };
  } catch (e) {
    const msg = e instanceof SyntaxError ? e.message : '未知错误';
    return { success: false, error: `JSON 解析失败: ${msg}` };
  }
};

export const validateJson = (input: string): JsonResult => {
  if (!input.trim()) return { success: false, error: '输入为空' };
  try {
    const parsed = JSON.parse(input);
    const kind = Array.isArray(parsed) ? '数组' : typeof parsed === 'object' && parsed !== null ? '对象' : '值';
    return { success: true, data: `✅ 有效的 JSON（${kind}，${JSON.stringify(parsed).length} 字符）` };
  } catch (e) {
    const msg = e instanceof SyntaxError ? e.message : '未知错误';
    return { success: false, error: `JSON 解析失败: ${msg}` };
  }
};
