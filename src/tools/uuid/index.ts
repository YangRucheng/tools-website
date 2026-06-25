import { registerTool } from '@/tools/registry';
import { Category } from '@/tools/types';
import type { Tool, ToolShareState } from '@/tools/types';

const tool: Tool = {
  id: 'uuid',
  name: 'UUID 生成',
  category: Category.GENERATION,
  route: '/uuid',
  description: 'UUID v4 生成和验证',
  keywords: ['uuid', 'guid', 'generate', 'validate', 'v4', '生成', '验证'],
  seoTitle: 'UUID 生成器 — 在线 UUID v4 生成和验证工具',
  seoDescription: '免费在线 UUID 生成器，支持批量生成 UUID v4、格式验证，所有生成在浏览器本地完成，无需联网。',
  component: () => import('./UuidTool.vue'),
  encodeShareState: (s) => JSON.stringify(s),
  decodeShareState: (e) => JSON.parse(e) as ToolShareState,
};

registerTool(tool);
