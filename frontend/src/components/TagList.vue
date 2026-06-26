<template>
  <div class="tag-list">
    <span
      v-for="tag in tags"
      :key="`${tag.type}-${tag.id}`"
      class="tag-chip"
      :class="`tag-${tag.type}`"
    >
      {{ tag.displayName || tag.name }}
      <span v-if="showCount && tag.count" class="tag-count">· {{ tag.count }}</span>
    </span>
    <span v-if="!tags.length" class="empty">暂无标签</span>
  </div>
</template>

<script setup>
defineProps({
  tags: {
    type: Array,
    default: () => []
  },
  showCount: {
    type: Boolean,
    default: false
  }
});
</script>

<style scoped>
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.tag-chip {
  display: inline-flex;
  align-items: center;
  padding: 3px 11px;
  border-radius: 20px;
  font-size: var(--font-size-xs);
  font-weight: 500;
  line-height: 1.6;
  white-space: nowrap;
}

.tag-positive {
  background: var(--color-positive-light);
  color: var(--color-positive);
  border: 1px solid rgba(59, 130, 176, 0.18);
}

.tag-neutral {
  background: var(--color-neutral-light);
  color: var(--color-neutral);
  border: 1px solid rgba(139, 143, 163, 0.18);
}

.tag-risk {
  background: var(--color-risk-light);
  color: var(--color-risk);
  border: 1px solid rgba(212, 139, 74, 0.18);
}

.tag-count {
  margin-left: 3px;
  opacity: 0.7;
}

.empty {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}
</style>
