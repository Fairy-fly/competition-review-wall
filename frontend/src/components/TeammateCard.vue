<template>
  <article class="teammate-card">
    <div class="card-grid" aria-hidden="true"></div>
    <div class="card-head">
      <div class="avatar-ring">
        <span>{{ initials }}</span>
      </div>
      <div class="identity">
        <h3>{{ user.realName || "匿名队友" }}</h3>
        <p>{{ user.major || "未填写专业" }} · {{ user.grade || "未填写年级" }}</p>
      </div>
      <div class="score-badge">
        <strong>{{ formatScore(user.averageScore) }}</strong>
        <span>综合</span>
      </div>
    </div>

    <div class="skill-line">
      <span>技能方向</span>
      <strong>{{ user.skillDirection || "等待补充" }}</strong>
    </div>

    <div class="portrait-metrics">
      <div>
        <strong>{{ user.reviewCount || 0 }}</strong>
        <span>评价</span>
      </div>
      <div class="again">
        <strong>{{ user.willingAgainRate || 0 }}%</strong>
        <span>再次组队</span>
      </div>
      <div>
        <strong>{{ tagCount }}</strong>
        <span>标签</span>
      </div>
    </div>

    <div class="mini-radar" aria-hidden="true">
      <span style="--level: 88%"></span>
      <span style="--level: 72%"></span>
      <span style="--level: 64%"></span>
      <span style="--level: 80%"></span>
    </div>

    <TagList :tags="topTags" />

    <div class="card-footer">
      <span class="status-pill" :class="{ muted: !user.reviewCount }">
        {{ user.reviewCount ? "画像已沉淀" : "等待首条评价" }}
      </span>
      <el-button type="primary" link @click="$emit('open', user)">查看画像</el-button>
    </div>
  </article>
</template>

<script setup>
import { computed } from "vue";
import TagList from "@/components/TagList.vue";

const props = defineProps({
  user: {
    type: Object,
    required: true
  }
});

defineEmits(["open"]);

const initials = computed(() => {
  const name = props.user.realName || "队友";
  return name.slice(-2);
});

const topTags = computed(() => (props.user.topTags || []).slice(0, 4));
const tagCount = computed(() => props.user.topTags?.length || 0);

function formatScore(value) {
  const score = Number(value || 0);
  return Number.isInteger(score) ? score : score.toFixed(1);
}
</script>

<style scoped>
.teammate-card {
  position: relative;
  overflow: hidden;
  min-height: 292px;
  padding: 18px;
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-lg);
  background:
    linear-gradient(180deg, rgba(255,255,255,0.96), rgba(248,250,252,0.92)),
    var(--surface-solid);
  box-shadow: var(--shadow-xs);
  transition: transform var(--transition-base), box-shadow var(--transition-base), border-color var(--transition-base);
}

.teammate-card:hover {
  transform: translateY(-4px);
  border-color: rgba(75,92,240,0.28);
  box-shadow: var(--shadow-card);
}

.card-grid {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(75,92,240,0.055) 1px, transparent 1px),
    linear-gradient(90deg, rgba(75,92,240,0.055) 1px, transparent 1px);
  background-size: 28px 28px;
  mask-image: linear-gradient(135deg, rgba(0,0,0,0.55), transparent 58%);
}

.card-head,
.skill-line,
.portrait-metrics,
.mini-radar,
.card-footer,
:deep(.tag-list) {
  position: relative;
  z-index: 1;
}

.card-head {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
}

.avatar-ring {
  width: 54px;
  height: 54px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  color: #fff;
  font-weight: 750;
  background: linear-gradient(135deg, var(--brand-primary), #6677ff);
  box-shadow: 0 12px 24px rgba(75,92,240,0.20);
}

.identity {
  min-width: 0;
}

.identity h3 {
  margin: 0;
  font-size: 18px;
  color: var(--text-main);
  font-weight: 750;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.identity p {
  margin: 3px 0 0;
  color: var(--text-faint);
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.score-badge {
  min-width: 54px;
  padding: 8px 10px;
  border-radius: 14px;
  text-align: center;
  background: var(--primary-soft);
  color: var(--primary);
  border: 1px solid rgba(75,92,240,0.15);
}

.score-badge strong {
  display: block;
  font-size: 19px;
  line-height: 1;
}

.score-badge span {
  display: block;
  margin-top: 3px;
  font-size: 11px;
  color: var(--text-faint);
}

.skill-line {
  margin-top: 16px;
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(248,250,252,0.88);
  border: 1px solid rgba(148,163,184,0.14);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.skill-line span {
  color: var(--text-faint);
  font-size: 12px;
  flex-shrink: 0;
}

.skill-line strong {
  color: var(--text-main);
  font-size: 13px;
  font-weight: 650;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.portrait-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 14px;
}

.portrait-metrics div {
  min-width: 0;
  padding: 10px 8px;
  border-radius: 14px;
  background: #fff;
  border: 1px solid rgba(148,163,184,0.14);
  text-align: center;
}

.portrait-metrics strong {
  display: block;
  color: var(--text-main);
  font-size: 17px;
  line-height: 1;
}

.portrait-metrics span {
  display: block;
  margin-top: 5px;
  color: var(--text-faint);
  font-size: 11px;
}

.portrait-metrics .again strong {
  color: var(--brand-teal);
}

.mini-radar {
  height: 34px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  align-items: end;
  margin: 16px 0 12px;
}

.mini-radar span {
  height: var(--level);
  min-height: 8px;
  border-radius: 999px 999px 4px 4px;
  background: linear-gradient(180deg, rgba(75,92,240,0.75), rgba(24,169,153,0.34));
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 16px;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  min-height: 26px;
  padding: 0 10px;
  border-radius: 999px;
  color: var(--brand-teal-deep);
  background: var(--brand-teal-soft);
  border: 1px solid rgba(24,169,153,0.18);
  font-size: 12px;
  font-weight: 650;
}

.status-pill.muted {
  color: #9a641e;
  background: var(--brand-amber-soft);
  border-color: rgba(217,145,59,0.18);
}

@media (max-width: 520px) {
  .teammate-card {
    min-height: auto;
    padding: 16px;
  }

  .card-head {
    grid-template-columns: auto minmax(0, 1fr);
  }

  .score-badge {
    grid-column: 1 / -1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }
}
</style>
