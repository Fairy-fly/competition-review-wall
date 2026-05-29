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
    default: "#2563eb"
  }
});
</script>

<style scoped>
.score-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-top-width: 4px;
  border-radius: 8px;
  padding: 18px;
  min-height: 112px;
}

.score-label {
  color: #6b7280;
  font-size: 13px;
}

.score-value {
  margin-top: 10px;
  font-size: 28px;
  font-weight: 700;
  color: #111827;
}

.score-hint {
  margin-top: 8px;
  color: #94a3b8;
  font-size: 12px;
}
</style>

