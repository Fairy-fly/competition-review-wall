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
        <span>技术 {{ review.skillScore }}</span>
        <span>{{ review.willingAgain ? "愿意再次组队" : "再次组队意愿低" }}</span>
      </div>

      <p class="review-comment">{{ review.comment || "这条评价没有填写文字内容。" }}</p>
      <TagList :tags="review.tags" />
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
  }
});

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
  gap: 16px;
}

.review-item {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 18px;
}

.review-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

.review-title {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}

.review-meta {
  margin-top: 4px;
  color: #6b7280;
  font-size: 13px;
}

.review-scores {
  margin: 14px 0 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  color: #475569;
  font-size: 13px;
}

.review-comment {
  margin: 0 0 12px;
  color: #334155;
}
</style>

