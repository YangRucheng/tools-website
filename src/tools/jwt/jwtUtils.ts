import { jwtDecode } from 'jwt-decode';

export interface JwtParts {
  header: unknown;
  payload: unknown;
  signature: string;
}

export interface JwtResult {
  success: boolean;
  data?: JwtParts;
  error?: string;
}

export const decodeJwt = (token: string): JwtResult => {
  if (!token.trim()) return { success: false, error: '输入为空' };
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return { success: false, error: 'JWT 格式无效：需要 3 段（Header.Payload.Signature）' };

    // Manually decode header from first part
    const headerJson = atob(parts[0].replace(/-/g, '+').replace(/_/g, '/'));
    const header = JSON.parse(headerJson);

    const payload = jwtDecode(token);

    return {
      success: true,
      data: {
        header,
        payload,
        signature: parts[2],
      },
    };
  } catch (e) {
    return { success: false, error: `JWT 解析失败: ${e instanceof Error ? e.message : '格式无效'}` };
  }
};

export const isJwtExpired = (payload: { exp?: number }): boolean => {
  if (payload.exp == null) return false;
  return payload.exp * 1000 < Date.now();
};

export const formatJwtPayload = (payload: unknown): string => {
  try {
    return JSON.stringify(payload, null, 2);
  } catch {
    return String(payload);
  }
};
