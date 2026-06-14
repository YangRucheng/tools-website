import { registerTool } from '@/tools/registry';
import { Category } from '@/tools/types';
import type { Tool, ToolShareState } from '@/tools/types';

const tool: Tool = {
  id: 'timestamp',
  name: '时间戳转换',
  category: Category.TIME_ID,
  route: '/timestamp',
  description: 'Unix 时间戳与日期互转',
  keywords: ['timestamp', 'unix', 'date', 'time', '时间戳', '日期', '时间'],
  component: () => import('./TimestampTool.vue'),
  encodeShareState: (s) => JSON.stringify(s),
  decodeShareState: (e) => JSON.parse(e) as ToolShareState,
};

registerTool(tool);
