<script setup lang="ts">
import { ref, inject, watch } from 'vue';
import { NButton } from 'naive-ui';
import { encodeBase64, decodeBase64 } from './base64Utils';
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

const { input, direction, clear } = useToolStorage('base64', {
  input: '',
  direction: 'encode' as 'encode' | 'decode',
});

const output = ref('');
const error = ref('');

const setToolState = inject<(state: ToolShareState) => void>('setToolState', () => {});

const directionOptions = [
  { label: '编码', value: 'encode' },
  { label: '解码', value: 'decode' },
];

const updateShareState = () => {
  setToolState({ input: input.value, direction: direction.value });
};

const run = () => {
  const result = direction.value === 'encode' ? encodeBase64(input.value) : decodeBase64(input.value);
  if (result.success) {
    output.value = result.data ?? '';
    error.value = '';
  } else {
    output.value = '';
    error.value = result.error ?? '';
  }
  updateShareState();
};

useSharedStateRestore({ input, direction }, () => {
  if (input.value) run();
});

watch([input, direction], () => updateShareState());
</script>

<template>
  <ToolLayout title="Base64 编解码">
    <ModeToggle v-model="direction" :options="directionOptions" />
    <IoLayout>
      <template #input>
        <ToolInput
          v-model="input"
          :placeholder="direction === 'encode' ? '输入要编码的文本...' : '输入 Base64 字符串...'"
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
      <n-button type="primary" style="min-width: 160px" @click="run">执行</n-button>
    </div>
  </ToolLayout>
</template>
