import { createRouter, createWebHashHistory } from 'vue-router';
import { getTools } from '@/tools/registry';
import { decodeShareParam } from '@/composables/useShareState';
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
  history: createWebHashHistory(),
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
