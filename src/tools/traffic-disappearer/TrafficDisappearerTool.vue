<script setup lang="ts">
import { ref, computed } from 'vue';
import { NButton, NSelect, NInput, NInputNumber, NCheckbox, NProgress } from 'naive-ui';
import ToolLayout from '@/components/common/ToolLayout.vue';
import ToolOptionsBar from '@/components/common/ToolOptionsBar.vue';
import {
  ALL_SOURCES,
  CUSTOM_VALUE,
  THREAD_DEFAULT,
  THREAD_MIN,
  THREAD_MAX,
  LOOP_DEFAULT,
  LOOP_INFINITE,
  runMultiLoop,
  formatSize,
  formatSpeed,
} from './trafficDisappearerUtils';
import type { OverallProgress } from './trafficDisappearerUtils';

// --- Controls ---
const selectedValue = ref(ALL_SOURCES[0].value);
const customUrl = ref('');
const threadCount = ref(THREAD_DEFAULT);
const loopCount = ref(LOOP_DEFAULT);
const infiniteLoop = ref(false);

const running = ref(false);
const progress = ref<OverallProgress | null>(null);
const error = ref('');
const aborter = ref<AbortController | null>(null);

const isCustom = computed(() => selectedValue.value === CUSTOM_VALUE);

const effectiveUrl = computed(() => {
  if (isCustom.value) return customUrl.value.trim();
  return selectedValue.value;
});

const effectiveLoops = computed(() => (infiniteLoop.value ? LOOP_INFINITE : loopCount.value));

// --- Options ---
const selectOptions = ALL_SOURCES;

// --- Actions ---
const startTest = async () => {
  const url = effectiveUrl.value;
  if (!url) return;

  running.value = true;
  error.value = '';
  progress.value = null;

  const ac = new AbortController();
  aborter.value = ac;

  try {
    await runMultiLoop(
      url,
      threadCount.value,
      effectiveLoops.value,
      (p) => {
        progress.value = p;
      },
      ac.signal,
    );
  } catch (err: unknown) {
    if (err instanceof Error && err.message !== '已手动停止') {
      error.value = `测速失败: ${err.message}`;
    }
  } finally {
    running.value = false;
    aborter.value = null;
  }
};

const stopTest = () => {
  aborter.value?.abort();
};

const reset = () => {
  stopTest();
  progress.value = null;
  error.value = '';
  running.value = false;
};

// --- Computed ---
const aggregateSpeedSafe = computed(() => progress.value?.aggregateSpeedBps ?? 0);
const totalLoadedSafe = computed(() => progress.value?.totalLoaded ?? 0);
const elapsedMsSafe = computed(() => progress.value?.elapsedMs ?? 0);
const finished = computed(() => progress.value?.finished ?? false);

const loopLabel = computed(() => {
  const p = progress.value;
  if (!p) return '';
  const cur = p.currentLoop;
  const total = p.totalLoops === -1 ? '∞' : String(p.totalLoops);
  return `第 ${cur} / ${total} 轮`;
});
</script>

<template>
  <ToolLayout title="流量消失器">
    <p class="tool-desc">多线程并发下载测速，支持 TCP 连接池压测与循环测试</p>

    <!-- Source -->
    <ToolOptionsBar class="control-row">
      <n-select
        v-model:value="selectedValue"
        :options="selectOptions"
        style="min-width: 260px; max-width: 400px"
        :disabled="running"
        placeholder="选择测速源"
      />
    </ToolOptionsBar>

    <div v-if="isCustom" class="custom-url-row">
      <n-input
        v-model:value="customUrl"
        placeholder="输入自定义文件 URL..."
        :disabled="running"
        clearable
      />
    </div>

    <!-- Thread & Loop controls -->
    <ToolOptionsBar class="control-row">
      <div class="control-group">
        <span class="control-label">并发线程</span>
        <n-input-number
          v-model:value="threadCount"
          :min="THREAD_MIN"
          :max="THREAD_MAX"
          :disabled="running"
          style="width: 90px"
        />
      </div>
      <div class="control-group">
        <span class="control-label">测试轮数</span>
        <n-input-number
          v-model:value="loopCount"
          :min="1"
          :max="99999"
          :disabled="running || infiniteLoop"
          style="width: 90px"
        />
      </div>
      <n-checkbox v-model:checked="infiniteLoop" :disabled="running" class="infinite-check">
        ♾️ 无限循环
      </n-checkbox>
    </ToolOptionsBar>

    <!-- Actions -->
    <div class="tool-actions">
      <n-button secondary @click="reset" :disabled="!running && !progress && !error">重置</n-button>
      <n-button
        v-if="!running"
        type="primary"
        style="min-width: 160px"
        :disabled="!effectiveUrl"
        @click="startTest"
      >
        开始测速
      </n-button>
      <n-button v-else type="error" style="min-width: 160px" @click="stopTest">
        停止
      </n-button>
    </div>

    <!-- Error banner -->
    <div v-if="error" class="error-banner">{{ error }}</div>

    <!-- Progress & Results -->
    <div v-if="progress" class="results-area">
      <!-- Loop indicator -->
      <div class="loop-bar">
        <span class="loop-label">{{ loopLabel }}</span>
      </div>

      <!-- Aggregate stats -->
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-label">聚合速度</span>
          <span class="stat-value speed">{{ formatSpeed(aggregateSpeedSafe) }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">已下载</span>
          <span class="stat-value">{{ formatSize(totalLoadedSafe) }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">用时</span>
          <span class="stat-value">{{ (elapsedMsSafe / 1000).toFixed(2) }}s</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">状态</span>
          <span class="stat-value" :class="{ 'stat-done': finished }">
            {{ finished ? '✅ 完成' : '运行中' }}
          </span>
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

.custom-url-row {
  margin: var(--app-spacing-sm) 0 var(--app-spacing-sm);
  max-width: 500px;
}

.control-group {
  display: flex;
  align-items: center;
  gap: var(--app-spacing-sm);
}

.control-label {
  font-size: 13px;
  color: var(--app-text-muted);
  white-space: nowrap;
}

.infinite-check {
  margin-left: var(--app-spacing-lg);
}

.error-banner {
  margin-top: var(--app-spacing-md);
  padding: var(--app-spacing-sm) var(--app-spacing-md);
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: var(--app-radius-sm);
  color: #dc2626;
  font-size: 14px;
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

.loop-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--app-spacing-md);
}

.loop-label {
  font-size: 15px;
  font-weight: 700;
  color: var(--app-text);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--app-spacing-md);
  margin-bottom: var(--app-spacing-lg);
}

@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.stat-card {
  background: var(--app-bg-soft);
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-sm);
  padding: var(--app-spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--app-spacing-sm);
}

.stat-label {
  font-size: 12px;
  color: var(--app-text-muted);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--app-text);
  font-family: var(--app-font-mono);
}

.stat-value.speed {
  color: var(--app-primary);
}

.stat-done {
  color: #22c55e !important;
  font-size: 16px;
}
</style>
