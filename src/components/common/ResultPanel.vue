<script setup lang="ts">
import { NInput } from 'naive-ui';

defineProps<{
  text: string;
  editable?: boolean;
  placeholder?: string;
}>();

const emit = defineEmits<{
  'update:text': [value: string];
}>();
</script>

<template>
  <div class="result-panel">
    <n-input
      v-if="editable"
      :value="text"
      type="textarea"
      :placeholder="placeholder ?? '暂无输出'"
      :autosize="{ minRows: 12, maxRows: 30 }"
      :input-props="{ style: { fontFamily: 'var(--app-font-mono)', fontSize: '13px' } }"
      @update:value="emit('update:text', $event)"
    />
    <pre v-else-if="text" class="result-text">{{ text }}</pre>
    <div v-else class="result-placeholder">{{ placeholder ?? '暂无输出' }}</div>
    <slot name="actions" />
  </div>
</template>

<style scoped>
.result-panel {
  background: var(--app-bg-soft);
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius);
  padding: var(--app-spacing-md);
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 120px;
}

.result-text {
  font-family: var(--app-font-mono);
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
  color: var(--app-text);
  margin: 0;
  overflow: auto;
  flex: 1;
}

.result-placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: var(--app-text-muted);
  user-select: none;
  min-height: 80px;
}
</style>