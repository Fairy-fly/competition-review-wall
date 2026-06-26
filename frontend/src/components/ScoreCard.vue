<template>
  <div class="score-card" :style="{ borderTopColor: accent }">
    <div class="score-label">{{ label }}</div>
    <div class="score-value">{{ value }}</div>
    <div v-if="hint" class="score-hint">{{ hint }}</div>
  </div>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  hint: {
    type: String,
    default: ""
  },
  accent: {
    type: String,
    default: "var(--color-brand)"
  }
});
</script>

<style scoped>
.score-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-top-width: 3px;
  border-radius: var(--radius-md);
  padding: 20px;
  transition: box-shadow var(--transition-fast);
}

.score-card:hover {
  box-shadow: var(--shadow-md);
}

.score-label {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  font-weight: 500;
  letter-spacing: 0.3px;
  text-transform: uppercase;
}

.score-value {
  margin-top: 8px;
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--color-text-primary);
  letter-spacing: -0.6px;
  line-height: 1.1;
}

.score-hint {
  margin-top: 6px;
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
}
</style>
