<script setup lang="ts">
import { provide, ref, watch } from 'vue';
import { NConfigProvider, NMessageProvider, NLayout, NLayoutHeader, NLayoutContent } from 'naive-ui';
import AppHeader from '@/components/layout/AppHeader.vue';
import AppSidebar from '@/components/layout/AppSidebar.vue';
import ToolContentArea from '@/components/layout/ToolContentArea.vue';
import { useTheme } from '@/composables/useTheme';
import { provideBrand } from '@/composables/useBrand';
import type { ToolShareState } from '@/tools/types';

const { naiveTheme, themeOverrides } = useTheme();

// Brand detection — runs once before provide
const brand = provideBrand();

// Dynamic favicon — brand-level, persists across navigation
watch(() => brand.value.faviconPath, (path) => {
  const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null;
  if (favicon) favicon.href = path;
}, { immediate: true });

// Shared tool state for share functionality
const toolState = ref<ToolShareState>({});
const setToolState = (state: ToolShareState) => {
  toolState.value = state;
};
provide('toolState', toolState);
provide('setToolState', setToolState);

// Mobile sidebar toggle
const sidebarOpen = ref(false);
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};
</script>

<template>
  <n-config-provider :theme="naiveTheme" :theme-overrides="themeOverrides">
    <n-message-provider>
      <div class="app-shell">
        <AppSidebar :class="{ open: sidebarOpen }" />
        <div v-if="sidebarOpen" class="sidebar-backdrop" @click="sidebarOpen = false" />
        <div class="app-main">
          <n-layout-header bordered class="app-header">
            <AppHeader @toggle-sidebar="toggleSidebar" />
          </n-layout-header>
          <n-layout-content class="app-content">
            <ToolContentArea />
          </n-layout-content>
        </div>
      </div>
    </n-message-provider>
  </n-config-provider>
</template>

<style scoped>
.app-shell {
  display: flex;
  min-height: 100vh;
}

.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.app-header {
  flex-shrink: 0;
}

.app-content {
  flex: 1;
  overflow-y: auto;
}

.sidebar-backdrop {
  display: none;
}

@media (max-width: 768px) {
  .sidebar-backdrop {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 199;
  }
}
</style>
