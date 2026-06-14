import { describe, it, expect } from 'vitest';
import { generateQrSvg } from './qrcodeUtils';

describe('generateQrSvg', () => {
  it('generates SVG for text', async () => {
    const result = await generateQrSvg('hello');
    expect(result.success).toBe(true);
    expect(result.data).toContain('<svg');
  });

  it('returns error for empty input', async () => {
    const result = await generateQrSvg('');
    expect(result.success).toBe(false);
  });

  it('generates SVG with different ECC levels', async () => {
    const result = await generateQrSvg('test', 'high');
    expect(result.success).toBe(true);
    expect(result.data).toContain('<svg');
  });
});
