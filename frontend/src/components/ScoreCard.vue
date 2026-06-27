<template>
  <div class="score-card" :style="{ '--accent': accent }">
    <div class="sc-icon-wrap">
      <slot name="icon" />
    </div>
    <div class="sc-value">{{ value }}</div>
    <div class="sc-label">{{ label }}</div>
    <div v-if="hint" class="sc-hint">{{ hint }}</div>
  </div>
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  hint: { type: String, default: "" },
  accent: { type: String, default: "var(--primary)" }
});
</script>

<style scoped>
.score-card {
  background: var(--surface-solid);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  padding: 22px 20px;
  position: relative;
  overflow: hidden;
  transition: box-shadow var(--transition-fast), border-color var(--transition-fast);
}
.score-card::before {
  content: "";
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: var(--accent);
  border-radius: 0 0 2px 2px;
}

.score-card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--accent);
}

.sc-value {
  font-size: 32px;
  font-weight: 750;
  color: var(--text-main);
  letter-spacing: -0.6px;
  line-height: 1.1;
  margin-top: 4px;
}

.sc-label {
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 500;
  margin-top: 6px;
}

.sc-hint {
  margin-top: 4px;
  color: var(--text-faint);
  font-size: 12px;
}
</style>
