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

    <section class="section-surface motion-card project-wall-section">
      <div class="surface-actions">
        <div><strong>项目列表</strong><div class="muted-text">点击详情可查看成员、补充队友、切换状态和发起评价。</div></div>
        <el-button type="primary" @click="router.push('/projects/create')" class="btn-lift">创建项目</el-button>
      </div>

      <div v-if="projects.length" class="project-card-grid">
        <article v-for="project in projects" :key="project.id" class="project-task-card">
          <div class="project-card-head">
            <div class="project-type">{{ project.type || "竞赛项目" }}</div>
            <el-tag :type="statusTag(project.status)" size="small" effect="light">{{ statusLabel(project.status) }}</el-tag>
          </div>
          <h2>{{ project.name }}</h2>
          <p>{{ project.teamName || "未填写队伍名称" }}</p>
          <div class="project-meta-grid">
            <div>
              <strong>{{ project.memberCount || 0 }}</strong>
              <span>成员数</span>
            </div>
            <div>
              <strong>{{ reviewState(project.status) }}</strong>
              <span>评价状态</span>
            </div>
            <div>
              <strong>{{ pendingText(project) }}</strong>
              <span>待评价</span>
            </div>
          </div>
          <div class="project-time">{{ fmtDate(project.startDate) }} - {{ fmtDate(project.endDate) }}</div>
          <div class="project-card-actions">
            <el-button type="primary" link @click="router.push(`/projects/${project.id}`)">查看详情</el-button>
          </div>
        </article>
      </div>

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
const reviewState = (s) => (s === "reviewable" ? "已开放" : s === "archived" ? "已沉淀" : "未开放");

function pendingText(project) {
  const count = project.pendingCount ?? project.unreviewedCount ?? project.todoReviewCount;
  if (count === undefined || count === null) {
    return project.status === "reviewable" ? "看详情" : "-";
  }
  return count;
}

function fmtDate(v) {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,"0")}.${String(d.getDate()).padStart(2,"0")}`;
}

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
.hero-banner { display:flex; gap:36px; align-items:center; padding:36px 44px; margin-bottom:28px; background:
  linear-gradient(rgba(75,92,240,0.055) 1px, transparent 1px),
  linear-gradient(90deg, rgba(75,92,240,0.045) 1px, transparent 1px),
  var(--surface-solid);
  background-size:28px 28px;
  border:1px solid var(--border-soft); border-radius:var(--radius-xl); box-shadow:var(--shadow-card); }
.hero-left { flex:1; }
.hero-right { min-width:360px; }
.hero-title { margin:0; font-size:34px; font-weight:750; color:var(--text-main); }
.hero-desc { margin:10px 0 0; color:var(--text-muted); font-size:16px; }
.hero-preview { padding:18px; border:1px solid var(--border-soft); border-radius:var(--radius-lg); background:var(--surface-soft); display:flex; }
.project-card-grid {
  display:grid;
  grid-template-columns:repeat(auto-fill,minmax(270px,1fr));
  gap:16px;
}
.project-task-card {
  position:relative;
  overflow:hidden;
  padding:18px;
  border:1px solid var(--border-soft);
  border-radius:var(--radius-lg);
  background:
    linear-gradient(rgba(75,92,240,0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(75,92,240,0.04) 1px, transparent 1px),
    var(--surface-solid);
  background-size:26px 26px;
  box-shadow:var(--shadow-xs);
  transition:all var(--transition-base);
}
.project-task-card:hover {
  transform:translateY(-3px);
  border-color:rgba(75,92,240,0.26);
  box-shadow:var(--shadow-card);
}
.project-card-head {
  display:flex;
  justify-content:space-between;
  gap:10px;
  align-items:center;
}
.project-type {
  display:inline-flex;
  min-height:28px;
  align-items:center;
  padding:0 10px;
  border-radius:999px;
  color:var(--brand-primary);
  background:var(--primary-soft);
  font-size:12px;
  font-weight:750;
}
.project-task-card h2 {
  margin:16px 0 0;
  font-size:19px;
  color:var(--text-main);
  line-height:1.35;
}
.project-task-card p {
  margin:6px 0 0;
  color:var(--text-faint);
  font-size:13px;
}
.project-meta-grid {
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:8px;
  margin-top:18px;
}
.project-meta-grid div {
  padding:10px 8px;
  border:1px solid rgba(148,163,184,0.14);
  border-radius:14px;
  background:rgba(248,250,252,0.82);
  text-align:center;
}
.project-meta-grid strong {
  display:block;
  color:var(--text-main);
  font-size:16px;
  line-height:1.1;
}
.project-meta-grid span {
  display:block;
  margin-top:5px;
  color:var(--text-faint);
  font-size:11px;
}
.project-time {
  margin-top:14px;
  color:var(--text-muted);
  font-size:13px;
}
.project-card-actions {
  display:flex;
  justify-content:flex-end;
  margin-top:10px;
}
.empty-placeholder { padding:52px 24px; text-align:center; color:var(--text-faint); }
.empty-icon-box {
  width: 56px; height: 56px; border-radius: 14px;
  background: var(--surface-soft); border: 1px solid var(--border-soft);
  display: grid; place-items: center; margin: 0 auto 12px;
  color: var(--text-muted);
  animation: softFloat 3.2s ease-in-out infinite;
}

@media (max-width: 900px) {
  .hero-banner { flex-direction:column; align-items:stretch; padding:24px; }
  .hero-right { min-width:0; }
  .hero-preview { flex-wrap:wrap; }
}

@media (max-width: 560px) {
  .project-card-grid { grid-template-columns:1fr; }
}
</style>
