import { registerTool } from '@/tools/registry';
import { Category } from '@/tools/types';
import type { Tool, ToolShareState } from '@/tools/types';

const tool: Tool = {
  id: 'base64',
  name: 'Base64 编解码',
  category: Category.ENCODING,
  route: '/base64',
  description: 'Base64 编码和解码，支持 Unicode',
  keywords: ['base64', 'encode', 'decode', '编码', '解码', 'base64url'],
  seoTitle: 'Base64 编解码 — 在线 Base64 编码解码工具，支持 Unicode',
  seoDescription: '免费在线 Base64 编码解码工具，支持 Unicode 字符和 Base64URL 格式，所有数据在浏览器本地处理，安全可靠。',
  component: () => import('./Base64Tool.vue'),
  encodeShareState: (s) => JSON.stringify(s),
  decodeShareState: (e) => JSON.parse(e) as ToolShareState,
};

registerTool(tool);
