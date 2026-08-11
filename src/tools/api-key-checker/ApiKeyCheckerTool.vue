<script setup lang="ts">
import { ref, computed, inject, watch } from 'vue';
import { NButton, NInput, NSelect } from 'naive-ui';
import {
  batchCheckKeys,
  extractBalanceValue,
  INTERFACE_TYPES,
  INTERFACE_LABELS,
  SUPPLIERS_BY_INTERFACE,
  SUPPLIER_LABELS,
  getSupplierConfig,
} from './apiKeyCheckerUtils';
import type { InterfaceType, Supplier, KeyCheckResult, CheckOptions, HttpTransport } from './apiKeyCheckerUtils';
import ToolLayout from '@/components/common/ToolLayout.vue';
import ToolInput from '@/components/common/ToolInput.vue';
import ToolOptionsBar from '@/components/common/ToolOptionsBar.vue';
import IoLayout from '@/components/common/IoLayout.vue';
import ErrorAlert from '@/components/common/ErrorAlert.vue';
import { useToolStorage } from '@/composables/useToolStorage';
import { useSharedStateRestore } from '@/composables/useSharedStateRestore';
import { useClipboard } from '@/composables/useClipboard';
import { useUserscriptBridge } from '@/composables/useUserscriptBridge';
import type { ToolShareState } from '@/tools/types';

const { copy } = useClipboard();

// 油猴脚本桥接：激活时检查请求经 GM_xmlhttpRequest 代发，绕过 CORS
const { active, request } = useUserscriptBridge();
const corsHint = ref(false);
const userscriptUrl = computed(() => `${window.location.origin}/userscripts/api-key-checker.user.js`);

const {
  input,
  interfaceType,
  supplier,
  customBaseUrl,
  customBalancePath,
  testModel,
  sortMode,
  clear,
} = useToolStorage('api-key-checker', {
  input: '',
  interfaceType: 'openai' as InterfaceType,
  supplier: 'deepseek' as Supplier,
  customBaseUrl: '',
  customBalancePath: '/user/balance',
  testModel: '',
  sortMode: 'default' as 'default' | 'balance',
});

const results = ref<KeyCheckResult[]>([]);
const checking = ref(false);
const hasChecked = ref(false);
const error = ref('');

const setToolState = inject<(state: ToolShareState) => void>('setToolState', () => {});

const interfaceOptions = INTERFACE_TYPES.map((t) => ({
  label: INTERFACE_LABELS[t],
  value: t,
}));

// 供应商选项随接口类型过滤
const supplierOptions = computed(() =>
  SUPPLIERS_BY_INTERFACE[interfaceType.value].map((s) => ({
    label: SUPPLIER_LABELS[s],
    value: s,
  })),
);

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

// 推荐模型：各供应商内置默认（含自定义端点）
const recommendedModel = computed(() => getSupplierConfig(supplier.value).defaultModel);

const modelPlaceholder = computed(() => `默认：${recommendedModel.value}（留空使用推荐）`);

// 自定义端点 Base URL 占位符随接口类型变化
const baseUrlPlaceholder = computed(() =>
  interfaceType.value === 'openai' ? 'https://your-endpoint.com/v1' : 'https://your-endpoint.com',
);

// 解析最终使用的 Base URL（去掉末尾斜杠）
const resolvedBaseUrl = computed(() => {
  if (supplier.value === 'custom') return customBaseUrl.value.trim().replace(/\/+$/, '');
  return getSupplierConfig(supplier.value).baseUrl;
});

// 解析最终使用的余额路径
const resolvedBalancePath = computed(() => {
  if (supplier.value === 'deepseek') return getSupplierConfig('deepseek').balancePath ?? '/user/balance';
  return customBalancePath.value.trim() || '/user/balance';
});

// 解析最终使用的测试模型：用户填了用用户的，否则用推荐
const resolvedModel = computed(() => {
  const m = testModel.value.trim();
  if (m) return m;
  return recommendedModel.value;
});

const updateShareState = () => {
  setToolState({
    interfaceType: interfaceType.value,
    supplier: supplier.value,
    customBaseUrl: customBaseUrl.value,
    customBalancePath: customBalancePath.value,
    testModel: testModel.value,
    sortMode: sortMode.value,
  });
};

// 油猴脚本激活时，把 check 的 fetch 替换为脚本代发；否则返回 undefined 走默认 fetch。
const buildTransport = (): HttpTransport | undefined => {
  if (!active.value) return undefined;
  return async (url: string, init: RequestInit): Promise<Response> => {
    const headers = Object.fromEntries(new Headers(init.headers).entries()) as Record<string, string>;
    const res = await request({
      method: init.method ?? 'GET',
      url,
      headers,
      body: typeof init.body === 'string' ? init.body : undefined,
    });
    // status 0 为传输层失败（网络/超时），先抛出再构造 Response，避免 new Response(status:0) 崩溃。
    if (res.status === 0) {
      throw new TypeError(res.error ?? '请求网络错误（传输层失败）');
    }
    return new Response(res.responseText, {
      status: res.status,
      statusText: res.statusText,
      headers: { 'Content-Type': 'application/json' },
    });
  };
};

const run = async () => {
  const lines = input.value.split('\n').filter((l) => l.trim());
  if (lines.length === 0) {
    error.value = '请输入至少一个私钥';
    results.value = [];
    hasChecked.value = true;
    return;
  }

  // 自定义端点必填校验
  if (supplier.value === 'custom') {
    if (!resolvedBaseUrl.value) {
      error.value = '请输入自定义端点的 Base URL';
      results.value = [];
      hasChecked.value = true;
      return;
    }
    if (interfaceType.value !== 'balance' && !resolvedModel.value) {
      error.value = '请输入测试模型';
      results.value = [];
      hasChecked.value = true;
      return;
    }
  }

  error.value = '';
  corsHint.value = false;
  results.value = [];
  checking.value = true;
  hasChecked.value = true;
  try {
    const opts: CheckOptions = {
      interfaceType: interfaceType.value,
      supplier: supplier.value,
      baseUrl: resolvedBaseUrl.value,
      testModel: resolvedModel.value,
      balancePath: resolvedBalancePath.value,
      transport: buildTransport(),
    };
    results.value = await batchCheckKeys(lines, opts);
    if (results.value.length === 0) {
      error.value = '没有识别到合法格式的密钥，已自动过滤';
    }
  } catch (e) {
    if (e instanceof TypeError) {
      if (active.value) {
        error.value = '请求发生网络错误（超时或端点不可达），请重试。';
      } else {
        error.value = '检查请求被浏览器跨域（CORS）策略拦截，或网络不可达。安装用户脚本后可绕过跨域限制。';
        corsHint.value = true;
      }
    } else {
      error.value = `检查异常: ${String(e)}`;
    }
  } finally {
    checking.value = false;
    updateShareState();
  }
};

const copyKey = async (rawKey: string) => {
  await copy(rawKey);
};

const handleClear = () => {
  clear();
  results.value = [];
  error.value = '';
  hasChecked.value = false;
};

const deleteKey = (r: KeyCheckResult) => {
  // 从结果中移除
  results.value = results.value.filter((item) => item.rawKey !== r.rawKey);
  // 从输入中移除对应行
  const lines = input.value.split('\n');
  let removed = false;
  input.value = lines
    .filter((line) => {
      if (!removed && line.trim() === r.rawKey) {
        removed = true;
        return false;
      }
      return true;
    })
    .join('\n');
};

// 切换接口类型时，若当前供应商不在新类型可选列表中，回落到第一项
watch(interfaceType, (newType) => {
  if (!SUPPLIERS_BY_INTERFACE[newType].includes(supplier.value)) {
    supplier.value = SUPPLIERS_BY_INTERFACE[newType][0];
  }
});

useSharedStateRestore(
  { interfaceType, supplier, customBaseUrl, customBalancePath, testModel, sortMode },
  () => {
    // 仅恢复配置，input 密钥出于安全不分享
  },
);

watch([interfaceType, supplier, customBaseUrl, customBalancePath, testModel, sortMode], () =>
  updateShareState(),
);
</script>

<template>
  <ToolLayout title="大模型 API Key 批量检查">
    <ToolOptionsBar>
      <n-select v-model:value="interfaceType" :options="interfaceOptions" style="width: 150px" />
      <n-select v-model:value="supplier" :options="supplierOptions" style="width: 140px" />
      <n-input
        v-if="interfaceType !== 'balance'"
        v-model:value="testModel"
        :placeholder="modelPlaceholder"
        style="width: 220px"
      />
      <n-select
        v-if="interfaceType === 'balance'"
        v-model:value="sortMode"
        :options="sortOptions"
        style="width: 140px"
      />
    </ToolOptionsBar>

    <div v-if="supplier === 'custom'" class="custom-endpoint">
      <div class="custom-endpoint-head">
        <span class="custom-endpoint-title">自定义端点</span>
        <span class="custom-endpoint-hint">请求将直连下方地址</span>
      </div>
      <ToolOptionsBar class="custom-endpoint-fields">
        <span class="option-label">Base URL:</span>
        <n-input
          v-model:value="customBaseUrl"
          :placeholder="baseUrlPlaceholder"
          style="width: 320px"
        />
        <template v-if="interfaceType === 'balance'">
          <span class="option-label">余额路径:</span>
          <n-input
            v-model:value="customBalancePath"
            placeholder="/user/balance"
            style="width: 180px"
          />
        </template>
      </ToolOptionsBar>
    </div>

    <IoLayout>
      <template #input>
        <ToolInput v-model="input" placeholder="请输入私钥，每行一个..." :rows="6" />
        <ErrorAlert v-if="error" :message="error" />
        <div v-if="corsHint && !active" class="cors-install-hint">
          <span class="cors-install-text">安装用户脚本后刷新页面，即可绕过浏览器跨域限制直连检查。</span>
          <n-button
            tag="a"
            :href="userscriptUrl"
            :data-tampermonkey-install="userscriptUrl"
            :data-greasemonkey-install="userscriptUrl"
            rel="noopener"
            size="small"
            type="primary"
          >
            安装用户脚本
          </n-button>
        </div>
        <div v-if="hasChecked && droppedCount > 0" class="dropped-hint">
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
            <n-button v-if="!r.valid" size="tiny" secondary class="delete-btn" @click="deleteKey(r)">删除</n-button>
            <n-button v-else size="tiny" secondary @click="copyKey(r.rawKey)">复制</n-button>
          </div>
        </div>
      </template>
    </IoLayout>
    <div class="tool-actions">
      <n-button
        v-if="!active"
        tag="a"
        :href="userscriptUrl"
        :data-tampermonkey-install="userscriptUrl"
        :data-greasemonkey-install="userscriptUrl"
        rel="noopener"
        title="需先安装油猴（Tampermonkey）扩展，点击后进入安装流程，安装完成后刷新页面生效"
      >
        安装用户脚本（绕过 CORS）
      </n-button>

      <n-button secondary @click="handleClear">清除</n-button>
      <n-button type="primary" style="min-width: 160px" @click="run" :loading="checking">开始检查</n-button>
    </div>
  </ToolLayout>
</template>

<style scoped>
.custom-endpoint {
  margin-top: var(--app-spacing-sm);
  padding: var(--app-spacing-sm) var(--app-spacing-md);
  background: var(--app-bg-soft);
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius);
}

.custom-endpoint-head {
  display: flex;
  align-items: baseline;
  gap: var(--app-spacing-sm);
  margin-bottom: var(--app-spacing-xs);
}

.custom-endpoint-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--app-text);
}

.custom-endpoint-hint {
  font-size: 12px;
  color: var(--app-text-muted);
}

.option-label {
  font-size: 13px;
  color: var(--app-text-muted);
  flex-shrink: 0;
}

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

.cors-install-hint {
  display: flex;
  align-items: center;
  gap: var(--app-spacing-sm);
  margin-top: var(--app-spacing-sm);
  padding: var(--app-spacing-sm) var(--app-spacing-md);
  border-radius: var(--app-radius-sm);
  background: var(--app-primary-soft);
  border: 1px solid var(--app-border);
  font-size: 13px;
  color: var(--app-text);
}

.delete-btn {
  color: #ef4444 !important;
  border-color: #ef4444 !important;
}

.delete-btn:hover {
  color: #dc2626 !important;
  border-color: #dc2626 !important;
  background: #fef2f2 !important;
}
</style>
