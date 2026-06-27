<template>
  <div class="page-shell">
    <header class="page-header">
      <h1 class="page-title">管理员后台</h1>
      <p class="page-subtitle">集中查看用户、项目和评价，处理不适合公开展示的内容。</p>
    </header>

    <!-- Overview cards -->
    <section class="stat-grid section-block">
      <ScoreCard label="学生总数" :value="overview.totalUsers" hint="含管理员" accent="#5B6CFF" />
      <ScoreCard label="竞赛项目" :value="overview.totalProjects" hint="已创建的项目" accent="#18A999" />
      <ScoreCard label="有效评价" :value="overview.totalReviews" hint="正常状态的评价" accent="#7C5CFF" />
      <ScoreCard label="隐藏评价" :value="overview.hiddenReviews" hint="已隐藏的评价数" accent="#EF6F7A" />
      <ScoreCard label="平台平均分" :value="overview.averageScore || 0" hint="正常评价综合均分" accent="#5B6CFF" />
      <ScoreCard label="无评价用户" :value="overview.usersWithoutReviews" hint="尚未收到评价的学生" accent="#D98922" />
    </section>

    <!-- Charts -->
    <section class="section-block three-col-grid">
      <div class="section-surface">
        <div class="panel-title">热门标签 TOP 8</div>
        <div ref="tagChartRef" class="chart-box"></div>
        <div v-if="chartsLoading" class="chart-overlay">正在加载图表数据...</div>
        <div v-else-if="!dashboard.hotTags.length && !chartsError" class="chart-overlay"><el-icon :size="32"><DataAnalysis /></el-icon><span>暂无标签数据</span><small>产生评价并打标签后这里会显示排名</small></div>
        <div v-if="chartsError" class="chart-overlay error">图表数据加载失败</div>
      </div>
      <div class="section-surface">
        <div class="panel-title">各专业平均评分</div>
        <div ref="majorChartRef" class="chart-box"></div>
        <div v-if="chartsLoading" class="chart-overlay">正在加载图表数据...</div>
        <div v-else-if="!adminStats.byMajor.length && !chartsError" class="chart-overlay"><el-icon :size="32"><Histogram /></el-icon><span>暂无各专业数据</span><small>当产生更多评价后，这里会自动生成各专业均分对比</small></div>
        <div v-if="chartsError" class="chart-overlay error">图表数据加载失败</div>
      </div>
      <div class="section-surface">
        <div class="panel-title">近 7 天评价趋势</div>
        <div ref="trendChartRef" class="chart-box"></div>
        <div v-if="chartsLoading" class="chart-overlay">正在加载图表数据...</div>
        <div v-else-if="!adminStats.reviewTrend.length && !chartsError" class="chart-overlay"><el-icon :size="32"><DataLine /></el-icon><span>暂无近期评价</span><small>近 7 天产生新评价后，这里会显示趋势折线图</small></div>
        <div v-if="chartsError" class="chart-overlay error">图表数据加载失败</div>
      </div>
    </section>

    <!-- Tabs: users, projects, reviews, appeals -->
    <section class="section-block section-surface">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="用户管理" name="users">
          <el-table v-loading="loadingUsers" :data="users" stripe empty-text="暂无用户数据">
            <el-table-column prop="realName" label="姓名" min-width="120" />
            <el-table-column prop="studentNo" label="学号" width="120" />
            <el-table-column prop="college" label="学院" min-width="120" />
            <el-table-column prop="major" label="专业" min-width="120" />
            <el-table-column prop="grade" label="年级" width="100" />
            <el-table-column prop="role" label="角色" width="100">
              <template #default="{ row }"><el-tag :type="row.role==='admin'?'danger':'info'" size="small">{{ row.role==="admin"?"管理员":"学生" }}</el-tag></template>
            </el-table-column>
            <el-table-column prop="projectCount" label="项目数" width="90" />
            <el-table-column prop="reviewCount" label="评价数" width="90" />
            <el-table-column label="密码" width="160">
              <template #default="{ row }"><span style="color:var(--text-faint)">********</span><el-button type="warning" link size="small" style="margin-left:8px" @click="showPwdDialog(row)">重置</el-button></template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="项目管理" name="projects">
          <el-table v-loading="loadingProjects" :data="projects" stripe empty-text="暂无项目数据">
            <el-table-column prop="name" label="项目名称" min-width="180" />
            <el-table-column prop="type" label="竞赛类型" width="120" />
            <el-table-column prop="creatorName" label="创建者" width="120" />
            <el-table-column prop="teamName" label="队伍名称" min-width="140" />
            <el-table-column label="状态" width="110"><template #default="{ row }"><el-tag :type="statusTagType(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag></template></el-table-column>
            <el-table-column prop="memberCount" label="成员数" width="90" />
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="评价管理" name="reviews">
          <div class="surface-actions"><div><strong>评价筛选</strong><div class="muted-text">支持按项目、状态、评分和关键词筛选评价记录。</div></div><el-button @click="resetReviewFilters">重置筛选</el-button></div>
          <div class="toolbar-row section-block">
            <el-select v-model="reviewFilters.projectId" placeholder="按项目筛选" clearable style="width:200px"><el-option v-for="p in projects" :key="p.id" :label="p.name" :value="p.id" /></el-select>
            <el-select v-model="reviewFilters.status" placeholder="评价状态" clearable style="width:140px"><el-option label="正常" value="normal" /><el-option label="已隐藏" value="hidden" /></el-select>
            <el-select v-model="reviewFilters.minScore" placeholder="最低评分" clearable style="width:140px"><el-option v-for="s in [5,4,3,2,1]" :key="s" :label="`${s} 分及以上`" :value="s" /></el-select>
            <el-input v-model="reviewFilters.keyword" placeholder="项目/评价人/被评人/内容" clearable style="width:220px" />
            <el-button type="primary" :loading="loadingReviews" @click="fetchReviews">查询</el-button>
          </div>
          <ReviewList v-if="reviews.length" :reviews="reviews" admin-mode class="section-block" />
          <el-table v-loading="loadingReviews" :data="reviews" stripe empty-text="暂无符合条件的评价" class="section-block">
            <el-table-column prop="id" label="ID" width="60" />
            <el-table-column prop="projectName" label="项目" min-width="150" />
            <el-table-column prop="reviewerName" label="评价人" width="100" />
            <el-table-column prop="revieweeName" label="被评价人" width="100" />
            <el-table-column prop="overallScore" label="综合分" width="80" />
            <el-table-column label="状态" width="90"><template #default="{ row }"><el-tag :type="row.status==='hidden'?'danger':'success'" size="small">{{ row.status==="hidden"?"已隐藏":"正常" }}</el-tag></template></el-table-column>
            <el-table-column label="隐藏原因" min-width="160"><template #default="{ row }"><span v-if="row.hiddenReason" class="hidden-reason-text">{{ row.hiddenReason }}</span><span v-else class="muted-text">-</span></template></el-table-column>
            <el-table-column label="操作" width="120" fixed="right"><template #default="{ row }"><el-button type="danger" link :disabled="row.status==='hidden'" @click="showHideDialog(row)">隐藏评价</el-button></template></el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="申诉管理" name="appeals">
          <div class="surface-actions"><div><strong>申诉列表</strong><div class="muted-text">处理学生对评价的申诉：通过则自动隐藏评价，驳回则保留原评价。</div></div><el-tag v-if="pendingAppealCount" type="warning">{{ pendingAppealCount }} 条待处理</el-tag></div>
          <el-table v-loading="loadingAppeals" :data="appeals" stripe empty-text="暂无申诉记录">
            <el-table-column prop="id" label="ID" width="60" />
            <el-table-column prop="appellantName" label="申诉人" width="100" />
            <el-table-column label="关联评价" min-width="180"><template #default="{ row }"><div>{{ row.projectName }}</div><div class="muted-text">评价人：{{ row.reviewerName }} → 被评人：{{ row.revieweeName }} · {{ row.overallScore }} 分</div></template></el-table-column>
            <el-table-column prop="reason" label="申诉理由" min-width="200" show-overflow-tooltip />
            <el-table-column label="状态" width="100"><template #default="{ row }"><el-tag :type="appealStatusType(row.status)" size="small">{{ appealStatusLabel(row.status) }}</el-tag></template></el-table-column>
            <el-table-column label="处理回复" min-width="160" show-overflow-tooltip><template #default="{ row }"><span v-if="row.adminReply">{{ row.adminReply }}</span><span v-else class="muted-text">-</span></template></el-table-column>
            <el-table-column label="操作" width="160" fixed="right"><template #default="{ row }"><el-space v-if="row.status==='pending'"><el-button type="success" link size="small" @click="showAppealProcessDialog(row,'approved')">通过</el-button><el-button type="danger" link size="small" @click="showAppealProcessDialog(row,'rejected')">驳回</el-button></el-space><span v-else class="muted-text">已处理</span></template></el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </section>

    <!-- Dialogs -->
    <el-dialog v-model="hideDialogVisible" title="隐藏评价" width="460px" :close-on-click-modal="false">
      <el-form :model="hideForm" label-width="80px"><el-form-item label="评价 ID"><span>{{ hideForm.reviewId }}</span></el-form-item><el-form-item label="隐藏原因" required><el-input v-model="hideForm.reason" type="textarea" :rows="3" maxlength="200" show-word-limit placeholder="请填写隐藏原因" /></el-form-item></el-form>
      <template #footer><el-button @click="hideDialogVisible=false">取消</el-button><el-button type="danger" :loading="hidingReview" @click="confirmHide">确认隐藏</el-button></template>
    </el-dialog>

    <el-dialog v-model="appealProcessVisible" :title="appealProcessForm.action==='approved'?'通过申诉':'驳回申诉'" width="460px" :close-on-click-modal="false">
      <el-alert v-if="appealProcessForm.action==='approved'" title="通过申诉后，关联评价将被自动隐藏" type="warning" :closable="false" show-icon style="margin-bottom:16px" />
      <el-form label-width="80px"><el-form-item label="申诉 ID"><span>{{ appealProcessForm.appealId }}</span></el-form-item><el-form-item label="处理回复"><el-input v-model="appealProcessForm.reply" type="textarea" :rows="3" maxlength="200" show-word-limit :placeholder="appealProcessForm.action==='approved'?'回复申诉人，说明通过原因':'回复申诉人，说明驳回原因'" /></el-form-item></el-form>
      <template #footer><el-button @click="appealProcessVisible=false">取消</el-button><el-button :type="appealProcessForm.action==='approved'?'success':'danger'" :loading="processingAppeal" @click="confirmAppealProcess">{{ appealProcessForm.action==='approved'?'确认通过':'确认驳回' }}</el-button></template>
    </el-dialog>

    <el-dialog v-model="pwdDialogVisible" title="重置密码" width="400px" :close-on-click-modal="false">
      <el-form label-width="80px"><el-form-item label="用户"><span>{{ pwdForm.realName }}（{{ pwdForm.studentNo }}）</span></el-form-item><el-form-item label="新密码" required><el-input v-model="pwdForm.password" type="password" show-password placeholder="至少 6 位" /></el-form-item></el-form>
      <template #footer><el-button @click="pwdDialogVisible=false">取消</el-button><el-button type="primary" :loading="pwdSubmitting" @click="confirmResetPassword">确认重置</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import * as echarts from "echarts";
import { DataAnalysis, Histogram, DataLine } from "@element-plus/icons-vue";
import { getAdminProjects, getAdminReviews, getAdminUsers, hideReview, resetPassword } from "@/api/adminApi";
import { getAppeals, processAppeal } from "@/api/appealApi";
import { getAdminStats, getDashboardSummary } from "@/api/dashboardApi";
import ReviewList from "@/components/ReviewList.vue";
import ScoreCard from "@/components/ScoreCard.vue";

const activeTab = ref("users");
const loadingUsers = ref(false);
const loadingProjects = ref(false);
const loadingReviews = ref(false);
const hidingReview = ref(false);
const loadingAppeals = ref(false);
const processingAppeal = ref(false);
const chartsLoading = ref(true);
const chartsError = ref(false);

const tagChartRef = ref(null);
const majorChartRef = ref(null);
const trendChartRef = ref(null);

// ECharts instances: init once, reuse forever
let tagChartInst = null;
let majorChartInst = null;
let trendChartInst = null;
let resizeObserver = null;

const adminStats = reactive({ byMajor: [], reviewTrend: [], pendingAppeals: 0 });
const users = ref([]);
const projects = ref([]);
const reviews = ref([]);
const appeals = ref([]);
const pendingAppealCount = computed(() => appeals.value.filter(a => a.status === "pending").length);
const overview = reactive({ totalUsers:0, totalProjects:0, totalReviews:0, hiddenReviews:0, averageScore:0, usersWithoutReviews:0 });
const dashboard = reactive({ topUsers: [], hotTags: [] });
const reviewFilters = reactive({ projectId:undefined, status:undefined, minScore:undefined, keyword:"" });
const hideDialogVisible = ref(false);
const hideForm = reactive({ reviewId:null, reason:"" });
const appealProcessVisible = ref(false);
const appealProcessForm = reactive({ appealId:null, action:"approved", reply:"" });
const pwdDialogVisible = ref(false);
const pwdSubmitting = ref(false);
const pwdForm = reactive({ userId:null, realName:"", studentNo:"", password:"" });

const statusMap = { ongoing:"进行中", reviewable:"可评价", archived:"已归档" };
function statusLabel(s) { return statusMap[s] || s || "-"; }
function statusTagType(s) { return s==="ongoing"?"info":s==="reviewable"?"success":"warning"; }
function resetReviewFilters() { reviewFilters.projectId=undefined; reviewFilters.status=undefined; reviewFilters.minScore=undefined; reviewFilters.keyword=""; fetchReviews(); }

/* ---- Chart engine: init once, never dispose except on unmount ---- */
function getOrInitChart(domRef, existing) {
  if (!domRef.value) return null;
  if (domRef.value.clientWidth === 0 || domRef.value.clientHeight === 0) return null;
  if (existing && !existing.isDisposed()) return existing;
  return echarts.getInstanceByDom(domRef.value) || echarts.init(domRef.value);
}

function safeSet(inst, option) {
  if (!inst || inst.isDisposed()) return;
  inst.setOption(option, { notMerge: true, lazyUpdate: false });
}

function tagChartOption() {
  const data = dashboard.hotTags;
  return {
    animation: true, animationDuration: 800, animationDurationUpdate: 600, animationEasing: "cubicOut",
    tooltip: { trigger:"axis", backgroundColor:"#fff", borderColor:"rgba(148,163,184,0.2)", textStyle:{color:"#0f172a",fontSize:13}, formatter: p => p[0]?`${p[0].name}<br/><b>${p[0].value}</b> 次`:"" },
    grid: { left:90, right:20, top:10, bottom:24 },
    xAxis: { type:"value", axisLine:{show:false}, axisTick:{show:false}, splitLine:{lineStyle:{color:"#f1f5f9"}} },
    yAxis: { type:"category", data:data.map(t=>t.displayName).reverse(), inverse:true, axisLine:{show:false}, axisTick:{show:false}, axisLabel:{color:"#64748b",fontSize:12,margin:12} },
    series: [{ type:"bar", data:data.map(t=>t.count).reverse(), barWidth:16, itemStyle:{borderRadius:[0,6,6,0], color:new echarts.graphic.LinearGradient(0,0,1,0,[{offset:0,color:"#818cf8"},{offset:1,color:"#6366f1"}])}, emphasis:{itemStyle:{color:"#4f46e5"}} }]
  };
}

function majorChartOption() {
  const data = adminStats.byMajor;
  return {
    animation: true, animationDuration: 800, animationDurationUpdate: 600, animationEasing: "cubicOut",
    tooltip: { trigger:"axis", backgroundColor:"#fff", borderColor:"rgba(148,163,184,0.2)", textStyle:{color:"#0f172a",fontSize:13}, formatter: p => p[0]?`${p[0].name}<br/>平均 <b>${p[0].value}</b> 分`:"" },
    grid: { left:85, right:20, top:10, bottom:24 },
    xAxis: { type:"value", max:5, axisLine:{show:false}, axisTick:{show:false}, splitLine:{lineStyle:{color:"#f1f5f9"}} },
    yAxis: { type:"category", data:data.map(m=>m.major).reverse(), inverse:true, axisLine:{show:false}, axisTick:{show:false}, axisLabel:{color:"#64748b",fontSize:12,margin:12} },
    series: [{ type:"bar", data:data.map(m=>m.avgScore).reverse(), barWidth:16, itemStyle:{borderRadius:[0,6,6,0], color:new echarts.graphic.LinearGradient(0,0,1,0,[{offset:0,color:"#5eead4"},{offset:1,color:"#0d9488"}])}, emphasis:{itemStyle:{color:"#0f766e"}} }]
  };
}

function fmtDate(d) { if(!d)return""; const dt=new Date(d); return `${String(dt.getMonth()+1).padStart(2,"0")}/${String(dt.getDate()).padStart(2,"0")}`; }
function fmtDateFull(d) { if(!d)return""; const dt=new Date(d); return `${dt.getFullYear()}年${dt.getMonth()+1}月${dt.getDate()}日`; }

function trendChartOption() {
  const data = adminStats.reviewTrend;
  return {
    animation: true, animationDuration: 800, animationDurationUpdate: 600, animationEasing: "cubicOut",
    tooltip: { trigger:"axis", backgroundColor:"#fff", borderColor:"rgba(148,163,184,0.2)", textStyle:{color:"#0f172a",fontSize:13}, formatter: p => p[0]?`${fmtDateFull(p[0].name)}<br/>评价数 <b>${p[0].value}</b>`:"" },
    grid: { left:42, right:24, top:12, bottom:22 },
    xAxis: { type:"category", data:data.map(d=>fmtDate(d.date)), axisLine:{show:false}, axisTick:{show:false}, axisLabel:{color:"#94a3b8",fontSize:11} },
    yAxis: { type:"value", minInterval:1, axisLine:{show:false}, axisTick:{show:false}, splitLine:{lineStyle:{color:"#f1f5f9"}} },
    series: [{ type:"line", data:data.map(d=>d.count), smooth:true, lineStyle:{color:"#4B5CF0",width:2.5}, itemStyle:{color:"#4B5CF0"}, areaStyle:{color:new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:"rgba(75,92,240,0.10)"},{offset:1,color:"rgba(75,92,240,0.01)"}])}, symbol:"circle", symbolSize:5, emphasis:{symbolSize:7} }]
  };
}

function renderAllCharts() {
  nextTick(() => requestAnimationFrame(() => {
    if (dashboard.hotTags.length) { tagChartInst = getOrInitChart(tagChartRef, tagChartInst); safeSet(tagChartInst, tagChartOption()); }
    if (adminStats.byMajor.length) { majorChartInst = getOrInitChart(majorChartRef, majorChartInst); safeSet(majorChartInst, majorChartOption()); }
    if (adminStats.reviewTrend.length) { trendChartInst = getOrInitChart(trendChartRef, trendChartInst); safeSet(trendChartInst, trendChartOption()); }
    setTimeout(() => [tagChartInst,majorChartInst,trendChartInst].forEach(c=>{try{c?.resize()}catch{}}), 120);
  }));
}

/* ---- Data ---- */
async function loadDashboardData() {
  chartsLoading.value = true; chartsError.value = false;
  try {
    const [summary, stats] = await Promise.all([getDashboardSummary(), getAdminStats()]);
    Object.assign(overview, summary.data.overview||{});
    dashboard.topUsers = summary.data.topUsers || [];
    dashboard.hotTags = summary.data.hotTags || [];
    Object.assign(adminStats, stats.data);
    chartsLoading.value = false;
    renderAllCharts();
  } catch { chartsLoading.value = false; chartsError.value = true; }
}

async function fetchUsers() { loadingUsers.value=true; try { const r=await getAdminUsers(); users.value=r.data||[]; } catch(e) { ElMessage.error(e.message||"加载用户列表失败"); } finally { loadingUsers.value=false; } }
async function fetchProjects() { loadingProjects.value=true; try { const r=await getAdminProjects(); projects.value=r.data||[]; } catch(e) { ElMessage.error(e.message||"加载项目列表失败"); } finally { loadingProjects.value=false; } }
async function fetchReviews() {
  loadingReviews.value=true;
  try { const p={}; if(reviewFilters.projectId)p.projectId=reviewFilters.projectId; if(reviewFilters.status)p.status=reviewFilters.status; if(reviewFilters.minScore)p.minScore=reviewFilters.minScore; if(reviewFilters.keyword)p.keyword=reviewFilters.keyword; const r=await getAdminReviews(p); reviews.value=r.data||[]; } catch(e) { ElMessage.error(e.message||"加载评价列表失败"); } finally { loadingReviews.value=false; }
}

function showHideDialog(row) { hideForm.reviewId=row.id; hideForm.reason=""; hideDialogVisible.value=true; }
async function confirmHide() { if(!hideForm.reason.trim()){ElMessage.warning("请填写隐藏原因");return;} hidingReview.value=true; try { await hideReview(hideForm.reviewId,{reason:hideForm.reason}); hideDialogVisible.value=false; ElMessage.success("评价已隐藏"); await Promise.all([loadDashboardData(), fetchReviews()]); } catch(e) { ElMessage.error(e.message||"隐藏失败"); } finally { hidingReview.value=false; } }

function appealStatusType(s) { return s==="pending"?"warning":s==="approved"?"success":"info"; }
function appealStatusLabel(s) { return s==="pending"?"待处理":s==="approved"?"已通过":"已驳回"; }
async function fetchAppeals() { loadingAppeals.value=true; try { const r=await getAppeals(); appeals.value=r.data||[]; } catch(e) { ElMessage.error(e.message||"加载申诉列表失败"); } finally { loadingAppeals.value=false; } }
function showAppealProcessDialog(row,action) { appealProcessForm.appealId=row.id; appealProcessForm.action=action; appealProcessForm.reply=""; appealProcessVisible.value=true; }
async function confirmAppealProcess() { if(!appealProcessForm.reply.trim()){ElMessage.warning("请填写处理回复");return;} processingAppeal.value=true; try { await processAppeal(appealProcessForm.appealId,{status:appealProcessForm.action,adminReply:appealProcessForm.reply.trim()}); appealProcessVisible.value=false; ElMessage.success(appealProcessForm.action==="approved"?"申诉已通过":"申诉已驳回"); await Promise.all([fetchReviews(),fetchAppeals()]); } catch(e) { ElMessage.error(e.message||"处理失败"); } finally { processingAppeal.value=false; } }

function showPwdDialog(row) { pwdForm.userId=row.id; pwdForm.realName=row.realName; pwdForm.studentNo=row.studentNo; pwdForm.password=""; pwdDialogVisible.value=true; }
async function confirmResetPassword() { if(pwdForm.password.length<6){ElMessage.warning("新密码长度不能少于6位");return;} pwdSubmitting.value=true; try { await resetPassword(pwdForm.userId,{password:pwdForm.password}); pwdDialogVisible.value=false; ElMessage.success(`已重置 ${pwdForm.realName} 的密码`); } catch(e) { ElMessage.error(e.message); } finally { pwdSubmitting.value=false; } }

function handleTabChange(tab) { if(tab==="users")fetchUsers(); else if(tab==="projects")fetchProjects(); else if(tab==="reviews")fetchReviews(); else if(tab==="appeals")fetchAppeals(); }

/* ---- Lifecycle ---- */
onMounted(async () => {
  await Promise.all([loadDashboardData(), fetchUsers()]);
  nextTick(() => {
    const els = [tagChartRef.value, majorChartRef.value, trendChartRef.value].filter(Boolean);
    if (els.length) {
      resizeObserver = new ResizeObserver(() => [tagChartInst,majorChartInst,trendChartInst].forEach(c=>{try{c?.resize()}catch{}}));
      els.forEach(el => resizeObserver.observe(el));
    }
  });
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect(); resizeObserver = null;
  [tagChartInst, majorChartInst, trendChartInst].forEach(c => { try { c?.dispose(); } catch {} });
  tagChartInst = majorChartInst = trendChartInst = null;
});
</script>

<style scoped>
.hidden-reason-text { color:#991b1b; font-size:13px; }
.chart-box { width:100%; height:240px; min-height:240px; }
.panel-title { margin-bottom:12px; font-weight:650; color:var(--text-main); font-size:15px; }
.chart-overlay {
  position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 6px; color: var(--text-faint); pointer-events: none; background: rgba(255,255,255,0.6);
}
.chart-overlay span { font-size:14px; font-weight:600; color:var(--text-muted); }
.chart-overlay small { font-size:12px; color:var(--text-faint); }
.chart-overlay.error span { color: var(--danger); }
.section-surface { position: relative; }
</style>
