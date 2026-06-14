import { ref, computed } from 'vue';
import { searchTools } from '@/tools/registry';
import type { Tool } from '@/tools/types';

export const useToolSearch = () => {
  const query = ref('');
  const selectedIndex = ref(0);

  const results = computed<Tool[]>(() => {
    const q = query.value.trim();
    return q.length > 0 ? searchTools(q) : [];
  });

  const selectTool = (tool: Tool) => {
    query.value = '';
    selectedIndex.value = 0;
    return tool.route;
  };

  const onKeydown = (e: KeyboardEvent) => {
    if (results.value.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex.value = (selectedIndex.value + 1) % results.value.length;
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex.value = (selectedIndex.value - 1 + results.value.length) % results.value.length;
    }
  };

  return { query, selectedIndex, results, selectTool, onKeydown };
};
