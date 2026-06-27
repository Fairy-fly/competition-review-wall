<template>
  <div class="page-shell motion-page">
    <section class="hero-banner motion-hero">
      <div class="hero-left">
        <h1 class="hero-title">智能队友推荐</h1>
        <p class="hero-desc">根据评分、技能方向和互补标签，找到更适合一起参赛的同学。</p>
      </div>
      <div class="hero-right">
        <div class="hero-preview recommend-preview">
          <div class="preview-row">
            <span class="preview-row-label">我的方向</span>
            <el-tag size="small" effect="light" type="primary">{{ mySkillDirection || "未填写" }}</el-tag>
          </div>
          <div class="preview-row">
            <span class="preview-row-label">建议互补</span>
            <div style="display:flex;gap:4px;flex-wrap:wrap">
              <el-tag v-for="r in complementRoles.slice(0,3)" :key="r" size="small" effect="light" type="success">{{ r }}</el-tag>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section-block section-surface motion-card">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="高分推荐" name="top">
          <div class="toolbar-row section-block">
            <el-input v-model="filters.keyword" placeholder="姓名/学号/专业" style="width:200px" clearable />
            <el-input v-model="filters.major" placeholder="专业" style="width:140px" clearable />
            <el-input v-model="filters.grade" placeholder="年级" style="width:120px" clearable />
            <el-button type="primary" :loading="loading" @click="fetchTopUsers" class="btn-lift">查询</el-button>
          </div>
        </el-tab-pane>
        <el-tab-pane label="互补推荐" name="complement">
          <div class="muted-text" style="margin-bottom:14px">
            {{ mySkillDirection ? `你是 ${mySkillDirection} 方向，以下队友技能可与你互补。` : '请在个人中心填写技能方向以启用互补推荐。' }}
          </div>
          <div class="toolbar-row section-block">
            <el-select v-model="compFilter.direction" placeholder="互补方向" style="width:180px" clearable>
              <el-option v-for="d in complementDirections" :key="d" :label="d" :value="d" />
            </el-select>
            <el-input v-model="compFilter.major" placeholder="专业" style="width:140px" clearable />
            <el-input v-model="compFilter.grade" placeholder="年级" style="width:120px" clearable />
            <el-button type="primary" :loading="loadingComp" @click="fetchComplementUsers" class="btn-lift">查询</el-button>
          </div>
        </el-tab-pane>
      </el-tabs>
    </section>

    <section class="section-block">
      <div v-if="loading || loadingComp" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px">
        <div v-for="i in 4" :key="i" class="skeleton-block" style="height:200px"></div>
      </div>

      <div v-else-if="displayUsers.length" class="recommend-grid motion-stagger">
        <div v-for="user in displayUsers" :key="user.id" class="rec-card">
          <div class="rec-card-top">
            <div>
              <div class="rec-name">{{ user.realName }}</div>
              <div class="rec-meta">{{ user.major || "未填写专业" }} · {{ user.grade || "未知年级" }}</div>
            </div>
            <div class="rec-score-badge">{{ user.averageScore || 0 }}</div>
          </div>
          <div class="rec-card-mid">
            <div class="rec-field"><span class="rec-f-label">技能方向</span><span>{{ user.skillDirection || "未填写" }}</span></div>
            <div class="rec-field"><span class="rec-f-label">再次组队率</span><span class="rec-f-hi">{{ user.willingAgainRate || 0 }}%</span></div>
            <div class="rec-field"><span class="rec-f-label">评价次数</span><span>{{ user.reviewCount || 0 }} 次</span></div>
          </div>
          <div v-if="user.topTags && user.topTags.length" class="rec-tags"><TagList :tags="user.topTags.slice(0,3)" /></div>
          <div class="rec-actions">
            <el-button size="small" type="primary" @click="router.push(`/users/${user.id}`)" class="btn-lift">查看画像</el-button>
          </div>
        </div>
      </div>

      <div v-else class="empty-placeholder">
        <div class="empty-icon-box"><el-icon :size="30"><TrophyBase /></el-icon></div>
        <div>暂无符合条件的推荐</div>
        <div class="muted-text" style="margin-top:8px">试试调整筛选条件或放宽专业/年级限制</div>
        <el-button style="margin-top:12px" @click="activeTab==='top'?fetchTopUsers():fetchComplementUsers()" class="btn-lift">重新查询</el-button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";
import { getWallUsers } from "@/api/userApi";
import { useUserStore } from "@/store/user";
import TagList from "@/components/TagList.vue";
import { TrophyBase, Connection } from "@element-plus/icons-vue";

const router = useRouter();
const userStore = useUserStore();
const activeTab = ref("top");
const loading = ref(false);
const loadingComp = ref(false);
const topUsers = ref([]);
const compUsers = ref([]);

const filters = reactive({ keyword:"", major:"", grade:"" });
const compFilter = reactive({ direction:"", major:"", grade:"" });

const mySkillDirection = computed(() => userStore.currentUser?.skillDirection || "");

function inferComplementDirections(sd) {
  const d = (sd || "").toLowerCase();
  if (d.includes("前端")) return ["后端开发","算法建模","产品设计","文档答辩"];
  if (d.includes("后端")||d.includes("服务端")) return ["前端开发","算法建模","产品设计"];
  if (d.includes("算法")||d.includes("建模")||d.includes("数据")) return ["前端开发","后端开发","文档答辩"];
  if (d.includes("产品")||d.includes("设计")) return ["前端开发","后端开发","算法建模"];
  return ["前端开发","后端开发","算法建模","产品设计"];
}

const complementRoles = computed(() => inferComplementDirections(mySkillDirection.value));
const complementDirections = computed(() => complementRoles.value);
const displayUsers = computed(() => activeTab.value === "top" ? topUsers.value : compUsers.value);

async function fetchTopUsers() {
  loading.value = true;
  try {
    const params = { sortBy:"score_desc" };
    if (filters.keyword) params.keyword = filters.keyword;
    if (filters.major) params.major = filters.major;
    if (filters.grade) params.grade = filters.grade;
    const r = await getWallUsers(params);
    topUsers.value = (r.data.users || []).slice(0,12);
  } catch(e) { ElMessage.error(e.message); } finally { loading.value = false; }
}

async function fetchComplementUsers() {
  if (!mySkillDirection.value) { ElMessage.info("请先在个人中心填写技能方向"); return; }
  loadingComp.value = true;
  try {
    const params = { sortBy:"score_desc" };
    if (compFilter.direction || complementRoles.value[0]) params.skillDirection = compFilter.direction || complementRoles.value[0];
    if (compFilter.major) params.major = compFilter.major;
    if (compFilter.grade) params.grade = compFilter.grade;
    const r = await getWallUsers(params);
    compUsers.value = (r.data.users || []).slice(0,12);
  } catch(e) { ElMessage.error(e.message); } finally { loadingComp.value = false; }
}

function handleTabChange(tab) {
  if (tab === "top" && !topUsers.value.length) fetchTopUsers();
  else if (tab === "complement" && !compUsers.value.length) fetchComplementUsers();
}

onMounted(async () => { if (!userStore.currentUser) { try { await userStore.fetchCurrentUser(); } catch{} } await fetchTopUsers(); });
</script>

<style scoped>
.hero-banner {
  display:flex; gap:36px; align-items:center; padding:36px 44px; margin-bottom:28px;
  background:var(--surface-solid); border:1px solid var(--border-soft); border-radius:var(--radius-xl); box-shadow:var(--shadow-card);
}
.hero-left { flex:1; }
.hero-right { min-width:220px; }
.hero-title { margin:0; font-size:34px; font-weight:750; color:var(--text-main); letter-spacing:-0.8px; }
.hero-desc { margin:10px 0 0; color:var(--text-muted); font-size:16px; line-height:1.8; }
.hero-preview { padding:18px 20px; border:1px solid var(--border-soft); border-radius:var(--radius-lg); background:var(--surface-soft); display:flex; flex-direction:column; gap:12px; }
.preview-row { display:flex; justify-content:space-between; align-items:center; }
.preview-row-label { font-size:13px; color:var(--text-faint); }

.recommend-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:16px; }
.rec-card {
  background:var(--surface-solid); border:1px solid var(--border-soft); border-radius:var(--radius-lg);
  padding:22px; display:flex; flex-direction:column; gap:14px; min-height:260px;
  transition: all var(--transition-base);
}
.rec-card:hover { transform:translateY(-4px); box-shadow:var(--shadow-hover); border-color:var(--primary); }
.rec-card-top { display:flex; justify-content:space-between; align-items:flex-start; gap:10px; }
.rec-name { font-size:17px; font-weight:700; color:var(--text-main); }
.rec-meta { margin-top:2px; color:var(--text-faint); font-size:13px; }
.rec-score-badge {
  width:48px; height:48px; border-radius:50%; background:var(--primary-soft); color:var(--primary);
  display:grid; place-items:center; font-size:16px; font-weight:700; flex-shrink:0;
}
.rec-card-mid { border-top:1px solid var(--border-soft); border-bottom:1px solid var(--border-soft); padding:10px 0; display:grid; gap:6px; }
.rec-field { display:flex; justify-content:space-between; font-size:14px; color:var(--text-muted); }
.rec-f-label { color:var(--text-faint); }
.rec-f-hi { font-weight:600; color:var(--teal); }
.rec-tags { min-height:28px; max-height:100px; overflow:hidden; }
.rec-actions { margin-top:auto; display:flex; justify-content:flex-end; padding-top:4px; }
.empty-placeholder { padding:52px; text-align:center; color:var(--text-faint); }
.empty-icon-box {
  width: 56px; height: 56px; border-radius: 14px;
  background: var(--surface-soft); border: 1px solid var(--border-soft);
  display: grid; place-items: center; margin: 0 auto 12px;
  color: var(--text-muted);
  animation: softFloat 3.2s ease-in-out infinite;
}
</style>
