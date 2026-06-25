import { registerTool } from '@/tools/registry';
import { Category } from '@/tools/types';
import type { Tool, ToolShareState } from '@/tools/types';

const tool: Tool = {
  id: 'random-key',
  name: '随机密钥生成',
  category: Category.GENERATION,
  route: '/random-key',
  description: '生成 32 / 48 / 64 位安全随机密钥，支持大小写',
  keywords: ['random', 'key', 'secret', 'token', 'password', '随机', '密钥', '密码', 'token'],
  seoTitle: '随机密钥生成器 — 在线生成 32/48/64 位安全随机密钥',
  seoDescription: '免费在线随机密钥生成器，基于 crypto.getRandomValues 生成 32/48/64 位安全随机字符串，支持大小写切换，所有生成在浏览器本地完成。',
  component: () => import('./RandomKeyTool.vue'),
  encodeShareState: (s) => JSON.stringify(s),
  decodeShareState: (e) => JSON.parse(e) as ToolShareState,
};

registerTool(tool);
