import { registerTool } from '@/tools/registry';
import { Category } from '@/tools/types';
import type { Tool, ToolShareState } from '@/tools/types';

const tool: Tool = {
  id: 'jwt-decoder',
  name: 'JWT 解码',
  category: Category.SECURITY,
  route: '/jwt',
  description: 'JWT Token 解码，查看 Header、Payload、Signature',
  keywords: ['jwt', 'token', 'decode', 'jsonwebtoken', '解析', '令牌'],
  component: () => import('./JwtTool.vue'),
  encodeShareState: (s) => JSON.stringify(s),
  decodeShareState: (e) => JSON.parse(e) as ToolShareState,
};

registerTool(tool);
