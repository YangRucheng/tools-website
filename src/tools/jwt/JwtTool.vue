<script setup lang="ts">
import { ref, computed, inject } from 'vue';
import { NButton, NTag } from 'naive-ui';
import { decodeJwt, isJwtExpired, formatJwtPayload } from './jwtUtils';
import type { JwtParts } from './jwtUtils';
import ResultPanel from '@/components/common/ResultPanel.vue';
import ErrorAlert from '@/components/common/ErrorAlert.vue';
import CopyButton from '@/components/common/CopyButton.vue';
import ToolLayout from '@/components/common/ToolLayout.vue';
import ToolInput from '@/components/common/ToolInput.vue';
import IoLayout from '@/components/common/IoLayout.vue';
import { useToolStorage } from '@/composables/useToolStorage';
import { useSharedStateRestore } from '@/composables/useSharedStateRestore';
import type { ToolShareState } from '@/tools/types';

const { input, clear } = useToolStorage('jwt', { input: '' });

const jwt = ref<JwtParts | null>(null);
const error = ref('');

const setToolState = inject<(state: ToolShareState) => void>('setToolState', () => {});

const expired = computed(() => {
  if (!jwt.value?.payload) return false;
  return isJwtExpired(jwt.value.payload as { exp?: number });
});

const headerJson = computed(() => formatJwtPayload(jwt.value?.header));
const payloadJson = computed(() => formatJwtPayload(jwt.value?.payload));

const updateShareState = () => {
  setToolState({ input: input.value });
};

const run = () => {
  const result = decodeJwt(input.value);
  if (result.success) {
    jwt.value = result.data ?? null;
    error.value = '';
  } else {
    jwt.value = null;
    error.value = result.error ?? '';
  }
  updateShareState();
};

useSharedStateRestore({ input }, () => {
  if (input.value) run();
});
</script>

<template>
  <ToolLayout title="JWT 解码">
    <IoLayout>
      <template #input>
        <ToolInput
          v-model="input"
          :rows="4"
          placeholder="粘贴 JWT Token..."
        />
        <ErrorAlert v-if="error" :message="error" />
      </template>
      <template #output>
        <ResultPanel v-if="!jwt || error" text="" />
        <div v-else class="jwt-parts">
          <div class="part">
            <div class="part-header">
              <n-tag type="info" size="small">HEADER</n-tag>
              <CopyButton :text="headerJson" />
            </div>
            <ResultPanel :text="headerJson" />
          </div>
          <div class="part">
            <div class="part-header">
              <n-tag type="warning" size="small">PAYLOAD</n-tag>
              <CopyButton :text="payloadJson" />
            </div>
            <ResultPanel :text="payloadJson" />
          </div>
          <div class="part">
            <div class="part-header">
              <n-tag size="small">SIGNATURE</n-tag>
              <CopyButton :text="jwt.signature" />
            </div>
            <code class="sig">{{ jwt.signature }}</code>
          </div>
        </div>
      </template>
    </IoLayout>
    <div class="tool-actions">
      <n-button secondary @click="clear">清除</n-button>
      <n-button type="primary" style="min-width: 160px" @click="run">解码</n-button>
    </div>
    <n-tag v-if="jwt && expired" type="error" style="margin-top: 8px">⚠ 已过期</n-tag>
    <n-tag v-else-if="jwt" type="success" style="margin-top: 8px">未过期</n-tag>
  </ToolLayout>
</template>

<style scoped>
.jwt-parts { display: flex; flex-direction: column; gap: var(--app-spacing-md); }
.part-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--app-spacing-sm); }
.sig { font-family: var(--app-font-mono); font-size: 12px; word-break: break-all; color: var(--app-text-muted); padding: var(--app-spacing-sm) var(--app-spacing-md); background: var(--app-bg-soft); border-radius: var(--app-radius-sm); display: block; border: 1px solid var(--app-border); }
</style>
