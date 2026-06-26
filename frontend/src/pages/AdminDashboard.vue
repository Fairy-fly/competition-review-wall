<template>
  <div class="page-shell">
    <header class="page-header">
      <h1 class="page-title">管理员后台</h1>
      <p class="page-subtitle">集中查看用户、项目和评价，处理不适合公开展示的内容。</p>
    </header>

    <!-- Overview cards -->
    <section class="stat-grid section-block">
      <ScoreCard label="学生总数" :value="overview.totalUsers" hint="含管理员" />
      <ScoreCard label="竞赛项目" :value="overview.totalProjects" accent="#0f766e" />
      <ScoreCard label="有效评价" :value="overview.totalReviews" accent="#7c3aed" />
      <ScoreCard label="隐藏评价" :value="overview.hiddenReviews" hint="已隐藏的评价数" accent="#ea580c" />
      <ScoreCard label="平台平均分" :value="overview.averageScore || 0" accent="#2563eb" />
      <ScoreCard label="无评价用户" :value="overview.usersWithoutReviews" hint="尚未收到任何评价的学生" accent="#d97706" />
    </section>

    <section class="section-block section-surface">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="用户管理" name="users">
          <el-table v-loading="loadingUsers" :data="users" stripe empty-text="暂无用户数据">
            <el-table-column prop="realName" label="姓名" min-width="120" />
            <el-table-column prop="studentNo" label="学号" width="120" />
            <el-table-column prop="college" label="学院" min-width="120" />
            <el-table-column prop="major" label="专业" min-width="120" />
            <el-table-column prop="grade" label="年级" width="100" />
            <el-table-column prop="role" label="角色" width="100">
              <template #default="{ row }">
                <el-tag :type="row.role === 'admin' ? 'danger' : 'info'" size="small">
                  {{ row.role === "admin" ? "管理员" : "学生" }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="projectCount" label="项目数" width="90" />
            <el-table-column prop="reviewCount" label="评价数" width="90" />
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="项目管理" name="projects">
          <el-table v-loading="loadingProjects" :data="projects" stripe empty-text="暂无项目数据">
            <el-table-column prop="name" label="项目名称" min-width="180" />
            <el-table-column prop="type" label="竞赛类型" width="120" />
            <el-table-column prop="creatorName" label="创建者" width="120" />
            <el-table-column prop="teamName" label="队伍名称" min-width="140" />
            <el-table-column label="状态" width="110">
              <template #default="{ row }">
                <el-tag :type="statusTagType(row.status)" size="small">
                  {{ statusLabel(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="memberCount" label="成员数" width="90" />
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="评价管理" name="reviews">
          <!-- Filter bar -->
          <div class="surface-actions">
            <div>
              <strong>评价筛选</strong>
              <div class="muted-text">支持按项目、状态、评分和关键词筛选评价记录。</div>
            </div>
            <el-button @click="resetReviewFilters">重置筛选</el-button>
          </div>

          <div class="toolbar-row section-block">
            <el-select
              v-model="reviewFilters.projectId"
              placeholder="按项目筛选"
              clearable
              style="width: 200px"
            >
              <el-option
                v-for="p in projects"
                :key="p.id"
                :label="p.name"
                :value="p.id"
              />
            </el-select>
            <el-select
              v-model="reviewFilters.status"
              placeholder="评价状态"
              clearable
              style="width: 140px"
            >
              <el-option label="正常" value="normal" />
              <el-option label="已隐藏" value="hidden" />
            </el-select>
            <el-select
              v-model="reviewFilters.minScore"
              placeholder="最低评分"
              clearable
              style="width: 140px"
            >
              <el-option v-for="s in [5, 4, 3, 2, 1]" :key="s" :label="`${s} 分及以上`" :value="s" />
            </el-select>
            <el-input
              v-model="reviewFilters.keyword"
              placeholder="项目/评价人/被评人/内容"
              clearable
              style="width: 220px"
            />
            <el-button type="primary" :loading="loadingReviews" @click="fetchReviews">查询</el-button>
          </div>

          <!-- Review cards + table -->
          <ReviewList v-if="reviews.length" :reviews="reviews" admin-mode class="section-block" />

          <el-table
            v-loading="loadingReviews"
            :data="reviews"
            stripe
            empty-text="暂无符合条件的评价"
            class="section-block"
          >
            <el-table-column prop="id" label="ID" width="60" />
            <el-table-column prop="projectName" label="项目" min-width="150" />
            <el-table-column prop="reviewerName" label="评价人" width="100" />
            <el-table-column prop="revieweeName" label="被评价人" width="100" />
            <el-table-column prop="overallScore" label="综合分" width="80" />
            <el-table-column label="状态" width="90">
              <template #default="{ row }">
                <el-tag :type="row.status === 'hidden' ? 'danger' : 'success'" size="small">
                  {{ row.status === "hidden" ? "已隐藏" : "正常" }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="隐藏原因" min-width="160">
              <template #default="{ row }">
                <span v-if="row.hiddenReason" class="hidden-reason-text">{{ row.hiddenReason }}</span>
                <span v-else class="muted-text">-</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="{ row }">
                <el-button
                  type="danger"
                  link
                  :disabled="row.status === 'hidden'"
                  @click="showHideDialog(row)"
                >
                  隐藏评价
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </section>

    <!-- Hidden reason dialog -->
    <el-dialog
      v-model="hideDialogVisible"
      title="隐藏评价"
      width="460px"
      :close-on-click-modal="false"
    >
      <el-form :model="hideForm" label-width="80px">
        <el-form-item label="评价 ID">
          <span>{{ hideForm.reviewId }}</span>
        </el-form-item>
        <el-form-item label="隐藏原因" required>
          <el-input
            v-model="hideForm.reason"
            type="textarea"
            :rows="3"
            maxlength="200"
            show-word-limit
            placeholder="请填写隐藏原因，例如：表述偏主观 / 含不实信息 / 与协作无关"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="hideDialogVisible = false">取消</el-button>
        <el-button type="danger" :loading="hidingReview" @click="confirmHide">
          确认隐藏
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import { ElMessage } from "element-plus";

import { getAdminProjects, getAdminReviews, getAdminUsers, hideReview } from "@/api/adminApi";
import { getDashboardSummary } from "@/api/dashboardApi";
import ReviewList from "@/components/ReviewList.vue";
import ScoreCard from "@/components/ScoreCard.vue";

const activeTab = ref("users");

const loadingUsers = ref(false);
const loadingProjects = ref(false);
const loadingReviews = ref(false);
const hidingReview = ref(false);

const users = ref([]);
const projects = ref([]);
const reviews = ref([]);

const overview = reactive({
  totalUsers: 0,
  totalProjects: 0,
  totalReviews: 0,
  hiddenReviews: 0,
  averageScore: 0,
  usersWithoutReviews: 0
});

const reviewFilters = reactive({
  projectId: undefined,
  status: undefined,
  minScore: undefined,
  keyword: ""
});

const hideDialogVisible = ref(false);
const hideForm = reactive({
  reviewId: null,
  reason: ""
});

const statusMap = {
  ongoing: "进行中",
  reviewable: "可评价",
  archived: "已归档"
};

function statusLabel(status) {
  return statusMap[status] || status || "-";
}

function statusTagType(status) {
  return status === "ongoing" ? "info" : status === "reviewable" ? "success" : "warning";
}

function resetReviewFilters() {
  reviewFilters.projectId = undefined;
  reviewFilters.status = undefined;
  reviewFilters.minScore = undefined;
  reviewFilters.keyword = "";
  fetchReviews();
}

/* ---- Data fetching ---- */
async function fetchOverview() {
  try {
    const res = await getDashboardSummary();
    Object.assign(overview, res.data.overview || {});
  } catch (error) {
    // overview is non-critical, degrade gracefully
  }
}

async function fetchUsers() {
  loadingUsers.value = true;
  try {
    const res = await getAdminUsers();
    users.value = res.data || [];
  } catch (error) {
    ElMessage.error(error.message || "加载用户列表失败");
  } finally {
    loadingUsers.value = false;
  }
}

async function fetchProjects() {
  loadingProjects.value = true;
  try {
    const res = await getAdminProjects();
    projects.value = res.data || [];
  } catch (error) {
    ElMessage.error(error.message || "加载项目列表失败");
  } finally {
    loadingProjects.value = false;
  }
}

async function fetchReviews() {
  loadingReviews.value = true;
  try {
    const params = {};
    if (reviewFilters.projectId) params.projectId = reviewFilters.projectId;
    if (reviewFilters.status) params.status = reviewFilters.status;
    if (reviewFilters.minScore) params.minScore = reviewFilters.minScore;
    if (reviewFilters.keyword) params.keyword = reviewFilters.keyword;
    const res = await getAdminReviews(params);
    reviews.value = res.data || [];
  } catch (error) {
    ElMessage.error(error.message || "加载评价列表失败");
  } finally {
    loadingReviews.value = false;
  }
}

/* ---- Hide review ---- */
function showHideDialog(row) {
  hideForm.reviewId = row.id;
  hideForm.reason = "";
  hideDialogVisible.value = true;
}

async function confirmHide() {
  const reason = hideForm.reason.trim();
  if (!reason) {
    ElMessage.warning("请填写隐藏原因");
    return;
  }

  hidingReview.value = true;
  try {
    await hideReview(hideForm.reviewId, { reason });
    hideDialogVisible.value = false;
    ElMessage.success("评价已隐藏，前台画像会同步剔除");
    await Promise.all([fetchOverview(), fetchReviews()]);
  } catch (error) {
    ElMessage.error(error.message || "隐藏失败");
  } finally {
    hidingReview.value = false;
  }
}

function handleTabChange(tab) {
  if (tab === "users") fetchUsers();
  else if (tab === "projects") fetchProjects();
  else if (tab === "reviews") fetchReviews();
}

onMounted(async () => {
  await Promise.all([fetchOverview(), fetchUsers()]);
});
</script>

<style scoped>
.hidden-reason-text {
  color: #991b1b;
  font-size: 13px;
}
</style>
