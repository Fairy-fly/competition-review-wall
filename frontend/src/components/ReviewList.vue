<template>
  <div v-if="reviews.length" class="review-list">
    <article v-for="review in reviews" :key="review.id" class="review-note" :class="{ hidden: review.status === 'hidden' }">
      <div class="review-head">
        <div class="review-author">
          <span class="anonymous-badge">{{ adminMode ? review.reviewerName : "匿名队友" }}</span>
          <div class="review-meta">{{ review.projectName }} · {{ formatDate(review.createdAt) }}</div>
        </div>
        <el-tag :type="review.status === 'hidden' ? 'danger' : 'primary'" effect="light">
          {{ review.status === "hidden" ? "已隐藏" : `综合 ${review.overallScore} 分` }}
        </el-tag>
      </div>

      <div class="review-scores">
        <span>任务 {{ review.taskScore }}</span>
        <span>沟通 {{ review.communicationScore }}</span>
        <span>责任 {{ review.responsibilityScore }}</span>
        <span>技能 {{ review.skillScore }}</span>
        <span :class="review.willingAgain ? 'again yes' : 'again no'">
          {{ review.willingAgain ? "愿意再次组队" : "再次组队意愿低" }}
        </span>
      </div>

      <p class="review-comment">{{ review.comment || "这条评价没有填写文字内容。" }}</p>
      <p v-if="adminMode && review.hiddenReason" class="review-reason">隐藏原因：{{ review.hiddenReason }}</p>
      <TagList :tags="review.tags" />
      <div v-if="showAppeal && review.status === 'normal'" class="appeal-row">
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
  gap: 16px;
}

.review-note {
  position: relative;
  overflow: hidden;
  background:
    linear-gradient(rgba(217,145,59,0.045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(217,145,59,0.035) 1px, transparent 1px),
    #fffdfa;
  background-size: 22px 22px;
  border: 1px solid rgba(217,145,59,0.22);
  border-radius: var(--radius-lg);
  padding: 18px 20px;
  box-shadow: 0 12px 28px rgba(15,23,42,0.045);
  transition: transform var(--transition-base), box-shadow var(--transition-base), border-color var(--transition-base);
}

.review-note::before {
  content: "";
  position: absolute;
  left: 0;
  top: 18px;
  bottom: 18px;
  width: 4px;
  border-radius: 0 999px 999px 0;
  background: var(--brand-amber);
}

.review-note:hover {
  transform: translateY(-2px);
  border-color: rgba(217,145,59,0.36);
  box-shadow: var(--shadow-card);
}

.review-note.hidden {
  background:
    linear-gradient(rgba(229,107,122,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(229,107,122,0.035) 1px, transparent 1px),
    #fff9fa;
  border-color: rgba(229,107,122,0.20);
}

.review-note.hidden::before {
  background: var(--brand-rose);
}

.review-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

.review-author {
  min-width: 0;
}

.anonymous-badge {
  display: inline-flex;
  min-height: 28px;
  align-items: center;
  padding: 0 11px;
  border-radius: 999px;
  color: var(--brand-primary);
  background: var(--primary-soft);
  border: 1px solid rgba(75,92,240,0.16);
  font-size: 13px;
  font-weight: 750;
}

.review-meta {
  margin-top: 7px;
  color: var(--text-faint);
  font-size: 12px;
}

.review-scores {
  margin: 16px 0 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.review-scores span {
  display: inline-flex;
  align-items: center;
  min-height: 26px;
  padding: 0 10px;
  border-radius: 999px;
  color: var(--text-muted);
  background: rgba(255,255,255,0.78);
  border: 1px solid rgba(148,163,184,0.16);
  font-size: 12px;
  font-weight: 650;
}

.review-scores .again.yes {
  color: var(--brand-teal-deep);
  background: var(--brand-teal-soft);
  border-color: rgba(24,169,153,0.20);
}

.review-scores .again.no {
  color: #B8354A;
  background: var(--brand-rose-soft);
  border-color: rgba(229,107,122,0.20);
}

.review-comment {
  margin: 0 0 14px;
  color: var(--text-main);
  line-height: 1.85;
  font-size: 15px;
}

.review-reason {
  margin: 0 0 12px;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  background: var(--brand-rose-soft);
  color: #B8354A;
  font-size: 13px;
}

.appeal-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
  opacity: 0.78;
}

.empty-placeholder {
  padding: 48px 20px;
  text-align: center;
  color: var(--text-faint);
  font-size: 15px;
}

@media (max-width: 560px) {
  .review-head {
    flex-direction: column;
  }
}
</style>
