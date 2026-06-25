import { registerTool } from '@/tools/registry';
import { Category } from '@/tools/types';
import type { Tool, ToolShareState } from '@/tools/types';

const tool: Tool = {
  id: 'api-key-checker',
  name: '大模型密钥检查',
  category: Category.MORE,
  route: '/api-key-checker',
  description: '批量检查 DeepSeek、智谱等大模型 API Key 是否可用，支持余额查询',
  keywords: ['api', 'key', 'apikey', 'secret', 'deepseek', 'zhipu', 'glm', '密钥', '检查', '余额'],
  seoTitle: '大模型密钥检查 — DeepSeek、智谱 API Key 批量检测与余额查询',
  seoDescription: '免费在线大模型 API Key 检测工具，支持 DeepSeek、智谱 GLM 等平台密钥批量验证和余额查询，请求直连官方接口，数据安全。',
  component: () => import('./ApiKeyCheckerTool.vue'),
  encodeShareState: (s) => JSON.stringify(s),
  decodeShareState: (e) => JSON.parse(e) as ToolShareState,
};

registerTool(tool);
