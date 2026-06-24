/**
 * 品牌配置 — 根据域名动态切换 logo、网站名、描述等品牌标识。
 * 精确匹配优先；未匹配时回退到 DEFAULT_BRAND。
 */
export interface BrandConfig {
  siteName: string
  tagline: string
  description: string
  logoPath: string
  faviconPath: string
  headerText: string
}

/** 兜底品牌 — 未匹配到特定域名时使用 */
export const DEFAULT_BRAND: BrandConfig = {
  siteName: '工具网',
  tagline: '开发者日常工具集 — 本地优先，即开即用',
  description: '本地优先开发者工具站 — 所有处理在浏览器本地完成',
  logoPath: 'https://cdn.micono.eu.org/icon/logo.png',
  faviconPath: 'https://cdn.micono.eu.org/icon/logo.png',
  headerText: '精心设计的工具网站，本地优先、即开即用！',
}

/**
 * 域名 → 品牌映射表。
 */
const DOMAIN_BRAND_MAP: Record<string, BrandConfig> = {
  '*.misaka-network.top': {
    siteName: '御坂工具网',
    tagline: '开发者日常工具集 — 本地优先，即开即用',
    description: '本地优先开发者工具站 — 所有处理在浏览器本地完成',
    logoPath: '/logo.png',
    faviconPath: '/favicon.png',
    headerText: '公众号 Misaka 御坂网络精心设计，本地优先、即开即用！',
  },
  '*.keorigin.com': {
    siteName: '科基工具网',
    tagline: '本地优先的开发者工具箱',
    description: '格式化、编码、解码、生成和检查常见开发数据。你的输入只在浏览器本地处理。',
    logoPath: '/keorigin.logo.svg',
    faviconPath: '/keorigin.logo.svg',
    headerText: '精心设计，本地优先、即开即用！',
  }
}

/** 根据 hostname 匹配品牌配置 */
export function resolveBrand(hostname: string): BrandConfig {
  const host = hostname.split(':')[0] ?? hostname
  if (DOMAIN_BRAND_MAP[host]) return DOMAIN_BRAND_MAP[host]
  for (const [key, brand] of Object.entries(DOMAIN_BRAND_MAP))
    if (key.startsWith('*.') && host.endsWith(key.slice(1))) return brand
  return DEFAULT_BRAND
}
