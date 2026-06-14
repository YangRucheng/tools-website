<script setup lang="ts">
defineProps<{ title: string }>();
</script>

<template>
  <div class="tool-layout">
    <h1 class="tool-title">{{ title }}</h1>
    <slot />
  </div>
</template>

<style scoped>
.tool-layout {
  max-width: var(--app-max-width);
  margin: 0 auto;
}

.tool-title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: var(--app-spacing-lg);
  color: var(--app-text);
  letter-spacing: -0.3px;
}
</style>
