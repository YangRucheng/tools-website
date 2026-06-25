import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import { writeFileSync } from 'node:fs';

/** Build-time sitemap / robots generation */
const sitemapPlugin = () => {
  const BASE_URL = 'https://tools.misaka-network.top'

  // 与 src/tools/ 下的工具注册保持同步
  const entries = [
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

  const generateSitemap = () => {
    const urls = entries
      .map((e) => `  <url>
    <loc>${BASE_URL}${e.path}</loc>
    <lastmod>${e.lastmod}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`)
      .join('\n')

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`
  }

  return {
    name: 'sitemap-generator',
    closeBundle() {
      const dist = resolve(__dirname, 'dist')
      writeFileSync(resolve(dist, 'sitemap.xml'), generateSitemap(), 'utf-8')
      writeFileSync(
        resolve(dist, 'robots.txt'),
        `User-agent: *\nAllow: /\nSitemap: ${BASE_URL}/sitemap.xml\n`,
        'utf-8',
      )
      console.log(`  ✅ sitemap.xml + robots.txt generated (${entries.length} URLs)`)
    },
  }
}

export default defineConfig({
  plugins: [vue(), sitemapPlugin()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    target: 'esnext',
    modulePreload: false,
    assetsDir: 'misaka-assets',
  },
});
