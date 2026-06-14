<script setup lang="ts">
import { ref, inject, watch } from 'vue';
import { NButton, NSelect } from 'naive-ui';
import { formatJson, minifyJson, validateJson } from './jsonUtils';
import type { JsonResult } from './jsonUtils';
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

const { input, mode, indent, clear } = useToolStorage('json', {
  input: '',
  mode: 'format' as 'format' | 'minify' | 'validate',
  indent: 2,
});

const output = ref('');
const error = ref('');

const setToolState = inject<(state: ToolShareState) => void>('setToolState', () => {});

const modeOptions = [
  { label: '格式化', value: 'format' },
  { label: '压缩', value: 'minify' },
  { label: '验证', value: 'validate' },
];

const indentOptions = [
  { label: '2 空格', value: 2 },
  { label: '4 空格', value: 4 },
  { label: 'Tab', value: 0 },
];

const updateShareState = () => {
  setToolState({ input: input.value, mode: mode.value, indent: indent.value });
};

const run = () => {
  let result: JsonResult;
  switch (mode.value) {
    case 'minify':
      result = minifyJson(input.value);
      break;
    case 'validate':
      result = validateJson(input.value);
      break;
    default:
      result = formatJson(input.value, indent.value);
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

const onOutputEdit = (newText: string) => {
  output.value = newText;
  input.value = newText;
};

useSharedStateRestore({ input, mode, indent }, () => {
  if (input.value) run();
});

watch([input, mode, indent], () => updateShareState());
</script>

<template>
  <ToolLayout title="JSON 格式化">
    <ToolOptionsBar>
      <ModeToggle v-model="mode" :options="modeOptions" />
      <n-select
        v-if="mode === 'format'"
        v-model:value="indent"
        :options="indentOptions"
        style="width: 100px"
      />
    </ToolOptionsBar>
    <IoLayout>
      <template #input>
        <ToolInput
          v-model="input"
          placeholder='输入 JSON 数据，例如 {"hello":"world"}'
          :rows="10"
        />
        <ErrorAlert v-if="error" :message="error" />
      </template>
      <template #output>
        <ResultPanel
          :text="output"
          :editable="mode === 'format'"
          @update:text="onOutputEdit"
        >
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
