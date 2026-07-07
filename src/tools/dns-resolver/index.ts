import { registerTool } from '@/tools/registry';
import { Category } from '@/tools/types';
import type { Tool } from '@/tools/types';

const tool: Tool = {
  id: 'dns-resolver',
  name: 'DNS 解析',
  category: Category.MORE,
  route: '/dns-resolver',
  description: '查询域名在全国各区域、各运营商的 DNS 解析结果，并发请求实时展示',
  keywords: ['dns', 'resolve', 'doh', '域名', '解析', 'ip', '区域', '运营商', '电信', '联通', '移动', 'edns'],
  seoTitle: 'DNS 解析 — 全国多区域多运营商 DNS 查询工具',
  seoDescription: '免费在线 DNS 解析工具，通过阿里 DoH 接口并发查询域名在全国各区域、各运营商（电信/联通/移动/港澳台）的 A 记录解析结果，实时展示对比。',
  component: () => import('./DnsResolverTool.vue'),
};

registerTool(tool);
