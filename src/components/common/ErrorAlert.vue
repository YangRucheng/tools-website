<script setup lang="ts">
defineProps<{ message: string }>();
</script>

<template>
  <div class="error-alert">
    <span class="error-icon">⚠</span>
    <span class="error-text">{{ message }}</span>
  </div>
</template>

<style scoped>
.error-alert {
  display: flex;
  align-items: flex-start;
  gap: var(--app-spacing-sm);
  padding: var(--app-spacing-sm) var(--app-spacing-md);
  border-radius: var(--app-radius-sm);
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
  font-size: 13px;
}

[data-theme="dark"] .error-alert {
  background: #451a1a;
  border-color: #7f1d1d;
  color: #fca5a5;
}

.error-icon {
  flex-shrink: 0;
}

.error-text {
  word-break: break-all;
}
</style>
