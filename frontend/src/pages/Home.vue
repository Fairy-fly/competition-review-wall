<template>
  <div class="page-shell motion-page">
    <section class="home-hero motion-hero">
      <div class="hero-copy">
        <span class="hero-kicker">校园竞赛协作画像墙</span>
        <h1>竞赛队友测评墙</h1>
        <p>先看协作画像，再决定和谁组队。用匿名互评沉淀靠谱程度、沟通方式、执行节奏和再次组队意愿。</p>

        <div class="hero-actions">
          <button class="hero-act primary" @click="router.push('/reviews/create')">
            <el-icon :size="17"><EditPen /></el-icon>
            写评价
          </button>
          <button class="hero-act" @click="router.push('/recommend')">
            <el-icon :size="17"><Search /></el-icon>
            找队友
          </button>
          <button class="hero-act" @click="router.push('/projects')">
            <el-icon :size="17"><Document /></el-icon>
            看项目
          </button>
          <button class="hero-act" @click="router.push('/profile')">
            <el-icon :size="17"><User /></el-icon>
            我的画像
          </button>
        </div>

        <div class="hero-metrics">
          <div class="hero-metric">
            <strong>{{ animatedStats.users }}</strong>
            <span>学生画像</span>
          </div>
          <div class="hero-metric">
            <strong>{{ animatedStats.reviews }}</strong>
            <span>有效评价</span>
          </div>
          <div class="hero-metric">
            <strong>{{ animatedStats.avgScore }}</strong>
            <span>平台均分</span>
          </div>
          <div class="hero-metric">
            <strong>{{ animatedStats.projects }}</strong>
            <span>竞赛项目</span>
          </div>
        </div>
      </div>

      <div class="hero-preview-card">
        <div class="preview-top">
          <div class="preview-avatar">林同学</div>
          <div>
            <span class="preview-label">队友画像卡</span>
            <h2>算法建模 · 大三</h2>
          </div>
        </div>
        <div class="preview-score-row">
          <div>
            <strong>4.8</strong>
            <span>综合评分</span>
          </div>
          <div>
            <strong>82%</strong>
            <span>再次组队</span>
          </div>
        </div>
        <div class="preview-radar" aria-hidden="true">
          <svg viewBox="0 0 150 96">
            <polygon points="75,8 128,38 108,86 42,86 22,38" class="radar-grid" />
            <polygon points="75,22 113,44 99,76 51,76 37,44" class="radar-grid inner" />
            <polygon points="75,19 118,43 96,79 48,73 34,41" class="radar-fill" />
            <circle cx="75" cy="48" r="3" />
          </svg>
        </div>
        <div class="preview-tags">
          <span>靠谱</span>
          <span>沟通顺畅</span>
          <span>执行力强</span>
        </div>
      </div>
    </section>

    <section v-if="todos.length" class="section-block section-surface campus-surface motion-card">
      <div class="surface-actions">
        <div>
          <strong>待评价队友</strong>
          <div class="muted-text">你还有队友尚未评价，完成后他们的协作画像会更完整。</div>
        </div>
      </div>
      <div class="todo-list">
        <div v-for="project in todos" :key="project.projectId" class="todo-project">
          <div class="todo-project-head">
            <span class="todo-project-name">{{ project.projectName }}</span>
            <el-tag size="small" type="warning" effect="light">{{ project.unreviewedCount }} / {{ project.totalCount }} 人待评价</el-tag>
          </div>
          <div class="todo-teammates">
            <span v-for="t in project.unreviewed" :key="t.teammateId" class="todo-teammate">
              {{ t.teammateName }}（{{ t.roleInTeam || "队员" }}）
              <el-button type="primary" link size="small" @click="router.push(`/reviews/create?projectId=${project.projectId}&revieweeId=${t.teammateId}`)">去评价</el-button>
            </span>
          </div>
        </div>
      </div>
    </section>

    <section class="three-col-grid section-block motion-stagger">
      <div class="section-surface campus-surface compact-panel">
        <div class="panel-title">高分队友</div>
        <div v-if="dashboard.topUsers.length" class="mini-list">
          <button v-for="user in dashboard.topUsers" :key="user.id" class="mini-row" @click="openUser(user)">
            <span>
              <strong>{{ user.realName }}</strong>
              <small>{{ user.major || "未填写专业" }} · {{ user.skillDirection || "未填写方向" }}</small>
            </span>
            <el-tag size="small" effect="light" type="primary">{{ user.averageScore || 0 }} 分</el-tag>
          </button>
        </div>
        <div v-else class="empty-placeholder"><div class="empty-icon-box"><el-icon :size="30"><TrophyBase /></el-icon></div>暂无高分队友</div>
      </div>

      <div class="section-surface campus-surface compact-panel">
        <div class="panel-title">热门协作标签</div>
        <TagList v-if="dashboard.hotTags.length" :tags="dashboard.hotTags" show-count />
        <div v-else class="empty-placeholder"><div class="empty-icon-box"><el-icon :size="30"><CollectionTag /></el-icon></div>暂无标签数据</div>
      </div>

      <div class="section-surface campus-surface compact-panel">
        <div class="panel-title">最近浏览画像</div>
        <div v-if="recentViewed.length" class="mini-list">
          <button v-for="user in recentViewed" :key="user.id" class="mini-row" @click="router.push(`/users/${user.id}`)">
            <span><strong>{{ user.realName }}</strong><small>{{ user.major || "未填写专业" }}</small></span>
            <el-tag size="small" effect="light" type="info">{{ user.averageScore || 0 }} 分</el-tag>
          </button>
        </div>
        <div v-else class="empty-placeholder"><div class="empty-icon-box"><el-icon :size="30"><View /></el-icon></div>浏览画像后会显示在这里</div>
      </div>
    </section>

    <section class="section-block section-surface filter-surface motion-card">
      <div class="surface-actions filter-head">
        <div>
          <strong>画像墙筛选</strong>
          <div class="muted-text">按专业、年级、标签、竞赛类型和再次组队率找适合的搭子。</div>
        </div>
        <div class="filter-actions">
          <el-button @click="resetFilters">重置</el-button>
          <el-button type="primary" :loading="loading" @click="fetchWall">查询</el-button>
        </div>
      </div>
      <div class="toolbar-row portrait-toolbar">
        <el-input v-model="filters.keyword" placeholder="姓名 / 学号 / 专业" clearable />
        <el-input v-model="filters.major" placeholder="专业" clearable />
        <el-input v-model="filters.grade" placeholder="年级" clearable />
        <el-input v-model="filters.tag" placeholder="标签" clearable />
        <el-select v-model="filters.projectType" placeholder="竞赛类型" clearable>
          <el-option v-for="type in projectTypes" :key="type" :label="type" :value="type" />
        </el-select>
        <el-select v-model="filters.minScore" placeholder="最低评分" clearable>
          <el-option v-for="s in [5,4,3,2,1]" :key="s" :label="`${s} 分及以上`" :value="s" />
        </el-select>
        <el-select v-model="filters.minWillingAgainRate" placeholder="再次组队率" clearable>
          <el-option label="80% 及以上" :value="80" />
          <el-option label="60% 及以上" :value="60" />
          <el-option label="40% 及以上" :value="40" />
        </el-select>
        <el-select v-model="filters.sortBy" placeholder="排序方式">
          <el-option label="按评分排序" value="score_desc" />
          <el-option label="按评价数排序" value="reviews_desc" />
          <el-option label="按最新加入" value="newest" />
        </el-select>
        <el-checkbox v-model="filters.onlyReviewed">仅看有评价的人</el-checkbox>
      </div>
    </section>

    <section class="section-block wall-section">
      <div class="wall-head">
        <div>
          <span class="hero-kicker">Public Portraits</span>
          <h2>公开画像墙</h2>
          <p>点击卡片查看评分雷达、标签趋势、参与项目和匿名评价。</p>
        </div>
        <el-tag type="info" effect="light">{{ wall.users.length }} 人</el-tag>
      </div>

      <div v-if="wall.users.length" v-loading="loading" class="teammate-wall motion-stagger">
        <TeammateCard v-for="user in wall.users" :key="user.id" :user="user" @open="openUser" />
      </div>
      <div v-else v-loading="loading" class="section-surface empty-wall">
        <div class="empty-icon-box"><el-icon :size="30"><Search /></el-icon></div>
        <div>暂无符合条件的队友</div>
        <div class="muted-text" style="margin-top:6px">试试调整筛选条件或点击“重置”。</div>
      </div>
    </section>

    <section class="section-block three-col-grid motion-stagger">
      <div class="section-surface compact-panel">
        <div class="panel-title">最近评价</div>
        <div v-if="activity.recentReviews.length" class="mini-list">
          <div v-for="item in activity.recentReviews" :key="'r'+item.id" class="mini-row" style="cursor:default">
            <span><strong>{{ item.projectName }}</strong><small>{{ item.overallScore }} 分 · {{ formatRelativeTime(item.createdAt) }}</small></span>
            <el-button link size="small" type="primary" @click="router.push(`/users/${item.revieweeId}`)">看画像</el-button>
          </div>
        </div>
        <div v-else class="empty-placeholder"><div class="empty-icon-box"><el-icon :size="30"><EditPen /></el-icon></div>暂无评价记录</div>
      </div>

      <div class="section-surface compact-panel">
        <div class="panel-title">可评价项目</div>
        <div v-if="activity.recentProjects.length" class="mini-list">
          <div v-for="item in activity.recentProjects" :key="'p'+item.id" class="mini-row" style="cursor:default">
            <span><strong>{{ item.name }}</strong><small>{{ item.type || "" }}</small></span>
            <el-button link size="small" type="primary" @click="router.push(`/projects/${item.id}`)">看项目</el-button>
          </div>
        </div>
        <div v-else class="empty-placeholder"><div class="empty-icon-box"><el-icon :size="30"><Document /></el-icon></div>暂无互评阶段项目</div>
      </div>

      <div class="section-surface compact-panel">
        <div class="panel-title">最近活跃画像</div>
        <div v-if="activity.recentProfiles.length" class="mini-list">
          <button v-for="item in activity.recentProfiles" :key="'u'+item.id" class="mini-row" @click="router.push(`/users/${item.id}`)">
            <span><strong>{{ item.realName }}</strong><small>{{ item.major || "" }} · 新收到 {{ item.recentReviewCount }} 条评价</small></span>
            <el-tag size="small" effect="light" type="info">{{ item.skillDirection || "" }}</el-tag>
          </button>
        </div>
        <div v-else class="empty-placeholder"><div class="empty-icon-box"><el-icon :size="30"><User /></el-icon></div>暂无活跃画像</div>
      </div>
    </section>

    <section class="section-block rules-section">
      <div class="wall-head">
        <div>
          <span class="hero-kicker">Wall Rules</span>
          <h2>画像墙规则</h2>
          <p>轻社交展示，严肃评价沉淀。前台匿名，后台可追溯。</p>
        </div>
      </div>
      <div class="rule-grid">
        <div class="rule-card">
          <div class="rule-icon"><el-icon :size="26"><Hide /></el-icon></div>
          <strong>匿名评价</strong>
          <p>所有评价在前台展示为“匿名队友”，评价人身份不会公开。</p>
        </div>
        <div class="rule-card">
          <div class="rule-icon trust"><el-icon :size="26"><DataAnalysis /></el-icon></div>
          <strong>公开画像</strong>
          <p>评分和标签自动汇总为协作画像，帮助组队前快速判断协作风格。</p>
        </div>
        <div class="rule-card">
          <div class="rule-icon risk"><el-icon :size="26"><Warning /></el-icon></div>
          <strong>恶意评价可申诉</strong>
          <p>可对存在问题的评价提交申诉，管理员审核后处理。</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";
import { getDashboardSummary, getRecentActivity, getUserTodos } from "@/api/dashboardApi";
import { getWallUsers } from "@/api/userApi";
import TagList from "@/components/TagList.vue";
import TeammateCard from "@/components/TeammateCard.vue";
import { EditPen, Search, Document, User, TrophyBase, CollectionTag, View, DataAnalysis, Hide, Warning } from "@element-plus/icons-vue";

const FILTER_KEY = "competition_review_wall_filters";
const RECENT_KEY = "competition_review_wall_recent_profiles";
const router = useRouter();
const loading = ref(false);

const recentViewed = ref([]);
const todos = ref([]);
const activity = reactive({ recentReviews: [], recentProjects: [], recentProfiles: [] });
const dashboard = reactive({
  overview: { totalUsers: 0, totalProjects: 0, totalReviews: 0, hiddenReviews: 0, averageScore: 0, usersWithoutReviews: 0 },
  topUsers: [],
  hotTags: []
});
const wall = reactive({ users: [] });

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
const projectTypes = ["创新创业", "数学建模", "科创竞赛", "程序设计", "产品设计"];

const animatedStats = reactive({ users: 0, reviews: 0, avgScore: 0, projects: 0 });

function animateCount(target, key) {
  const start = 0;
  const duration = 800;
  const startTime = performance.now();
  function step(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    animatedStats[key] = Math.round(start + (target - start) * eased);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function animateAvgScore(target) {
  const duration = 800;
  const startTime = performance.now();
  function step(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    animatedStats.avgScore = (target * eased).toFixed(2);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function formatRelativeTime(d) {
  if (!d) return "";
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (diff < 60) return "刚刚";
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} 天前`;
  return d.slice(0, 10);
}

function loadSavedFilters() {
  try {
    return JSON.parse(localStorage.getItem(FILTER_KEY) || "{}");
  } catch {
    return {};
  }
}

function persistFilters() {
  localStorage.setItem(FILTER_KEY, JSON.stringify(filters));
}

function loadRecentViewed() {
  try {
    recentViewed.value = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  } catch {
    recentViewed.value = [];
  }
}

function openUser(user) {
  const next = [
    { id: user.id, realName: user.realName, major: user.major, averageScore: user.averageScore },
    ...recentViewed.value.filter((item) => item.id !== user.id)
  ].slice(0, 5);
  localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  recentViewed.value = next;
  router.push(`/users/${user.id}`);
}

async function fetchDashboard() {
  try {
    const res = await getDashboardSummary();
    Object.assign(dashboard.overview, res.data.overview);
    dashboard.topUsers = res.data.topUsers || [];
    dashboard.hotTags = res.data.hotTags || [];
    const overview = dashboard.overview;
    animateCount(overview.totalUsers, "users");
    animateCount(overview.totalReviews, "reviews");
    animateCount(overview.totalProjects, "projects");
    animateAvgScore(overview.averageScore || 0);
  } catch {
    /* dashboard is non-critical */
  }
}

async function fetchActivity() {
  try {
    const response = await getRecentActivity();
    Object.assign(activity, response.data);
  } catch {
    /* activity is non-critical */
  }
}

async function fetchTodos() {
  try {
    const response = await getUserTodos();
    todos.value = response.data || [];
  } catch {
    /* todos are non-critical */
  }
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
  await Promise.all([fetchDashboard(), fetchActivity(), fetchTodos(), fetchWall()]);
});
</script>

<style scoped>
.home-hero {
  position: relative;
  overflow: hidden;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 32px;
  align-items: stretch;
  padding: 42px;
  border: 1px solid rgba(75,92,240,0.14);
  border-radius: var(--radius-xl);
  background:
    linear-gradient(rgba(75,92,240,0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(75,92,240,0.05) 1px, transparent 1px),
    linear-gradient(135deg, #ffffff 0%, #f7fbff 58%, #eef7ff 100%);
  background-size: 30px 30px, 30px 30px, auto;
  box-shadow: var(--shadow-card);
}

.home-hero::after {
  content: "";
  position: absolute;
  inset: auto 42px 0 42px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(75,92,240,0.28), rgba(24,169,153,0.28), transparent);
}

.hero-copy,
.hero-preview-card {
  position: relative;
  z-index: 1;
}

.hero-kicker {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  color: var(--brand-primary);
  background: var(--primary-soft);
  border: 1px solid rgba(75,92,240,0.15);
  font-size: 12px;
  font-weight: 750;
}

.hero-copy h1 {
  margin: 18px 0 0;
  font-size: 42px;
  line-height: 1.12;
  color: var(--text-main);
  font-weight: 850;
}

.hero-copy p {
  max-width: 620px;
  margin: 16px 0 0;
  color: var(--text-muted);
  font-size: 17px;
  line-height: 1.85;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 24px;
}

.hero-act {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 42px;
  padding: 0 16px;
  border-radius: 14px;
  border: 1px solid rgba(148,163,184,0.20);
  background: rgba(255,255,255,0.82);
  color: var(--text-main);
  font-size: 14px;
  font-weight: 650;
  cursor: pointer;
  transition: all var(--transition-base);
}

.hero-act:hover {
  transform: translateY(-2px);
  border-color: rgba(75,92,240,0.32);
  box-shadow: var(--shadow-sm);
}

.hero-act.primary {
  color: #fff;
  border-color: transparent;
  background: var(--brand-primary);
  box-shadow: var(--shadow-btn);
}

.hero-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-top: 32px;
  max-width: 680px;
}

.hero-metric {
  min-width: 0;
  padding: 14px;
  border-radius: 16px;
  background: rgba(255,255,255,0.72);
  border: 1px solid rgba(148,163,184,0.15);
}

.hero-metric strong {
  display: block;
  color: var(--brand-primary);
  font-size: 27px;
  line-height: 1;
}

.hero-metric span {
  display: block;
  margin-top: 7px;
  color: var(--text-faint);
  font-size: 12px;
}

.hero-preview-card {
  align-self: center;
  min-height: 360px;
  padding: 22px;
  border-radius: 22px;
  border: 1px solid rgba(75,92,240,0.16);
  background: rgba(255,255,255,0.88);
  box-shadow: 0 18px 42px rgba(15,23,42,0.08);
}

.preview-top {
  display: flex;
  gap: 14px;
  align-items: center;
}

.preview-avatar {
  width: 64px;
  height: 64px;
  border-radius: 20px;
  display: grid;
  place-items: center;
  color: #fff;
  font-weight: 800;
  background: linear-gradient(135deg, var(--brand-primary), #6d78ff);
}

.preview-label {
  color: var(--brand-teal-deep);
  font-size: 12px;
  font-weight: 750;
}

.preview-top h2 {
  margin: 4px 0 0;
  font-size: 18px;
  color: var(--text-main);
}

.preview-score-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 20px;
}

.preview-score-row div {
  padding: 14px;
  border-radius: 16px;
  background: var(--surface-soft);
  border: 1px solid var(--border-soft);
}

.preview-score-row strong {
  display: block;
  color: var(--brand-primary);
  font-size: 28px;
  line-height: 1;
}

.preview-score-row div:nth-child(2) strong {
  color: var(--brand-teal);
}

.preview-score-row span {
  display: block;
  margin-top: 6px;
  color: var(--text-faint);
  font-size: 12px;
}

.preview-radar {
  display: grid;
  place-items: center;
  height: 140px;
  margin-top: 14px;
  border-radius: 18px;
  background:
    linear-gradient(rgba(75,92,240,0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(75,92,240,0.05) 1px, transparent 1px),
    #f8fbff;
  background-size: 18px 18px;
}

.preview-radar svg {
  width: 170px;
  max-width: 100%;
}

.preview-radar circle {
  fill: var(--brand-primary);
}

.radar-grid {
  fill: none;
  stroke: rgba(75,92,240,0.20);
}

.radar-grid.inner {
  stroke: rgba(24,169,153,0.20);
}

.radar-fill {
  fill: rgba(75,92,240,0.14);
  stroke: var(--brand-primary);
  stroke-width: 2;
}

.preview-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.preview-tags span {
  padding: 6px 10px;
  border-radius: 999px;
  color: var(--brand-teal-deep);
  background: var(--brand-teal-soft);
  border: 1px solid rgba(24,169,153,0.18);
  font-size: 12px;
  font-weight: 650;
}

.campus-surface {
  position: relative;
  overflow: hidden;
}

.campus-surface::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: radial-gradient(rgba(75,92,240,0.12) 1px, transparent 1px);
  background-size: 18px 18px;
  mask-image: linear-gradient(135deg, rgba(0,0,0,0.26), transparent 42%);
}

.filter-surface {
  background: var(--surface-toolbar);
  backdrop-filter: blur(10px);
}

.filter-head {
  align-items: flex-start;
}

.filter-actions {
  display: flex;
  gap: 8px;
}

.portrait-toolbar {
  display: grid;
  grid-template-columns: minmax(180px, 1.4fr) repeat(3, minmax(110px, 1fr)) repeat(4, minmax(130px, 1fr)) auto;
  align-items: center;
}

.portrait-toolbar > * {
  width: 100%;
}

.wall-section {
  margin-top: 28px;
}

.wall-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-end;
  margin-bottom: 16px;
}

.wall-head h2 {
  margin: 12px 0 0;
  color: var(--text-main);
  font-size: 26px;
}

.wall-head p {
  margin: 6px 0 0;
  color: var(--text-muted);
  font-size: 14px;
}

.teammate-wall {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
  gap: 18px;
}

.empty-wall {
  padding: 60px 20px;
  text-align: center;
  color: var(--text-faint);
}

.rule-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.rule-card {
  padding: 22px;
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-lg);
  background: var(--surface-solid);
  box-shadow: var(--shadow-xs);
  transition: all var(--transition-base);
}

.rule-card:hover {
  transform: translateY(-2px);
  border-color: rgba(75,92,240,0.24);
  box-shadow: var(--shadow-card);
}

.rule-icon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  margin-bottom: 12px;
  color: var(--brand-primary);
  background: var(--primary-soft);
}

.rule-icon.trust {
  color: var(--brand-teal-deep);
  background: var(--brand-teal-soft);
}

.rule-icon.risk {
  color: #B8354A;
  background: var(--brand-rose-soft);
}

.rule-card strong {
  display: block;
  color: var(--text-main);
  margin-bottom: 6px;
}

.rule-card p {
  margin: 0;
  color: var(--text-muted);
  font-size: 13px;
  line-height: 1.8;
}

.todo-list {
  display: grid;
  gap: 12px;
}

.todo-project {
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  padding: 16px 18px;
  background: var(--surface-solid);
}

.todo-project-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.todo-project-name {
  font-weight: 650;
}

.todo-teammates {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 18px;
}

.todo-teammate {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--text-muted);
  font-size: 14px;
}

@media (max-width: 1100px) {
  .home-hero {
    grid-template-columns: 1fr;
  }

  .hero-preview-card {
    max-width: 520px;
  }

  .portrait-toolbar {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .home-hero {
    padding: 24px;
    gap: 20px;
  }

  .hero-copy h1 {
    font-size: 31px;
  }

  .hero-copy p {
    font-size: 15px;
  }

  .hero-metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .hero-actions,
  .filter-actions,
  .wall-head {
    align-items: stretch;
  }

  .hero-act,
  .filter-actions > * {
    flex: 1 1 calc(50% - 8px);
    justify-content: center;
  }

  .portrait-toolbar,
  .rule-grid {
    grid-template-columns: 1fr;
  }

  .wall-head {
    flex-direction: column;
  }

  .teammate-wall {
    grid-template-columns: 1fr;
  }
}
</style>
