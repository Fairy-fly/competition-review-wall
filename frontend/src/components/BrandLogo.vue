<template>
  <svg viewBox="0 0 48 48" class="brand-logo-svg" aria-label="竞赛队友测评墙">
    <!-- outer radar ring -->
    <circle cx="24" cy="24" r="22" fill="none" stroke="rgba(91,108,255,0.18)" stroke-width="1"/>
    <circle cx="24" cy="24" r="19" fill="none" stroke="rgba(91,108,255,0.10)" stroke-width="0.6" stroke-dasharray="3 5"/>
    <!-- network lines -->
    <line x1="24" y1="4" x2="24" y2="23" stroke="rgba(91,108,255,0.28)" stroke-width="1"/>
    <line x1="42" y1="18" x2="25" y2="23" stroke="rgba(91,108,255,0.32)" stroke-width="1"/>
    <line x1="8" y1="26" x2="23" y2="24" stroke="rgba(24,169,153,0.25)" stroke-width="1"/>
    <line x1="18" y1="42" x2="23" y2="25" stroke="rgba(91,108,255,0.22)" stroke-width="1"/>
    <line x1="34" y1="40" x2="25" y2="25" stroke="rgba(24,169,153,0.20)" stroke-width="1"/>
    <line x1="12" y1="10" x2="23" y2="23" stroke="rgba(145,163,184,0.22)" stroke-width="0.8"/>
    <!-- peripheral nodes -->
    <circle cx="24" cy="4" r="2.4" fill="rgba(91,108,255,0.55)"/>
    <circle cx="42" cy="18" r="2.4" fill="rgba(91,108,255,0.50)"/>
    <circle cx="8" cy="26" r="2.4" fill="rgba(24,169,153,0.45)"/>
    <circle cx="18" cy="42" r="2.4" fill="rgba(91,108,255,0.40)"/>
    <circle cx="34" cy="40" r="2.4" fill="rgba(24,169,153,0.38)"/>
    <circle cx="12" cy="10" r="2" fill="rgba(145,163,184,0.35)"/>
    <!-- center node -->
    <circle cx="24" cy="24" r="3.8" fill="#5B6CFF"/>
    <circle cx="24" cy="24" r="3.8" fill="none" stroke="rgba(91,108,255,0.40)" stroke-width="1.5">
      <animate attributeName="r" values="3.8;5.5;3.8" dur="3s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.4;0.08;0.4" dur="3s" repeatCount="indefinite"/>
    </circle>
  </svg>
</template>

<script setup>
defineProps({
  size: { type: Number, default: 44 }
});
</script>

<style scoped>
.brand-logo-svg {
  width: v-bind(size + 'px');
  height: v-bind(size + 'px');
  display: block;
  flex-shrink: 0;
}
@media (prefers-reduced-motion: reduce) {
  .brand-logo-svg circle[stroke="rgba(91,108,255,0.40)"] animate { animation: none; }
}
</style>
