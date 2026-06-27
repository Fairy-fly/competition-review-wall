<template>
  <div class="login-page">
    <!-- Ambient background glow -->
    <div class="login-ambient">
      <div class="amb-orb amb-orb-1"></div>
      <div class="amb-orb amb-orb-2"></div>
      <div class="amb-orb amb-orb-3"></div>
      <div class="amb-line amb-line-1"></div>
      <div class="amb-line amb-line-2"></div>
      <div class="amb-dots"></div>
    </div>

    <!-- Left: Brand Hero -->
    <section class="login-hero">
      <div class="hero-inner">
        <!-- Brand -->
        <div class="hero-brand">
          <img src="/brand-logo.png" alt="竞赛队友测评墙" class="hero-logo" />
          <div class="hero-brand-text">
            <strong>竞赛队友测评墙</strong>
            <span>课程设计 Demo</span>
          </div>
        </div>

        <!-- Headline -->
        <h1 class="hero-headline">
          <span class="hl-line">让竞赛组队</span>
          <span class="hl-line">不再只靠<span class="hl-accent">感觉</span></span>
        </h1>
        <p class="hero-desc">通过匿名互评、协作画像与队友推荐，帮助同学在组队前更早了解真实协作风格，降低磨合成本。</p>

        <!-- Feature pills -->
        <div class="hero-features">
          <div class="hf-card" style="--delay: 0ms">
            <div class="hf-icon hf-icon-shield">
              <el-icon :size="20"><Hide /></el-icon>
            </div>
            <div>
              <strong>匿名互评</strong>
              <p>评价对外为匿名队友，降低人情压力。</p>
            </div>
          </div>
          <div class="hf-card" style="--delay: 120ms">
            <div class="hf-icon hf-icon-data">
              <el-icon :size="20"><DataAnalysis /></el-icon>
            </div>
            <div>
              <strong>协作画像</strong>
              <p>自动汇总评分、标签和再组队率。</p>
            </div>
          </div>
          <div class="hf-card" style="--delay: 240ms">
            <div class="hf-icon hf-icon-connect">
              <el-icon :size="20"><Connection /></el-icon>
            </div>
            <div>
              <strong>队友推荐</strong>
              <p>根据技能方向匹配适合参赛的同学。</p>
            </div>
          </div>
        </div>

        <!-- Trust metrics -->
        <div class="hero-metrics">
          <div class="hm-item">
            <span class="hm-num">5</span>
            <span class="hm-label">学生画像</span>
          </div>
          <div class="hm-item">
            <span class="hm-num">7</span>
            <span class="hm-label">有效评价</span>
          </div>
          <div class="hm-item">
            <span class="hm-num">4.14</span>
            <span class="hm-label">平台均分</span>
          </div>
          <div class="hm-item">
            <span class="hm-num">3</span>
            <span class="hm-label">竞赛项目</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Right: Login Panel -->
    <section class="login-panel">
      <div class="panel-card">
        <div class="panel-head">
          <h2>欢迎回来</h2>
          <p>登录后查看你的竞赛协作画像与待评价项目</p>
        </div>

        <el-form :model="form" @submit.prevent="handleLogin">
          <div class="field-group">
            <label class="field-label">学号</label>
            <el-input v-model="form.studentNo" placeholder="请输入学号" size="large" :prefix-icon="UserFilled" class="custom-input" />
          </div>
          <div class="field-group">
            <label class="field-label">密码</label>
            <el-input v-model="form.password" type="password" show-password placeholder="请输入密码" size="large" :prefix-icon="Lock" class="custom-input" />
          </div>
          <el-button class="login-submit" :loading="loading" @click="handleLogin">
            登 录
          </el-button>
        </el-form>

        <div class="panel-foot">
          <span>还没有账号？<router-link to="/register">去注册</router-link></span>
        </div>

        <div class="panel-note">
          <el-icon :size="14"><InfoFilled /></el-icon>
          <span>普通用户只看到匿名评价，管理员保留完整记录用于争议追溯。</span>
        </div>
      </div>
    </section>
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
/* ===== Full-screen layout ===== */
.login-page {
  min-height: 100vh;
  display: flex;
  position: relative;
  overflow: hidden;
  background: #f5f7fc;
}

/* ===== Ambient background ===== */
.login-ambient { position: absolute; inset: 0; pointer-events: none; z-index: 0; }
.amb-orb { position: absolute; border-radius: 50%; filter: blur(100px); }
.amb-orb-1 { width: 520px; height: 520px; background: rgba(91,108,255,0.07); top: -12%; left: -6%; animation: orbDrift 14s ease-in-out infinite; }
.amb-orb-2 { width: 380px; height: 380px; background: rgba(24,169,153,0.05); bottom: 5%; right: -8%; animation: orbDrift 16s ease-in-out infinite reverse; }
.amb-orb-3 { width: 280px; height: 280px; background: rgba(91,108,255,0.04); top: 45%; left: 55%; animation: orbDrift 18s ease-in-out infinite; }
.amb-line {
  position: absolute; height: 1.5px; width: 240px;
  background: linear-gradient(90deg, transparent, rgba(91,108,255,0.08), transparent);
  animation: lineFlow 10s ease-in-out infinite;
}
.amb-line-1 { top: 20%; left: 55%; animation-delay: 0s; }
.amb-line-2 { top: 65%; left: 15%; animation-delay: 5s; width: 300px; }

@keyframes orbDrift {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -20px) scale(1.04); }
  66% { transform: translate(-20px, 25px) scale(0.96); }
}
@keyframes lineFlow {
  0% { transform: translateX(-40px); opacity: 0.08; }
  50% { opacity: 0.25; }
  100% { transform: translateX(40px); opacity: 0.08; }
}

/* ===== Left Hero (60%) ===== */
.login-hero {
  flex: 6;
  display: flex; align-items: center;
  padding: 60px 64px 60px 72px;
  position: relative; z-index: 1;
}
.login-hero::after {
  content: "";
  position: absolute; right: 0; top: 12%; bottom: 12%;
  width: 1px;
  background: linear-gradient(180deg, transparent, rgba(91,108,255,0.12), rgba(24,169,153,0.08), transparent);
}

.hero-inner {
  max-width: 620px;
  display: flex; flex-direction: column;
  animation: fadeSlideUp 600ms ease both;
}
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Brand */
.hero-brand { display: flex; align-items: center; gap: 16px; margin-bottom: 40px; }
.hero-logo { width: 52px; height: 52px; border-radius: 12px; flex-shrink: 0; }
.hero-brand-text { display: flex; flex-direction: column; gap: 2px; }
.hero-brand-text strong { font-size: 18px; color: var(--brand-ink); font-weight: 650; }
.hero-brand-text span { font-size: 12px; color: var(--brand-faint); letter-spacing: 0.5px; }

/* Headline */
.hero-headline { margin: 0; }
.hl-line { display: block; font-size: 64px; font-weight: 700; color: var(--brand-ink); letter-spacing: -2px; line-height: 1.12; }
.hl-accent { color: var(--brand-primary); position: relative; }
.hl-accent::after {
  content: ""; position: absolute; bottom: 4px; left: 0; right: 0; height: 8px;
  background: rgba(91,108,255,0.12); border-radius: 4px; z-index: -1;
}

.hero-desc { margin: 28px 0 0; color: var(--brand-muted); font-size: 17px; line-height: 1.8; max-width: 480px; }

/* Feature cards */
.hero-features { display: grid; gap: 8px; margin-top: 36px; }
.hf-card {
  display: flex; gap: 14px; align-items: flex-start;
  padding: 14px 16px; border-radius: var(--radius-md);
  border: 1px solid rgba(148,163,184,0.16);
  background: rgba(255,255,255,0.55);
  animation: fadeSlideUp 500ms ease both;
  animation-delay: var(--delay);
  transition: all var(--transition-base);
}
.hf-card:hover {
  border-color: rgba(91,108,255,0.25);
  background: rgba(255,255,255,0.85);
  box-shadow: var(--shadow-sm);
  transform: translateX(4px);
}
.hf-card strong { display: block; font-size: 15px; color: var(--brand-ink); margin-bottom: 2px; }
.hf-card p { margin: 0; font-size: 13px; color: var(--brand-muted); line-height: 1.5; }
.hf-icon { width: 38px; height: 38px; border-radius: 10px; display: grid; place-items: center; flex-shrink: 0; }
.hf-icon-shield { background: rgba(91,108,255,0.08); color: var(--brand-primary); }
.hf-icon-data  { background: rgba(24,169,153,0.08); color: var(--brand-teal); }
.hf-icon-connect { background: rgba(217,145,59,0.08); color: var(--brand-amber); }

/* Metrics */
.hero-metrics { display: flex; gap: 40px; margin-top: 40px; }
.hm-item { display: flex; flex-direction: column; gap: 3px; }
.hm-num { font-size: 34px; font-weight: 700; color: var(--brand-ink); letter-spacing: -0.5px; }
.hm-label { font-size: 13px; color: var(--brand-faint); }

/* ===== Right Login Panel (40%) ===== */
.login-panel {
  flex: 4;
  display: flex; align-items: center; justify-content: center;
  padding: 60px 56px;
  position: relative; z-index: 1;
}

.panel-card {
  width: 100%; max-width: 400px;
  animation: fadeSlideUp 600ms ease 200ms both;
}

.panel-head { margin-bottom: 36px; }
.panel-head h2 { margin: 0; font-size: 30px; font-weight: 700; color: var(--brand-ink); letter-spacing: -0.5px; }
.panel-head p { margin: 10px 0 0; color: var(--brand-muted); font-size: 14px; line-height: 1.6; }

.field-group { margin-bottom: 18px; }
.field-label { display: block; font-size: 13px; font-weight: 600; color: var(--brand-muted); margin-bottom: 6px; }

.login-submit {
  width: 100%; margin-top: 10px; height: 52px; font-size: 17px; font-weight: 600;
  letter-spacing: 0.5px;
  border-radius: var(--radius-md) !important;
  background: linear-gradient(135deg, #6475FF 0%, #5062F4 100%) !important;
  border: none !important;
  box-shadow: 0 8px 24px rgba(91,108,255,0.25);
  transition: all var(--transition-base);
  color: #fff;
}
.login-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 36px rgba(91,108,255,0.38);
}
.login-submit:active { transform: translateY(1px); box-shadow: 0 4px 14px rgba(91,108,255,0.20); }

.panel-foot { text-align: center; margin-top: 18px; font-size: 14px; color: var(--brand-muted); }
.panel-foot a { color: var(--brand-primary); font-weight: 600; margin-left: 6px; }

.panel-note {
  display: flex; align-items: center; gap: 8px; margin-top: 24px;
  padding: 10px 14px; border-radius: var(--radius-sm);
  background: rgba(145,163,184,0.06); font-size: 12px; color: var(--brand-faint);
}

/* ===== Responsive ===== */
@media (max-width: 960px) {
  .login-page { flex-direction: column; }
  .login-hero { padding: 44px 32px 32px; flex: auto; }
  .login-hero::after { display: none; }
  .hero-headline .hl-line { font-size: 44px; }
  .login-panel { padding: 24px 32px 48px; flex: auto; }
  .hero-metrics { gap: 24px; }
  .hm-num { font-size: 26px; }
}

@media (prefers-reduced-motion: reduce) {
  .amb-orb, .amb-line, .hf-card, .panel-card { animation: none !important; }
}
</style>
