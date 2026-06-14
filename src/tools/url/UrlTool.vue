<script setup lang="ts">
import { ref, inject, watch } from 'vue';
import { NButton, NCheckbox } from 'naive-ui';
import { encodeUrl, decodeUrl } from './urlUtils';
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

const { input, direction, fullEncode, clear } = useToolStorage('url', {
  input: '',
  direction: 'encode' as 'encode' | 'decode',
  fullEncode: false,
});

const output = ref('');
const error = ref('');

const setToolState = inject<(state: ToolShareState) => void>('setToolState', () => {});

const directionOptions = [
  { label: '编码', value: 'encode' },
  { label: '解码', value: 'decode' },
];

const updateShareState = () => {
  setToolState({ input: input.value, direction: direction.value, fullEncode: fullEncode.value });
};

const run = () => {
  const result = direction.value === 'encode' ? encodeUrl(input.value, fullEncode.value) : decodeUrl(input.value);
  if (result.success) {
    output.value = result.data ?? '';
    error.value = '';
  } else {
    output.value = '';
    error.value = result.error ?? '';
  }
  updateShareState();
};

useSharedStateRestore({ input, direction, fullEncode }, () => {
  if (input.value) run();
});

watch([input, direction], () => updateShareState());
</script>

<template>
  <ToolLayout title="URL 编解码">
    <ToolOptionsBar>
      <ModeToggle v-model="direction" :options="directionOptions" />
      <n-checkbox v-if="direction === 'encode'" v-model:checked="fullEncode">
        完整编码（含 RFC 3986 非保留字符）
      </n-checkbox>
    </ToolOptionsBar>
    <IoLayout>
      <template #input>
        <ToolInput
          v-model="input"
          :placeholder="direction === 'encode' ? '输入要编码的 URL 或文本...' : '输入 URL 编码字符串...'"
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
