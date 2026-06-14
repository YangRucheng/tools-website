import QRCode from 'qrcode';

export type QrEcc = 'L' | 'M' | 'Q' | 'H';

const eccMap: Record<string, QrEcc> = {
  low: 'L',
  medium: 'M',
  quartile: 'Q',
  high: 'H',
};

export interface QrResult {
  success: boolean;
  data?: string;
  error?: string;
}

export const generateQrSvg = async (text: string, ecc: 'low' | 'medium' | 'quartile' | 'high' = 'high', scale: number = 8): Promise<QrResult> => {
  if (!text.trim()) return { success: false, error: '输入为空' };
  try {
    const svg = await QRCode.toString(text, {
      type: 'svg',
      errorCorrectionLevel: eccMap[ecc] ?? 'M',
      width: scale * 29, // ~base module size
    });
    return { success: true, data: svg };
  } catch (e) {
    return { success: false, error: `二维码生成失败: ${String(e)}` };
  }
};
