<script setup lang="ts">
defineProps<{
  modelValue: string;
  options: { label: string; value: string }[];
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();
</script>

<template>
  <div class="mode-toggle">
    <button
      v-for="opt in options"
      :key="opt.value"
      class="mode-btn"
      :class="{ active: modelValue === opt.value }"
      @click="emit('update:modelValue', opt.value)"
    >
      {{ opt.label }}
    </button>
  </div>
</template>

<style scoped>
.mode-toggle {
  display: inline-flex;
  background: var(--app-bg-soft);
  border: 1px solid var(--app-border);
  border-radius: 8px;
  padding: 3px;
}

.mode-btn {
  padding: 6px 16px;
  border: none;
  background: transparent;
  color: var(--app-text-muted);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
  white-space: nowrap;
  font-family: inherit;
}

.mode-btn:hover {
  color: var(--app-text);
}

.mode-btn.active {
  background: var(--app-primary);
  color: #ffffff;
  box-shadow: 0 1px 3px rgba(37, 99, 235, 0.3);
}
</style>
