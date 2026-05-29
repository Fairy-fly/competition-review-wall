<template>
  <div class="page-shell">
    <header class="page-header">
      <h1 class="page-title">我的竞赛项目</h1>
      <p class="page-subtitle">从这里管理自己参与的比赛项目，推进到可评价状态。</p>
    </header>

    <section class="section-surface">
      <div class="surface-actions">
        <div>
          <strong>项目列表</strong>
          <div class="muted-text">点击详情可查看成员、补充队友、切换状态和发起评价。</div>
        </div>
        <el-button type="primary" @click="router.push('/projects/create')">创建项目</el-button>
      </div>

      <el-table :data="projects" stripe>
        <el-table-column prop="name" label="项目名称" min-width="180" />
        <el-table-column prop="type" label="竞赛类型" min-width="140" />
        <el-table-column prop="teamName" label="队伍名称" min-width="140" />
        <el-table-column prop="status" label="状态" width="120" />
        <el-table-column prop="memberCount" label="成员数" width="100" />
        <el-table-column label="时间" min-width="180">
          <template #default="{ row }">
            {{ row.startDate || "-" }} 至 {{ row.endDate || "-" }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="router.push(`/projects/${row.id}`)">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </section>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";

import { getMyProjects } from "@/api/projectApi";

const router = useRouter();
const projects = ref([]);

async function fetchProjects() {
  try {
    const response = await getMyProjects();
    projects.value = response.data;
  } catch (error) {
    ElMessage.error(error.message);
  }
}

onMounted(fetchProjects);
</script>

