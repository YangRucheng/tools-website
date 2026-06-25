<script setup lang="ts">
import { inject, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { NButton } from 'naive-ui';
import { useTheme } from '@/composables/useTheme';
import { encodeShareParam } from '@/composables/useShareState';
import { getToolByRoute } from '@/tools/registry';
import { SUN_ICON, MOON_ICON, SHARE_ICON, MENU_ICON } from '@/utils/icons';
import { useBrand } from '@/composables/useBrand';
import type { ToolShareState } from '@/tools/types';

defineEmits<{ toggleSidebar: [] }>();

const { isDark, toggle } = useTheme();
const router = useRouter();
const route = useRoute();
const brand = useBrand();

const toolState = inject<{ value: ToolShareState }>('toolState');

const activeTool = computed(() => getToolByRoute(route.path));

const handleShare = () => {
  const tool = activeTool.value;
  if (!tool?.encodeShareState || !toolState) return;
  const encoded = tool.encodeShareState(toolState.value);
  const param = encodeShareParam(encoded);
  const url = `${window.location.origin}${tool.route}?state=${param}`;
  navigator.clipboard.writeText(url).catch(() => {
    // fallback ignored
  });
};
</script>

<template>
  <div class="header">
    <div class="header-left">
      <n-button quaternary circle size="small" class="menu-btn" @click="$emit('toggleSidebar')" title="菜单">
        <span class="icon-inner" v-html="MENU_ICON" />
      </n-button>
      <span class="brand" @click="router.push('/')">{{ brand.headerText }}</span>
    </div>
    <div class="header-right">
      <n-button quaternary circle @click="toggle" :title="isDark ? '浅色模式' : '深色模式'">
        <span class="icon-inner" v-html="isDark ? SUN_ICON : MOON_ICON" />
      </n-button>
      <n-button quaternary circle @click="handleShare" title="分享" v-if="activeTool?.encodeShareState">
        <span class="icon-inner" v-html="SHARE_ICON" />
      </n-button>
    </div>
  </div>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px var(--app-spacing-lg);
  gap: var(--app-spacing-md);
  height: var(--app-header-height);
  max-width: 100%;
  width: 100%;
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
  gap: var(--app-spacing-sm);
}

.menu-btn {
  display: none;
}

.brand {
  font-size: 12px;
  color: var(--app-text-muted);
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 768px) {
  .menu-btn {
    display: inline-flex;
  }
}
</style>
