<script setup lang="ts">
import { ref, inject, watch } from 'vue';
import { NButton, NSelect, NInput } from 'naive-ui';
import { computeHash, computeHmac, ALGORITHMS } from './hashUtils';
import type { HashAlgorithm } from './hashUtils';
import ResultPanel from '@/components/common/ResultPanel.vue';
import ErrorAlert from '@/components/common/ErrorAlert.vue';
import CopyButton from '@/components/common/CopyButton.vue';
import ToolLayout from '@/components/common/ToolLayout.vue';
import ModeToggle from '@/components/common/ModeToggle.vue';
import ToolInput from '@/components/common/ToolInput.vue';
import ToolOptionsBar from '@/components/common/ToolOptionsBar.vue';
import IoLayout from '@/components/common/IoLayout.vue';
import { useToolStorage } from '@/composables/useToolStorage';
import { useSharedStateRestore } from '@/composables/useSharedStateRestore';
import type { ToolShareState } from '@/tools/types';

const { input, algorithm, mode, key, clear } = useToolStorage('hash', {
  input: '',
  algorithm: 'SHA-256' as HashAlgorithm,
  mode: 'hash' as 'hash' | 'hmac',
  key: '',
});

const output = ref('');
const error = ref('');

const setToolState = inject<(state: ToolShareState) => void>('setToolState', () => {});

const modeOptions = [
  { label: '哈希', value: 'hash' },
  { label: 'HMAC', value: 'hmac' },
];

const algoOptions = ALGORITHMS.map((a) => ({ label: a, value: a }));

const updateShareState = () => {
  setToolState({ input: input.value, algorithm: algorithm.value, mode: mode.value });
};

const run = () => {
  const result = mode.value === 'hash'
    ? computeHash(input.value, algorithm.value)
    : computeHmac(input.value, key.value, algorithm.value);
  if (result.success) {
    output.value = result.data ?? '';
    error.value = '';
  } else {
    output.value = '';
    error.value = result.error ?? '';
  }
  updateShareState();
};

useSharedStateRestore({ input, algorithm, mode }, () => {
  if (input.value) run();
});

watch([input, algorithm, mode], () => updateShareState());
</script>

<template>
  <ToolLayout title="哈希计算">
    <ToolOptionsBar>
      <ModeToggle v-model="mode" :options="modeOptions" />
      <n-select v-model:value="algorithm" :options="algoOptions" style="width: 120px" />
    </ToolOptionsBar>
    <IoLayout>
      <template #input>
        <ToolInput v-model="input" placeholder="输入要计算哈希的文本..." :rows="4" />
        <n-input
          v-if="mode === 'hmac'"
          v-model:value="key"
          placeholder="密钥 (Key)"
          :input-props="{ style: { fontFamily: 'var(--app-font-mono)' } }"
        />
        <ErrorAlert v-if="error" :message="error" />
      </template>
      <template #output>
        <ResultPanel :text="output">
          <template #actions>
            <CopyButton v-if="output" :text="output" />
          </template>
        </ResultPanel>
      </template>
    </IoLayout>
    <div class="tool-actions">
      <n-button secondary @click="clear">清除</n-button>
      <n-button type="primary" style="min-width: 160px" @click="run">计算</n-button>
    </div>
  </ToolLayout>
</template>
