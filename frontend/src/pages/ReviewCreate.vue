<template>
  <div class="page-shell">
    <header class="page-header">
      <h1 class="page-title">提交匿名评价</h1>
      <p class="page-subtitle">评价对外只展示为"匿名队友"，后台保留记录用于争议追溯。</p>
    </header>

    <div class="two-col-grid">
      <section class="section-surface">
        <div class="surface-actions">
          <div>
            <strong>评价表单</strong>
            <div class="muted-text">默认 5 分，你可以根据自己的真实感受调整。</div>
          </div>
        </div>

        <el-form :model="form" label-width="108px">
          <el-form-item label="选择项目" required>
            <el-select
              v-model="form.projectId"
              placeholder="请选择你参与的项目"
              style="width: 100%"
              :loading="loadingProjects"
              @change="handleProjectChange"
            >
              <el-option
                v-for="item in reviewableProjects"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="评价队友" required>
            <el-select
              v-model="form.revieweeId"
              placeholder="请选择要评价的队友"
              style="width: 100%"
              :loading="loadingMembers"
            >
              <el-option
                v-for="member in reviewableMembers"
                :key="member.id"
                :label="`${member.realName}（${member.roleInTeam || '队员'}）`"
                :value="member.id"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="综合评分">
            <el-rate v-model="form.overallScore" :max="5" show-score />
          </el-form-item>
          <el-form-item label="任务完成">
            <el-rate v-model="form.taskScore" :max="5" show-score />
          </el-form-item>
          <el-form-item label="沟通协作">
            <el-rate v-model="form.communicationScore" :max="5" show-score />
          </el-form-item>
          <el-form-item label="责任心">
            <el-rate v-model="form.responsibilityScore" :max="5" show-score />
          </el-form-item>
          <el-form-item label="技术能力">
            <el-rate v-model="form.skillScore" :max="5" show-score />
          </el-form-item>
          <el-form-item label="再次组队">
            <el-switch v-model="form.willingAgain" active-text="愿意" inactive-text="不太愿意" />
          </el-form-item>

          <el-form-item label="文字评价" required>
            <el-input
              v-model="form.comment"
              type="textarea"
              :rows="4"
              maxlength="500"
              show-word-limit
              placeholder="说清楚协作印象，别只留一个分数。例如：沟通主动、交付准时、遇到问题会及时同步。"
            />
          </el-form-item>

          <el-form-item label="评价标签">
            <div class="tag-groups">
              <div v-for="(group, label) in groupedTags" :key="label" class="tag-group">
                <strong>{{ label }}</strong>
                <el-checkbox-group v-model="form.tagIds">
                  <el-checkbox v-for="tag in group" :key="tag.id" :label="tag.id">
                    {{ tag.displayName }}
                  </el-checkbox>
                </el-checkbox-group>
              </div>
            </div>
            <div v-if="!tags.length" class="muted-text" style="margin-top: 8px">标签加载中...</div>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" :loading="submitting" @click="handleSubmit">
              提交评价
            </el-button>
            <el-button @click="clearDraft">清除草稿</el-button>
          </el-form-item>
        </el-form>
      </section>

      <section class="section-surface">
        <div class="surface-actions">
          <div>
            <strong>可评价成员</strong>
            <div class="muted-text">只有同项目队友、且项目已进入可评价或已归档阶段时，才能提交评价。每人每项目只能评价同一位队友一次。</div>
          </div>
        </div>

        <el-table
          v-if="members.length"
          :data="members"
          stripe
          empty-text="请先在左侧选择一个项目"
        >
          <el-table-column prop="realName" label="队友" min-width="110" />
          <el-table-column prop="roleInTeam" label="角色" min-width="100" />
          <el-table-column prop="major" label="专业" min-width="100" />
          <el-table-column label="可评价" width="90">
            <template #default="{ row }">
              <el-tag :type="row.canReview ? 'success' : 'info'">
                {{ row.canReview ? '可以' : row.hasReviewed ? '已评' : '暂不可' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
        <div v-else class="empty-placeholder">
          {{ form.projectId ? '该项目暂无其他成员' : '请先在左侧选择一个项目' }}
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useRoute, useRouter } from "vue-router";

import { getMyProjects, getProjectDetail } from "@/api/projectApi";
import { createReview } from "@/api/reviewApi";
import { getTags } from "@/api/tagApi";
import { useUserStore } from "@/store/user";

const DRAFT_KEY = "competition_review_draft";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const submitting = ref(false);
const loadingProjects = ref(false);
const loadingMembers = ref(false);
const projects = ref([]);
const members = ref([]);
const tags = ref([]);

const defaultForm = {
  projectId: undefined,
  revieweeId: undefined,
  overallScore: 5,
  taskScore: 5,
  communicationScore: 5,
  responsibilityScore: 5,
  skillScore: 5,
  willingAgain: true,
  comment: "",
  tagIds: []
};

const form = reactive({ ...defaultForm });

const reviewableProjects = computed(() =>
  projects.value.filter((item) => item.status !== "ongoing")
);

const reviewableMembers = computed(() =>
  members.value.filter((item) => item.canReview)
);

const groupedTags = computed(() => ({
  "正向标签": tags.value.filter((item) => item.type === "positive"),
  "中性标签": tags.value.filter((item) => item.type === "neutral"),
  "风险标签": tags.value.filter((item) => item.type === "risk")
}));

/* ---- Draft persistence ---- */
function loadDraft() {
  try {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      const draft = JSON.parse(saved);
      Object.keys(defaultForm).forEach((key) => {
        if (draft[key] !== undefined) {
          form[key] = draft[key];
        }
      });
      return true;
    }
  } catch (error) {
    // corrupted draft, ignore
  }
  return false;
}

function saveDraft() {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...form }));
  } catch (error) {
    // storage full or unavailable
  }
}

function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch (error) {
    // ignore
  }
  Object.assign(form, defaultForm);
  members.value = [];
  ElMessage.success("草稿已清除");
}

// Auto-save on form change
watch(form, saveDraft, { deep: true });

/* ---- Data fetching ---- */
async function fetchBaseData() {
  loadingProjects.value = true;
  try {
    const [projectRes, tagRes] = await Promise.all([
      getMyProjects(),
      getTags()
    ]);
    projects.value = projectRes.data;
    tags.value = tagRes.data?.items || tagRes.data || [];
  } catch (error) {
    ElMessage.error(error.message || "加载基础数据失败");
  } finally {
    loadingProjects.value = false;
  }
}

async function handleProjectChange(projectId) {
  form.revieweeId = undefined;
  members.value = [];

  if (!projectId) {
    return;
  }

  loadingMembers.value = true;
  try {
    const response = await getProjectDetail(projectId);
    const project = response.data;
    members.value = (project.members || []).filter(
      (item) => item.id !== userStore.currentUser?.id
    );

    // If revieweeId is in URL query and belongs to this project, pre-select
    if (route.query.revieweeId) {
      const targetId = Number(route.query.revieweeId);
      const found = members.value.find((m) => m.id === targetId);
      if (found && found.canReview) {
        form.revieweeId = targetId;
      }
    }
  } catch (error) {
    ElMessage.error(error.message || "加载项目成员失败");
  } finally {
    loadingMembers.value = false;
  }
}

/* ---- Submit ---- */
async function handleSubmit() {
  // Validate
  if (!form.projectId) {
    ElMessage.warning("请选择项目");
    return;
  }
  if (!form.revieweeId) {
    ElMessage.warning("请选择要评价的队友");
    return;
  }
  if (!form.comment.trim()) {
    ElMessage.warning("请填写文字评价");
    return;
  }

  try {
    await ElMessageBox.confirm(
      "评价提交后无法修改，确认提交吗？",
      "确认提交",
      {
        confirmButtonText: "确认提交",
        cancelButtonText: "再改改",
        type: "warning"
      }
    );
  } catch {
    return;
  }

  submitting.value = true;
  try {
    await createReview({
      projectId: form.projectId,
      revieweeId: form.revieweeId,
      overallScore: form.overallScore,
      taskScore: form.taskScore,
      communicationScore: form.communicationScore,
      responsibilityScore: form.responsibilityScore,
      skillScore: form.skillScore,
      willingAgain: form.willingAgain,
      comment: form.comment.trim(),
      tagIds: form.tagIds
    });

    clearDraft();
    router.push(`/users/${form.revieweeId}?reviewSubmitted=1`);
  } catch (error) {
    ElMessage.error(error.message || "提交失败");
  } finally {
    submitting.value = false;
  }
}

/* ---- Init ---- */
onMounted(async () => {
  try {
    const hasDraft = loadDraft();
    await fetchBaseData();

    // Apply URL query params (override draft for project/reviewee)
    if (route.query.projectId) {
      form.projectId = Number(route.query.projectId);
    }
    if (form.projectId) {
      await handleProjectChange(form.projectId);
    }

    if (hasDraft && form.comment) {
      ElMessage.info("已恢复上次未提交的草稿");
    }
  } catch (error) {
    ElMessage.error(error.message || "页面加载失败");
  }
});
</script>

<style scoped>
.tag-groups {
  display: grid;
  gap: 14px;
  width: 100%;
}

.tag-group {
  display: grid;
  gap: 8px;
}
</style>
