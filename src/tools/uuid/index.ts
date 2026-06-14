import { registerTool } from '@/tools/registry';
import { Category } from '@/tools/types';
import type { Tool, ToolShareState } from '@/tools/types';

const tool: Tool = {
  id: 'uuid',
  name: 'UUID 生成',
  category: Category.TIME_ID,
  route: '/uuid',
  description: 'UUID v4 生成和验证',
  keywords: ['uuid', 'guid', 'generate', 'validate', 'v4', '生成', '验证'],
  component: () => import('./UuidTool.vue'),
  encodeShareState: (s) => JSON.stringify(s),
  decodeShareState: (e) => JSON.parse(e) as ToolShareState,
};

registerTool(tool);
