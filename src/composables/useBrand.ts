/**
 * 品牌组合式 API — 根据域名解析品牌配置，provide/inject 共享。
 */
import { computed, inject, provide, type InjectionKey, type Ref } from 'vue'
import { resolveBrand, DEFAULT_BRAND, type BrandConfig } from '@/config/brand'

export const BRAND_KEY: InjectionKey<Ref<BrandConfig>> = Symbol('brand')

/** 在 App.vue 的 setup 中调用一次，检测域名并 provide 品牌 */
export function provideBrand(): Ref<BrandConfig> {
  const brand = computed<BrandConfig>(() => resolveBrand(window.location.hostname))
  provide(BRAND_KEY, brand)
  return brand
}

/** 任意子组件中获取当前品牌配置 */
export function useBrand(): BrandConfig {
  const brand = inject(BRAND_KEY)
  if (!brand) {
    // 未 provide 时返回兜底品牌（避免测试/独立使用场景崩溃）
    return DEFAULT_BRAND
  }
  return brand.value
}
