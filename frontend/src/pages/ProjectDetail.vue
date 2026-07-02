<template>
  <div class="page-shell">
    <header class="page-header project-head">
      <div>
        <h1 class="page-title">{{ project.name || "项目详情" }}</h1>
        <p class="page-subtitle">把成员、阶段和评价进度维护清楚，评价链路就能顺畅跑起来。</p>
      </div>
      <div class="head-actions">
        <el-button @click="router.back()">返回上一页</el-button>
        <el-button type="primary" @click="handleNextAction">{{ nextAction.label }}</el-button>
      </div>
    </header>

    <div class="two-col-grid">
      <section id="add-member-panel" class="section-surface">
        <div class="surface-actions">
          <div>
            <strong>项目阶段</strong>
            <div class="muted-text">{{ stageInfo.description }}</div>
          </div>
          <el-tag :type="stageInfo.type">{{ stageInfo.label }}</el-tag>
        </div>

        <el-alert :title="stageInfo.tip" type="info" :closable="false" show-icon />

        <el-descriptions class="section-block" :column="1" border>
          <el-descriptions-item label="创建者">{{ project.creatorName || "-" }}</el-descriptions-item>
          <el-descriptions-item label="竞赛类型">{{ project.type || "-" }}</el-descriptions-item>
          <el-descriptions-item label="队伍名称">{{ project.teamName || "-" }}</el-descriptions-item>
          <el-descriptions-item label="项目时间">{{ fmtDate(project.startDate) }} - {{ fmtDate(project.endDate) }}</el-descriptions-item>
          <el-descriptions-item label="项目说明">{{ project.description || "暂无说明" }}</el-descriptions-item>
        </el-descriptions>

        <div class="section-block">
          <strong>切换项目状态</strong>
          <div class="muted-text status-note">只有创建者或管理员可以切换项目阶段。</div>
          <el-radio-group v-model="statusForm.status">
            <el-radio-button label="ongoing">进行中</el-radio-button>
            <el-radio-button label="reviewable">可评价</el-radio-button>
            <el-radio-button label="archived">已归档</el-radio-button>
          </el-radio-group>
          <div class="status-actions">
            <el-button type="primary" :disabled="!canManage" @click="handleUpdateStatus">保存状态</el-button>
          </div>
        </div>
      </section>

      <section class="section-surface">
        <div class="surface-actions">
          <div>
            <strong>评价进度</strong>
            <div class="muted-text">展示你对本项目队友的互评完成情况。</div>
          </div>
        </div>
        <el-progress :percentage="progress.summary.progressRate || 0" />
        <div class="progress-grid">
          <ScoreCard label="可评价对象" :value="progress.summary.totalTargets || 0" hint="不包含自己" accent="#5B6CFF" />
          <ScoreCard label="已评价" :value="progress.summary.completedCount || 0" accent="#18A999" />
          <ScoreCard label="待评价" :value="progress.summary.pendingCount || 0" accent="#D98922" />
        </div>
      </section>
    </div>

    <div class="two-col-grid section-block">
      <section class="section-surface">
        <div class="surface-actions">
          <div>
            <strong>添加队友</strong>
            <div class="muted-text">先按学号预览匹配结果，确认无误后再加入项目。</div>
          </div>
        </div>

        <el-form :model="memberForm" label-width="76px">
          <el-form-item label="学号">
            <el-input v-model="memberForm.studentNo" placeholder="请输入队友学号">
              <template #append>
                <el-button :loading="previewLoading" @click="previewMember">预览</el-button>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="角色">
            <el-input v-model="memberForm.roleInTeam" placeholder="例如：算法 / 前端 / 文档" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :disabled="!canManage" @click="handleAddMember">添加成员</el-button>
          </el-form-item>
        </el-form>

        <el-alert
          v-if="memberPreview"
          class="preview-card"
          type="success"
          :closable="false"
          show-icon
          :title="`匹配到：${memberPreview.realName}（${memberPreview.major || '未填写专业'}）`"
        />
      </section>

      <section class="section-surface">
        <div class="surface-actions">
          <div>
            <strong>下一步建议</strong>
            <div class="muted-text">按照阶段推进，不用在页面之间来回找入口。</div>
          </div>
        </div>
        <ol class="flow-list">
          <li :class="{ active: project.status === 'ongoing' }">进行中：补全成员，确认分工。</li>
          <li :class="{ active: project.status === 'reviewable' }">可评价：进入评价页，完成匿名互评。</li>
          <li :class="{ active: project.status === 'archived' }">已归档：查看画像沉淀和历史评价。</li>
        </ol>
      </section>
    </div>

    <section class="section-block section-surface">
      <div class="surface-actions">
        <div>
          <strong>项目成员</strong>
          <div class="muted-text">成员列表直接显示“我是否已评价该成员”。</div>
        </div>
      </div>

      <el-table v-loading="loading" :data="project.members || []" stripe empty-text="暂无项目成员">
        <el-table-column prop="realName" label="成员" min-width="120" />
        <el-table-column prop="studentNo" label="学号" width="120" />
        <el-table-column prop="major" label="专业" min-width="120" />
        <el-table-column prop="grade" label="年级" width="110" />
        <el-table-column prop="roleInTeam" label="队内角色" min-width="140" />
        <el-table-column prop="skillDirection" label="技能方向" min-width="150" />
        <el-table-column label="评价状态" width="130">
          <template #default="{ row }">
            <el-tag :type="reviewStatusType(row.reviewStatus)">{{ reviewStatusText(row.reviewStatus) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="230" fixed="right">
          <template #default="{ row }">
            <el-space>
              <el-button type="primary" link @click="router.push(`/users/${row.id}`)">查看画像</el-button>
              <el-button
                v-if="row.canReview"
                type="success"
                link
                @click="router.push(`/reviews/create?projectId=${project.id}&revieweeId=${row.id}`)"
              >
                去评价
              </el-button>
            </el-space>
          </template>
        </el-table-column>
      </el-table>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import { useRoute, useRouter } from "vue-router";

import { addProjectMember, getProjectDetail, getProjectReviewProgress, updateProjectStatus } from "@/api/projectApi";
import { lookupUser } from "@/api/userApi";
import ScoreCard from "@/components/ScoreCard.vue";

const route = useRoute();
const router = useRouter();

const loading = ref(false);
const previewLoading = ref(false);
const project = ref({});
const memberPreview = ref(null);
const progress = reactive({
  summary: {
    totalMembers: 0,
    totalTargets: 0,
    completedCount: 0,
    pendingCount: 0,
    progressRate: 0,
    isReviewOpen: false
  },
  members: []
});

const statusForm = reactive({ status: "ongoing" });
const memberForm = reactive({
  studentNo: "",
  roleInTeam: ""
});

const canManage = computed(() => Boolean(project.value.canManage));
const stageMap = {
  ongoing: {
    label: "进行中",
    type: "info",
    description: "当前项目还在组队或推进阶段，暂不能提交评价。",
    tip: "建议先补齐成员和分工，准备进入互评时再切换为“可评价”。"
  },
  reviewable: {
    label: "可评价",
    type: "success",
    description: "项目已开放互评，成员可以匿名评价队友。",
    tip: "现在可以从成员列表或提交评价页进入互评。"
  },
  archived: {
    label: "已归档",
    type: "warning",
    description: "项目已经结束，仍可查看画像和历史评价沉淀。",
    tip: "归档项目保留评价结果，方便后续组队参考。"
  }
};

const stageInfo = computed(() => stageMap[project.value.status] || stageMap.ongoing);

function fmtDate(v) {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,"0")}.${String(d.getDate()).padStart(2,"0")}`;
}
const nextAction = computed(() => {
  if (project.value.status === "ongoing") {
    return { label: "去添加队友", action: "member" };
  }
  if (project.value.status === "reviewable") {
    return { label: "去评价队友", action: "review" };
  }
  return { label: "查看测评墙", action: "wall" };
});

function reviewStatusText(status) {
  return {
    self: "自己",
    done: "已评价",
    todo: "待评价",
    locked: "未开放"
  }[status] || "-";
}

function reviewStatusType(status) {
  return {
    self: "info",
    done: "success",
    todo: "warning",
    locked: "info"
  }[status] || "info";
}

async function fetchDetail() {
  loading.value = true;
  try {
    const [detailRes, progressRes] = await Promise.all([
      getProjectDetail(route.params.id),
      getProjectReviewProgress(route.params.id)
    ]);
    project.value = detailRes.data;
    statusForm.status = detailRes.data.status;
    Object.assign(progress.summary, progressRes.data.summary);
    progress.members = progressRes.data.members || [];
  } catch (error) {
    ElMessage.error(error.message);
  } finally {
    loading.value = false;
  }
}

async function previewMember() {
  if (!memberForm.studentNo) {
    ElMessage.warning("请先输入队友学号");
    return;
  }

  previewLoading.value = true;
  try {
    const response = await lookupUser({ studentNo: memberForm.studentNo });
    memberPreview.value = response.data;
  } catch (error) {
    memberPreview.value = null;
    ElMessage.error(error.message);
  } finally {
    previewLoading.value = false;
  }
}

async function handleAddMember() {
  try {
    await addProjectMember(route.params.id, memberForm);
    ElMessage.success("成员添加成功");
    memberForm.studentNo = "";
    memberForm.roleInTeam = "";
    memberPreview.value = null;
    await fetchDetail();
  } catch (error) {
    ElMessage.error(error.message);
  }
}

async function handleUpdateStatus() {
  try {
    await updateProjectStatus(route.params.id, { status: statusForm.status });
    ElMessage.success("项目状态已更新");
    await fetchDetail();
  } catch (error) {
    ElMessage.error(error.message);
  }
}

function handleNextAction() {
  if (nextAction.value.action === "member") {
    document.querySelector("#add-member-panel")?.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }
  if (nextAction.value.action === "review") {
    router.push(`/reviews/create?projectId=${project.value.id}`);
    return;
  }
  router.push("/");
}

onMounted(fetchDetail);
</script>

<style scoped>
.project-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 24px;
  border: 1px solid rgba(75,92,240,0.14);
  border-radius: var(--radius-xl);
  background:
    linear-gradient(rgba(75,92,240,0.055) 1px, transparent 1px),
    linear-gradient(90deg, rgba(75,92,240,0.045) 1px, transparent 1px),
    var(--surface-solid);
  background-size: 28px 28px;
  box-shadow: var(--shadow-card);
}
.head-actions { display: flex; flex-wrap: wrap; gap: 10px; justify-content: flex-end; }
.status-note { margin: 6px 0 12px; }
.status-actions { margin-top: 14px; }

/* ---- Status radio group: segmented pill ---- */
:deep(.el-radio-group) {
  background: rgba(248,250,252,0.85);
  border: 1px solid rgba(148,163,184,0.18);
  border-radius: 14px;
  padding: 4px;
  display: inline-flex;
}
:deep(.el-radio-button__inner) {
  border-radius: 10px !important;
  border: 1px solid transparent !important;
  background: transparent !important;
  color: #64748b !important;
  font-weight: 500;
  padding: 7px 18px;
  transition: all 0.18s ease;
  box-shadow: none !important;
}
:deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  border: 1px solid transparent !important;
  box-shadow: none !important;
}
/* ongoing checked */
:deep(.el-radio-button__original-radio[value="ongoing"]:checked + .el-radio-button__inner) {
  background: linear-gradient(135deg, rgba(217,137,34,.14), rgba(217,137,34,.07)) !important;
  color: #B96D12 !important;
  border-color: rgba(217,137,34,.22) !important;
  font-weight: 600;
}
/* reviewable checked */
:deep(.el-radio-button__original-radio[value="reviewable"]:checked + .el-radio-button__inner) {
  background: linear-gradient(135deg, rgba(24,169,153,.16), rgba(24,169,153,.07)) !important;
  color: #0C8A7A !important;
  border-color: rgba(24,169,153,.24) !important;
  font-weight: 600;
}
/* archived checked */
:deep(.el-radio-button__original-radio[value="archived"]:checked + .el-radio-button__inner) {
  background: linear-gradient(135deg, rgba(100,116,139,.12), rgba(100,116,139,.06)) !important;
  color: #475569 !important;
  border-color: rgba(100,116,139,.20) !important;
  font-weight: 600;
}

/* Progress bar */
:deep(.el-progress-bar__outer) { background: #e8ecf1; border-radius: 8px; }
:deep(.el-progress-bar__inner) {
  background: linear-gradient(90deg, #5B6CFF, #18A999) !important;
  border-radius: 8px;
  box-shadow: 0 4px 14px rgba(91,108,255,0.12);
}

.progress-grid { margin-top: 16px; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }

.preview-card {
  margin-top: 12px;
}

.flow-list {
  margin: 0;
  padding-left: 20px;
  color: var(--text-muted);
  line-height: 2.2;
  font-size: 14px;
}

.flow-list li.active {
  color: var(--brand-primary);
  font-weight: 650;
}

.empty-placeholder {
  padding: 36px 12px;
  text-align: center;
  color: var(--text-faint);
}

@media (max-width: 760px) {
  .project-head {
    flex-direction: column;
    padding: 20px;
  }

  .head-actions {
    width: 100%;
  }

  .head-actions > * {
    flex: 1 1 auto;
  }

  .progress-grid {
    grid-template-columns: 1fr;
  }
}
</style>
