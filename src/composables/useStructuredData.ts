/**
 * 结构化数据 (JSON-LD) — 为搜索引擎提供富文本摘要。
 * 首页注入 WebSite + Organization，工具页注入 WebApplication。
 */
import type { Tool } from '@/tools/types'

export interface StructuredDataInput {
  type: 'home' | 'tool'
  brandName: string
  brandDescription: string
  url: string
  logoUrl?: string
  tool?: Tool
}

export const injectStructuredData = (input: StructuredDataInput): void => {
  const scriptId = 'structured-data'

  // Remove previous JSON-LD if exists
  const old = document.getElementById(scriptId)
  if (old) old.remove()

  let json: Record<string, unknown>

  if (input.type === 'home') {
    json = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: input.brandName,
      description: input.brandDescription,
      url: input.url,
      ...(input.logoUrl ? { image: input.logoUrl } : {}),
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${input.url}?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    }
  } else {
    json = {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: input.tool?.name ?? input.brandName,
      description: input.tool?.description ?? input.brandDescription,
      url: input.url,
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Any',
      browserRequirements: 'Requires JavaScript',
    }
  }

  const script = document.createElement('script')
  script.id = scriptId
  script.type = 'application/ld+json'
  script.textContent = JSON.stringify(json)
  document.head.appendChild(script)
}

/** 移除结构化数据（切换到无 schema 的页面时调用） */
export const removeStructuredData = (): void => {
  const el = document.getElementById('structured-data')
  if (el) el.remove()
}
