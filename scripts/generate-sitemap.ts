/**
 * 构建后脚本 — 生成 sitemap.xml 到 dist/ 目录。
 * 运行方式: npx tsx scripts/generate-sitemap.ts
 * 建议在 package.json build 命令后执行。
 *
 * 注意：工具路由需与 src/tools/index.ts 中的注册保持同步。
 */

import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const BASE_URL = 'https://tools.misaka-network.top'

interface SitemapEntry {
  path: string
  lastmod: string
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority: number
}

// 与 src/tools/ 下的工具注册保持同步
const entries: SitemapEntry[] = [
  { path: '/', lastmod: '2025-12-01', changefreq: 'weekly', priority: 1.0 },
  { path: '/json', lastmod: '2025-12-01', changefreq: 'monthly', priority: 0.9 },
  { path: '/base64', lastmod: '2025-12-01', changefreq: 'monthly', priority: 0.9 },
  { path: '/base36', lastmod: '2025-12-01', changefreq: 'monthly', priority: 0.7 },
  { path: '/url', lastmod: '2025-12-01', changefreq: 'monthly', priority: 0.8 },
  { path: '/timestamp', lastmod: '2025-12-01', changefreq: 'monthly', priority: 0.8 },
  { path: '/uuid', lastmod: '2025-12-01', changefreq: 'monthly', priority: 0.7 },
  { path: '/jwt', lastmod: '2025-12-01', changefreq: 'monthly', priority: 0.8 },
  { path: '/hash', lastmod: '2025-12-01', changefreq: 'monthly', priority: 0.8 },
  { path: '/qrcode', lastmod: '2025-12-01', changefreq: 'monthly', priority: 0.8 },
  { path: '/api-key-checker', lastmod: '2025-12-01', changefreq: 'monthly', priority: 0.8 },
  { path: '/traffic-disappearer', lastmod: '2025-06-01', changefreq: 'monthly', priority: 0.8 },
]

const generateSitemap = (baseUrl: string): string => {
  const urls = entries
    .map(
      (e) => `  <url>
    <loc>${baseUrl}${e.path}</loc>
    <lastmod>${e.lastmod}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`,
    )
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`
}

const distDir = resolve(import.meta.dirname ?? __dirname, '..', 'dist')
const sitemap = generateSitemap(BASE_URL)
const outPath = resolve(distDir, 'sitemap.xml')

writeFileSync(outPath, sitemap, 'utf-8')
console.log(`✅ sitemap.xml generated → ${outPath}`)
console.log(`   ${entries.length} URLs for ${BASE_URL}`)
