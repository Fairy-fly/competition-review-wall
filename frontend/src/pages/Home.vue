<template>
  <div class="page-shell">
    <header class="page-header">
      <h1 class="page-title">测评墙</h1>
      <p class="page-subtitle">用匿名协作反馈和公开画像，帮组队判断更有依据一点。</p>
    </header>

    <section class="stat-grid section-block">
      <ScoreCard label="学生画像数" :value="wall.summary.totalUsers" hint="已公开展示的学生范围" />
      <ScoreCard label="竞赛项目数" :value="wall.summary.totalProjects" hint="累计录入项目" accent="#0f766e" />
      <ScoreCard label="有效评价数" :value="wall.summary.totalReviews" hint="仅统计正常状态评价" accent="#7c3aed" />
      <ScoreCard label="平台平均分" :value="wall.summary.averageScore || 0" hint="综合评分均值" accent="#ea580c" />
    </section>

    <section class="section-block section-surface">
      <div class="surface-actions">
        <div>
          <strong>筛选条件</strong>
          <div class="muted-text">支持按专业、年级、标签和评分快速筛人。</div>
        </div>
        <el-button @click="resetFilters">重置筛选</el-button>
      </div>

      <div class="toolbar-row">
        <el-input v-model="filters.keyword" placeholder="姓名 / 学号 / 专业" style="width: 220px" clearable />
        <el-input v-model="filters.major" placeholder="专业" style="width: 160px" clearable />
        <el-input v-model="filters.grade" placeholder="年级" style="width: 140px" clearable />
        <el-input v-model="filters.tag" placeholder="标签" style="width: 160px" clearable />
        <el-select v-model="filters.minScore" placeholder="最低评分" clearable style="width: 140px">
          <el-option v-for="score in [5,4,3,2,1]" :key="score" :label="`${score} 分及以上`" :value="score" />
        </el-select>
        <el-select v-model="filters.sortBy" placeholder="排序方式" style="width: 160px">
          <el-option label="按评分排序" value="score_desc" />
          <el-option label="按评价数排序" value="reviews_desc" />
          <el-option label="按最新加入排序" value="newest" />
        </el-select>
        <el-button type="primary" :loading="loading" @click="fetchWall">查询</el-button>
      </div>
    </section>

    <section class="section-block section-surface">
      <div class="surface-actions">
        <div>
          <strong>公开画像列表</strong>
          <div class="muted-text">点击“查看画像”可以进入更完整的雷达图和历史评价页。</div>
        </div>
      </div>

      <el-table :data="wall.users" stripe>
        <el-table-column prop="realName" label="学生" min-width="120" />
        <el-table-column label="专业 / 年级" min-width="180">
          <template #default="{ row }">
            {{ row.major || "未填写专业" }} / {{ row.grade || "未填写年级" }}
          </template>
        </el-table-column>
        <el-table-column prop="skillDirection" label="技能方向" min-width="160" />
        <el-table-column prop="averageScore" label="综合分" width="90" />
        <el-table-column prop="reviewCount" label="评价数" width="90" />
        <el-table-column prop="willingAgainRate" label="再次组队率" width="120">
          <template #default="{ row }">
            {{ row.willingAgainRate }}%
          </template>
        </el-table-column>
        <el-table-column label="热门标签" min-width="220">
          <template #default="{ row }">
            <TagList :tags="row.topTags" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="router.push(`/users/${row.id}`)">查看画像</el-button>
          </template>
        </el-table-column>
      </el-table>
    </section>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";

import ScoreCard from "@/components/ScoreCard.vue";
import TagList from "@/components/TagList.vue";
import { getWallUsers } from "@/api/userApi";

const router = useRouter();
const loading = ref(false);
const wall = reactive({
  summary: {
    totalUsers: 0,
    totalProjects: 0,
    totalReviews: 0,
    averageScore: 0
  },
  users: []
});

const filters = reactive({
  keyword: "",
  major: "",
  grade: "",
  tag: "",
  minScore: undefined,
  sortBy: "score_desc"
});

async function fetchWall() {
  loading.value = true;
  try {
    const response = await getWallUsers(filters);
    wall.summary = response.data.summary;
    wall.users = response.data.users;
  } catch (error) {
    ElMessage.error(error.message);
  } finally {
    loading.value = false;
  }
}

function resetFilters() {
  filters.keyword = "";
  filters.major = "";
  filters.grade = "";
  filters.tag = "";
  filters.minScore = undefined;
  filters.sortBy = "score_desc";
  fetchWall();
}

onMounted(fetchWall);
</script>

