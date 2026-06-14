<script setup lang="ts">
import { NInput } from 'naive-ui';

defineProps<{
  modelValue: string;
  placeholder?: string;
  rows?: number;
  type?: 'text' | 'textarea';
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();
</script>

<template>
  <n-input
    :value="modelValue"
    :type="type ?? 'textarea'"
    :placeholder="placeholder"
    :autosize="type === 'text' ? undefined : { minRows: rows ?? 12, maxRows: 30 }"
    :input-props="{ style: { fontFamily: 'var(--app-font-mono)', fontSize: '13px' } }"
    @update:value="emit('update:modelValue', $event)"
  />
</template>