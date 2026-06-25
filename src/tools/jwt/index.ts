import { registerTool } from '@/tools/registry';
import { Category } from '@/tools/types';
import type { Tool, ToolShareState } from '@/tools/types';

const tool: Tool = {
  id: 'jwt-decoder',
  name: 'JWT 解码',
  category: Category.NETWORK,
  route: '/jwt',
  description: 'JWT Token 解码，查看 Header、Payload、Signature',
  keywords: ['jwt', 'token', 'decode', 'jsonwebtoken', '解析', '令牌'],
  seoTitle: 'JWT 解码 — 在线 JWT Token 解析工具',
  seoDescription: '免费在线 JWT 解码工具，解析 Token 的 Header、Payload、Signature，支持 RS256/HS256 等算法识别，数据不上传服务器。',
  component: () => import('./JwtTool.vue'),
  encodeShareState: (s) => JSON.stringify(s),
  decodeShareState: (e) => JSON.parse(e) as ToolShareState,
};

registerTool(tool);
