<script setup lang="ts">
import { ref, inject, watch } from 'vue';
import { NButton } from 'naive-ui';
import { encodeBase36, decodeBase36, encodeNumberToBase36, decodeBase36ToNumber } from './base36Utils';
import type { Base36Method } from './base36Utils';
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

const { input, direction, method, clear } = useToolStorage('base36', {
  input: '',
  direction: 'encode' as 'encode' | 'decode',
  method: 'text' as Base36Method,
});

const output = ref('');
const error = ref('');

const setToolState = inject<(state: ToolShareState) => void>('setToolState', () => {});

const directionOptions = [
  { label: '编码', value: 'encode' },
  { label: '解码', value: 'decode' },
];

const methodOptions = [
  { label: '文本编码', value: 'text' },
  { label: '数字转换', value: 'number' },
];

const updateShareState = () => {
  setToolState({ input: input.value, direction: direction.value, method: method.value });
};

const run = () => {
  let result;
  if (method.value === 'number') {
    result = direction.value === 'encode'
      ? encodeNumberToBase36(input.value)
      : decodeBase36ToNumber(input.value);
  } else {
    result = direction.value === 'encode'
      ? encodeBase36(input.value)
      : decodeBase36(input.value);
  }
  if (result.success) {
    output.value = result.data ?? '';
    error.value = '';
  } else {
    output.value = '';
    error.value = result.error ?? '';
  }
  updateShareState();
};

useSharedStateRestore({ input, direction, method }, () => {
  if (input.value) run();
});

watch([input, direction, method], () => updateShareState());
</script>

<template>
  <ToolLayout title="Base36 编解码">
    <ToolOptionsBar>
      <ModeToggle v-model="method" :options="methodOptions" />
      <ModeToggle v-model="direction" :options="directionOptions" />
    </ToolOptionsBar>
    <IoLayout>
      <template #input>
        <ToolInput
          v-model="input"
          :placeholder="method === 'number'
            ? (direction === 'encode' ? '输入十进制数字，例如 1234567890' : '输入 Base36 字符串，例如 kf12oi')
            : (direction === 'encode' ? '输入要编码的文本...' : '输入 Base36 编码字符串...')"
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
