import { createRouter, createWebHistory } from 'vue-router';
import { getTools, getToolByRoute } from '@/tools/registry';
import { decodeShareParam } from '@/composables/useShareState';
import { updateSeoHead, buildFullUrl } from '@/composables/useSeo';
import { injectStructuredData } from '@/composables/useStructuredData';
import { resolveBrand } from '@/config/brand';
import type { ToolShareState } from '@/tools/types';

// Ensure side-effect imports that register all tools have run before creating routes
import '@/tools';

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/components/home/HomePage.vue'),
  },
  ...getTools().map((tool) => ({
    path: tool.route,
    name: tool.id,
    component: tool.component,
  })),
  { path: '/:pathMatch(.*)*', redirect: '/' },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Shared state from ?state= param, decoded once on navigation
export const sharedState = { value: null as ToolShareState | null };

router.beforeEach((to) => {
  const stateParam = to.query.state;
  if (typeof stateParam === 'string' && stateParam) {
    try {
      sharedState.value = decodeShareParam(stateParam) as ToolShareState;
    } catch {
      sharedState.value = null;
    }
  } else {
    sharedState.value = null;
  }
});

// SEO: set per-page title, meta tags, structured data after each navigation
router.afterEach((to) => {
  const brand = resolveBrand(window.location.hostname);
  const url = buildFullUrl(to.fullPath);

  if (to.name === 'home') {
    updateSeoHead({
      title: `${brand.siteName} — ${brand.tagline}`,
      description: brand.description,
      url,
      image: brand.logoPath,
    });
    injectStructuredData({
      type: 'home',
      brandName: brand.siteName,
      brandDescription: brand.description,
      url,
      logoUrl: brand.logoPath,
    });
    return;
  }

  const tool = getToolByRoute(to.path);
  if (tool) {
    updateSeoHead({
      title: tool.seoTitle ?? `${tool.name} — ${brand.siteName}`,
      description: tool.seoDescription ?? tool.description,
      url,
      image: brand.logoPath,
    });
    injectStructuredData({
      type: 'tool',
      brandName: brand.siteName,
      brandDescription: brand.description,
      url,
      tool,
    });
  }
});
