import { registerTool } from '@/tools/registry';
import { Category } from '@/tools/types';
import type { Tool, ToolShareState } from '@/tools/types';

const tool: Tool = {
  id: 'json-formatter',
  name: 'JSON 格式化',
  category: Category.DATA_PROCESSING,
  route: '/json',
  description: '格式化、验证、压缩 JSON 数据',
  keywords: ['json', 'format', 'validate', 'minify', 'beautify', '格式化', '压缩', '验证'],
  component: () => import('./JsonTool.vue'),
  encodeShareState: (state: ToolShareState) => JSON.stringify(state),
  decodeShareState: (encoded: string) => JSON.parse(encoded) as ToolShareState,
};

registerTool(tool);
