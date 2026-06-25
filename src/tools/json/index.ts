import { registerTool } from '@/tools/registry';
import { Category } from '@/tools/types';
import type { Tool, ToolShareState } from '@/tools/types';

const tool: Tool = {
  id: 'json-formatter',
  name: 'JSON 格式化',
  category: Category.ENCODING,
  route: '/json',
  description: '格式化、验证、压缩 JSON 数据',
  keywords: ['json', 'format', 'validate', 'minify', 'beautify', '格式化', '压缩', '验证'],
  seoTitle: 'JSON 格式化 — 在线 JSON 美化、验证、压缩工具',
  seoDescription: '免费的在线 JSON 格式化工具，支持 JSON 美化、压缩、语法验证，所有处理在浏览器本地完成，数据不上传服务器。',
  component: () => import('./JsonTool.vue'),
  encodeShareState: (state: ToolShareState) => JSON.stringify(state),
  decodeShareState: (encoded: string) => JSON.parse(encoded) as ToolShareState,
};

registerTool(tool);
