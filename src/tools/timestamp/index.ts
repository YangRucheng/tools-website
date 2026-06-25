import { registerTool } from '@/tools/registry';
import { Category } from '@/tools/types';
import type { Tool, ToolShareState } from '@/tools/types';

const tool: Tool = {
  id: 'timestamp',
  name: '时间戳转换',
  category: Category.NETWORK,
  route: '/timestamp',
  description: 'Unix 时间戳与日期互转',
  keywords: ['timestamp', 'unix', 'date', 'time', '时间戳', '日期', '时间'],
  seoTitle: '时间戳转换 — Unix 时间戳与日期在线互转工具',
  seoDescription: '免费在线 Unix 时间戳转换工具，支持秒/毫秒时间戳与日期时间互转，实时显示当前时间戳，数据在浏览器本地处理。',
  component: () => import('./TimestampTool.vue'),
  encodeShareState: (s) => JSON.stringify(s),
  decodeShareState: (e) => JSON.parse(e) as ToolShareState,
};

registerTool(tool);
