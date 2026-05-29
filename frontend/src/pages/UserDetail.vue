<template>
  <div class="page-shell">
    <header class="page-header">
      <h1 class="page-title">{{ profile.user?.realName || "队友画像" }}</h1>
      <p class="page-subtitle">
        {{ profile.user?.college || "未填写学院" }} · {{ profile.user?.major || "未填写专业" }} ·
        {{ profile.user?.skillDirection || "未填写技能方向" }}
      </p>
    </header>

    <div class="two-col-grid">
      <section class="section-surface">
        <div class="stat-grid">
          <ScoreCard label="综合分" :value="profile.summary.overallScore || 0" />
          <ScoreCard label="评价次数" :value="profile.summary.reviewCount || 0" accent="#0f766e" />
          <ScoreCard label="参与项目数" :value="profile.summary.projectCount || 0" accent="#7c3aed" />
          <ScoreCard label="再次组队率" :value="`${profile.summary.willingAgainRate || 0}%`" accent="#ea580c" />
        </div>

        <div class="section-block">
          <RadarChart :scores="profile.summary" />
        </div>
      </section>

      <section class="section-surface">
        <div class="surface-actions">
          <div>
            <strong>高频标签</strong>
            <div class="muted-text">这里展示这个同学最稳定的协作印象。</div>
          </div>
        </div>
        <TagList :tags="profile.topTags" show-count />

        <div class="section-block">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="学号">{{ profile.user?.studentNo || "-" }}</el-descriptions-item>
            <el-descriptions-item label="学院">{{ profile.user?.college || "-" }}</el-descriptions-item>
            <el-descriptions-item label="专业">{{ profile.user?.major || "-" }}</el-descriptions-item>
            <el-descriptions-item label="年级">{{ profile.user?.grade || "-" }}</el-descriptions-item>
            <el-descriptions-item label="技能方向">{{ profile.user?.skillDirection || "-" }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </section>
    </div>

    <section class="section-block section-surface">
      <div class="surface-actions">
        <div>
          <strong>匿名评价记录</strong>
          <div class="muted-text">只显示正常状态评价，管理员隐藏后这里会同步消失。</div>
        </div>
      </div>
      <ReviewList :reviews="profile.recentReviews" />
    </section>
  </div>
</template>

<script setup>
import { onMounted, reactive } from "vue";
import { ElMessage } from "element-plus";
import { useRoute } from "vue-router";

import { getProfile } from "@/api/profileApi";
import RadarChart from "@/components/RadarChart.vue";
import ReviewList from "@/components/ReviewList.vue";
import ScoreCard from "@/components/ScoreCard.vue";
import TagList from "@/components/TagList.vue";

const route = useRoute();
const profile = reactive({
  user: {},
  summary: {},
  topTags: [],
  recentReviews: []
});

async function fetchProfile() {
  try {
    const response = await getProfile(route.params.id);
    Object.assign(profile, response.data);
  } catch (error) {
    ElMessage.error(error.message);
  }
}

onMounted(fetchProfile);
</script>

