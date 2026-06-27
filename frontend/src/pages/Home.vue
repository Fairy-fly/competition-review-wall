<template>
  <div class="page-shell motion-page">
    <!-- Hero -->
    <section class="hero-banner motion-hero">
      <div class="hero-left">
        <h1 class="hero-title">竞赛队友 · 协作画像</h1>
        <p class="hero-desc">基于匿名互评数据，为每位同学生成可信的协作画像。<br />组队前先看一眼，少踩坑、多共赢。</p>

        <div class="hero-metrics">
          <div class="hero-metric">
            <span class="metric-num">{{ animatedStats.users }}</span>
            <span class="metric-label">学生画像</span>
          </div>
          <div class="hero-metric">
            <span class="metric-num">{{ animatedStats.reviews }}</span>
            <span class="metric-label">有效评价</span>
          </div>
          <div class="hero-metric">
            <span class="metric-num">{{ animatedStats.avgScore }}</span>
            <span class="metric-label">平台均分</span>
          </div>
          <div class="hero-metric">
            <span class="metric-num">{{ animatedStats.projects }}</span>
            <span class="metric-label">竞赛项目</span>
          </div>
        </div>
      </div>

      <div class="hero-right">
        <!-- Profile Preview Card -->
        <div class="hero-preview motion-card">
          <div class="preview-head">
            <span class="preview-badge">协作画像预览</span>
          </div>
          <div class="preview-core">
            <div class="preview-ring-wrap">
              <div class="preview-ring"></div>
              <span class="preview-ring-score">4.1</span>
            </div>
            <div class="preview-key">
              <span class="preview-key-label">再次组队率</span>
              <strong class="preview-key-value">82%</strong>
            </div>
          </div>
          <div class="preview-tags">
            <span class="preview-chip positive">靠谱</span>
            <span class="preview-chip positive">执行力强</span>
            <span class="preview-chip neutral">沟通顺畅</span>
          </div>
        </div>

        <!-- Quick action buttons -->
        <div class="hero-actions motion-stagger">
          <button class="hero-act primary" @click="router.push('/reviews/create')">
            <el-icon :size="17"><EditPen /></el-icon>提交评价
          </button>
          <button class="hero-act" @click="router.push('/recommend')">
            <el-icon :size="17"><Search /></el-icon>找队友
          </button>
          <button class="hero-act" @click="router.push('/projects/create')">
            <el-icon :size="17"><Document /></el-icon>创建项目
          </button>
          <button class="hero-act" @click="router.push('/profile')">
            <el-icon :size="17"><User /></el-icon>我的画像
          </button>
        </div>
      </div>
    </section>

    <!-- My Todos -->
    <section v-if="todos.length" class="section-block section-surface motion-card">
      <div class="surface-actions">
        <div>
          <strong>待评价队友</strong>
          <div class="muted-text">你还有队友尚未评价，别让他们等太久。</div>
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
              <el-button type="primary" link size="small" class="btn-lift" @click="router.push(`/reviews/create?projectId=${project.projectId}&revieweeId=${t.teammateId}`)">去评价</el-button>
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- Three panels: Top Users / Hot Tags / Recent Viewed -->
    <section class="three-col-grid section-block motion-stagger">
      <div class="section-surface compact-panel">
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

      <div class="section-surface compact-panel">
        <div class="panel-title">标签热门</div>
        <TagList v-if="dashboard.hotTags.length" :tags="dashboard.hotTags" show-count />
        <div v-else class="empty-placeholder"><div class="empty-icon-box"><el-icon :size="30"><CollectionTag /></el-icon></div>暂无标签数据</div>
      </div>

      <div class="section-surface compact-panel">
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

    <!-- Recent Activity -->
    <section class="three-col-grid section-block motion-stagger">
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

    <!-- Filter Panel -->
    <section class="section-block section-surface motion-card">
      <div class="surface-actions">
        <div>
          <strong>筛选条件</strong>
          <div class="muted-text">按专业、年级、标签、竞赛类型和再次组队率找人。</div>
        </div>
        <el-button class="btn-lift" @click="resetFilters">重置筛选</el-button>
      </div>
      <div class="toolbar-row">
        <el-input v-model="filters.keyword" placeholder="姓名 / 学号 / 专业" style="width:200px" clearable />
        <el-input v-model="filters.major" placeholder="专业" style="width:140px" clearable />
        <el-input v-model="filters.grade" placeholder="年级" style="width:120px" clearable />
        <el-input v-model="filters.tag" placeholder="标签" style="width:140px" clearable />
        <el-select v-model="filters.projectType" placeholder="竞赛类型" clearable style="width:150px">
          <el-option v-for="type in projectTypes" :key="type" :label="type" :value="type" />
        </el-select>
        <el-select v-model="filters.minScore" placeholder="最低评分" clearable style="width:130px">
          <el-option v-for="s in [5,4,3,2,1]" :key="s" :label="`${s} 分及以上`" :value="s" />
        </el-select>
        <el-select v-model="filters.minWillingAgainRate" placeholder="再次组队率" clearable style="width:150px">
          <el-option label="80% 及以上" :value="80" />
          <el-option label="60% 及以上" :value="60" />
          <el-option label="40% 及以上" :value="40" />
        </el-select>
        <el-select v-model="filters.sortBy" placeholder="排序方式" style="width:140px">
          <el-option label="按评分排序" value="score_desc" />
          <el-option label="按评价数排序" value="reviews_desc" />
          <el-option label="按最新加入" value="newest" />
        </el-select>
        <el-checkbox v-model="filters.onlyReviewed">仅看有评价的人</el-checkbox>
        <el-button type="primary" :loading="loading" @click="fetchWall" class="btn-lift">查询</el-button>
      </div>
    </section>

    <!-- Public Profile Table -->
    <section class="section-block section-surface motion-card">
      <div class="surface-actions">
        <div>
          <strong>公开画像列表</strong>
          <div class="muted-text">点击画像可查看评分卡、标签趋势、参与项目和匿名评价。</div>
        </div>
        <el-tag type="info" effect="light">{{ wall.users.length }} 人</el-tag>
      </div>
      <el-table v-loading="loading" :data="wall.users" stripe>
        <template #empty>
          <div class="empty-placeholder">
            <div class="empty-icon-box"><el-icon :size="30"><Search /></el-icon></div>
            <div>暂无符合条件的队友</div>
            <div class="muted-text" style="margin-top:6px">试试调整筛选条件或点击"重置筛选"</div>
          </div>
        </template>
        <el-table-column prop="realName" label="学生" min-width="120" />
        <el-table-column label="专业 / 年级" min-width="180">
          <template #default="{ row }">{{ row.major || "未填写专业" }} / {{ row.grade || "未填写年级" }}</template>
        </el-table-column>
        <el-table-column prop="skillDirection" label="技能方向" min-width="150" />
        <el-table-column prop="averageScore" label="综合分" width="90" />
        <el-table-column prop="reviewCount" label="评价数" width="90" />
        <el-table-column prop="willingAgainRate" label="再次组队率" width="120">
          <template #default="{ row }">{{ row.willingAgainRate || 0 }}%</template>
        </el-table-column>
        <el-table-column label="热门标签" min-width="220">
          <template #default="{ row }"><TagList :tags="row.topTags" /></template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openUser(row)" class="btn-lift">查看画像</el-button>
          </template>
        </el-table-column>
      </el-table>
    </section>

    <!-- Platform Rules -->
    <section class="section-block section-surface motion-card">
      <div class="surface-actions">
        <div>
          <strong>平台说明</strong>
          <div class="muted-text">了解匿名评价机制，帮助你更好地使用本平台。</div>
        </div>
      </div>
      <div class="rule-grid">
        <div class="rule-card">
          <div class="rule-icon"><el-icon :size="28"><Hide /></el-icon></div>
          <strong>匿名评价</strong>
          <p>所有评价在前台展示为"匿名队友"，评价人身份不会公开。</p>
        </div>
        <div class="rule-card">
          <div class="rule-icon"><el-icon :size="28"><DataAnalysis /></el-icon></div>
          <strong>公开画像</strong>
          <p>评分和标签自动汇总为协作画像，帮队友了解你的协作风格。</p>
        </div>
        <div class="rule-card">
          <div class="rule-icon"><el-icon :size="28"><View /></el-icon></div>
          <strong>管理员可追溯</strong>
          <p>后台保留完整记录用于争议核查，不对普通用户公开。</p>
        </div>
        <div class="rule-card">
          <div class="rule-icon"><el-icon :size="28"><Warning /></el-icon></div>
          <strong>恶意评价可申诉</strong>
          <p>可对存在问题的评价提交申诉，管理员审核后处理。</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";
import { getDashboardSummary, getRecentActivity, getUserTodos } from "@/api/dashboardApi";
import { getWallUsers } from "@/api/userApi";
import TagList from "@/components/TagList.vue";
import { EditPen, Search, Document, User, TrophyBase, CollectionTag, View, DataAnalysis, Hide, Warning, Connection } from "@element-plus/icons-vue";

const FILTER_KEY = "competition_review_wall_filters";
const RECENT_KEY = "competition_review_wall_recent_profiles";
const router = useRouter();
const loading = ref(false);

const recentViewed = ref([]);
const todos = ref([]);
const activity = reactive({ recentReviews: [], recentProjects: [], recentProfiles: [] });
const dashboard = reactive({
  overview: { totalUsers: 0, totalProjects: 0, totalReviews: 0, hiddenReviews: 0, averageScore: 0, usersWithoutReviews: 0 },
  topUsers: [], hotTags: []
});
const wall = reactive({ users: [] });

const defaultFilters = { keyword:"", major:"", grade:"", tag:"", projectType:"", minScore:undefined, minWillingAgainRate:undefined, onlyReviewed:false, sortBy:"score_desc" };
const filters = reactive({ ...defaultFilters, ...loadSavedFilters() });
const overview = computed(() => dashboard.overview);
const projectTypes = ["创新创业","数学建模","科创竞赛","程序设计","产品设计"];

// Animated counter for hero stats
const animatedStats = reactive({ users:0, reviews:0, avgScore:0, projects:0 });
function animateCount(target, key) {
  const start = 0;
  const duration = 800;
  const startTime = performance.now();
  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
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
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
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
  if (diff < 3600) return `${Math.floor(diff/60)} 分钟前`;
  if (diff < 86400) return `${Math.floor(diff/3600)} 小时前`;
  if (diff < 604800) return `${Math.floor(diff/86400)} 天前`;
  return d.slice(0,10);
}

function loadSavedFilters() { try { return JSON.parse(localStorage.getItem(FILTER_KEY) || "{}"); } catch { return {}; } }
function persistFilters() { localStorage.setItem(FILTER_KEY, JSON.stringify(filters)); }
function loadRecentViewed() { try { recentViewed.value = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); } catch { recentViewed.value = []; } }

function openUser(user) {
  const next = [{ id:user.id, realName:user.realName, major:user.major, averageScore:user.averageScore }, ...recentViewed.value.filter(i => i.id !== user.id)].slice(0,5);
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
    // Trigger count animation
    const o = dashboard.overview;
    animateCount(o.totalUsers, 'users');
    animateCount(o.totalReviews, 'reviews');
    animateCount(o.totalProjects, 'projects');
    animateAvgScore(o.averageScore || 0);
  } catch (e) { /* non-critical */ }
}

async function fetchActivity() { try { const r = await getRecentActivity(); Object.assign(activity, r.data); } catch {} }
async function fetchTodos() { try { const r = await getUserTodos(); todos.value = r.data || []; } catch {} }

async function fetchWall() {
  loading.value = true;
  try { persistFilters(); const r = await getWallUsers(filters); wall.users = r.data.users; } catch(e) { ElMessage.error(e.message); } finally { loading.value = false; }
}

async function resetFilters() { Object.assign(filters, defaultFilters); persistFilters(); await fetchWall(); }

onMounted(async () => {
  loadRecentViewed();
  await Promise.all([fetchDashboard(), fetchActivity(), fetchTodos(), fetchWall()]);
});
</script>

<style scoped>
/* ---- Hero ---- */
.hero-banner {
  display: flex;
  gap: 36px;
  align-items: stretch;
  padding: 40px 44px;
  margin-bottom: 28px;
  background: var(--surface-solid);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-card);
  overflow: hidden;
  position: relative;
}
.hero-banner::before {
  content: "";
  position: absolute;
  top: -40%;
  left: -10%;
  width: 60%;
  height: 180%;
  background: radial-gradient(ellipse, rgba(79,99,246,0.06) 0%, transparent 70%);
  pointer-events: none;
}
.hero-left { flex: 1; min-width: 0; position: relative; z-index: 1; }
.hero-right { display: flex; flex-direction: column; gap: 14px; min-width: 240px; align-items: stretch; position: relative; z-index: 1; }
.hero-title { margin: 0; font-size: 34px; font-weight: 750; color: var(--text-main); letter-spacing: -0.8px; }
.hero-desc { margin: 14px 0 0; color: var(--text-muted); font-size: 16px; line-height: 1.8; max-width: 520px; }

.hero-metrics { display: flex; gap: 32px; margin-top: 28px; }
.hero-metric { display: flex; flex-direction: column; gap: 4px; }
.metric-num { font-size: 34px; font-weight: 700; color: var(--primary); letter-spacing: -0.5px; }
.metric-label { font-size: 13px; color: var(--text-faint); }

/* Preview card */
.hero-preview {
  background: linear-gradient(145deg, #fafbff 0%, #f5f7ff 100%);
  border: 1px solid rgba(79, 99, 246, 0.14);
  border-radius: var(--radius-lg);
  padding: 20px 22px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 200px;
}
.preview-head { display: flex; align-items: center; }
.preview-badge {
  font-size: 12px; font-weight: 600; color: var(--primary);
  background: rgba(79,99,246,0.08); padding: 3px 12px; border-radius: 20px;
}
.preview-core { display: flex; align-items: center; gap: 18px; }
.preview-ring-wrap {
  width: 58px; height: 58px; border-radius: 50%;
  background: rgba(79,99,246,0.06); border: 2px solid rgba(79,99,246,0.15);
  display: grid; place-items: center; position: relative; flex-shrink: 0;
}
.preview-ring {
  position: absolute; inset: -2px; border-radius: 50%;
  border: 2px solid transparent;
  border-top-color: var(--primary);
  border-right-color: var(--primary);
  opacity: 0.4; animation: spin 4s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.preview-ring-score { font-size: 18px; font-weight: 700; color: var(--primary); }
.preview-key { display: flex; flex-direction: column; gap: 2px; }
.preview-key-label { font-size: 11px; color: var(--text-faint); }
.preview-key-value { font-size: 22px; font-weight: 700; color: var(--teal); }
.preview-tags { display: flex; gap: 6px; }
.preview-chip { padding: 3px 10px; border-radius: 14px; font-size: 11px; font-weight: 500; border: 1px solid; }
.preview-chip.positive { background: rgba(59,130,176,0.07); color: #256c95; border-color: rgba(59,130,176,0.22); }
.preview-chip.neutral { background: rgba(139,143,163,0.06); color: #6b6f85; border-color: rgba(139,143,163,0.18); }

/* Quick actions */
.hero-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.hero-act {
  display: flex; align-items: center; gap: 6px;
  padding: 11px 14px; border-radius: var(--radius-md); border: 1px solid var(--border-soft);
  background: var(--surface-solid); font-size: 14px; font-weight: 500; color: var(--text-main);
  cursor: pointer; transition: all var(--transition-base);
}
.hero-act:hover { border-color: var(--primary); box-shadow: var(--shadow-sm); transform: translateY(-2px); }
.hero-act:active { transform: translateY(0); }
.hero-act.primary { background: var(--primary); color: #fff; border-color: var(--primary); font-weight: 600; }
.hero-act.primary:hover { background: var(--primary-dark); }

/* Rule cards */
.rule-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
.rule-card { padding: 22px; border: 1px solid var(--border-soft); border-radius: var(--radius-md); background: var(--surface-solid); transition: all var(--transition-base); }
.rule-card:hover { box-shadow: var(--shadow-sm); transform: translateY(-2px); }
.rule-card .rule-icon { width: 48px; height: 48px; border-radius: 13px; display: grid; place-items: center; margin-bottom: 12px; border: 1px solid var(--border-soft); color: var(--primary); background: var(--primary-soft); }
.rule-card strong { display: block; margin-bottom: 6px; color: var(--text-main); }
.rule-card p { margin: 0; color: var(--text-muted); font-size: 13px; line-height: 1.8; }

/* Todos */
.todo-list { display: grid; gap: 12px; }
.todo-project { border: 1px solid var(--border-soft); border-radius: var(--radius-md); padding: 16px 18px; background: var(--surface-solid); }
.todo-project-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 10px; }
.todo-project-name { font-weight: 600; }
.todo-teammates { display: flex; flex-wrap: wrap; gap: 8px 18px; }
.todo-teammate { display: inline-flex; align-items: center; gap: 6px; font-size: 14px; color: var(--text-muted); }

.compact-panel { min-height: 190px; }
.empty-icon-box {
  width: 56px; height: 56px; border-radius: 14px;
  background: var(--surface-soft); border: 1px solid var(--border-soft);
  display: grid; place-items: center; margin: 0 auto 12px;
  color: var(--text-faint);
  animation: softFloat 3.2s ease-in-out infinite;
}
.empty-placeholder { padding: 44px 16px; text-align: center; color: var(--text-faint); font-size: 14px; }
</style>
