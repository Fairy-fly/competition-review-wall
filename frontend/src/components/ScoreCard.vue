<template>
  <div class="score-card" :style="{ '--sc-color': accent }">
    <div class="sc-glow"></div>
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
  position: relative;
  overflow: hidden;
  min-height: 130px;
  border-radius: 20px;
  padding: 22px 22px 18px;
  border: 1px solid rgba(148,163,184,0.14);
  background: linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(248,250,252,0.80) 100%);
  box-shadow: 0 14px 36px rgba(15,23,42,0.045);
  transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
}
.sc-glow {
  position: absolute; right: -18px; top: -18px;
  width: 72px; height: 72px; border-radius: 999px;
  background: radial-gradient(circle, color-mix(in srgb, var(--sc-color) 20%, transparent), transparent 70%);
  opacity: 0.7; pointer-events: none;
}
.score-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 22px 52px rgba(15,23,42,0.07);
  border-color: color-mix(in srgb, var(--sc-color) 28%, rgba(148,163,184,0.16));
}
.sc-value {
  font-size: 34px; font-weight: 800; color: #0f172a;
  letter-spacing: -0.04em; line-height: 1; position: relative; z-index: 1;
}
.sc-label {
  color: #475569; font-size: 14px; font-weight: 650;
  margin-top: 12px; position: relative; z-index: 1;
}
.sc-hint {
  margin-top: 3px; color: #94a3b8; font-size: 12px;
  position: relative; z-index: 1;
}
</style>
