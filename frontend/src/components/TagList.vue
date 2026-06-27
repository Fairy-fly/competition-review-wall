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
  max-height: 96px;
  overflow: hidden;
}

.tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.5;
  white-space: nowrap;
  transition: all 0.18s ease;
  cursor: default;
}

.tag-positive {
  background: rgba(59, 130, 176, 0.10);
  color: #1e5a7a;
  border: 1.4px solid rgba(59, 130, 176, 0.35);
}

.tag-neutral {
  background: rgba(100, 116, 139, 0.08);
  color: #4a5568;
  border: 1.4px solid rgba(100, 116, 139, 0.30);
}

.tag-risk {
  background: rgba(212, 139, 74, 0.10);
  color: #a45d1e;
  border: 1.4px solid rgba(212, 139, 74, 0.35);
}

.tag-chip:hover {
  transform: translateY(-1px);
  filter: brightness(0.92);
}

.tag-count {
  opacity: 0.6;
  font-weight: 400;
}

.empty {
  color: var(--text-faint);
  font-size: 13px;
}
</style>
