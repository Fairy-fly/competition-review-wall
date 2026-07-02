<template>
  <div class="page-shell">
    <header class="page-header profile-head report-head">
      <div class="report-identity">
        <div class="report-avatar">{{ (profile.user?.realName || "队友").slice(-2) }}</div>
        <div>
          <span class="report-kicker">协作画像报告</span>
          <h1 class="page-title">{{ profile.user?.realName || "队友画像" }}</h1>
          <p class="page-subtitle">
            {{ profile.user?.college || "未填写学院" }} · {{ profile.user?.major || "未填写专业" }} ·
            {{ profile.user?.skillDirection || "未填写技能方向" }}
          </p>
        </div>
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
          <ScoreCard label="综合评分" :value="profile.summary.overallScore || 0" />
          <ScoreCard label="评价次数" :value="profile.summary.reviewCount || 0" accent="#D9913B" />
          <ScoreCard label="参与项目" :value="profile.summary.projectCount || 0" accent="#4B5CF0" />
          <ScoreCard label="再次组队率" :value="`${profile.summary.willingAgainRate || 0}%`" accent="#18A999" />
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

        <div class="section-block">
          <strong>适合角色</strong>
          <div class="muted-text tag-note">根据技能方向和标签综合推断，仅供参考。</div>
          <div v-if="suitableRoles.length" class="role-list">
            <div v-for="r in suitableRoles" :key="r.role" class="role-chip">
              <span class="role-name">{{ r.role }}</span>
              <span class="role-reason">{{ r.reason }}</span>
            </div>
          </div>
          <div v-else class="muted-text">暂未积累足够数据推断适合角色</div>
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
      <ReviewList :reviews="profile.recentReviews" :show-appeal="profile.viewer.isSelf" @appeal="showAppealDialog" />
    </section>

    <!-- 申诉弹窗 -->
    <el-dialog v-model="appealDialogVisible" title="申请申诉" width="460px" :close-on-click-modal="false">
      <el-form label-width="80px">
        <el-form-item label="评价 ID">
          <span>{{ appealForm.reviewId }}</span>
        </el-form-item>
        <el-form-item label="申诉理由" required>
          <el-input
            v-model="appealForm.reason"
            type="textarea"
            :rows="4"
            maxlength="500"
            show-word-limit
            placeholder="请说明你认为该评价存在问题的具体原因，例如：与事实不符、表述偏颇、缺乏具体事例等。"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="appealDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="appealSubmitting" @click="submitAppeal">提交申诉</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import { useRoute, useRouter } from "vue-router";

import { getProfile } from "@/api/profileApi";
import { addFavorite, removeFavorite } from "@/api/userApi";
import { createAppeal } from "@/api/appealApi";
import RadarChart from "@/components/RadarChart.vue";
import ReviewList from "@/components/ReviewList.vue";
import ScoreCard from "@/components/ScoreCard.vue";
import TagList from "@/components/TagList.vue";

const RECENT_KEY = "competition_review_wall_recent_profiles";
const route = useRoute();
const router = useRouter();
const favoriteLoading = ref(false);
const appealDialogVisible = ref(false);
const appealSubmitting = ref(false);
const appealForm = reactive({
  reviewId: null,
  reason: ""
});
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

function inferRoles(skillDirection, topTags) {
  const roles = [];
  const direction = (skillDirection || "").toLowerCase();
  const tagNames = (topTags || []).map((t) => t.name);

  if (direction.includes("前端")) roles.push({ role: "前端开发", reason: "技能方向为前端" });
  if (direction.includes("后端") || direction.includes("服务端")) roles.push({ role: "后端开发", reason: "技能方向为后端" });
  if (direction.includes("算法") || direction.includes("建模") || direction.includes("数据")) roles.push({ role: "算法建模", reason: "技能方向涉及算法/建模" });
  if (direction.includes("产品") || direction.includes("设计") || direction.includes("ui")) roles.push({ role: "产品设计", reason: "技能方向为产品/设计" });
  if (direction.includes("文档")) roles.push({ role: "文档撰写", reason: "技能方向为文档" });
  if (direction.includes("ai") || direction.includes("人工智能") || direction.includes("机器学习")) roles.push({ role: "AI/机器学习", reason: "技能方向涉及AI" });
  if (direction.includes("全栈")) roles.push({ role: "全栈开发", reason: "技能方向为全栈" });

  if (tagNames.includes("creative_ideas")) roles.push({ role: "创意担当", reason: "多次被评价为有创意" });
  if (tagNames.includes("strong_documentation") || tagNames.includes("presentation_ready")) roles.push({ role: "文档答辩", reason: "标签显示文档/答辩能力强" });
  if (tagNames.includes("reliable") || tagNames.includes("strong_execution")) roles.push({ role: "组织协调", reason: "标签显示可靠/执行力强" });
  if (tagNames.includes("smooth_communication")) roles.push({ role: "沟通桥梁", reason: "标签显示沟通顺畅" });

  const seen = new Set();
  return roles.filter((r) => {
    if (seen.has(r.role)) return false;
    seen.add(r.role);
    return true;
  });
}

const suitableRoles = computed(() =>
  inferRoles(profile.user?.skillDirection, profile.topTags)
);

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

function showAppealDialog(reviewId) {
  appealForm.reviewId = reviewId;
  appealForm.reason = "";
  appealDialogVisible.value = true;
}

async function submitAppeal() {
  const reason = appealForm.reason.trim();
  if (!reason) {
    ElMessage.warning("请填写申诉理由");
    return;
  }

  appealSubmitting.value = true;
  try {
    await createAppeal({ reviewId: appealForm.reviewId, reason });
    appealDialogVisible.value = false;
    ElMessage.success("申诉已提交，管理员会尽快处理");
  } catch (error) {
    ElMessage.error(error.message);
  } finally {
    appealSubmitting.value = false;
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

.report-head {
  position: relative;
  overflow: hidden;
  padding: 26px;
  border: 1px solid rgba(75,92,240,0.14);
  border-radius: var(--radius-xl);
  background:
    linear-gradient(rgba(75,92,240,0.055) 1px, transparent 1px),
    linear-gradient(90deg, rgba(75,92,240,0.045) 1px, transparent 1px),
    var(--surface-solid);
  background-size: 28px 28px;
  box-shadow: var(--shadow-card);
}

.report-identity {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
}

.report-avatar {
  width: 68px;
  height: 68px;
  border-radius: 22px;
  display: grid;
  place-items: center;
  color: #fff;
  font-weight: 800;
  background: linear-gradient(135deg, var(--brand-primary), #6876ff);
  box-shadow: 0 14px 28px rgba(75,92,240,0.20);
  flex-shrink: 0;
}

.report-kicker {
  display: inline-flex;
  align-items: center;
  min-height: 26px;
  padding: 0 10px;
  border-radius: 999px;
  color: var(--brand-teal-deep);
  background: var(--brand-teal-soft);
  border: 1px solid rgba(24,169,153,0.18);
  font-size: 12px;
  font-weight: 750;
  margin-bottom: 8px;
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
  gap: 8px;
}

.mini-row {
  width: 100%;
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-sm);
  background: var(--surface-solid);
  padding: 10px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  text-align: left;
  cursor: pointer;
  transition: border-color var(--transition-fast);
}

.mini-row:hover {
  border-color: var(--brand-primary);
}

.mini-row strong {
  display: block;
  font-size: 14px;
  color: var(--text-main);
  font-weight: 600;
}

.mini-row small {
  display: block;
  margin-top: 2px;
  color: var(--text-faint);
  font-size: 12px;
}

.explain-list {
  margin: 0;
  padding-left: 18px;
  color: var(--text-muted);
  line-height: 2;
  font-size: 14px;
}

.role-list {
  display: grid;
  gap: 8px;
}

.role-chip {
  border: 1px solid rgba(75,92,240,0.16);
  border-radius: var(--radius-sm);
  background: var(--primary-soft);
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.role-name {
  font-weight: 600;
  color: var(--brand-primary-deep);
  font-size: 14px;
}

.role-reason {
  color: var(--text-faint);
  font-size: 12px;
}

.empty-placeholder {
  padding: 36px 12px;
  text-align: center;
  color: var(--text-faint);
  font-size: 14px;
}

@media (max-width: 760px) {
  .report-head {
    flex-direction: column;
    padding: 20px;
  }

  .head-actions {
    justify-content: flex-start;
    width: 100%;
  }

  .head-actions > * {
    flex: 1 1 auto;
  }
}
</style>
