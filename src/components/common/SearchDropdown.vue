<script setup lang="ts">
import { computed } from 'vue';
import { NPopover, NInput } from 'naive-ui';
import { useToolSearch } from '@/composables/useToolSearch';
import { SEARCH_ICON } from '@/utils/icons';

const { query, selectedIndex, results, selectTool, onKeydown } = useToolSearch();

const emit = defineEmits<{ select: [route: string] }>();

const showResults = computed(() => results.value.length > 0);
</script>

<template>
  <n-popover
    :show="showResults"
    trigger="manual"
    placement="bottom-start"
    :width="320"
  >
    <template #trigger>
      <n-input
        v-model:value="query"
        clearable
        placeholder="搜索工具..."
        @keydown="onKeydown"
        style="width: 280px"
      >
        <template #prefix>
          <span class="icon-inner" v-html="SEARCH_ICON" />
        </template>
      </n-input>
    </template>
    <div class="search-results">
      <div
        v-for="(tool, i) in results"
        :key="tool.id"
        class="search-item"
        :class="{ active: i === selectedIndex }"
        @mousedown.prevent="emit('select', selectTool(tool))"
      >
        <span class="search-item-name">{{ tool.name }}</span>
        <span class="search-item-desc">{{ tool.description }}</span>
      </div>
    </div>
  </n-popover>
</template>

<style scoped>
.search-results {
  max-height: 360px;
  overflow-y: auto;
  padding: var(--app-spacing-xs) 0;
}

.search-item {
  padding: var(--app-spacing-sm) var(--app-spacing-md);
  cursor: pointer;
  border-radius: var(--app-radius-sm);
  transition: background 0.15s;
}

.search-item:hover,
.search-item.active {
  background: var(--app-surface-hover);
}

.search-item-name {
  display: block;
  font-weight: 500;
}

.search-item-desc {
  display: block;
  font-size: 12px;
  color: var(--app-text-muted);
  margin-top: 2px;
}
</style>
