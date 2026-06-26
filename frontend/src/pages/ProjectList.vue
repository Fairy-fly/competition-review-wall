<template>
  <div class="page-shell motion-page">
    <section class="hero-banner motion-hero">
      <div class="hero-left">
        <h1 class="hero-title">我的竞赛项目</h1>
        <p class="hero-desc">管理你参与的比赛项目，补充队友后推进到可评价阶段即可开始互评。</p>
      </div>
      <div class="hero-right">
        <div class="hero-preview" style="flex-direction:row;gap:20px;padding:16px 22px;justify-content:space-around">
          <div style="text-align:center"><div style="font-size:28px;font-weight:700;color:var(--text-main)">{{ projects.length }}</div><div style="font-size:12px;color:var(--text-faint)">全部项目</div></div>
          <div style="text-align:center"><div style="font-size:28px;font-weight:700;color:var(--amber)">{{ statusCounts.ongoing }}</div><div style="font-size:12px;color:var(--text-faint)">进行中</div></div>
          <div style="text-align:center"><div style="font-size:28px;font-weight:700;color:var(--primary)">{{ statusCounts.reviewable }}</div><div style="font-size:12px;color:var(--text-faint)">可评价</div></div>
          <div style="text-align:center"><div style="font-size:28px;font-weight:700;color:var(--teal)">{{ statusCounts.archived }}</div><div style="font-size:12px;color:var(--text-faint)">已归档</div></div>
        </div>
      </div>
    </section>

    <section class="section-surface motion-card">
      <div class="surface-actions">
        <div><strong>项目列表</strong><div class="muted-text">点击详情可查看成员、补充队友、切换状态和发起评价。</div></div>
        <el-button type="primary" @click="router.push('/projects/create')" class="btn-lift">创建项目</el-button>
      </div>

      <el-table v-if="projects.length" :data="projects" stripe>
        <template #empty>
          <div class="empty-placeholder">
            <div class="empty-icon-box"><el-icon :size="30"><Document /></el-icon></div>
            <div>还没有参与项目</div>
            <div class="muted-text" style="margin-top:6px">创建项目并邀请队友后，可以在这里管理</div>
            <el-button type="primary" style="margin-top:14px" @click="router.push('/projects/create')" class="btn-lift">创建第一个项目</el-button>
          </div>
        </template>
        <el-table-column prop="name" label="项目名称" min-width="180" />
        <el-table-column prop="type" label="竞赛类型" min-width="140" />
        <el-table-column prop="teamName" label="队伍名称" min-width="140" />
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="statusTag(row.status)" size="small" effect="light">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="memberCount" label="成员数" width="100" />
        <el-table-column label="时间" min-width="180">
          <template #default="{ row }">{{ row.startDate || "-" }} 至 {{ row.endDate || "-" }}</template>
        </el-table-column>
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="router.push(`/projects/${row.id}`)" class="btn-lift">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div v-else class="empty-placeholder" style="padding:56px">
        <div class="empty-icon-box"><el-icon :size="30"><Document /></el-icon></div>
        <div style="font-size:16px;font-weight:600;color:var(--text-muted);margin-bottom:4px">还没有参与项目</div>
        <div class="muted-text">创建项目并邀请队友后，可以在这里管理和推进互评流程。</div>
        <el-button type="primary" style="margin-top:16px" @click="router.push('/projects/create')" class="btn-lift">创建第一个项目</el-button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";
import { getMyProjects } from "@/api/projectApi";
import { Document } from "@element-plus/icons-vue";

const router = useRouter();
const projects = ref([]);

const statusLabel = (s) => ({ ongoing:"进行中", reviewable:"可评价", archived:"已归档" }[s] || s);
const statusTag = (s) => ({ ongoing:"info", reviewable:"success", archived:"" }[s] || "info");

const statusCounts = computed(() => ({
  ongoing: projects.value.filter(p => p.status === "ongoing").length,
  reviewable: projects.value.filter(p => p.status === "reviewable").length,
  archived: projects.value.filter(p => p.status === "archived").length
}));

async function fetchProjects() {
  try { const r = await getMyProjects(); projects.value = r.data; } catch(e) { ElMessage.error(e.message); }
}

onMounted(fetchProjects);
</script>

<style scoped>
.hero-banner { display:flex; gap:36px; align-items:center; padding:36px 44px; margin-bottom:28px; background:var(--surface-solid); border:1px solid var(--border-soft); border-radius:var(--radius-xl); box-shadow:var(--shadow-card); }
.hero-left { flex:1; }
.hero-right { min-width:360px; }
.hero-title { margin:0; font-size:34px; font-weight:750; color:var(--text-main); }
.hero-desc { margin:10px 0 0; color:var(--text-muted); font-size:16px; }
.hero-preview { padding:18px; border:1px solid var(--border-soft); border-radius:var(--radius-lg); background:var(--surface-soft); display:flex; }
.empty-placeholder { padding:52px 24px; text-align:center; color:var(--text-faint); }
.empty-icon-box {
  width: 56px; height: 56px; border-radius: 14px;
  background: var(--surface-soft); border: 1px solid var(--border-soft);
  display: grid; place-items: center; margin: 0 auto 12px;
  color: var(--text-muted);
  animation: softFloat 3.2s ease-in-out infinite;
}
</style>
