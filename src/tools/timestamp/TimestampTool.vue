<script setup lang="ts">
import { ref, inject } from 'vue';
import { NButton, NSpace } from 'naive-ui';
import { timestampToDate, dateToTimestamp, getCurrentTimestamp } from './timestampUtils';
import type { TimestampInfo } from './timestampUtils';
import ResultPanel from '@/components/common/ResultPanel.vue';
import ErrorAlert from '@/components/common/ErrorAlert.vue';
import CopyButton from '@/components/common/CopyButton.vue';
import ToolLayout from '@/components/common/ToolLayout.vue';
import ModeToggle from '@/components/common/ModeToggle.vue';
import ToolInput from '@/components/common/ToolInput.vue';
import IoLayout from '@/components/common/IoLayout.vue';
import { useToolStorage } from '@/composables/useToolStorage';
import { useSharedStateRestore } from '@/composables/useSharedStateRestore';
import type { ToolShareState } from '@/tools/types';

const { input, mode, clear } = useToolStorage('timestamp', {
  input: '',
  mode: 'ts-to-date' as 'ts-to-date' | 'date-to-ts',
});

const result = ref<TimestampInfo | null>(null);
const tsResult = ref(0);
const error = ref('');

const setToolState = inject<(state: ToolShareState) => void>('setToolState', () => {});

const modeOptions = [
  { label: '时间戳 → 日期', value: 'ts-to-date' },
  { label: '日期 → 时间戳', value: 'date-to-ts' },
];

const resultRows = (): { label: string; value: string }[] => {
  if (!result.value) return [];
  const r = result.value;
  return [
    { label: 'Unix 秒', value: String(r.unixSeconds) },
    { label: 'Unix 毫秒', value: String(r.unixMillis) },
    { label: 'UTC 时间', value: r.utc },
    { label: '本地时间', value: r.local },
    { label: 'ISO 8601', value: r.iso8601 },
    { label: '相对时间', value: r.relative },
  ];
};

const updateShareState = () => {
  setToolState({ input: input.value, mode: mode.value });
};

const run = () => {
  result.value = null;
  tsResult.value = 0;
  error.value = '';
  if (mode.value === 'ts-to-date') {
    const ts = Number(input.value.trim());
    if (!input.value.trim() || isNaN(ts)) {
      error.value = '请输入有效的时间戳';
      return;
    }
    result.value = timestampToDate(ts);
  } else {
    const res = dateToTimestamp(input.value);
    if (!res.success) {
      error.value = res.error;
      return;
    }
    tsResult.value = res.data;
  }
  updateShareState();
};

const useNow = () => {
  input.value = String(getCurrentTimestamp());
  mode.value = 'ts-to-date';
  run();
};

useSharedStateRestore({ input, mode }, () => {
  if (input.value) run();
});
</script>

<template>
  <ToolLayout title="时间戳转换">
    <ModeToggle v-model="mode" :options="modeOptions" />
    <IoLayout>
      <template #input>
        <n-space :size="8">
          <ToolInput
            v-model="input"
            type="text"
            :placeholder="mode === 'ts-to-date' ? '输入时间戳，例如 1609459200' : '输入日期，例如 2021-01-01'"
            style="flex: 1"
          />
          <n-button v-if="mode === 'ts-to-date'" @click="useNow" secondary>当前时间</n-button>
        </n-space>
        <ErrorAlert v-if="error" :message="error" />
      </template>
      <template #output>
        <!-- ts-to-date: individual rows with per-field copy -->
        <div v-if="result" class="result-rows">
          <div v-for="row in resultRows()" :key="row.label" class="result-row">
            <span class="result-label">{{ row.label }}</span>
            <code class="result-value">{{ row.value }}</code>
            <CopyButton :text="row.value" />
          </div>
        </div>
        <!-- date-to-ts: single value -->
        <ResultPanel v-else :text="tsResult ? `Unix 时间戳（秒）: ${tsResult}` : ''">
          <template #actions>
            <CopyButton v-if="tsResult" :text="String(tsResult)" />
          </template>
        </ResultPanel>
      </template>
    </IoLayout>
    <div class="tool-actions">
      <n-button secondary @click="clear">清除</n-button>
      <n-button type="primary" style="min-width: 160px" @click="run">转换</n-button>
    </div>
  </ToolLayout>
</template>

<style scoped>
.result-rows {
  background: var(--app-bg-soft);
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius);
  padding: var(--app-spacing-sm) var(--app-spacing-md);
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: auto;
  max-height: calc(100vh - 280px);
  min-height: 120px;
}

.result-row {
  display: flex;
  align-items: center;
  gap: var(--app-spacing-sm);
  padding: 6px 0;
}

.result-row + .result-row {
  border-top: 1px solid var(--app-border);
}

.result-label {
  font-size: 12px;
  color: var(--app-text-muted);
  min-width: 70px;
  flex-shrink: 0;
}

.result-value {
  font-family: var(--app-font-mono);
  font-size: 13px;
  color: var(--app-text);
  flex: 1;
  word-break: break-all;
  background: transparent;
  padding: 0;
}
</style>
