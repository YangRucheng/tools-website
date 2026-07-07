<script setup lang="ts">
import { ref, computed } from 'vue';
import { NButton, NInput, NSelect, NProgress } from 'naive-ui';
import ToolLayout from '@/components/common/ToolLayout.vue';
import ToolOptionsBar from '@/components/common/ToolOptionsBar.vue';
import ErrorAlert from '@/components/common/ErrorAlert.vue';
import { useToolStorage } from '@/composables/useToolStorage';
import { useClipboard } from '@/composables/useClipboard';
import { COPY_ICON, CHECK_ICON } from '@/utils/icons';
import {
  REGIONS,
  ISP_OPTIONS,
  AREA_OPTIONS,
  filterRegions,
  groupByArea,
  splitRegionName,
  computeIpDistribution,
  runAllRegions,
  isValidDomain,
  cleanDomain,
} from './dnsResolverUtils';
import type { RegionResult, DnsStatus, IspFilter, AreaFilter } from './dnsResolverUtils';

// 固定并发数
const CONCURRENCY = 16;

const { domain, ispFilter, areaFilter } = useToolStorage('dns-resolver', {
  domain: '',
  ispFilter: 'all' as IspFilter,
  areaFilter: 'all' as AreaFilter,
});

const results = ref<Record<string, RegionResult>>({});
const running = ref(false);
const error = ref('');
const aborter = ref<AbortController | null>(null);

// 分布排序：'desc' 多→少，'asc' 少→多
const distSort = ref<'desc' | 'asc'>('desc');
const distCopied = ref(false);

const { copy } = useClipboard();

const filteredRegions = computed(() =>
  filterRegions(REGIONS, ispFilter.value, areaFilter.value),
);
const groupedRegions = computed(() => groupByArea(filteredRegions.value));

const resultList = computed(() => filteredRegions.value.map((r) => results.value[r.name]).filter(Boolean));
const baseDistribution = computed(() => computeIpDistribution(resultList.value));
const distribution = computed(() => {
  if (distSort.value === 'asc') {
    return [...baseDistribution.value].sort((a, b) => a.count - b.count);
  }
  return baseDistribution.value; // computeIpDistribution 已按 count 降序
});
const distributionTotal = computed(() =>
  baseDistribution.value.reduce((s, e) => s + e.count, 0),
);

const toggleDistSort = () => {
  distSort.value = distSort.value === 'desc' ? 'asc' : 'desc';
};

const copyDistributionIps = async () => {
  if (baseDistribution.value.length === 0) return;
  const text = baseDistribution.value.map((e) => e.ip).join('\n');
  const ok = await copy(text);
  if (ok) {
    distCopied.value = true;
    setTimeout(() => { distCopied.value = false; }, 2000);
  }
};

const completedCount = computed(() => {
  let n = 0;
  for (const r of filteredRegions.value) {
    const res = results.value[r.name];
    if (res && (res.status === 'done' || res.status === 'error')) n++;
  }
  return n;
});

const totalCount = computed(() => filteredRegions.value.length);
const progressPercentage = computed(() =>
  totalCount.value === 0 ? 0 : Math.round((completedCount.value / totalCount.value) * 100),
);

const doneCount = computed(() =>
  filteredRegions.value.filter((r) => results.value[r.name]?.status === 'done').length,
);
const errorCount = computed(() =>
  filteredRegions.value.filter((r) => results.value[r.name]?.status === 'error').length,
);

const canReset = computed(
  () => running.value || Object.keys(results.value).length > 0 || error.value !== '',
);

const statusLabel = (s?: DnsStatus): string => {
  switch (s) {
    case 'running': return '查询中';
    case 'error': return '失败';
    case 'pending': return '等待';
    default: return '等待';
  }
};

const start = async () => {
  const cleaned = cleanDomain(domain.value);
  if (!cleaned) {
    error.value = '请输入要查询的域名';
    return;
  }
  if (!isValidDomain(cleaned)) {
    error.value = '域名格式不正确';
    return;
  }
  error.value = '';
  running.value = true;

  // 初始化所有区域为 pending
  const initial: Record<string, RegionResult> = {};
  for (const r of filteredRegions.value) {
    initial[r.name] = { region: r, status: 'pending', ips: [], ttl: null, elapsedMs: 0 };
  }
  results.value = initial;

  const ac = new AbortController();
  aborter.value = ac;

  try {
    await runAllRegions(
      cleaned,
      filteredRegions.value,
      CONCURRENCY,
      (_index, result) => {
        results.value = { ...results.value, [result.region.name]: result };
      },
      ac.signal,
    );
  } finally {
    // 将未完成区域标记为已取消
    const finalized = { ...results.value };
    for (const r of filteredRegions.value) {
      const cur = finalized[r.name];
      if (cur && (cur.status === 'pending' || cur.status === 'running')) {
        finalized[r.name] = { ...cur, status: 'error', error: '已取消' };
      }
    }
    results.value = finalized;
    running.value = false;
    aborter.value = null;
  }
};

const stop = () => {
  aborter.value?.abort();
};

const reset = () => {
  stop();
  results.value = {};
  error.value = '';
  running.value = false;
};

const onDomainEnter = () => {
  if (!running.value) start();
};

const splitCache = new Map<string, { isp: string; display: string }>();
const split = (name: string) => {
  let v = splitCache.get(name);
  if (!v) {
    v = splitRegionName(name);
    splitCache.set(name, v);
  }
  return v;
};
</script>

<template>
  <ToolLayout title="DNS 解析">
    <p class="tool-desc">查询域名在全国各区域、各运营商的 DNS 解析结果，并发请求实时展示</p>

    <ToolOptionsBar class="control-row">
      <n-input
        v-model:value="domain"
        placeholder="请输入域名，例如 example.com"
        style="min-width: 280px; max-width: 400px"
        :disabled="running"
        clearable
        @keyup.enter="onDomainEnter"
      />
      <n-select
        v-model:value="ispFilter"
        :options="ISP_OPTIONS"
        :disabled="running"
        style="width: 130px"
      />
      <n-select
        v-model:value="areaFilter"
        :options="AREA_OPTIONS"
        :disabled="running"
        style="width: 130px"
      />
    </ToolOptionsBar>

    <div class="tool-actions">
      <n-button secondary @click="reset" :disabled="!canReset">重置</n-button>
      <n-button
        v-if="!running"
        type="primary"
        style="min-width: 160px"
        :disabled="!domain.trim()"
        @click="start"
      >
        开始查询
      </n-button>
      <n-button v-else type="error" style="min-width: 160px" @click="stop">
        停止
      </n-button>
    </div>

    <ErrorAlert v-if="error" :message="error" />

    <div v-if="Object.keys(results).length > 0" class="results-area">
      <!-- 进度条 -->
      <div class="progress-bar">
        <n-progress
          type="line"
          :percentage="progressPercentage"
          :show-indicator="false"
          :height="8"
          :border-radius="4"
        />
        <div class="progress-meta">
          <span class="progress-label">{{ completedCount }} / {{ totalCount }}</span>
          <span class="progress-summary">
            <span class="summary-done">✓ {{ doneCount }}</span>
            <span v-if="errorCount > 0" class="summary-error">✗ {{ errorCount }}</span>
          </span>
        </div>
      </div>

      <!-- 解析结果占比分布 -->
      <div v-if="distribution.length > 0" class="distribution">
        <div class="distribution-header">
          <div class="distribution-title-wrap">
            <span class="distribution-title">解析结果分布</span>
            <span class="distribution-meta">{{ doneCount }} 个区域 · {{ distribution.length }} 个 IP</span>
          </div>
          <div class="distribution-actions">
            <button
              type="button"
              class="dist-icon-btn"
              :title="distSort === 'desc' ? '当前：多到少，点击切换' : '当前：少到多，点击切换'"
              :aria-label="distSort === 'desc' ? '切换为少到多' : '切换为多到少'"
              @click="toggleDistSort"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18" />
                <path d="M3 12h12" />
                <path d="M3 18h6" />
              </svg>
            </button>
            <button
              type="button"
              class="dist-icon-btn"
              :class="{ 'is-copied': distCopied }"
              :title="distCopied ? '已复制' : '复制全部 IP（每行一个）'"
              aria-label="复制全部 IP"
              @click="copyDistributionIps"
            >
              <span class="dist-icon-inner" v-html="distCopied ? CHECK_ICON : COPY_ICON" />
            </button>
          </div>
        </div>
        <div class="distribution-list">
          <div v-for="d in distribution" :key="d.ip" class="distribution-row">
            <code class="dist-ip">{{ d.ip }}</code>
            <span class="dist-count">{{ d.count }}/{{ distributionTotal }}</span>
            <span class="dist-pct">{{ d.percentage.toFixed(1) }}%</span>
          </div>
        </div>
      </div>

      <!-- 按大区分组展示 -->
      <div v-for="group in groupedRegions" :key="group.area" class="area-group">
        <div class="area-header">
          <span class="area-name">{{ group.area }}</span>
          <span class="area-count">{{ group.regions.length }} 个区域</span>
        </div>
        <div class="region-grid">
          <div
            v-for="r in group.regions"
            :key="r.name"
            class="region-card"
            :class="`is-${results[r.name]?.status ?? 'pending'}`"
          >
            <div class="region-head">
              <div class="region-name-wrap">
                <span
                  v-if="split(r.name).isp"
                  class="region-isp-tag"
                  :class="`tag-${split(r.name).isp}`"
                >{{ split(r.name).isp }}</span>
                <span class="region-name">{{ split(r.name).display }}</span>
              </div>
              <span class="region-status">
                <template v-if="results[r.name]?.status === 'done'">
                  <template v-if="results[r.name]!.ttl !== null">TTL {{ results[r.name]!.ttl }}</template>
                </template>
                <template v-else>{{ statusLabel(results[r.name]?.status) }}</template>
              </span>
            </div>
            <div class="region-body">
              <template v-if="results[r.name]?.status === 'done'">
                <div v-if="results[r.name]!.ips.length > 0" class="region-done">
                  <div class="ip-list">
                    <code
                      v-for="ip in results[r.name]!.ips.slice(0, 3)"
                      :key="ip"
                      class="region-ip"
                    >{{ ip }}</code>
                  </div>
                </div>
                <span v-else class="region-empty">无 A 记录</span>
              </template>
              <template v-else-if="results[r.name]?.status === 'error'">
                <span class="region-error">{{ results[r.name]!.error }}</span>
              </template>
              <template v-else-if="results[r.name]?.status === 'running'">
                <span class="region-loading">查询中…</span>
              </template>
              <template v-else>
                <span class="region-pending">等待中</span>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ToolLayout>
</template>

<style scoped>
.tool-desc {
  font-size: 14px;
  color: var(--app-text-muted);
  margin-bottom: var(--app-spacing-lg);
}

.control-row + .control-row {
  margin-top: var(--app-spacing-sm);
}

.tool-actions {
  display: flex;
  gap: var(--app-spacing-sm);
  margin-top: var(--app-spacing-lg);
}

.results-area {
  margin-top: var(--app-spacing-lg);
  border-top: 1px solid var(--app-border);
  padding-top: var(--app-spacing-lg);
}

.progress-bar {
  margin-bottom: var(--app-spacing-lg);
}

.progress-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: var(--app-spacing-sm);
}

.progress-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--app-text);
  font-family: var(--app-font-mono);
}

.progress-summary {
  display: flex;
  gap: var(--app-spacing-md);
  font-size: 12px;
}

.summary-done {
  color: #22c55e;
  font-weight: 500;
}

.summary-error {
  color: #ef4444;
  font-weight: 500;
}

/* ===== 解析结果分布 ===== */
.distribution {
  margin-bottom: var(--app-spacing-lg);
  padding: var(--app-spacing-md);
  background: var(--app-bg-soft);
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-sm);
}

.distribution-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--app-spacing-sm);
}

.distribution-title-wrap {
  display: flex;
  align-items: baseline;
  gap: var(--app-spacing-sm);
  min-width: 0;
}

.distribution-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--app-text);
}

.distribution-meta {
  font-size: 12px;
  color: var(--app-text-muted);
}

.distribution-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.dist-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 4px;
  background: transparent;
  color: var(--app-text-muted);
  cursor: pointer;
  transition: color 0.15s ease, background 0.15s ease, border-color 0.15s ease;
}

.dist-icon-btn:hover {
  color: var(--app-primary);
  background: var(--app-surface);
  border-color: var(--app-border);
}

.dist-icon-btn.is-copied {
  color: #22c55e;
}

.dist-icon-inner {
  display: inline-flex;
  line-height: 0;
}

.distribution-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px var(--app-spacing-lg);
  column-gap: var(--app-spacing-xl);
  column-rule: 1px solid var(--app-border);
}

.distribution-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--app-spacing-sm);
  font-size: 12px;
  min-width: 0;
}

.dist-ip {
  font-family: var(--app-font-mono);
  font-size: 12px;
  color: var(--app-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
}

.dist-count {
  font-family: var(--app-font-mono);
  font-size: 12px;
  color: var(--app-text-muted);
  flex-shrink: 0;
}

.dist-pct {
  font-family: var(--app-font-mono);
  font-size: 12px;
  font-weight: 600;
  color: var(--app-primary);
  flex-shrink: 0;
  min-width: 48px;
  text-align: right;
}

@media (max-width: 640px) {
  .distribution-list {
    grid-template-columns: 1fr;
  }
}

/* ===== 大区分组 ===== */
.area-group + .area-group {
  margin-top: var(--app-spacing-lg);
}

.area-header {
  display: flex;
  align-items: baseline;
  gap: var(--app-spacing-sm);
  margin-bottom: var(--app-spacing-sm);
  padding: 0 4px;
}

.area-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--app-text);
}

.area-count {
  font-size: 12px;
  color: var(--app-text-muted);
}

.region-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: var(--app-spacing-sm);
}

.region-card {
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-sm);
  padding: var(--app-spacing-sm) var(--app-spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--app-spacing-xs);
  transition: border-color 0.2s ease, background 0.2s ease;
}

.region-card.is-running {
  border-color: var(--app-primary);
  background: var(--app-primary-soft);
}

.region-card.is-done {
  border-color: rgba(34, 197, 94, 0.5);
}

.region-card.is-error {
  border-color: rgba(239, 68, 68, 0.5);
  background: rgba(239, 68, 68, 0.04);
}

[data-theme="dark"] .region-card.is-error {
  background: rgba(239, 68, 68, 0.08);
}

.region-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--app-spacing-sm);
}

.region-name-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  flex: 1;
}

.region-isp-tag {
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
  padding: 2px 5px;
  border-radius: 3px;
  flex-shrink: 0;
  color: #fff;
}

.region-isp-tag.tag-电信 {
  background: #005bac; /* 电信蓝 */
}

.region-isp-tag.tag-联通 {
  background: #e45d03; /* 联通红 */
}

.region-isp-tag.tag-移动 {
  background: #0099cc; /* 移动蓝绿色 */
}

.region-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--app-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.region-status {
  font-size: 12px;
  font-weight: 500;
  flex-shrink: 0;
}

.is-pending .region-status { color: var(--app-text-muted); }
.is-running .region-status { color: var(--app-primary); }
.is-done .region-status { color: #22c55e; }
.is-error .region-status { color: #ef4444; }

.region-body {
  font-size: 12px;
  min-height: 18px;
}

.region-done {
  display: block;
}

.ip-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 6px;
  align-items: center;
  max-height: calc(2em * 1.5 + 4px);
  overflow: hidden;
}

.region-ip {
  font-family: var(--app-font-mono);
  font-size: 12px;
  color: var(--app-text);
  background: var(--app-bg-soft);
  padding: 1px 6px;
  border-radius: 3px;
}

.region-empty,
.region-pending,
.region-loading {
  color: var(--app-text-muted);
  font-size: 12px;
}

.region-loading {
  color: var(--app-primary);
}

.region-error {
  color: #ef4444;
  font-size: 12px;
  word-break: break-all;
}

@media (max-width: 640px) {
  .region-grid {
    grid-template-columns: 1fr;
  }
}
</style>
