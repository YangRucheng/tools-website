<script setup lang="ts">
import { ref, inject, watch } from 'vue';
import { NButton, NSelect } from 'naive-ui';
import { generateQrSvg } from './qrcodeUtils';
import ErrorAlert from '@/components/common/ErrorAlert.vue';
import ToolLayout from '@/components/common/ToolLayout.vue';
import ToolInput from '@/components/common/ToolInput.vue';
import ToolOptionsBar from '@/components/common/ToolOptionsBar.vue';
import IoLayout from '@/components/common/IoLayout.vue';
import ResultPanel from '@/components/common/ResultPanel.vue';
import { useToolStorage } from '@/composables/useToolStorage';
import { useSharedStateRestore } from '@/composables/useSharedStateRestore';
import type { ToolShareState } from '@/tools/types';

const { input, ecc, scale, clear } = useToolStorage('qrcode', {
  input: '',
  ecc: 'high' as 'low' | 'medium' | 'quartile' | 'high',
  scale: 8,
});

const svgOutput = ref('');
const error = ref('');

const setToolState = inject<(state: ToolShareState) => void>('setToolState', () => {});

const eccOptions = [
  { label: '低 (7%)', value: 'low' },
  { label: '中 (15%)', value: 'medium' },
  { label: '高 (25%)', value: 'quartile' },
  { label: '最高 (30%)', value: 'high' },
];

const scaleOptions = [
  { label: '小', value: 4 },
  { label: '中', value: 8 },
  { label: '大', value: 12 },
];

const updateShareState = () => {
  setToolState({ input: input.value, ecc: ecc.value, scale: scale.value });
};

const run = async () => {
  const result = await generateQrSvg(input.value, ecc.value, scale.value);
  if (result.success) {
    svgOutput.value = result.data ?? '';
    error.value = '';
  } else {
    svgOutput.value = '';
    error.value = result.error ?? '';
  }
  updateShareState();
};

const downloadPng = () => {
  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(svgOutput.value, 'image/svg+xml');
  const svgEl = svgDoc.querySelector('svg');
  if (!svgEl) return;
  const svgData = new XMLSerializer().serializeToString(svgEl);
  const canvas = document.createElement('canvas');
  const w = parseInt(svgEl.getAttribute('width') || '232');
  const h = parseInt(svgEl.getAttribute('height') || '232');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const img = new Image();
  const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  img.onload = () => {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    URL.revokeObjectURL(url);
    canvas.toBlob((pngBlob) => {
      if (!pngBlob) return;
      const downloadUrl = URL.createObjectURL(pngBlob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = 'qrcode.png';
      a.click();
      URL.revokeObjectURL(downloadUrl);
    });
  };
  img.src = url;
};

useSharedStateRestore({ input, ecc, scale }, () => {
  if (input.value) run();
});

watch([input, ecc, scale], () => updateShareState());
</script>

<template>
  <ToolLayout title="二维码生成">
    <ToolOptionsBar>
      <n-select v-model:value="ecc" :options="eccOptions" style="width: 140px" placeholder="纠错级别" />
      <n-select v-model:value="scale" :options="scaleOptions" style="width: 80px" placeholder="大小" />
    </ToolOptionsBar>
    <IoLayout>
      <template #input>
        <ToolInput
          v-model="input"
          :rows="4"
          placeholder="输入要编码的文本或 URL..."
        />
        <ErrorAlert v-if="error" :message="error" />
      </template>
      <template #output>
        <div v-if="svgOutput && !error" class="qr-display">
          <div class="qr-svg" v-html="svgOutput" />
          <n-button style="margin-top: 12px" @click="downloadPng" secondary>下载 PNG</n-button>
        </div>
        <ResultPanel v-else text="" />
      </template>
    </IoLayout>
    <div class="tool-actions">
      <n-button secondary @click="clear">清除</n-button>
      <n-button type="primary" style="min-width: 160px" @click="run">生成二维码</n-button>
    </div>
  </ToolLayout>
</template>

<style scoped>
.qr-display { display: flex; flex-direction: column; align-items: center; padding: var(--app-spacing-lg); background: #ffffff; border-radius: var(--app-radius); border: 1px solid var(--app-border); }
.qr-svg :deep(svg) { display: block; max-width: 100%; height: auto; }
</style>
