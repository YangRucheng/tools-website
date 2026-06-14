<script setup lang="ts">
</script>

<template>
  <div class="io-layout">
    <div class="io-pane">
      <slot name="input" />
    </div>
    <div class="io-pane">
      <slot name="output" />
    </div>
  </div>
</template>

<style scoped>
.io-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--app-spacing-lg);
  align-items: start;
  margin-top: var(--app-spacing-md);
}

.io-pane {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--app-spacing-md);
}

@media (max-width: 768px) {
  .io-layout {
    grid-template-columns: 1fr;
  }
}
</style>
