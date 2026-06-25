import { registerTool } from '@/tools/registry';
import { Category } from '@/tools/types';
import type { Tool, ToolShareState } from '@/tools/types';

const tool: Tool = {
  id: 'hash',
  name: '哈希计算',
  category: Category.GENERATION,
  route: '/hash',
  description: 'MD5、SHA-1、SHA-256、SHA-512 哈希和 HMAC 计算',
  keywords: ['hash', 'md5', 'sha', 'hmac', 'digest', '哈希', '散列', '摘要'],
  seoTitle: '哈希计算 — 在线 MD5、SHA-1、SHA-256、SHA-512 哈希工具',
  seoDescription: '免费在线哈希计算工具，支持 MD5、SHA-1、SHA-256、SHA-512 及 HMAC 消息认证码，所有计算在浏览器本地完成，数据安全。',
  component: () => import('./HashTool.vue'),
  encodeShareState: (s) => JSON.stringify(s),
  decodeShareState: (e) => JSON.parse(e) as ToolShareState,
};

registerTool(tool);
