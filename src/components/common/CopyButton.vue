<script setup lang="ts">
import { ref } from 'vue';
import { NButton } from 'naive-ui';
import { useClipboard } from '@/composables/useClipboard';
import { COPY_ICON, CHECK_ICON } from '@/utils/icons';

const props = defineProps<{ text: string }>();
const { copy } = useClipboard();
const copied = ref(false);

const handleCopy = async () => {
  const ok = await copy(props.text);
  if (ok) {
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  }
};
</script>

<template>
  <n-button size="small" quaternary @click="handleCopy" :type="copied ? 'success' : 'default'">
    <span class="icon-inner" v-html="copied ? CHECK_ICON : COPY_ICON" />
    {{ copied ? '已复制' : '复制' }}
  </n-button>
</template>

<style scoped>
.icon-inner {
  margin-right: 4px;
}
</style>
