<script setup lang="ts">
import { NSpace } from 'naive-ui';
</script>

<template>
  <n-space :size="12" align="center" class="tool-options-bar">
    <slot />
  </n-space>
</template>

<style scoped>
.tool-options-bar {
  flex-wrap: wrap;
}
</style>
