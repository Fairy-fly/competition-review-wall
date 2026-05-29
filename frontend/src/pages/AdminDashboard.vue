<template>
  <div class="page-shell">
    <header class="page-header">
      <h1 class="page-title">管理员后台</h1>
      <p class="page-subtitle">集中查看用户、项目和评价，处理不适合公开展示的内容。</p>
    </header>

    <section class="section-surface">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="用户管理" name="users">
          <el-table :data="users" stripe>
            <el-table-column prop="realName" label="姓名" min-width="120" />
            <el-table-column prop="studentNo" label="学号" width="120" />
            <el-table-column prop="major" label="专业" min-width="120" />
            <el-table-column prop="role" label="角色" width="100" />
            <el-table-column prop="projectCount" label="项目数" width="100" />
            <el-table-column prop="reviewCount" label="评价数" width="100" />
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="项目管理" name="projects">
          <el-table :data="projects" stripe>
            <el-table-column prop="name" label="项目名称" min-width="180" />
            <el-table-column prop="creatorName" label="创建者" width="120" />
            <el-table-column prop="teamName" label="队伍名称" min-width="140" />
            <el-table-column prop="status" label="状态" width="120" />
            <el-table-column prop="memberCount" label="成员数" width="100" />
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="评价管理" name="reviews">
          <ReviewList :reviews="reviews" admin-mode />
          <div v-if="reviews.length" class="section-block">
            <el-table :data="reviews" stripe>
              <el-table-column prop="projectName" label="项目" min-width="160" />
              <el-table-column prop="reviewerName" label="评价人" width="120" />
              <el-table-column prop="revieweeName" label="被评价人" width="120" />
              <el-table-column prop="overallScore" label="综合分" width="90" />
              <el-table-column prop="status" label="状态" width="100" />
              <el-table-column label="操作" width="120">
                <template #default="{ row }">
                  <el-button
                    type="danger"
                    link
                    :disabled="row.status === 'hidden'"
                    @click="handleHide(row.id)"
                  >
                    隐藏评价
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>
    </section>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { ElMessage } from "element-plus";

import { getAdminProjects, getAdminReviews, getAdminUsers, hideReview } from "@/api/adminApi";
import ReviewList from "@/components/ReviewList.vue";

const activeTab = ref("users");
const users = ref([]);
const projects = ref([]);
const reviews = ref([]);

async function fetchData() {
  try {
    const [usersRes, projectsRes, reviewsRes] = await Promise.all([
      getAdminUsers(),
      getAdminProjects(),
      getAdminReviews()
    ]);
    users.value = usersRes.data;
    projects.value = projectsRes.data;
    reviews.value = reviewsRes.data;
  } catch (error) {
    ElMessage.error(error.message);
  }
}

async function handleHide(id) {
  try {
    await hideReview(id);
    ElMessage.success("评价已隐藏");
    await fetchData();
  } catch (error) {
    ElMessage.error(error.message);
  }
}

onMounted(fetchData);
</script>
