import { registerTool } from '@/tools/registry';
import { Category } from '@/tools/types';
import type { Tool, ToolShareState } from '@/tools/types';

const tool: Tool = {
  id: 'url-encoder',
  name: 'URL 编解码',
  category: Category.ENCODING,
  route: '/url',
  description: 'URL 编码和解码（encodeURIComponent / decodeURIComponent）',
  keywords: ['url', 'encode', 'decode', 'uri', '编码', '解码', 'percent'],
  seoTitle: 'URL 编解码 — 在线 URL 编码解码工具（encodeURIComponent / decodeURIComponent）',
  seoDescription: '免费在线 URL 编码解码工具，支持 encodeURIComponent 和 decodeURIComponent，处理特殊字符和中文 URL，数据不上传服务器。',
  component: () => import('./UrlTool.vue'),
  encodeShareState: (s) => JSON.stringify(s),
  decodeShareState: (e) => JSON.parse(e) as ToolShareState,
};

registerTool(tool);
