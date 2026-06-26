<template>
  <div class="tag-list">
    <el-tag
      v-for="tag in tags"
      :key="`${tag.type}-${tag.id}`"
      :type="tagTypeMap[tag.type] || 'info'"
      effect="light"
      round
    >
      {{ tag.displayName || tag.name }}
      <span v-if="showCount && tag.count"> · {{ tag.count }}</span>
    </el-tag>
    <span v-if="!tags.length" class="empty">暂无标签</span>
  </div>
</template>

<script setup>
const tagTypeMap = {
  positive: "success",
  neutral: "warning",
  risk: "danger"
};

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
  gap: 8px;
}

.empty {
  color: #9ca3af;
  font-size: 13px;
}
</style>
