<template>
  <div class="page-shell">
    <header class="page-header profile-head">
      <div>
        <h1 class="page-title">{{ profile.user?.realName || "队友画像" }}</h1>
        <p class="page-subtitle">
          {{ profile.user?.college || "未填写学院" }} · {{ profile.user?.major || "未填写专业" }} ·
          {{ profile.user?.skillDirection || "未填写技能方向" }}
        </p>
      </div>
      <div class="head-actions">
        <el-button @click="router.back()">返回上一页</el-button>
        <el-button v-if="!profile.viewer.isSelf" @click="router.push(`/reviews/create?revieweeId=${profile.user.id}`)">
          从该画像发起评价
        </el-button>
        <el-button
          v-if="!profile.viewer.isSelf"
          :type="profile.viewer.isFavorite ? 'warning' : 'primary'"
          :loading="favoriteLoading"
          @click="toggleFavorite"
        >
          {{ profile.viewer.isFavorite ? "取消收藏" : "收藏队友" }}
        </el-button>
      </div>
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
            <strong>基础信息</strong>
            <div class="muted-text">公开画像只展示组队需要的基础信息。</div>
          </div>
        </div>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="学号">{{ profile.user?.studentNo || "-" }}</el-descriptions-item>
          <el-descriptions-item label="学院">{{ profile.user?.college || "-" }}</el-descriptions-item>
          <el-descriptions-item label="专业">{{ profile.user?.major || "-" }}</el-descriptions-item>
          <el-descriptions-item label="年级">{{ profile.user?.grade || "-" }}</el-descriptions-item>
          <el-descriptions-item label="技能方向">{{ profile.user?.skillDirection || "-" }}</el-descriptions-item>
        </el-descriptions>

        <div class="section-block">
          <strong>高频标签</strong>
          <div class="muted-text tag-note">反复出现的标签代表更稳定的协作印象。</div>
          <TagList :tags="profile.topTags" show-count />
        </div>
      </section>
    </div>

    <section class="section-block three-col-grid">
      <div class="section-surface">
        <div class="surface-actions">
          <div>
            <strong>近 3 个参与项目</strong>
            <div class="muted-text">帮助判断这份画像来自哪些竞赛经历。</div>
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
        <div v-else class="empty-placeholder">暂无项目记录</div>
      </div>

      <div class="section-surface">
        <div class="surface-actions">
          <div>
            <strong>最近标签趋势</strong>
            <div class="muted-text">按最近收到的评价标签排序。</div>
          </div>
        </div>
        <TagList :tags="profile.recentTags" show-count />
      </div>

      <div class="section-surface">
        <div class="surface-actions">
          <div>
            <strong>指标解读</strong>
            <div class="muted-text">让画像在答辩展示时更容易讲清楚。</div>
          </div>
        </div>
        <ul class="explain-list">
          <li>评价次数越多，画像参考价值越稳定。</li>
          <li>再次组队率体现队友对继续合作的意愿。</li>
          <li>隐藏评价不会参与前台展示和统计。</li>
        </ul>
      </div>
    </section>

    <section class="section-block section-surface">
      <div class="surface-actions">
        <div>
          <strong>匿名评价记录</strong>
          <div class="muted-text">仅显示正常状态评价；管理员隐藏后这里会同步消失。</div>
        </div>
      </div>
      <ReviewList :reviews="profile.recentReviews" />
    </section>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import { useRoute, useRouter } from "vue-router";

import { getProfile } from "@/api/profileApi";
import { addFavorite, removeFavorite } from "@/api/userApi";
import RadarChart from "@/components/RadarChart.vue";
import ReviewList from "@/components/ReviewList.vue";
import ScoreCard from "@/components/ScoreCard.vue";
import TagList from "@/components/TagList.vue";

const RECENT_KEY = "competition_review_wall_recent_profiles";
const route = useRoute();
const router = useRouter();
const favoriteLoading = ref(false);
const profile = reactive({
  user: {},
  summary: {},
  topTags: [],
  recentTags: [],
  recentProjects: [],
  recentReviews: [],
  viewer: {
    isSelf: false,
    isFavorite: false
  }
});

const statusMap = {
  ongoing: "进行中",
  reviewable: "可评价",
  archived: "已归档"
};

function statusText(status) {
  return statusMap[status] || status || "-";
}

function rememberProfile() {
  if (!profile.user?.id) {
    return;
  }

  let list = [];
  try {
    list = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  } catch (error) {
    list = [];
  }

  const next = [
    {
      id: profile.user.id,
      realName: profile.user.realName,
      major: profile.user.major,
      averageScore: profile.summary.overallScore
    },
    ...list.filter((item) => item.id !== profile.user.id)
  ].slice(0, 5);

  localStorage.setItem(RECENT_KEY, JSON.stringify(next));
}

async function fetchProfile() {
  const response = await getProfile(route.params.id);
  Object.assign(profile, response.data);
  rememberProfile();
}

async function toggleFavorite() {
  favoriteLoading.value = true;
  try {
    if (profile.viewer.isFavorite) {
      await removeFavorite(profile.user.id);
      profile.viewer.isFavorite = false;
      ElMessage.success("已取消收藏");
    } else {
      await addFavorite(profile.user.id);
      profile.viewer.isFavorite = true;
      ElMessage.success("已收藏队友");
    }
  } catch (error) {
    ElMessage.error(error.message);
  } finally {
    favoriteLoading.value = false;
  }
}

onMounted(async () => {
  if (route.query.reviewSubmitted === "1") {
    ElMessage.success("本次评价已计入画像");
  }

  try {
    await fetchProfile();
  } catch (error) {
    ElMessage.error(error.message);
  }
});
</script>

<style scoped>
.profile-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.head-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
}

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
