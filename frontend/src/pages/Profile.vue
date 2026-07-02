<template>
  <div class="page-shell motion-page">
    <!-- Profile Hero -->
    <section class="hero-banner profile-report-hero motion-hero">
      <div class="hero-left profile-identity">
        <div class="profile-avatar">{{ (userStore.currentUser?.realName || "我的").slice(-2) }}</div>
        <div>
          <span class="report-kicker">我的协作画像报告</span>
          <h1 class="hero-title">{{ userStore.currentUser?.realName || "个人中心" }}</h1>
          <p class="hero-desc">{{ userStore.currentUser?.college || "" }} · {{ userStore.currentUser?.major || "" }} · {{ userStore.currentUser?.grade || "" }}</p>
        </div>
      </div>
      <div class="hero-right">
        <div class="hero-preview profile-score-strip">
          <div style="text-align:center">
            <div style="font-size:30px;font-weight:700;color:var(--primary)">{{ profile.summary.overallScore || 0 }}</div>
            <div style="font-size:12px;color:var(--text-faint)">综合评分</div>
          </div>
          <div style="text-align:center">
            <div style="font-size:30px;font-weight:700;color:var(--teal)">{{ profile.summary.reviewCount || 0 }}</div>
            <div style="font-size:12px;color:var(--text-faint)">评价次数</div>
          </div>
          <div style="text-align:center">
            <div style="font-size:30px;font-weight:700;color:var(--teal)">{{ profile.summary.willingAgainRate || 0 }}%</div>
            <div style="font-size:12px;color:var(--text-faint)">再次组队率</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Left stack + Right stack -->
    <div class="profile-stack section-block motion-stagger">
      <!-- Left -->
      <div class="stack-col stack-left">
        <section class="section-surface">
          <div class="surface-actions"><div><strong>资料维护</strong><div class="muted-text">这些信息会同步到测评墙公开画像。</div></div></div>
          <el-form :model="form" label-width="88px">
            <el-form-item label="学号"><el-input :model-value="userStore.currentUser?.studentNo" disabled /></el-form-item>
            <el-form-item label="姓名"><el-input v-model="form.realName" /></el-form-item>
            <el-form-item label="学院"><el-input v-model="form.college" /></el-form-item>
            <el-form-item label="专业"><el-input v-model="form.major" /></el-form-item>
            <el-form-item label="年级"><el-input v-model="form.grade" /></el-form-item>
            <el-form-item label="技能方向"><el-input v-model="form.skillDirection" placeholder="例如：前端开发 / 算法建模" /></el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="saving" @click="saveProfile" class="btn-lift">保存资料</el-button>
              <el-button @click="router.push(`/users/${userStore.currentUser?.id}`)" class="btn-lift">查看公开画像</el-button>
            </el-form-item>
          </el-form>
        </section>

        <section class="section-surface">
          <div class="panel-title">近 3 个参与项目</div>
          <div v-if="profile.recentProjects && profile.recentProjects.length" class="mini-list">
            <button v-for="p in profile.recentProjects" :key="p.id" class="mini-row" @click="router.push(`/projects/${p.id}`)">
              <span><strong>{{ p.name }}</strong><small>{{ p.type || "" }} · {{ p.roleInTeam || "队员" }}</small></span>
              <el-tag size="small" effect="light">{{ statusText(p.status) }}</el-tag>
            </button>
          </div>
          <div v-else class="profile-empty">暂无参与项目</div>
        </section>

        <section class="section-surface">
          <div class="panel-title">我收藏的队友</div>
          <div v-if="favorites.length" class="mini-list">
            <button v-for="u in favorites" :key="u.id" class="mini-row" @click="router.push(`/users/${u.id}`)">
              <span><strong>{{ u.realName }}</strong><small>{{ u.major || "" }} · {{ u.skillDirection || "" }}</small></span>
              <el-tag size="small" effect="light" type="success">{{ u.averageScore || 0 }} 分</el-tag>
            </button>
          </div>
          <div v-else class="profile-empty">暂未收藏队友<el-button link type="primary" style="margin-left:6px" @click="router.push('/')">去测评墙找人</el-button></div>
        </section>

        <section class="section-surface">
          <div class="surface-actions"><div><strong>最近收到的匿名评价</strong><div class="muted-text">前台始终只展示匿名队友。</div></div></div>
          <ReviewList :reviews="profile.recentReviews" show-appeal @appeal="showAppealDialog" />
        </section>
      </div>

      <!-- Right -->
      <div class="stack-col stack-right">
        <section class="section-surface">
          <div class="surface-actions"><div><strong>协作画像</strong><div class="muted-text">基于正常状态匿名评价的聚合数据。</div></div></div>
          <div class="stat-grid">
            <div class="mini-stat-card"><div class="ms-num">{{ profile.summary.overallScore || 0 }}</div><div class="ms-label">综合分</div></div>
            <div class="mini-stat-card"><div class="ms-num" style="color:var(--teal)">{{ profile.summary.reviewCount || 0 }}</div><div class="ms-label">评价次数</div></div>
            <div class="mini-stat-card"><div class="ms-num" style="color:var(--primary)">{{ profile.summary.projectCount || 0 }}</div><div class="ms-label">参与项目</div></div>
            <div class="mini-stat-card"><div class="ms-num" style="color:var(--teal)">{{ profile.summary.willingAgainRate || 0 }}%</div><div class="ms-label">再次组队率</div></div>
          </div>
          <div class="section-block">
            <RadarChart :scores="profile.summary" />
          </div>
        </section>

        <section class="section-surface">
          <div class="panel-title">我的标签</div>
          <div class="muted-text" style="margin:0 0 10px">{{ profile.topTags && profile.topTags.length ? '队友最常留下的协作印象。' : '收到评价后会生成标签。' }}</div>
          <TagList v-if="profile.topTags && profile.topTags.length" :tags="profile.topTags" show-count />
          <div v-else class="profile-empty">收到评价后会生成标签</div>
        </section>

        <section class="section-surface">
          <div class="panel-title">适合角色</div>
          <div v-if="suitableRoles.length" class="role-list">
            <div v-for="r in suitableRoles" :key="r.role" class="role-chip"><span class="role-name">{{ r.role }}</span><span class="role-reason">{{ r.reason }}</span></div>
          </div>
          <div v-else class="profile-empty">暂未积累足够数据</div>
        </section>
      </div>
    </div>

    <el-dialog v-model="appealDialogVisible" title="申请申诉" width="440px" :close-on-click-modal="false">
      <el-form label-width="80px">
        <el-form-item label="评价ID"><span>{{ appealForm.reviewId }}</span></el-form-item>
        <el-form-item label="申诉理由" required>
          <el-input v-model="appealForm.reason" type="textarea" :rows="4" maxlength="500" show-word-limit placeholder="请说明具体原因。" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="appealDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="appealSubmitting" @click="submitAppeal">提交申诉</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";
import { getProfile } from "@/api/profileApi";
import { getFavorites, updateCurrentUser } from "@/api/userApi";
import { createAppeal } from "@/api/appealApi";
import RadarChart from "@/components/RadarChart.vue";
import ReviewList from "@/components/ReviewList.vue";
import TagList from "@/components/TagList.vue";
import { useUserStore } from "@/store/user";

const router = useRouter();
const userStore = useUserStore();
const saving = ref(false);
const favorites = ref([]);
const profile = reactive({ summary:{}, topTags:[], recentTags:[], recentProjects:[], recentReviews:[] });
const form = reactive({ realName:"", college:"", major:"", grade:"", skillDirection:"" });

const appealDialogVisible = ref(false);
const appealSubmitting = ref(false);
const appealForm = reactive({ reviewId:null, reason:"" });

const statusMap = { ongoing:"进行中", reviewable:"可评价", archived:"已归档" };
function statusText(s) { return statusMap[s] || s || "-"; }

function inferRoles(sd, tags) {
  const roles = [];
  const d = (sd||"").toLowerCase();
  const tn = (tags||[]).map(t=>t.name);
  if (d.includes("前端")) roles.push({role:"前端开发",reason:"技能方向为前端"});
  if (d.includes("后端")||d.includes("服务端")) roles.push({role:"后端开发",reason:"技能方向为后端"});
  if (d.includes("算法")||d.includes("建模")||d.includes("数据")) roles.push({role:"算法建模",reason:"技能方向涉及算法/建模"});
  if (d.includes("产品")||d.includes("设计")) roles.push({role:"产品设计",reason:"技能方向为产品/设计"});
  if (tn.includes("creative_ideas")) roles.push({role:"创意担当",reason:"多次被评价为有创意"});
  if (tn.includes("strong_documentation")||tn.includes("presentation_ready")) roles.push({role:"文档答辩",reason:"文档/答辩能力强"});
  if (tn.includes("reliable")||tn.includes("strong_execution")) roles.push({role:"组织协调",reason:"可靠/执行力强"});
  if (tn.includes("smooth_communication")) roles.push({role:"沟通桥梁",reason:"沟通顺畅"});
  const seen=new Set(); return roles.filter(r=>{if(seen.has(r.role))return false;seen.add(r.role);return true;});
}
const suitableRoles = computed(()=>inferRoles(userStore.currentUser?.skillDirection, profile.topTags));

function syncForm() { Object.assign(form, { realName:userStore.currentUser?.realName||"", college:userStore.currentUser?.college||"", major:userStore.currentUser?.major||"", grade:userStore.currentUser?.grade||"", skillDirection:userStore.currentUser?.skillDirection||"" }); }

async function fetchProfile() {
  if (!userStore.currentUser?.id) return;
  try {
    const pr = await getProfile(userStore.currentUser.id);
    Object.assign(profile, pr.data);
  } catch(e) { ElMessage.error("加载画像失败：" + (e.message||"")); }
}

async function fetchFavorites() {
  try {
    const fr = await getFavorites();
    favorites.value = fr.data || [];
  } catch(e) { /* favorites non-critical, show empty state instead of error */ }
}

async function saveProfile() {
  saving.value = true;
  try { const r = await updateCurrentUser(form); userStore.persistSession(userStore.token, r.data); syncForm(); await Promise.all([fetchProfile(), fetchFavorites()]); ElMessage.success("资料已更新"); }
  catch(e) { ElMessage.error(e.message); }
  finally { saving.value = false; }
}

function showAppealDialog(id) { appealForm.reviewId=id; appealForm.reason=""; appealDialogVisible.value=true; }
async function submitAppeal() {
  if (!appealForm.reason.trim()) { ElMessage.warning("请填写申诉理由"); return; }
  appealSubmitting.value = true;
  try { await createAppeal({reviewId:appealForm.reviewId, reason:appealForm.reason.trim()}); appealDialogVisible.value=false; ElMessage.success("申诉已提交"); }
  catch(e) { ElMessage.error(e.message); }
  finally { appealSubmitting.value = false; }
}

onMounted(async () => { syncForm(); await Promise.all([fetchProfile(), fetchFavorites()]); });
</script>

<style scoped>
.profile-stack {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 380px;
  gap: 24px;
  align-items: start;
}
.stack-col { display: flex; flex-direction: column; gap: 20px; }
.hero-banner { display:flex; gap:36px; align-items:center; padding:32px 40px; margin-bottom:24px; background:var(--surface-solid); border:1px solid var(--border-soft); border-radius:var(--radius-xl); box-shadow:var(--shadow-card); }
.profile-report-hero {
  overflow: hidden;
  background:
    linear-gradient(rgba(75,92,240,0.055) 1px, transparent 1px),
    linear-gradient(90deg, rgba(75,92,240,0.045) 1px, transparent 1px),
    linear-gradient(135deg, #ffffff, #f7fbff);
  background-size: 28px 28px, 28px 28px, auto;
}
.hero-left { flex:1; }
.profile-identity { display:flex; align-items:center; gap:16px; min-width:0; }
.profile-avatar {
  width:68px;
  height:68px;
  border-radius:22px;
  display:grid;
  place-items:center;
  color:#fff;
  font-weight:800;
  background:linear-gradient(135deg,var(--brand-primary),#6876ff);
  box-shadow:0 14px 28px rgba(75,92,240,0.20);
  flex-shrink:0;
}
.report-kicker {
  display:inline-flex;
  align-items:center;
  min-height:26px;
  padding:0 10px;
  border-radius:999px;
  color:var(--brand-teal-deep);
  background:var(--brand-teal-soft);
  border:1px solid rgba(24,169,153,0.18);
  font-size:12px;
  font-weight:750;
  margin-bottom:8px;
}
.hero-right { min-width:300px; }
.hero-title { margin:0; font-size:30px; font-weight:750; color:var(--text-main); }
.hero-desc { margin:8px 0 0; color:var(--text-muted); font-size:15px; }
.hero-preview { padding:14px 20px; border:1px solid var(--border-soft); border-radius:var(--radius-lg); background:var(--surface-soft); display:flex; align-items:center; justify-content:space-around; }
.profile-score-strip { flex-direction:row; gap:24px; padding:18px 24px; background:rgba(255,255,255,0.82); }
.mini-stat-card { background:var(--surface-soft); border:1px solid var(--border-soft); border-radius:var(--radius-md); padding:14px; text-align:center; transition:all var(--transition-base); }
.mini-stat-card:hover { box-shadow:var(--shadow-sm); transform:translateY(-2px); }
.ms-num { font-size:26px; font-weight:700; color:var(--text-main); }
.ms-label { margin-top:3px; font-size:12px; color:var(--text-faint); }
.panel-title { margin-bottom:12px; font-weight:650; font-size:16px; }
.mini-list { display:grid; gap:8px; }
.mini-row { width:100%; border:1px solid var(--border-soft); border-radius:var(--radius-sm); background:var(--surface-solid); padding:10px 14px; display:flex; align-items:center; justify-content:space-between; gap:10px; text-align:left; cursor:pointer; transition:all var(--transition-base); }
.mini-row:hover { border-color:var(--primary); box-shadow:var(--shadow-sm); transform:translateY(-2px); }
.mini-row strong { display:block; font-size:14px; color:var(--text-main); }
.mini-row small { display:block; margin-top:2px; color:var(--text-faint); font-size:12px; }
.role-list { display:grid; gap:8px; }
.role-chip { border:1px solid var(--primary-soft); border-radius:var(--radius-sm); background:var(--primary-soft); padding:10px 14px; display:flex; flex-direction:column; gap:2px; }
.role-name { font-weight:600; color:var(--primary-dark); font-size:14px; }
.role-reason { color:var(--text-faint); font-size:12px; }
.profile-empty { padding:20px; text-align:center; color:var(--text-faint); font-size:14px; }

@media (max-width: 900px) {
  .profile-stack { grid-template-columns: 1fr; }
  .stack-right { order: -1; }
  .hero-banner { flex-direction:column; align-items:stretch; padding:24px; }
  .hero-right { min-width:0; }
  .profile-score-strip { flex-wrap:wrap; }
  .profile-score-strip > div { flex:1 1 90px; }
}
</style>
