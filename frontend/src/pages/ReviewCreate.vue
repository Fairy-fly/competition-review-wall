<template>
  <div class="page-shell motion-page">
    <section class="hero-banner motion-hero">
      <div class="hero-left">
        <h1 class="hero-title">提交匿名评价</h1>
        <p class="hero-desc">评价对外仅展示为"匿名队友"，后台保留记录用于争议追溯。</p>
      </div>
    </section>

    <div class="two-col-grid section-block motion-stagger">
      <!-- Left: Review Form -->
      <section class="section-surface">
        <div class="surface-actions"><div><strong>评价表单</strong><div class="muted-text">默认 5 分，请根据真实感受调整。</div></div></div>

        <el-form :model="form" label-width="100px">
          <el-form-item label="选择项目" required>
            <el-select v-model="form.projectId" placeholder="请选择你参与的项目" style="width:100%" :loading="loadingProjects" @change="handleProjectChange">
              <el-option v-for="item in reviewableProjects" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="评价队友" required>
            <el-select v-model="form.revieweeId" placeholder="请选择要评价的队友" style="width:100%" :loading="loadingMembers">
              <el-option v-for="m in reviewableMembers" :key="m.id" :label="`${m.realName}（${m.roleInTeam||'队员'}）`" :value="m.id" />
            </el-select>
          </el-form-item>

          <!-- Scoring rows with descriptions -->
          <div class="score-section">
            <div class="score-row">
              <div class="score-row-info"><strong>综合评分</strong><span class="score-hint">整体协作感受</span></div>
              <el-rate v-model="form.overallScore" :max="5" show-score />
            </div>
            <div class="score-row">
              <div class="score-row-info"><strong>任务完成</strong><span class="score-hint">是否按时完成分工任务</span></div>
              <el-rate v-model="form.taskScore" :max="5" show-score />
            </div>
            <div class="score-row">
              <div class="score-row-info"><strong>沟通协作</strong><span class="score-hint">是否主动同步进展</span></div>
              <el-rate v-model="form.communicationScore" :max="5" show-score />
            </div>
            <div class="score-row">
              <div class="score-row-info"><strong>责任心</strong><span class="score-hint">对任务是否认真负责</span></div>
              <el-rate v-model="form.responsibilityScore" :max="5" show-score />
            </div>
            <div class="score-row">
              <div class="score-row-info"><strong>技术能力</strong><span class="score-hint">是否能解决实际问题</span></div>
              <el-rate v-model="form.skillScore" :max="5" show-score />
            </div>
          </div>

          <el-divider />

          <el-form-item label="再次组队">
            <el-switch v-model="form.willingAgain" active-text="愿意" inactive-text="不太愿意" />
          </el-form-item>

          <el-form-item label="文字评价" required>
            <el-input v-model="form.comment" type="textarea" :rows="4" maxlength="500" show-word-limit placeholder="说清楚协作印象，别只留分数。例如：沟通主动、交付准时、遇到问题会及时同步。" />
          </el-form-item>

          <el-form-item label="评价标签">
            <div v-if="!tags.length" style="display:grid;gap:8px">
              <div class="skeleton-line" style="width:80px;height:14px"></div>
              <div style="display:flex;gap:8px;flex-wrap:wrap">
                <span v-for="i in 6" :key="i" class="skeleton-line" style="width:60px;height:28px;border-radius:20px"></span>
              </div>
            </div>
            <div v-else class="tag-groups">
              <div v-for="(group, label) in groupedTags" :key="label" class="tag-group">
                <span class="tag-group-label">{{ label }}</span>
                <div class="tag-chip-row">
                  <button
                    v-for="tag in group"
                    :key="tag.id"
                    type="button"
                    class="tag-select-chip"
                    :class="{ active: form.tagIds.includes(tag.id), [`chip-${tag.type}`]: true }"
                    @click="toggleTag(tag.id)"
                  >
                    {{ tag.displayName }}
                    <el-icon v-if="form.tagIds.includes(tag.id)" :size="14" style="margin-left:3px"><Check /></el-icon>
                  </button>
                </div>
              </div>
            </div>
          </el-form-item>

          <el-divider />
          <el-form-item>
            <el-button size="large" type="primary" :loading="submitting" @click="handleSubmit" class="btn-lift">提交评价</el-button>
            <el-button size="large" @click="clearDraft" class="btn-lift">清除草稿</el-button>
          </el-form-item>
        </el-form>
      </section>

      <!-- Right: Member list -->
      <aside style="position:sticky;top:88px;align-self:start">
        <section class="section-surface">
          <div class="surface-actions"><div><strong>可评价成员</strong><div class="muted-text">同项目、已进入互评阶段的队友。</div></div></div>
          <div v-if="form.projectId && members.length" class="mini-list">
            <div v-for="m in members" :key="m.id" class="member-chip" :class="{ selectable: m.canReview, selected: m.id === form.revieweeId }" @click="m.canReview && (form.revieweeId = m.id)">
              <div class="member-chip-info">
                <strong>{{ m.realName }}</strong>
                <small>{{ m.roleInTeam || "队员" }} · {{ m.major || "" }}</small>
              </div>
              <el-tag :type="m.canReview ? 'success' : 'info'" size="small" effect="light">{{ m.canReview ? '可评价' : m.hasReviewed ? '已评价' : '暂不可' }}</el-tag>
            </div>
          </div>
          <div v-else class="empty-placeholder">
            <div class="empty-icon-box"><el-icon :size="30"><User /></el-icon></div>
            <div>{{ form.projectId ? '该项目暂无其他成员' : '请先在左侧选择项目' }}</div>
          </div>
        </section>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useRoute, useRouter } from "vue-router";
import { getMyProjects, getProjectDetail } from "@/api/projectApi";
import { createReview } from "@/api/reviewApi";
import { getTags } from "@/api/tagApi";
import { useUserStore } from "@/store/user";
import { User, Check } from "@element-plus/icons-vue";

const DRAFT_KEY = "competition_review_draft";
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const submitting = ref(false);
const loadingProjects = ref(false);
const loadingMembers = ref(false);
const projects = ref([]);
const members = ref([]);
const tags = ref([]);

const defaultForm = { projectId:undefined, revieweeId:undefined, overallScore:5, taskScore:5, communicationScore:5, responsibilityScore:5, skillScore:5, willingAgain:true, comment:"", tagIds:[] };
const form = reactive({ ...defaultForm });

const reviewableProjects = computed(() => projects.value.filter(p => p.status !== "ongoing"));
const reviewableMembers = computed(() => members.value.filter(m => m.canReview));
const groupedTags = computed(() => ({
  "正向标签": tags.value.filter(t => t.type === "positive"),
  "中性标签": tags.value.filter(t => t.type === "neutral"),
  "风险标签": tags.value.filter(t => t.type === "risk"),
}));

function toggleTag(tagId) {
  const idx = form.tagIds.indexOf(tagId);
  if (idx === -1) {
    form.tagIds.push(tagId);
  } else {
    form.tagIds.splice(idx, 1);
  }
}

function loadDraft() { try { const s = localStorage.getItem(DRAFT_KEY); if (s) { const d = JSON.parse(s); Object.keys(defaultForm).forEach(k => { if (d[k] !== undefined) form[k] = d[k]; }); return true; } } catch {} return false; }
function saveDraft() { try { localStorage.setItem(DRAFT_KEY, JSON.stringify({...form})); } catch {} }
function clearDraft() { try { localStorage.removeItem(DRAFT_KEY); } catch {} Object.assign(form, defaultForm); members.value=[]; ElMessage.success("草稿已清除"); }
watch(form, saveDraft, { deep: true });

async function fetchBaseData() {
  loadingProjects.value = true;
  try { const [pr, tr] = await Promise.all([getMyProjects(), getTags()]); projects.value = pr.data; tags.value = tr.data?.items || tr.data || []; }
  catch(e) { ElMessage.error(e.message||"加载数据失败"); }
  finally { loadingProjects.value = false; }
}

async function handleProjectChange(pid) {
  form.revieweeId = undefined; members.value = [];
  if (!pid) return;
  loadingMembers.value = true;
  try {
    const r = await getProjectDetail(pid);
    members.value = (r.data.members||[]).filter(m => m.id !== userStore.currentUser?.id);
    if (route.query.revieweeId) { const tid = Number(route.query.revieweeId); const f = members.value.find(m => m.id === tid); if (f && f.canReview) form.revieweeId = tid; }
  } catch(e) { ElMessage.error(e.message||"加载成员失败"); }
  finally { loadingMembers.value = false; }
}

async function handleSubmit() {
  if (!form.projectId) { ElMessage.warning("请选择项目"); return; }
  if (!form.revieweeId) { ElMessage.warning("请选择队友"); return; }
  if (!form.comment.trim()) { ElMessage.warning("请填写文字评价"); return; }
  try { await ElMessageBox.confirm("评价提交后无法修改，确认提交？", "确认", { confirmButtonText:"确认提交", cancelButtonText:"再改改", type:"warning" }); } catch { return; }
  submitting.value = true;
  try {
    await createReview({ projectId:form.projectId, revieweeId:form.revieweeId, overallScore:form.overallScore, taskScore:form.taskScore, communicationScore:form.communicationScore, responsibilityScore:form.responsibilityScore, skillScore:form.skillScore, willingAgain:form.willingAgain, comment:form.comment.trim(), tagIds:form.tagIds });
    const revieweeId = form.revieweeId;
    clearDraft();
    router.push(`/users/${revieweeId}?reviewSubmitted=1`);
  } catch(e) { ElMessage.error(e.message); }
  finally { submitting.value = false; }
}

onMounted(async () => {
  const hasDraft = loadDraft();
  await fetchBaseData();
  if (route.query.projectId) form.projectId = Number(route.query.projectId);
  if (form.projectId) await handleProjectChange(form.projectId);
  if (hasDraft && form.comment) ElMessage.info("已恢复上次未提交的草稿");
});
</script>

<style scoped>
.hero-banner { display:flex; gap:36px; align-items:center; padding:36px 44px; margin-bottom:28px; background:var(--surface-solid); border:1px solid var(--border-soft); border-radius:var(--radius-xl); box-shadow:var(--shadow-card); }
.hero-left { flex:1; }
.hero-title { margin:0; font-size:34px; font-weight:750; color:var(--text-main); }
.hero-desc { margin:10px 0 0; color:var(--text-muted); font-size:16px; }

.score-section { display:grid; gap:4px; margin-bottom:8px; }
.score-row { display:flex; align-items:center; justify-content:space-between; padding:12px 16px; border-radius:var(--radius-sm); background:var(--surface-soft); border:1px solid var(--border-soft); transition:all var(--transition-fast); }
.score-row:hover { border-color:var(--primary); }
.score-row-info { display:flex; flex-direction:column; gap:2px; }
.score-row-info strong { font-size:15px; color:var(--text-main); }
.score-hint { font-size:12px; color:var(--text-faint); }

.tag-groups { display:grid; gap:14px; width:100%; }
.tag-group { padding:12px 14px; border:1px solid var(--border-soft); border-radius:var(--radius-sm); background:var(--surface-soft); display:grid; gap:10px; }
.tag-group-label { font-size:13px; font-weight:600; color:var(--text-muted); }
.tag-chip-row { display:flex; flex-wrap:wrap; gap:8px; }
.tag-select-chip { padding:5px 14px; border-radius:20px; border:1.2px solid var(--border-medium); background:var(--surface-solid); font-size:13px; color:var(--text-muted); cursor:pointer; transition:all 0.15s ease; display:inline-flex; align-items:center; font-family:inherit; line-height:1.5; }
.tag-select-chip:hover { border-color:var(--primary); color:var(--text-main); }
.tag-select-chip.active { border-color:rgba(91,108,255,0.40); background:rgba(91,108,255,0.09); color:#3F51D1; font-weight:500; }
.tag-select-chip.active.chip-neutral { border-color:rgba(148,163,184,0.30); background:rgba(148,163,184,0.09); color:#64748B; }
.tag-select-chip.active.chip-risk { border-color:rgba(217,137,34,0.25); background:rgba(217,137,34,0.09); color:#C57A18; }

/* Willing-again switch: teal when active */
:deep(.el-switch.is-checked .el-switch__core) {
  background: linear-gradient(135deg, #67D6C2, #3CBFA8) !important;
  border-color: #3CBFA8 !important;
}

.member-chip { display:flex; align-items:center; justify-content:space-between; padding:14px 16px; border:1px solid var(--border-soft); border-radius:var(--radius-sm); background:var(--surface-solid); gap:10px; transition:all var(--transition-base); }
.member-chip.selectable { cursor:pointer; }
.member-chip.selectable:hover { border-color:var(--primary); transform:translateX(4px); box-shadow:var(--shadow-sm); }
.member-chip.selected { border-color:var(--primary); background:var(--primary-soft); }
.member-chip-info { display:flex; flex-direction:column; gap:2px; }
.member-chip-info strong { font-size:15px; color:var(--text-main); }
.member-chip-info small { font-size:12px; color:var(--text-faint); }

.mini-list { display:grid; gap:8px; }
.empty-placeholder { padding:44px 16px; text-align:center; color:var(--text-faint); }
.empty-icon-box {
  width: 56px; height: 56px; border-radius: 14px;
  background: var(--surface-soft); border: 1px solid var(--border-soft);
  display: grid; place-items: center; margin: 0 auto 12px;
  color: var(--text-muted);
  animation: softFloat 3.2s ease-in-out infinite;
}
</style>
