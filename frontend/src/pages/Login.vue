<template>
  <div class="login-page">
    <!-- Animated background layers -->
    <div class="login-bg">
      <div class="bg-orb bg-orb-1"></div>
      <div class="bg-orb bg-orb-2"></div>
      <div class="bg-orb bg-orb-3"></div>
      <div class="bg-line bg-line-1"></div>
      <div class="bg-line bg-line-2"></div>
    </div>

    <div class="login-shell">
      <!-- Left: Showcase -->
      <section class="login-showcase">
        <div class="showcase-brand">
          <img src="/brand-logo.png" alt="竞赛队友测评墙" class="showcase-logo" />
          <div class="brand-text">
            <strong>竞赛队友测评墙</strong>
            <span>课程设计 Demo</span>
          </div>
        </div>

        <h1 class="showcase-title">让竞赛组队<br />不再只靠感觉</h1>
        <p class="showcase-desc">通过匿名互评、协作画像和队友推荐，帮助同学在组队前了解真实协作风格，减少磨合成本。</p>

        <!-- Feature cards -->
        <div class="feature-list">
          <div class="feature-card" style="animation-delay:0ms">
            <div class="feature-icon" style="background:rgba(79,99,246,0.08);color:var(--primary)">
              <el-icon :size="22"><Hide /></el-icon>
            </div>
            <div>
              <strong>匿名互评</strong>
              <p>评价对外显示为"匿名队友"，降低人情压力，让反馈更真实。</p>
            </div>
          </div>
          <div class="feature-card" style="animation-delay:140ms">
            <div class="feature-icon" style="background:rgba(15,118,110,0.08);color:var(--teal)">
              <el-icon :size="22"><DataAnalysis /></el-icon>
            </div>
            <div>
              <strong>协作画像</strong>
              <p>自动汇总评分、标签、再次组队率和项目经历，形成可参考画像。</p>
            </div>
          </div>
          <div class="feature-card" style="animation-delay:280ms">
            <div class="feature-icon" style="background:rgba(217,119,6,0.08);color:var(--amber)">
              <el-icon :size="22"><Connection /></el-icon>
            </div>
            <div>
              <strong>队友推荐</strong>
              <p>根据技能方向和协作标签，找到更适合一起参赛的同学。</p>
            </div>
          </div>
        </div>

        <!-- Stats row -->
        <div class="stats-row">
          <div class="stat-pill"><span class="stat-pill-num">5</span><span class="stat-pill-label">学生画像</span></div>
          <div class="stat-pill"><span class="stat-pill-num">7</span><span class="stat-pill-label">有效评价</span></div>
          <div class="stat-pill"><span class="stat-pill-num">4.14</span><span class="stat-pill-label">平台均分</span></div>
          <div class="stat-pill"><span class="stat-pill-num">3</span><span class="stat-pill-label">竞赛项目</span></div>
        </div>
      </section>

      <!-- Right: Login card -->
      <section class="login-panel-wrap">
        <div class="login-card">
          <div class="login-card-head">
            <h2>欢迎回来</h2>
            <p>登录后查看你的竞赛协作画像与待评价项目。</p>
          </div>

          <el-form :model="form" @submit.prevent="handleLogin">
            <div class="input-group">
              <label class="input-label">学号</label>
              <el-input v-model="form.studentNo" placeholder="请输入学号" size="large" :prefix-icon="UserFilled" />
            </div>
            <div class="input-group">
              <label class="input-label">密码</label>
              <el-input v-model="form.password" type="password" show-password placeholder="请输入密码" size="large" :prefix-icon="Lock" />
            </div>
            <el-button type="primary" size="large" class="login-btn" :loading="loading" @click="handleLogin">
              登录
            </el-button>
          </el-form>

          <div class="login-card-foot">
            <span>还没有账号？<router-link to="/register">去注册</router-link></span>
          </div>

          <div class="login-card-note">
            <el-icon :size="14"><InfoFilled /></el-icon>
            <span>普通用户只看到匿名评价，管理员保留完整记录用于争议追溯。</span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";
import { Hide, DataAnalysis, Connection, UserFilled, Lock, InfoFilled } from "@element-plus/icons-vue";
import { useUserStore } from "@/store/user";

const router = useRouter();
const userStore = useUserStore();
const loading = ref(false);

const form = reactive({
  studentNo: "2023001",
  password: "Stu@123456"
});

async function handleLogin() {
  loading.value = true;
  try {
    await userStore.login(form);
    ElMessage.success("登录成功");
    router.push("/");
  } catch (error) {
    ElMessage.error(error.message);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px;
  position: relative;
  overflow: hidden;
  background: linear-gradient(150deg, #f0f4ff 0%, #f8fafd 35%, #f0f7f6 70%, #f5f3ff 100%);
}

/* ---- Animated background ---- */
.login-bg { position: absolute; inset: 0; pointer-events: none; z-index: 0; }
.bg-orb {
  position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.45;
}
.bg-orb-1 { width: 420px; height: 420px; background: rgba(79,99,246,0.10); top: -8%; left: 5%; animation: orbFloat 12s ease-in-out infinite; }
.bg-orb-2 { width: 340px; height: 340px; background: rgba(15,118,110,0.08); bottom: 10%; right: -4%; animation: orbFloat 14s ease-in-out infinite reverse; }
.bg-orb-3 { width: 240px; height: 240px; background: rgba(217,119,6,0.06); top: 50%; left: 50%; animation: orbFloat 16s ease-in-out infinite; }
.bg-line {
  position: absolute; height: 2px; width: 200px;
  background: linear-gradient(90deg, transparent, rgba(79,99,246,0.10), transparent);
  animation: flowLine 8s ease-in-out infinite;
}
.bg-line-1 { top: 25%; left: 60%; animation-delay: 0s; }
.bg-line-2 { top: 58%; left: 10%; animation-delay: 4s; width: 260px; }

@keyframes orbFloat {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(20px, -30px) scale(1.04); }
  66% { transform: translate(-15px, 20px) scale(0.96); }
}
@keyframes flowLine {
  0% { transform: translateX(-60px); opacity: 0.1; }
  50% { opacity: 0.35; }
  100% { transform: translateX(60px); opacity: 0.1; }
}

/* ---- Shell ---- */
.login-shell {
  position: relative; z-index: 1;
  display: flex; gap: 0;
  width: min(100%, 1060px);
  min-height: 620px;
  background: rgba(255,255,255,0.82);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-hover);
  overflow: hidden;
}

/* ---- Left Showcase ---- */
.login-showcase {
  flex: 11;
  padding: 44px 48px;
  display: flex; flex-direction: column; justify-content: center;
  background: linear-gradient(160deg, rgba(248,250,255,0.9) 0%, rgba(255,255,255,0.6) 100%);
  border-right: 1px solid var(--border-soft);
}

.showcase-brand { display: flex; align-items: center; gap: 14px; margin-bottom: 32px; }
.showcase-logo { width: 52px; height: 52px; border-radius: 10px; flex-shrink: 0; }
.brand-text { display: flex; flex-direction: column; gap: 2px; }
.brand-text strong { font-size: 17px; color: var(--text-main); }
.brand-text span { font-size: 12px; color: var(--text-faint); }

.showcase-title { margin: 0; font-size: 52px; font-weight: 720; color: var(--brand-ink); letter-spacing: -1.4px; line-height: 1.2; }
.showcase-desc { margin: 20px 0 0; color: var(--brand-muted); font-size: 17px; line-height: 1.8; max-width: 500px; }

/* Feature cards */
.feature-list { display: grid; gap: 12px; margin-top: 32px; }
.feature-card {
  display: flex; gap: 14px; align-items: flex-start;
  padding: 15px 18px;
  border: 1px solid var(--border-soft); border-radius: var(--radius-md);
  background: rgba(255,255,255,0.6);
  animation: fadeUp 500ms ease both;
  transition: all var(--transition-base);
}
.feature-card:hover { border-color: var(--primary); box-shadow: var(--shadow-sm); transform: translateX(4px); }
.feature-card strong { display: block; font-size: 15px; color: var(--text-main); margin-bottom: 3px; }
.feature-card p { margin: 0; font-size: 13px; color: var(--text-muted); line-height: 1.6; }
.feature-icon { width: 42px; height: 42px; border-radius: 12px; display: grid; place-items: center; flex-shrink: 0; border: 1px solid rgba(0,0,0,0.06); }

/* Stats */
.stats-row { display: flex; gap: 28px; margin-top: 32px; }
.stat-pill { display: flex; flex-direction: column; gap: 3px; }
.stat-pill-num { font-size: 30px; font-weight: 700; color: var(--primary); letter-spacing: -0.5px; }
.stat-pill-label { font-size: 12px; color: var(--text-faint); }

/* ---- Right: Login Card ---- */
.login-panel-wrap {
  flex: 9;
  display: flex; align-items: center; justify-content: center; padding: 44px 48px;
}
.login-card {
  width: 100%; max-width: 420px;
  animation: fadeUp 520ms ease both;
}
.login-card-head { margin-bottom: 36px; }
.login-card-head h2 { margin: 0; font-size: 32px; font-weight: 700; color: var(--brand-ink); letter-spacing: -0.5px; }
.login-card-head p { margin: 10px 0 0; color: var(--brand-muted); font-size: 15px; }

.input-group { margin-bottom: 20px; }
.input-label { display: block; font-size: 13px; font-weight: 600; color: var(--brand-muted); margin-bottom: 6px; }

.login-btn {
  width: 100%; margin-top: 8px; height: 50px; font-size: 17px; font-weight: 600;
  border-radius: var(--radius-md) !important;
  background: linear-gradient(135deg, #6475FF 0%, #5062F4 100%) !important;
  border: none !important;
  box-shadow: 0 10px 24px rgba(91,108,255,0.25);
  transition: all var(--transition-base);
}
.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 36px rgba(91,108,255,0.35);
}
.login-btn:active { transform: translateY(1px); box-shadow: 0 6px 16px rgba(91,108,255,0.20); }

.login-card-foot { text-align: center; margin-top: 18px; font-size: 14px; color: var(--brand-muted); }
.login-card-foot a { color: var(--brand-primary); font-weight: 600; margin-left: 6px; }
.login-card-note { display: flex; align-items: center; gap: 8px; margin-top: 24px; padding: 12px 16px; border-radius: var(--radius-sm); background: var(--surface-soft); font-size: 13px; color: var(--brand-faint); }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Mobile */
@media (max-width: 860px) {
  .login-page { padding: 0; }
  .login-shell { flex-direction: column; min-height: auto; border-radius: 0; }
  .login-showcase { padding: 32px 28px; border-right: none; border-bottom: 1px solid var(--border-soft); }
  .showcase-title { font-size: 28px; }
  .feature-list { margin-top: 24px; }
  .stats-row { margin-top: 24px; gap: 18px; }
  .stat-pill-num { font-size: 24px; }
  .login-panel-wrap { padding: 32px 28px; }
}

@media (prefers-reduced-motion: reduce) {
  .bg-orb, .bg-line, .feature-card, .login-card { animation: none !important; }
}
</style>
