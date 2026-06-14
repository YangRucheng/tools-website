<script setup lang="ts">
import { ref, inject } from 'vue';
import { NButton, NInputNumber, NCheckbox, NSelect } from 'naive-ui';
import { generateUuids, validateUuid, formatUuid } from './uuidUtils';
import type { UuidVersion } from './uuidUtils';
import ErrorAlert from '@/components/common/ErrorAlert.vue';
import CopyButton from '@/components/common/CopyButton.vue';
import ToolLayout from '@/components/common/ToolLayout.vue';
import ModeToggle from '@/components/common/ModeToggle.vue';
import ToolInput from '@/components/common/ToolInput.vue';
import ToolOptionsBar from '@/components/common/ToolOptionsBar.vue';
import IoLayout from '@/components/common/IoLayout.vue';
import ResultPanel from '@/components/common/ResultPanel.vue';
import { useToolStorage } from '@/composables/useToolStorage';
import { useSharedStateRestore } from '@/composables/useSharedStateRestore';
import type { ToolShareState } from '@/tools/types';

const { mode, uuidVersion, count, uppercase, noDashes, input, clear } = useToolStorage('uuid', {
  mode: 'generate' as 'generate' | 'validate',
  uuidVersion: 'v4' as UuidVersion,
  count: 10,
  uppercase: false,
  noDashes: false,
  input: '',
});

const results = ref<string[]>([]);
const validationResult = ref('');
const error = ref('');

const setToolState = inject<(state: ToolShareState) => void>('setToolState', () => {});

const modeOptions = [
  { label: '生成', value: 'generate' },
  { label: '验证', value: 'validate' },
];

const versionOptions: { label: string; value: UuidVersion }[] = [
  { label: 'v1 (时间)', value: 'v1' },
  { label: 'v4 (随机)', value: 'v4' },
];

const updateShareState = () => {
  setToolState({ mode: mode.value, uuidVersion: uuidVersion.value, count: count.value, uppercase: uppercase.value, noDashes: noDashes.value });
};

const runGenerate = () => {
  error.value = '';
  validationResult.value = '';
  const raw = generateUuids(count.value, uuidVersion.value);
  results.value = raw.map((u) => formatUuid(u, uppercase.value, noDashes.value));
  updateShareState();
};

const runValidate = () => {
  results.value = [];
  error.value = '';
  if (!input.value.trim()) {
    error.value = '请输入 UUID';
    return;
  }
  const valid = validateUuid(input.value.trim());
  validationResult.value = valid ? '✅ 有效的 UUID (v1/v4)' : '❌ 无效的 UUID 格式';
  updateShareState();
};

useSharedStateRestore({ mode, uuidVersion, count, uppercase, noDashes });
</script>

<template>
  <ToolLayout title="UUID 生成 / 验证">
    <ModeToggle v-model="mode" :options="modeOptions" />

    <template v-if="mode === 'generate'">
      <ToolOptionsBar class="uuid-options">
        <span class="option-label">版本:</span>
        <n-select v-model:value="uuidVersion" :options="versionOptions" style="width: 130px" />
        <span class="option-label">生成数量:</span>
        <n-input-number v-model:value="count" :min="1" :max="100" style="width: 100px" />
        <n-checkbox v-model:checked="uppercase">大写</n-checkbox>
        <n-checkbox v-model:checked="noDashes">移除连字符</n-checkbox>
      </ToolOptionsBar>
      <div class="tool-actions">
        <n-button secondary @click="clear">重置</n-button>
        <n-button type="primary" style="min-width: 160px" @click="runGenerate">生成 UUID</n-button>
      </div>
      <div v-if="results.length" class="uuid-list">
        <div v-for="(u, i) in results" :key="i" class="uuid-row">
          <code>{{ u }}</code>
          <CopyButton :text="u" />
        </div>
      </div>
    </template>

    <template v-else>
      <IoLayout class="uuid-validate-layout">
        <template #input>
          <ToolInput
            v-model="input"
            type="text"
            placeholder="输入 UUID 验证，例如 550e8400-e29b-41d4-a716-446655440000"
          />
          <ErrorAlert v-if="error" :message="error" />
        </template>
        <template #output>
          <ResultPanel :text="validationResult" />
        </template>
      </IoLayout>
      <div class="tool-actions">
        <n-button secondary @click="clear">清除</n-button>
        <n-button type="primary" style="min-width: 160px" @click="runValidate">验证</n-button>
      </div>
    </template>
  </ToolLayout>
</template>

<style scoped>
.uuid-options {
  margin-top: var(--app-spacing-md);
}

.option-label {
  font-size: 13px;
  color: var(--app-text-muted);
}

.uuid-validate-layout {
  margin-top: var(--app-spacing-md);
}

.uuid-list {
  display: flex;
  flex-direction: column;
  gap: var(--app-spacing-sm);
  margin-top: var(--app-spacing-md);
}

.uuid-row {
  display: flex;
  align-items: center;
  gap: var(--app-spacing-sm);
  padding: var(--app-spacing-sm);
  background: var(--app-bg-soft);
  border-radius: var(--app-radius-sm);
  border: 1px solid var(--app-border);
}

.uuid-row code {
  font-family: var(--app-font-mono);
  font-size: 13px;
  flex: 1;
  word-break: break-all;
  color: var(--app-text);
}
</style>
