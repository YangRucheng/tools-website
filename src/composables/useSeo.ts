/**
 * SEO 头部管理 — 统一管理 document title、meta、link 标签。
 * 在路由 afterEach 中调用，为每个页面设置独立的 SEO 信息。
 */
export interface SeoInput {
  title: string
  description: string
  url: string
  image?: string
  type?: string
}

export const updateSeoHead = (input: SeoInput): void => {
  const { title, description, url, image, type = 'website' } = input

  // Title
  document.title = title

  // Helper: set or create a <meta> tag
  const setMeta = (name: string, content: string, isProperty = false): void => {
    const attr = isProperty ? 'property' : 'name'
    let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null
    if (!el) {
      el = document.createElement('meta')
      el.setAttribute(attr, name)
      document.head.appendChild(el)
    }
    el.setAttribute('content', content)
  }

  // Basic meta
  setMeta('description', description)

  // Open Graph
  setMeta('og:title', title, true)
  setMeta('og:description', description, true)
  setMeta('og:url', url, true)
  setMeta('og:type', type, true)
  if (image) {
    setMeta('og:image', image, true)
  }

  // Twitter Card
  setMeta('twitter:card', 'summary')
  setMeta('twitter:title', title)
  setMeta('twitter:description', description)
  if (image) {
    setMeta('twitter:image', image)
  }

  // Canonical URL
  let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
  if (!canonical) {
    canonical = document.createElement('link')
    canonical.rel = 'canonical'
    document.head.appendChild(canonical)
  }
  canonical.href = url
}

/** 根据当前 hostname 构造完整 URL */
export const buildFullUrl = (path: string): string =>
  `${window.location.origin}${path}`
