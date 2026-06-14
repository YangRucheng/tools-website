<script setup lang="ts">
import { ref, computed, inject, watch } from 'vue';
import { NButton, NSelect } from 'naive-ui';
import { batchCheckKeys, PROVIDERS, PROVIDER_LABELS, extractBalanceValue } from './apiKeyCheckerUtils';
import type { Provider, KeyCheckResult } from './apiKeyCheckerUtils';
import ToolLayout from '@/components/common/ToolLayout.vue';
import ToolInput from '@/components/common/ToolInput.vue';
import ToolOptionsBar from '@/components/common/ToolOptionsBar.vue';
import IoLayout from '@/components/common/IoLayout.vue';
import ErrorAlert from '@/components/common/ErrorAlert.vue';
import { useToolStorage } from '@/composables/useToolStorage';
import { useSharedStateRestore } from '@/composables/useSharedStateRestore';
import { useClipboard } from '@/composables/useClipboard';
import type { ToolShareState } from '@/tools/types';

const { copy } = useClipboard();

const { input, provider, sortMode, clear } = useToolStorage('api-key-checker', {
  input: '',
  provider: 'deepseek' as Provider,
  sortMode: 'default' as 'default' | 'balance',
});

const results = ref<KeyCheckResult[]>([]);
const checking = ref(false);
const error = ref('');

const setToolState = inject<(state: ToolShareState) => void>('setToolState', () => {});

const providerOptions = PROVIDERS.map((p) => ({
  label: PROVIDER_LABELS[p],
  value: p,
}));

const sortOptions = [
  { label: '默认顺序', value: 'default' },
  { label: '按余额排序', value: 'balance' },
];

const sortedResults = computed(() => {
  if (sortMode.value === 'balance') {
    return [...results.value].sort((a, b) => extractBalanceValue(b) - extractBalanceValue(a));
  }
  return results.value;
});

const droppedCount = computed(() => {
  const lines = input.value.split('\n').filter((l) => l.trim());
  return lines.length - results.value.length;
});

const updateShareState = () => {
  setToolState({ provider: provider.value });
};

const run = async () => {
  const lines = input.value.split('\n').filter((l) => l.trim());
  if (lines.length === 0) {
    error.value = '请输入至少一个私钥';
    results.value = [];
    return;
  }
  error.value = '';
  results.value = [];
  checking.value = true;
  try {
    results.value = await batchCheckKeys(lines, provider.value);
    if (results.value.length === 0) {
      error.value = '没有识别到合法格式的密钥，已自动过滤';
    }
  } catch (e) {
    error.value = `检查异常: ${String(e)}`;
  } finally {
    checking.value = false;
    updateShareState();
  }
};

const copyKey = async (rawKey: string) => {
  await copy(rawKey);
};

useSharedStateRestore({ provider }, () => {
  // Only restore provider; input keys are not shared for security
});

watch([provider], () => updateShareState());
</script>

<template>
  <ToolLayout title="大模型 API Key 批量检查">
    <ToolOptionsBar>
      <n-select v-model:value="provider" :options="providerOptions" style="width: 140px" />
      <n-select v-model:value="sortMode" :options="sortOptions" style="width: 140px" />
    </ToolOptionsBar>
    <IoLayout>
      <template #input>
        <ToolInput v-model="input" placeholder="请输入私钥，每行一个..." :rows="6" />
        <ErrorAlert v-if="error" :message="error" />
        <div v-if="droppedCount > 0" class="dropped-hint">
          已自动过滤 {{ droppedCount }} 行不合法的输入
        </div>
      </template>
      <template #output>
        <div v-if="results.length === 0" class="results-empty">检查结果将显示在这里</div>
        <div v-else class="results-list">
          <div
            v-for="r in sortedResults"
            :key="r.index"
            class="result-row"
            :class="{ 'result-valid': r.valid, 'result-invalid': !r.valid }"
          >
            <span class="result-status">{{ r.valid ? '✅' : '❌' }}</span>
            <code class="result-key">{{ r.maskedKey }}</code>
            <span class="result-msg">{{ r.message }}</span>
            <span class="result-balance">{{ r.balance }}</span>
            <n-button size="tiny" secondary @click="copyKey(r.rawKey)">复制</n-button>
          </div>
        </div>
      </template>
    </IoLayout>
    <div class="tool-actions">
      <n-button secondary @click="clear">清除</n-button>
      <n-button type="primary" style="min-width: 160px" @click="run" :loading="checking">开始检查</n-button>
    </div>
  </ToolLayout>
</template>

<style scoped>
.results-list {
  display: flex;
  flex-direction: column;
  gap: var(--app-spacing-sm);
}

.results-empty {
  color: var(--app-text-muted);
  font-size: 14px;
  text-align: center;
  padding: var(--app-spacing-lg);
}

.result-row {
  display: flex;
  align-items: center;
  gap: var(--app-spacing-sm);
  padding: var(--app-spacing-xs) var(--app-spacing-sm);
  border-radius: var(--app-radius-sm);
  font-size: 14px;
  border: 1px solid var(--app-border);
}

.result-valid {
  background: var(--app-primary-soft);
}

.result-invalid {
  background: var(--app-bg-soft);
}

.result-status {
  flex-shrink: 0;
  font-size: 16px;
}

.result-key {
  font-family: var(--app-font-mono);
  font-size: 12px;
  color: var(--app-text);
  flex-shrink: 0;
}

.result-msg {
  color: var(--app-text-muted);
  flex: 1;
  min-width: 0;
}

.result-balance {
  color: var(--app-primary);
  font-weight: 500;
  flex-shrink: 0;
  min-width: 110px;
  text-align: left;
}

.dropped-hint {
  color: var(--app-text-muted);
  font-size: 12px;
  margin-top: var(--app-spacing-xs);
}
</style>
