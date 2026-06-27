<template>
  <div class="tag-list">
    <span
      v-for="tag in tags"
      :key="`${tag.type}-${tag.id}`"
      class="tag-chip"
      :class="`tag-${tag.type}`"
    >
      {{ tag.displayName || tag.name }}
      <span v-if="showCount && tag.count" class="tag-count">{{ tag.count }}</span>
    </span>
    <span v-if="!tags.length" class="empty">暂无标签</span>
  </div>
</template>

<script setup>
defineProps({
  tags: { type: Array, default: () => [] },
  showCount: { type: Boolean, default: false }
});
</script>

<style scoped>
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  overflow: visible;
}

.tag-chip {
  display: inline-flex;
  align-items: center;
  box-sizing: border-box;
  min-height: 26px;
  height: auto;
  padding: 5px 11px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.2;
  white-space: nowrap;
  flex: 0 0 auto;
  border-width: 1px;
  border-style: solid;
  transition: background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
  cursor: default;
}

.tag-positive {
  background: rgba(91,108,255,0.08);
  color: #5360D8;
  border-color: rgba(91,108,255,0.22);
}

.tag-neutral {
  background: rgba(100,116,139,0.08);
  color: #64748B;
  border-color: rgba(100,116,139,0.18);
}

.tag-risk {
  background: rgba(239,68,68,0.06);
  color: #C24141;
  border-color: rgba(239,68,68,0.16);
}

.tag-chip:hover {
  transform: none;
  background: rgba(91,108,255,0.12);
  border-color: rgba(91,108,255,0.28);
  box-shadow: 0 2px 8px rgba(91,108,255,0.06);
}

.tag-count {
  opacity: 0.55;
  font-weight: 400;
  margin-left: 1px;
}

.empty {
  color: var(--text-faint);
  font-size: 13px;
}
</style>
