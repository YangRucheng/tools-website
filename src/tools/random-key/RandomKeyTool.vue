<script setup lang="ts">
import { ref, inject } from 'vue';
import { NButton, NInputNumber, NSelect, NCheckbox } from 'naive-ui';
import { generateRandomKeys } from './randomKeyUtils';
import type { KeyLength } from './randomKeyUtils';
import CopyButton from '@/components/common/CopyButton.vue';
import ToolLayout from '@/components/common/ToolLayout.vue';
import ToolOptionsBar from '@/components/common/ToolOptionsBar.vue';
import { useToolStorage } from '@/composables/useToolStorage';
import type { ToolShareState } from '@/tools/types';

const { count, keyLength, uppercase, clear } = useToolStorage('random-key', {
  count: 5,
  keyLength: 32 as KeyLength,
  uppercase: true,
});

const results = ref<string[]>([]);

const setToolState = inject<(state: ToolShareState) => void>('setToolState', () => {});

const lengthOptions: { label: string; value: KeyLength }[] = [
  { label: '32 位', value: 32 },
  { label: '48 位', value: 48 },
  { label: '64 位', value: 64 },
];

const runGenerate = () => {
  results.value = generateRandomKeys(count.value, keyLength.value, uppercase.value);
  setToolState({ count: count.value, keyLength: keyLength.value, uppercase: uppercase.value });
};
</script>

<template>
  <ToolLayout title="随机密钥生成">
    <ToolOptionsBar class="key-options">
      <span class="option-label">长度:</span>
      <n-select v-model:value="keyLength" :options="lengthOptions" style="width: 110px" />
      <span class="option-label">数量:</span>
      <n-input-number v-model:value="count" :min="1" :max="100" style="width: 100px" />
      <n-checkbox v-model:checked="uppercase">大写字母</n-checkbox>
    </ToolOptionsBar>

    <div class="tool-actions">
      <n-button secondary @click="clear">重置</n-button>
      <n-button type="primary" style="min-width: 160px" @click="runGenerate">生成密钥</n-button>
    </div>

    <div v-if="results.length" class="key-list">
      <div v-for="(key, i) in results" :key="i" class="key-row">
        <span class="key-index">{{ i + 1 }}.</span>
        <code>{{ key }}</code>
        <CopyButton :text="key" />
      </div>
    </div>
  </ToolLayout>
</template>

<style scoped>
.key-options {
  margin-top: var(--app-spacing-md);
}

.option-label {
  font-size: 13px;
  color: var(--app-text-muted);
}

.key-list {
  display: flex;
  flex-direction: column;
  gap: var(--app-spacing-sm);
  margin-top: var(--app-spacing-md);
}

.key-row {
  display: flex;
  align-items: center;
  gap: var(--app-spacing-sm);
  padding: var(--app-spacing-sm) var(--app-spacing-md);
  background: var(--app-bg-soft);
  border-radius: var(--app-radius-sm);
  border: 1px solid var(--app-border);
}

.key-index {
  font-size: 12px;
  color: var(--app-text-muted);
  min-width: 24px;
  flex-shrink: 0;
}

.key-row code {
  font-family: var(--app-font-mono);
  font-size: 13px;
  flex: 1;
  word-break: break-all;
  color: var(--app-text);
}
</style>
