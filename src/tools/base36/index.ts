import { registerTool } from '@/tools/registry';
import { Category } from '@/tools/types';
import type { Tool, ToolShareState } from '@/tools/types';

const tool: Tool = {
  id: 'base36',
  name: 'Base36 编解码',
  category: Category.ENCODING,
  route: '/base36',
  description: 'Base36 编码和解码',
  keywords: ['base36', 'encode', 'decode', '编码', '解码', 'radix36'],
  component: () => import('./Base36Tool.vue'),
  encodeShareState: (s) => JSON.stringify(s),
  decodeShareState: (e) => JSON.parse(e) as ToolShareState,
};

registerTool(tool);
