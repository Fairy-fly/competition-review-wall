<template>
  <div v-if="reviews.length" class="review-list">
    <article v-for="review in reviews" :key="review.id" class="review-item">
      <div class="review-head">
        <div>
          <div class="review-title">{{ adminMode ? review.reviewerName : "匿名队友" }}</div>
          <div class="review-meta">{{ review.projectName }} · {{ formatDate(review.createdAt) }}</div>
        </div>
        <el-tag :type="review.status === 'hidden' ? 'danger' : 'success'">
          {{ review.status === "hidden" ? "已隐藏" : `${review.overallScore} 分` }}
        </el-tag>
      </div>

      <div class="review-scores">
        <span>任务 {{ review.taskScore }}</span>
        <span>沟通 {{ review.communicationScore }}</span>
        <span>责任 {{ review.responsibilityScore }}</span>
        <span>技能 {{ review.skillScore }}</span>
        <span>{{ review.willingAgain ? "愿意再次组队" : "再次组队意愿低" }}</span>
      </div>

      <p class="review-comment">{{ review.comment || "这条评价没有填写文字内容。" }}</p>
      <p v-if="adminMode && review.hiddenReason" class="review-reason">隐藏原因：{{ review.hiddenReason }}</p>
      <TagList :tags="review.tags" />
      <div v-if="showAppeal && review.status === 'normal'" style="margin-top:10px">
        <el-button type="warning" link size="small" @click="$emit('appeal', review.id)">
          申请申诉
        </el-button>
      </div>
    </article>
  </div>
  <div v-else class="empty-placeholder">还没有评价内容</div>
</template>

<script setup>
import TagList from "./TagList.vue";

defineProps({
  reviews: {
    type: Array,
    default: () => []
  },
  adminMode: {
    type: Boolean,
    default: false
  },
  showAppeal: {
    type: Boolean,
    default: false
  }
});

defineEmits(["appeal"]);

function formatDate(value) {
  if (!value) {
    return "-";
  }
  return new Date(value).toLocaleString("zh-CN");
}
</script>

<style scoped>
.review-list {
  display: grid;
  gap: 14px;
}

.review-item {
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  padding: 20px;
}

.review-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

.review-title {
  font-size: var(--font-size-md);
  font-weight: 650;
  color: var(--color-text-primary);
}

.review-meta {
  margin-top: 4px;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.review-scores {
  margin: 14px 0 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.review-comment {
  margin: 0 0 12px;
  color: var(--color-text-primary);
  line-height: 1.7;
}

.review-reason {
  margin: 0 0 12px;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  background: var(--color-danger-light);
  color: var(--color-danger);
  font-size: var(--font-size-sm);
}

.empty-placeholder {
  padding: 48px 20px;
  text-align: center;
  color: var(--color-text-muted);
  font-size: var(--font-size-base);
}
</style>
