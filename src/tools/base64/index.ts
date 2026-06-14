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
  component: () => import('./Base64Tool.vue'),
  encodeShareState: (s) => JSON.stringify(s),
  decodeShareState: (e) => JSON.parse(e) as ToolShareState,
};

registerTool(tool);
