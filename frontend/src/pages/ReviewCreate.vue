<template>
  <div class="page-shell">
    <header class="page-header">
      <h1 class="page-title">提交匿名评价</h1>
      <p class="page-subtitle">评价只展示为“匿名队友”，后台保留可追溯记录。</p>
    </header>

    <div class="two-col-grid">
      <section class="section-surface">
        <el-form :model="form" label-width="108px">
          <el-form-item label="选择项目">
            <el-select v-model="form.projectId" placeholder="请选择项目" style="width: 100%" @change="handleProjectChange">
              <el-option v-for="item in reviewableProjects" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="评价队友">
            <el-select v-model="form.revieweeId" placeholder="请选择队友" style="width: 100%">
              <el-option v-for="member in members" :key="member.id" :label="member.realName" :value="member.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="综合评分">
            <el-rate v-model="form.overallScore" :max="5" />
          </el-form-item>
          <el-form-item label="任务完成">
            <el-rate v-model="form.taskScore" :max="5" />
          </el-form-item>
          <el-form-item label="沟通协作">
            <el-rate v-model="form.communicationScore" :max="5" />
          </el-form-item>
          <el-form-item label="责任心">
            <el-rate v-model="form.responsibilityScore" :max="5" />
          </el-form-item>
          <el-form-item label="技术能力">
            <el-rate v-model="form.skillScore" :max="5" />
          </el-form-item>
          <el-form-item label="再次组队">
            <el-switch v-model="form.willingAgain" active-text="愿意" inactive-text="不太愿意" />
          </el-form-item>
          <el-form-item label="匿名评价">
            <el-input v-model="form.comment" type="textarea" :rows="4" placeholder="说清楚协作印象，别只留一个分数。" />
          </el-form-item>
          <el-form-item label="评价标签">
            <div class="tag-groups">
              <div v-for="(group, label) in groupedTags" :key="label" class="tag-group">
                <strong>{{ label }}</strong>
                <el-checkbox-group v-model="form.tagIds">
                  <el-checkbox v-for="tag in group" :key="tag.id" :label="tag.id">{{ tag.displayName }}</el-checkbox>
                </el-checkbox-group>
              </div>
            </div>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :loading="submitting" @click="handleSubmit">提交评价</el-button>
          </el-form-item>
        </el-form>
      </section>

      <section class="section-surface">
        <div class="surface-actions">
          <div>
            <strong>可评价成员提示</strong>
            <div class="muted-text">只有同项目队友、且当前项目已进入可评价或已归档阶段时，才能成功提交。</div>
          </div>
        </div>

        <el-table :data="members" stripe>
          <el-table-column prop="realName" label="队友" min-width="120" />
          <el-table-column prop="roleInTeam" label="角色" min-width="130" />
          <el-table-column prop="major" label="专业" min-width="120" />
          <el-table-column prop="canReview" label="可评价" width="100">
            <template #default="{ row }">
              <el-tag :type="row.canReview ? 'success' : 'info'">{{ row.canReview ? "是" : "否" }}</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import { useRoute, useRouter } from "vue-router";

import { getProjectDetail, getMyProjects } from "@/api/projectApi";
import { createReview } from "@/api/reviewApi";
import { getTags } from "@/api/tagApi";
import { useUserStore } from "@/store/user";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const submitting = ref(false);
const projects = ref([]);
const members = ref([]);
const tags = ref([]);

const form = reactive({
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
});

const reviewableProjects = computed(() => projects.value.filter((item) => item.status !== "ongoing"));

const groupedTags = computed(() => ({
  正向标签: tags.value.filter((item) => item.type === "positive"),
  中性标签: tags.value.filter((item) => item.type === "neutral"),
  风险标签: tags.value.filter((item) => item.type === "risk")
}));

async function fetchBaseData() {
  const [projectRes, tagRes] = await Promise.all([getMyProjects(), getTags()]);
  projects.value = projectRes.data;
  tags.value = tagRes.data.items;

  if (route.query.projectId) {
    form.projectId = Number(route.query.projectId);
    await handleProjectChange(form.projectId);
  }
  if (route.query.revieweeId) {
    form.revieweeId = Number(route.query.revieweeId);
  }
}

async function handleProjectChange(projectId) {
  form.revieweeId = undefined;
  if (!projectId) {
    members.value = [];
    return;
  }

  const response = await getProjectDetail(projectId);
  members.value = (response.data.members || []).filter(
    (item) => item.id !== userStore.currentUser.id && response.data.status !== "ongoing"
  );
}

async function handleSubmit() {
  submitting.value = true;
  try {
    await createReview(form);
    ElMessage.success("匿名评价提交成功");
    router.push(`/users/${form.revieweeId}`);
  } catch (error) {
    ElMessage.error(error.message);
  } finally {
    submitting.value = false;
  }
}

onMounted(async () => {
  try {
    await fetchBaseData();
  } catch (error) {
    ElMessage.error(error.message);
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

