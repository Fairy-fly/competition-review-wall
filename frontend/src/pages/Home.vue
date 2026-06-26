<template>
  <div class="page-shell">
    <header class="page-header">
      <h1 class="page-title">测评墙</h1>
      <p class="page-subtitle">用匿名协作反馈和公开画像，帮助竞赛组队判断更有依据。</p>
    </header>

    <section class="section-surface">
      <div class="surface-actions">
        <div>
          <strong>我接下来能做什么</strong>
          <div class="muted-text">把常用路径放在首页，演示和日常使用都更顺手。</div>
        </div>
      </div>
      <div class="quick-grid">
        <button class="quick-card" @click="router.push('/projects/create')">
          <strong>创建项目</strong>
          <span>发起竞赛项目并添加队友</span>
        </button>
        <button class="quick-card" @click="router.push('/reviews/create')">
          <strong>去评价</strong>
          <span>评价已进入互评阶段的队友</span>
        </button>
        <button class="quick-card" @click="router.push('/profile')">
          <strong>看我的画像</strong>
          <span>查看评分、标签和收到的反馈</span>
        </button>
        <button class="quick-card" @click="router.push('/projects')">
          <strong>我的项目</strong>
          <span>管理成员和项目阶段</span>
        </button>
      </div>
    </section>

    <section class="stat-grid section-block">
      <ScoreCard label="学生画像数" :value="overview.totalUsers" hint="当前可展示的学生范围" />
      <ScoreCard label="竞赛项目数" :value="overview.totalProjects" hint="稳定演示数据中的项目" accent="#0f766e" />
      <ScoreCard label="有效评价数" :value="overview.totalReviews" hint="仅统计正常状态评价" accent="#7c3aed" />
      <ScoreCard label="平台平均分" :value="overview.averageScore || 0" hint="正常评价的综合均分" accent="#ea580c" />
    </section>

    <section class="three-col-grid section-block">
      <div class="section-surface compact-panel">
        <div class="panel-title">高分队友</div>
        <div v-if="dashboard.topUsers.length" class="mini-list">
          <button v-for="user in dashboard.topUsers" :key="user.id" class="mini-row" @click="openUser(user)">
            <span>
              <strong>{{ user.realName }}</strong>
              <small>{{ user.major || "未填写专业" }} · {{ user.skillDirection || "未填写方向" }}</small>
            </span>
            <el-tag size="small" type="success">{{ user.averageScore || 0 }} 分</el-tag>
          </button>
        </div>
        <div v-else class="empty-placeholder">暂无高分队友</div>
      </div>

      <div class="section-surface compact-panel">
        <div class="panel-title">标签热门</div>
        <TagList :tags="dashboard.hotTags" show-count />
      </div>

      <div class="section-surface compact-panel">
        <div class="panel-title">最近浏览画像</div>
        <div v-if="recentViewed.length" class="mini-list">
          <button v-for="user in recentViewed" :key="user.id" class="mini-row" @click="router.push(`/users/${user.id}`)">
            <span>
              <strong>{{ user.realName }}</strong>
              <small>{{ user.major || "未填写专业" }}</small>
            </span>
            <el-tag size="small" type="info">{{ user.averageScore || 0 }} 分</el-tag>
          </button>
        </div>
        <div v-else class="empty-placeholder">浏览画像后会显示在这里</div>
      </div>
    </section>

    <section class="section-block section-surface">
      <div class="surface-actions">
        <div>
          <strong>筛选条件</strong>
          <div class="muted-text">支持按专业、年级、标签、竞赛类型和再次组队率找人。</div>
        </div>
        <el-button @click="resetFilters">重置筛选</el-button>
      </div>

      <div class="toolbar-row">
        <el-input v-model="filters.keyword" placeholder="姓名 / 学号 / 专业" style="width: 220px" clearable />
        <el-input v-model="filters.major" placeholder="专业" style="width: 150px" clearable />
        <el-input v-model="filters.grade" placeholder="年级" style="width: 130px" clearable />
        <el-input v-model="filters.tag" placeholder="标签" style="width: 150px" clearable />
        <el-select v-model="filters.projectType" placeholder="竞赛类型" clearable style="width: 150px">
          <el-option v-for="type in projectTypes" :key="type" :label="type" :value="type" />
        </el-select>
        <el-select v-model="filters.minScore" placeholder="最低评分" clearable style="width: 130px">
          <el-option v-for="score in [5, 4, 3, 2, 1]" :key="score" :label="`${score} 分及以上`" :value="score" />
        </el-select>
        <el-select v-model="filters.minWillingAgainRate" placeholder="再次组队率" clearable style="width: 150px">
          <el-option label="80% 及以上" :value="80" />
          <el-option label="60% 及以上" :value="60" />
          <el-option label="40% 及以上" :value="40" />
        </el-select>
        <el-select v-model="filters.sortBy" placeholder="排序方式" style="width: 150px">
          <el-option label="按评分排序" value="score_desc" />
          <el-option label="按评价数排序" value="reviews_desc" />
          <el-option label="按最新加入" value="newest" />
        </el-select>
        <el-checkbox v-model="filters.onlyReviewed">仅看有评价的人</el-checkbox>
        <el-button type="primary" :loading="loading" @click="fetchWall">查询</el-button>
      </div>
    </section>

    <section class="section-block section-surface">
      <div class="surface-actions">
        <div>
          <strong>公开画像列表</strong>
          <div class="muted-text">点击画像可查看评分卡、标签趋势、参与项目和匿名评价。</div>
        </div>
        <el-tag type="info">{{ wall.users.length }} 人</el-tag>
      </div>

      <el-table v-loading="loading" :data="wall.users" stripe empty-text="暂无符合条件的队友">
        <el-table-column prop="realName" label="学生" min-width="120" />
        <el-table-column label="专业 / 年级" min-width="180">
          <template #default="{ row }">
            {{ row.major || "未填写专业" }} / {{ row.grade || "未填写年级" }}
          </template>
        </el-table-column>
        <el-table-column prop="skillDirection" label="技能方向" min-width="150" />
        <el-table-column prop="averageScore" label="综合分" width="90" />
        <el-table-column prop="reviewCount" label="评价数" width="90" />
        <el-table-column prop="willingAgainRate" label="再次组队率" width="120">
          <template #default="{ row }">{{ row.willingAgainRate || 0 }}%</template>
        </el-table-column>
        <el-table-column label="热门标签" min-width="220">
          <template #default="{ row }">
            <TagList :tags="row.topTags" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openUser(row)">查看画像</el-button>
          </template>
        </el-table-column>
      </el-table>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";

import { getDashboardSummary } from "@/api/dashboardApi";
import { getWallUsers } from "@/api/userApi";
import ScoreCard from "@/components/ScoreCard.vue";
import TagList from "@/components/TagList.vue";

const FILTER_KEY = "competition_review_wall_filters";
const RECENT_KEY = "competition_review_wall_recent_profiles";

const router = useRouter();
const loading = ref(false);
const dashboard = reactive({
  overview: {
    totalUsers: 0,
    totalProjects: 0,
    totalReviews: 0,
    hiddenReviews: 0,
    averageScore: 0,
    usersWithoutReviews: 0
  },
  topUsers: [],
  hotTags: []
});
const wall = reactive({
  users: []
});
const recentViewed = ref([]);

const defaultFilters = {
  keyword: "",
  major: "",
  grade: "",
  tag: "",
  projectType: "",
  minScore: undefined,
  minWillingAgainRate: undefined,
  onlyReviewed: false,
  sortBy: "score_desc"
};

const filters = reactive({ ...defaultFilters, ...loadSavedFilters() });
const overview = computed(() => dashboard.overview);
const projectTypes = ["创新创业", "数学建模", "科创竞赛", "程序设计", "产品设计"];

function loadSavedFilters() {
  try {
    return JSON.parse(localStorage.getItem(FILTER_KEY) || "{}");
  } catch (error) {
    return {};
  }
}

function persistFilters() {
  localStorage.setItem(FILTER_KEY, JSON.stringify(filters));
}

function loadRecentViewed() {
  try {
    recentViewed.value = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  } catch (error) {
    recentViewed.value = [];
  }
}

function openUser(user) {
  const next = [
    {
      id: user.id,
      realName: user.realName,
      major: user.major,
      averageScore: user.averageScore
    },
    ...recentViewed.value.filter((item) => item.id !== user.id)
  ].slice(0, 5);
  localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  recentViewed.value = next;
  router.push(`/users/${user.id}`);
}

async function fetchDashboard() {
  const response = await getDashboardSummary();
  Object.assign(dashboard.overview, response.data.overview);
  dashboard.topUsers = response.data.topUsers || [];
  dashboard.hotTags = response.data.hotTags || [];
}

async function fetchWall() {
  loading.value = true;
  try {
    persistFilters();
    const response = await getWallUsers(filters);
    wall.users = response.data.users;
  } catch (error) {
    ElMessage.error(error.message);
  } finally {
    loading.value = false;
  }
}

async function resetFilters() {
  Object.assign(filters, defaultFilters);
  persistFilters();
  await fetchWall();
}

onMounted(async () => {
  loadRecentViewed();
  try {
    await Promise.all([fetchDashboard(), fetchWall()]);
  } catch (error) {
    ElMessage.error(error.message);
  }
});
</script>

<style scoped>
.quick-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.quick-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f8fafc;
  padding: 16px;
  text-align: left;
  cursor: pointer;
  color: #111827;
}

.quick-card strong {
  display: block;
  font-size: 16px;
  margin-bottom: 6px;
}

.quick-card span {
  color: #64748b;
  font-size: 13px;
}

.quick-card:hover {
  border-color: #2563eb;
  background: #eff6ff;
}

.compact-panel {
  min-height: 180px;
}

.panel-title {
  margin-bottom: 12px;
  font-weight: 700;
  color: #111827;
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
</style>
