import { registerTool } from '@/tools/registry';
import { Category } from '@/tools/types';
import type { Tool, ToolShareState } from '@/tools/types';

const tool: Tool = {
  id: 'api-key-checker',
  name: '大模型密钥检查',
  category: Category.MORE,
  route: '/api-key-checker',
  description: '批量检查大模型 API Key 是否可用，支持 OpenAI/Anthropic 格式与余额查询，覆盖智谱、DeepSeek、Anthropic 及自定义端点',
  keywords: ['api', 'key', 'apikey', 'secret', 'deepseek', 'zhipu', 'glm', 'anthropic', 'claude', 'opus', 'openai', '密钥', '检查', '余额', '自定义端点'],
  seoTitle: '大模型密钥检查 — OpenAI/Anthropic 格式 + 余额查询，支持智谱、DeepSeek、Anthropic 及自定义端点',
  seoDescription: '免费在线大模型 API Key 检测工具，支持 OpenAI 与 Anthropic 接口格式及余额查询，覆盖智谱 GLM、DeepSeek、Anthropic Claude 及任意自定义兼容端点，可自定义测试模型，请求直连官方接口，数据安全。',
  component: () => import('./ApiKeyCheckerTool.vue'),
  encodeShareState: (s) => JSON.stringify(s),
  decodeShareState: (e) => JSON.parse(e) as ToolShareState,
};

registerTool(tool);
