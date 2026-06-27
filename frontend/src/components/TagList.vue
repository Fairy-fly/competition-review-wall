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
  transition: all 0.15s ease;
}

.tag-positive {
  background: rgba(59, 130, 176, 0.08);
  color: #256c95;
  border: 1.2px solid rgba(59, 130, 176, 0.28);
}

.tag-neutral {
  background: rgba(139, 143, 163, 0.08);
  color: #6b6f85;
  border: 1.2px solid rgba(139, 143, 163, 0.28);
}

.tag-risk {
  background: rgba(212, 139, 74, 0.08);
  color: #b8702d;
  border: 1.2px solid rgba(212, 139, 74, 0.28);
}

.tag-chip:hover {
  filter: brightness(0.95);
}

.tag-count {
  opacity: 0.65;
  font-weight: 400;
}

.empty {
  color: var(--text-faint);
  font-size: 13px;
}
</style>
