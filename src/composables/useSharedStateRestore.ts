import { onMounted, type Ref } from 'vue';
import { sharedState } from '@/router';
import type { ToolShareState } from '@/tools/types';

/**
 * Restore tool state from shared URL parameter on mount.
 * Clears sharedState after consumption to avoid re-applying.
 * Returns a callback to trigger the tool's run function if input was restored.
 */
export const useSharedStateRestore = (
  stateRefs: Record<string, Ref<unknown>>,
  onRestored?: () => void,
): void => {
  onMounted(() => {
    if (sharedState.value && typeof sharedState.value === 'object') {
      const s = sharedState.value as Record<string, unknown>;
      for (const key of Object.keys(stateRefs)) {
        if (key in s) {
          stateRefs[key].value = s[key];
        }
      }
      sharedState.value = null;
      onRestored?.();
    }
  });
};
