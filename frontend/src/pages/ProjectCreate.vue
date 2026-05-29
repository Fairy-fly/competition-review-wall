<template>
  <div class="page-shell">
    <header class="page-header">
      <h1 class="page-title">创建竞赛项目</h1>
      <p class="page-subtitle">先把项目建起来，后面再往里补队友、推进评价状态。</p>
    </header>

    <section class="section-surface">
      <ProjectForm @submit="handleSubmit" />
    </section>
  </div>
</template>

<script setup>
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";

import ProjectForm from "@/components/ProjectForm.vue";
import { createProject } from "@/api/projectApi";

const router = useRouter();

async function handleSubmit(payload) {
  try {
    const response = await createProject(payload);
    ElMessage.success("项目创建成功");
    router.push(`/projects/${response.data.id}`);
  } catch (error) {
    ElMessage.error(error.message);
  }
}
</script>

