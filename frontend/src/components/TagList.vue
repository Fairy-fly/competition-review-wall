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
  height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
  flex: 0 0 auto;
  border: 1.4px solid;
  transition: background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
  cursor: default;
}

.tag-positive {
  background: rgba(91,108,255,0.09);
  color: #3F51D1;
  border-color: rgba(91,108,255,0.24);
}

.tag-neutral {
  background: rgba(148,163,184,0.09);
  color: #64748B;
  border-color: rgba(148,163,184,0.20);
}

.tag-risk {
  background: rgba(217,137,34,0.09);
  color: #C57A18;
  border-color: rgba(217,137,34,0.22);
}

.tag-chip:hover {
  transform: none;
  background: rgba(91,108,255,0.12);
  border-color: rgba(91,108,255,0.32);
  box-shadow: 0 2px 8px rgba(91,108,255,0.08);
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
