<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { NInput } from 'naive-ui';
import { ORDERED_CATEGORIES, CATEGORY_META } from '@/tools/categories';
import { getToolsByCategory, getToolByRoute, searchTools } from '@/tools/registry';
import { Category } from '@/tools/types';
import { DATA_ICON, ENCODE_ICON, TIME_ICON, SECURITY_ICON, GENERATE_ICON, TOOLS_ICON, SEARCH_ICON } from '@/utils/icons';

const router = useRouter();
const route = useRoute();

const searchQuery = ref('');
const showResults = ref(false);

const activeTool = computed(() => getToolByRoute(route.path));

const results = computed(() => searchTools(searchQuery.value));

const categoryIconMap: Record<Category, string> = {
  [Category.DATA_PROCESSING]: DATA_ICON,
  [Category.ENCODING]: ENCODE_ICON,
  [Category.TIME_ID]: TIME_ICON,
  [Category.SECURITY]: SECURITY_ICON,
  [Category.GENERATION]: GENERATE_ICON,
  [Category.LLM]: TOOLS_ICON,
};

const isActive = (toolId: string) => activeTool.value?.id === toolId;

const selectTool = (tool: { route: string }) => {
  searchQuery.value = '';
  showResults.value = false;
  router.push(tool.route);
};

const handleSearchKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && results.value.length > 0) {
    selectTool(results.value[0]);
  }
};
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-brand" @click="router.push('/')">
      <img src="/logo.png" alt="logo" class="brand-logo" />
      <span class="brand-text">御坂工具网</span>
    </div>

    <div class="sidebar-search">
      <n-input
        v-model:value="searchQuery"
        clearable
        placeholder="搜索工具..."
        size="small"
        @focus="showResults = true"
        @blur="showResults = false"
        @keydown="handleSearchKeydown"
      >
        <template #prefix>
          <span class="icon-inner" v-html="SEARCH_ICON" />
        </template>
      </n-input>
      <div v-if="showResults && searchQuery && results.length > 0" class="search-dropdown">
        <div
          v-for="tool in results"
          :key="tool.id"
          class="search-item"
          @mousedown.prevent="selectTool(tool)"
        >
          <span class="search-item-name">{{ tool.name }}</span>
          <span class="search-item-cat">{{ CATEGORY_META[tool.category].label }}</span>
        </div>
      </div>
    </div>

    <nav class="sidebar-nav">
      <div
        v-for="cat in ORDERED_CATEGORIES"
        :key="cat"
        class="category-group"
      >
        <div class="category-header">
          <span class="category-icon" v-html="categoryIconMap[cat]" />
          <span class="category-label">{{ CATEGORY_META[cat].label }}</span>
        </div>
        <div
          v-for="tool in getToolsByCategory(cat)"
          :key="tool.id"
          class="tool-item"
          :class="{ active: isActive(tool.id) }"
          @click="selectTool(tool)"
        >
          <span class="tool-name">{{ tool.name }}</span>
        </div>
      </div>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  width: var(--app-sidebar-width);
  height: 100vh;
  background: var(--app-sidebar-bg);
  border-right: 1px solid var(--app-border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow-y: auto;
  position: sticky;
  top: 0;
}

.sidebar-brand {
  padding: var(--app-spacing-md) var(--app-spacing-md) var(--app-spacing-sm);
  cursor: pointer;
  user-select: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
}

.brand-logo {
  width: 60%;
  max-width: 140px;
  height: auto;
  object-fit: contain;
  flex-shrink: 0;
}

.brand-text {
  font-size: 20px;
  font-weight: 800;
  background: var(--app-gradient-text);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 1px;
  text-align: center;
  width: 100%;
}

.sidebar-search {
  padding: var(--app-spacing-sm) var(--app-spacing-md);
  position: relative;
}

.search-dropdown {
  position: absolute;
  top: 100%;
  left: var(--app-spacing-md);
  right: var(--app-spacing-md);
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-sm);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 100;
  max-height: 240px;
  overflow-y: auto;
}

.search-item {
  padding: var(--app-spacing-sm) var(--app-spacing-md);
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background 0.15s;
}

.search-item:hover {
  background: var(--app-surface-hover);
}

.search-item-name {
  font-weight: 500;
  font-size: 13px;
}

.search-item-cat {
  font-size: 11px;
  color: var(--app-text-muted);
}

.sidebar-nav {
  flex: 1;
  padding: var(--app-spacing-sm) 0;
  overflow-y: auto;
}

.category-group {
  margin-bottom: var(--app-spacing-xs);
}

.category-header {
  display: flex;
  align-items: center;
  gap: var(--app-spacing-sm);
  padding: var(--app-spacing-sm) var(--app-spacing-md);
  font-size: 12px;
  font-weight: 600;
  color: var(--app-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.category-icon {
  display: inline-flex;
  align-items: center;
  opacity: 0.6;
}

.tool-item {
  display: flex;
  align-items: center;
  padding: var(--app-spacing-sm) var(--app-spacing-md);
  padding-left: 44px;
  cursor: pointer;
  font-size: 14px;
  color: var(--app-text);
  border-left: 3px solid transparent;
  transition: all 0.15s;
  user-select: none;
}

.tool-item:hover {
  background: var(--app-surface-hover);
}

.tool-item.active {
  background: var(--app-primary-soft);
  color: var(--app-primary);
  border-left-color: var(--app-primary);
  font-weight: 500;
}

.icon-inner {
  color: var(--app-text-muted);
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    z-index: 200;
    transform: translateX(-100%);
    transition: transform 0.25s ease;
  }

  .sidebar.open {
    transform: translateX(0);
  }
}
</style>
