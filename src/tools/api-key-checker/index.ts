import { registerTool } from '@/tools/registry';
import { Category } from '@/tools/types';
import type { Tool, ToolShareState } from '@/tools/types';

const tool: Tool = {
  id: 'api-key-checker',
  name: '大模型密钥检查',
  category: Category.LLM,
  route: '/api-key-checker',
  description: '批量检查 DeepSeek、智谱等大模型 API Key 是否可用，支持余额查询',
  keywords: ['api', 'key', 'apikey', 'secret', 'deepseek', 'zhipu', 'glm', '密钥', '检查', '余额'],
  component: () => import('./ApiKeyCheckerTool.vue'),
  encodeShareState: (s) => JSON.stringify(s),
  decodeShareState: (e) => JSON.parse(e) as ToolShareState,
};

registerTool(tool);
