import { registerTool } from '@/tools/registry';
import { Category } from '@/tools/types';
import type { Tool, ToolShareState } from '@/tools/types';

const tool: Tool = {
  id: 'qrcode',
  name: '二维码生成',
  category: Category.GENERATION,
  route: '/qrcode',
  description: '在线生成二维码，支持 SVG 输出和 PNG 下载',
  keywords: ['qr', 'qrcode', '二维码', 'barcode', '生成'],
  seoTitle: '二维码生成器 — 在线生成二维码，支持 SVG 和 PNG 下载',
  seoDescription: '免费在线二维码生成器，输入文本或链接即可生成高清二维码，支持 SVG 矢量输出和 PNG 图片下载，生成在浏览器本地完成。',
  component: () => import('./QrcodeTool.vue'),
  encodeShareState: (s) => JSON.stringify(s),
  decodeShareState: (e) => JSON.parse(e) as ToolShareState,
};

registerTool(tool);
