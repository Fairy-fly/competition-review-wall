<template>
  <div class="page-shell">
    <header class="page-header">
      <h1 class="page-title">{{ project.name || "项目详情" }}</h1>
      <p class="page-subtitle">把队伍结构和项目状态维护好，评价链路就能顺畅跑起来。</p>
    </header>

    <div class="two-col-grid">
      <section class="section-surface">
        <div class="surface-actions">
          <div>
            <strong>项目信息</strong>
            <div class="muted-text">当前创建者：{{ project.creatorName || "-" }}</div>
          </div>
          <el-tag>{{ project.status || "ongoing" }}</el-tag>
        </div>

        <el-descriptions :column="1" border>
          <el-descriptions-item label="竞赛类型">{{ project.type || "-" }}</el-descriptions-item>
          <el-descriptions-item label="队伍名称">{{ project.teamName || "-" }}</el-descriptions-item>
          <el-descriptions-item label="项目时间">{{ project.startDate || "-" }} 至 {{ project.endDate || "-" }}</el-descriptions-item>
          <el-descriptions-item label="项目说明">{{ project.description || "暂无说明" }}</el-descriptions-item>
        </el-descriptions>

        <div class="section-block">
          <strong>切换项目状态</strong>
          <div class="muted-text" style="margin: 6px 0 12px">只有创建者或管理员可以切换项目流程阶段。</div>
          <el-radio-group v-model="statusForm.status">
            <el-radio-button label="ongoing">进行中</el-radio-button>
            <el-radio-button label="reviewable">可评价</el-radio-button>
            <el-radio-button label="archived">已归档</el-radio-button>
          </el-radio-group>
          <div style="margin-top: 12px">
            <el-button type="primary" :disabled="!canManage" @click="handleUpdateStatus">保存状态</el-button>
          </div>
        </div>
      </section>

      <section class="section-surface">
        <div class="surface-actions">
          <div>
            <strong>添加队友</strong>
            <div class="muted-text">按学号补充队友，避免同一项目重复加人。</div>
          </div>
        </div>

        <el-form :model="memberForm" label-width="76px">
          <el-form-item label="学号">
            <el-input v-model="memberForm.studentNo" placeholder="请输入队友学号" />
          </el-form-item>
          <el-form-item label="角色">
            <el-input v-model="memberForm.roleInTeam" placeholder="例如：算法 / 前端 / 文档" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :disabled="!canManage" @click="handleAddMember">添加成员</el-button>
          </el-form-item>
        </el-form>
      </section>
    </div>

    <section class="section-block section-surface">
      <div class="surface-actions">
        <div>
          <strong>项目成员</strong>
          <div class="muted-text">如果项目已经可评价，这里会直接给出进入评价页的入口。</div>
        </div>
      </div>

      <el-table :data="project.members || []" stripe>
        <el-table-column prop="realName" label="成员" min-width="120" />
        <el-table-column prop="studentNo" label="学号" width="120" />
        <el-table-column prop="major" label="专业" min-width="120" />
        <el-table-column prop="grade" label="年级" width="110" />
        <el-table-column prop="roleInTeam" label="队内角色" min-width="140" />
        <el-table-column prop="skillDirection" label="技能方向" min-width="160" />
        <el-table-column label="操作" width="220" fixed="right">
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

import { addProjectMember, getProjectDetail, updateProjectStatus } from "@/api/projectApi";
import { useUserStore } from "@/store/user";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const project = ref({});
const statusForm = reactive({ status: "ongoing" });
const memberForm = reactive({
  studentNo: "",
  roleInTeam: ""
});

const canManage = computed(() => {
  return project.value.creatorId === userStore.currentUser?.id || userStore.role === "admin";
});

async function fetchDetail() {
  try {
    const response = await getProjectDetail(route.params.id);
    project.value = response.data;
    statusForm.status = response.data.status;
  } catch (error) {
    ElMessage.error(error.message);
  }
}

async function handleAddMember() {
  try {
    await addProjectMember(route.params.id, memberForm);
    ElMessage.success("成员添加成功");
    memberForm.studentNo = "";
    memberForm.roleInTeam = "";
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

onMounted(fetchDetail);
</script>

