<template>
  <div class="page-shell">
    <header class="page-header">
      <h1 class="page-title">个人中心</h1>
      <p class="page-subtitle">维护基础资料，同时看清自己在队友眼里的协作画像。</p>
    </header>

    <div class="two-col-grid">
      <section class="section-surface">
        <div class="surface-actions">
          <div>
            <strong>资料维护</strong>
            <div class="muted-text">修改后的信息会同步到测评墙公开画像。</div>
          </div>
        </div>

        <el-form :model="form" label-width="96px">
          <el-form-item label="学号">
            <el-input :model-value="userStore.currentUser?.studentNo" disabled />
          </el-form-item>
          <el-form-item label="姓名">
            <el-input v-model="form.realName" />
          </el-form-item>
          <el-form-item label="学院">
            <el-input v-model="form.college" />
          </el-form-item>
          <el-form-item label="专业">
            <el-input v-model="form.major" />
          </el-form-item>
          <el-form-item label="年级">
            <el-input v-model="form.grade" />
          </el-form-item>
          <el-form-item label="技能方向">
            <el-input v-model="form.skillDirection" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :loading="saving" @click="saveProfile">保存资料</el-button>
          </el-form-item>
        </el-form>
      </section>

      <section class="section-surface">
        <div class="surface-actions">
          <div>
            <strong>我的协作概览</strong>
            <div class="muted-text">这些数据来自正常状态的匿名评价。</div>
          </div>
        </div>
        <div class="stat-grid">
          <ScoreCard label="综合分" :value="profile.summary.overallScore || 0" />
          <ScoreCard label="评价次数" :value="profile.summary.reviewCount || 0" accent="#0f766e" />
          <ScoreCard label="参与项目数" :value="profile.summary.projectCount || 0" accent="#7c3aed" />
          <ScoreCard label="再次组队率" :value="`${profile.summary.willingAgainRate || 0}%`" accent="#ea580c" />
        </div>

        <div class="section-block">
          <RadarChart :scores="profile.summary" />
        </div>

        <div class="section-block">
          <strong>高频标签</strong>
          <div class="muted-text" style="margin: 6px 0 10px">最容易被队友记住的协作印象。</div>
          <TagList :tags="profile.topTags" show-count />
        </div>
      </section>
    </div>

    <section class="section-block section-surface">
      <div class="surface-actions">
        <div>
          <strong>最近收到的匿名评价</strong>
          <div class="muted-text">前台始终只展示匿名队友，不暴露评价人身份。</div>
        </div>
      </div>
      <ReviewList :reviews="profile.recentReviews" />
    </section>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import { ElMessage } from "element-plus";

import { getProfile } from "@/api/profileApi";
import { updateCurrentUser } from "@/api/userApi";
import RadarChart from "@/components/RadarChart.vue";
import ReviewList from "@/components/ReviewList.vue";
import ScoreCard from "@/components/ScoreCard.vue";
import TagList from "@/components/TagList.vue";
import { useUserStore } from "@/store/user";

const userStore = useUserStore();
const saving = ref(false);
const profile = reactive({
  summary: {},
  topTags: [],
  recentReviews: []
});

const form = reactive({
  realName: "",
  college: "",
  major: "",
  grade: "",
  skillDirection: ""
});

function syncForm() {
  Object.assign(form, {
    realName: userStore.currentUser?.realName || "",
    college: userStore.currentUser?.college || "",
    major: userStore.currentUser?.major || "",
    grade: userStore.currentUser?.grade || "",
    skillDirection: userStore.currentUser?.skillDirection || ""
  });
}

async function fetchProfile() {
  if (!userStore.currentUser?.id) {
    return;
  }

  const response = await getProfile(userStore.currentUser.id);
  Object.assign(profile, response.data);
}

async function saveProfile() {
  saving.value = true;
  try {
    const response = await updateCurrentUser(form);
    userStore.persistSession(userStore.token, response.data);
    syncForm();
    await fetchProfile();
    ElMessage.success("个人资料已更新");
  } catch (error) {
    ElMessage.error(error.message);
  } finally {
    saving.value = false;
  }
}

onMounted(async () => {
  syncForm();
  try {
    await fetchProfile();
  } catch (error) {
    ElMessage.error(error.message);
  }
});
</script>

