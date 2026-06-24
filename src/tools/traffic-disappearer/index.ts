import { registerTool } from '@/tools/registry';
import { Category } from '@/tools/types';
import type { Tool } from '@/tools/types';

const tool: Tool = {
  id: 'traffic-disappearer',
  name: '流量消失器',
  category: Category.LLM,
  route: '/traffic-disappearer',
  description: '网络测速工具，从各大 CDN 节点测试下载速度与带宽',
  keywords: ['speed', 'test', '网络', '测速', '带宽', '下载', 'ping', 'traffic', '流量'],
  component: () => import('./TrafficDisappearerTool.vue'),
};

registerTool(tool);
