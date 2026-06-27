<template>
  <svg viewBox="0 0 44 44" class="brand-logo-svg" aria-label="竞赛队友测评墙">
    <!-- ring -->
    <circle cx="22" cy="22" r="19" fill="none" stroke="rgba(255,255,255,0.20)" stroke-width="1.2"/>
    <circle cx="22" cy="22" r="15" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="0.8" stroke-dasharray="4 6"/>
    <!-- nodes -->
    <circle cx="22" cy="6" r="2.5" fill="rgba(255,255,255,0.70)"/>
    <circle cx="36" cy="22" r="2.5" fill="rgba(255,255,255,0.70)"/>
    <circle cx="12" cy="32" r="2.5" fill="rgba(255,255,255,0.70)"/>
    <circle cx="10" cy="14" r="2.5" fill="rgba(255,255,255,0.70)"/>
    <!-- center -->
    <circle cx="22" cy="22" r="3" fill="#5B6CFF" stroke="rgba(255,255,255,0.5)" stroke-width="1"/>
    <!-- connections -->
    <line x1="22" y1="6" x2="22" y2="22" stroke="rgba(255,255,255,0.25)" stroke-width="0.9"/>
    <line x1="36" y1="22" x2="22" y2="22" stroke="rgba(91,108,255,0.35)" stroke-width="0.9"/>
    <line x1="12" y1="32" x2="22" y2="22" stroke="rgba(24,169,153,0.30)" stroke-width="0.9"/>
    <line x1="10" y1="14" x2="22" y2="22" stroke="rgba(255,255,255,0.20)" stroke-width="0.9"/>
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
</style>
