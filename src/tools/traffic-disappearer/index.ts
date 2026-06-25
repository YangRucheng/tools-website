import { registerTool } from '@/tools/registry';
import { Category } from '@/tools/types';
import type { Tool } from '@/tools/types';

const tool: Tool = {
  id: 'traffic-disappearer',
  name: '流量消失器',
  category: Category.MORE,
  route: '/traffic-disappearer',
  description: '网络测速工具，从各大 CDN 节点测试下载速度与带宽',
  keywords: ['speed', 'test', '网络', '测速', '带宽', '下载', 'ping', 'traffic', '流量'],
  seoTitle: '流量消失器 — 在线网络测速与带宽测试工具',
  seoDescription: '免费在线网络测速工具，从多个 CDN 节点测试下载速度和带宽，实时显示测速结果，帮助诊断网络质量。',
  component: () => import('./TrafficDisappearerTool.vue'),
};

registerTool(tool);
