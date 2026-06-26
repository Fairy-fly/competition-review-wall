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
            <div class="muted-text">这些信息会同步到测评墙公开画像。</div>
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
            <el-button @click="router.push(`/users/${userStore.currentUser?.id}`)">查看公开画像</el-button>
          </el-form-item>
        </el-form>
      </section>

      <section class="section-surface">
        <div class="surface-actions">
          <div>
            <strong>我的协作概览</strong>
            <div class="muted-text">仅统计正常状态的匿名评价。</div>
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
          <div class="muted-text tag-note">这些标签代表队友最容易记住的协作印象。</div>
          <TagList :tags="profile.topTags" show-count />
        </div>
      </section>
    </div>

    <section class="section-block three-col-grid">
      <div class="section-surface">
        <div class="surface-actions">
          <div>
            <strong>近 3 个参与项目</strong>
            <div class="muted-text">用于快速回忆画像来自哪些竞赛经历。</div>
          </div>
        </div>
        <div v-if="profile.recentProjects.length" class="mini-list">
          <button
            v-for="project in profile.recentProjects"
            :key="project.id"
            class="mini-row"
            @click="router.push(`/projects/${project.id}`)"
          >
            <span>
              <strong>{{ project.name }}</strong>
              <small>{{ project.type || "未填写类型" }} · {{ project.roleInTeam || "队员" }}</small>
            </span>
            <el-tag size="small">{{ statusText(project.status) }}</el-tag>
          </button>
        </div>
        <div v-else class="empty-placeholder">暂无参与项目</div>
      </div>

      <div class="section-surface">
        <div class="surface-actions">
          <div>
            <strong>我收藏的队友</strong>
            <div class="muted-text">适合后续组队时重点关注。</div>
          </div>
          <el-button link type="primary" @click="router.push('/')">去测评墙找人</el-button>
        </div>
        <div v-if="favorites.length" class="mini-list">
          <button v-for="user in favorites" :key="user.id" class="mini-row" @click="router.push(`/users/${user.id}`)">
            <span>
              <strong>{{ user.realName }}</strong>
              <small>{{ user.major || "未填写专业" }} · {{ user.skillDirection || "未填写方向" }}</small>
            </span>
            <el-tag size="small" type="success">{{ user.averageScore || 0 }} 分</el-tag>
          </button>
        </div>
        <div v-else class="empty-placeholder">暂未收藏队友</div>
      </div>

      <div class="section-surface">
        <div class="surface-actions">
          <div>
            <strong>指标说明</strong>
            <div class="muted-text">答辩展示时可以直接解释统计口径。</div>
          </div>
        </div>
        <ul class="explain-list">
          <li>综合分来自正常状态评价的平均分。</li>
          <li>再次组队率表示愿意再次组队的评价占比。</li>
          <li>管理员隐藏评价后，前台画像会自动剔除。</li>
        </ul>
      </div>
    </section>

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
import { useRouter } from "vue-router";

import { getProfile } from "@/api/profileApi";
import { getFavorites, updateCurrentUser } from "@/api/userApi";
import RadarChart from "@/components/RadarChart.vue";
import ReviewList from "@/components/ReviewList.vue";
import ScoreCard from "@/components/ScoreCard.vue";
import TagList from "@/components/TagList.vue";
import { useUserStore } from "@/store/user";

const router = useRouter();
const userStore = useUserStore();
const saving = ref(false);
const favorites = ref([]);
const profile = reactive({
  summary: {},
  topTags: [],
  recentTags: [],
  recentProjects: [],
  recentReviews: []
});

const form = reactive({
  realName: "",
  college: "",
  major: "",
  grade: "",
  skillDirection: ""
});

const statusMap = {
  ongoing: "进行中",
  reviewable: "可评价",
  archived: "已归档"
};

function statusText(status) {
  return statusMap[status] || status || "-";
}

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

  const [profileRes, favoritesRes] = await Promise.all([
    getProfile(userStore.currentUser.id),
    getFavorites()
  ]);
  Object.assign(profile, profileRes.data);
  favorites.value = favoritesRes.data || [];
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

<style scoped>
.tag-note {
  margin: 6px 0 10px;
}

.mini-list {
  display: grid;
  gap: 10px;
}

.mini-row {
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  text-align: left;
  cursor: pointer;
}

.mini-row strong,
.mini-row small {
  display: block;
}

.mini-row small {
  margin-top: 2px;
  color: #64748b;
  font-size: 12px;
}

.mini-row:hover {
  border-color: #2563eb;
}

.explain-list {
  margin: 0;
  padding-left: 18px;
  color: #475569;
  line-height: 1.9;
  font-size: 14px;
}
</style>
