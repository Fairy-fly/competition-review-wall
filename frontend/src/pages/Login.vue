<template>
  <div class="login-page">
    <!-- Ambient orbs -->
    <div class="amb-orbs">
      <div class="amb-orb ao-1"></div>
      <div class="amb-orb ao-2"></div>
      <div class="amb-orb ao-3"></div>
    </div>

    <!-- Network background SVG -->
    <svg class="login-network" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <line x1="80" y1="140" x2="340" y2="180" stroke="rgba(91,108,255,0.06)" stroke-width="1"/>
      <line x1="340" y1="180" x2="520" y2="320" stroke="rgba(91,108,255,0.05)" stroke-width="1"/>
      <line x1="520" y1="320" x2="680" y2="200" stroke="rgba(24,169,153,0.04)" stroke-width="1"/>
      <line x1="680" y1="200" x2="860" y2="380" stroke="rgba(91,108,255,0.04)" stroke-width="1"/>
      <line x1="200" y1="400" x2="440" y2="340" stroke="rgba(24,169,153,0.05)" stroke-width="1"/>
      <line x1="440" y1="340" x2="600" y2="500" stroke="rgba(91,108,255,0.04)" stroke-width="1"/>
      <line x1="100" y1="600" x2="380" y2="520" stroke="rgba(91,108,255,0.03)" stroke-width="1"/>
      <circle cx="340" cy="180" r="3" fill="rgba(91,108,255,0.12)" class="nn nn-1"/>
      <circle cx="520" cy="320" r="2.5" fill="rgba(91,108,255,0.10)" class="nn nn-2"/>
      <circle cx="680" cy="200" r="3" fill="rgba(24,169,153,0.08)" class="nn nn-3"/>
      <circle cx="440" cy="340" r="2" fill="rgba(91,108,255,0.09)" class="nn nn-4"/>
      <circle cx="600" cy="500" r="3" fill="rgba(24,169,153,0.07)" class="nn nn-5"/>
      <circle cx="380" cy="520" r="2.5" fill="rgba(91,108,255,0.08)" class="nn nn-6"/>
    </svg>

    <!-- Left: Brand Hero -->
    <section class="login-hero">
      <div class="hero-inner">
        <div class="hero-brand">
          <BrandLogo :size="56" />
          <div class="hero-brand-text">
            <strong>竞赛队友测评墙</strong>
            <span>课程设计 Demo</span>
          </div>
        </div>

        <h1 class="hero-headline">
          <span class="hl-line">让竞赛组队</span>
          <span class="hl-line">不再只靠<span class="hl-grad">感觉</span></span>
        </h1>
        <p class="hero-desc">通过匿名互评、协作画像与队友推荐，帮助同学在组队前了解真实协作风格，降低磨合成本。</p>

        <div class="hero-features">
          <div class="hf-card" style="--d:0">
            <div class="hf-icon hf-icon-a"><el-icon :size="19"><Hide /></el-icon></div>
            <div><strong>匿名互评</strong><p>评价对外为匿名队友，降低人情压力</p></div>
          </div>
          <div class="hf-card" style="--d:1">
            <div class="hf-icon hf-icon-b"><el-icon :size="19"><DataAnalysis /></el-icon></div>
            <div><strong>协作画像</strong><p>自动汇总评分、标签和再组队率</p></div>
          </div>
          <div class="hf-card" style="--d:2">
            <div class="hf-icon hf-icon-c"><el-icon :size="19"><Connection /></el-icon></div>
            <div><strong>队友推荐</strong><p>根据技能方向匹配适合参赛的同学</p></div>
          </div>
        </div>

        <div class="hero-metrics">
          <div class="hm"><span class="hm-num">5</span><span class="hm-lbl">学生画像</span></div>
          <div class="hm"><span class="hm-num">7</span><span class="hm-lbl">有效评价</span></div>
          <div class="hm"><span class="hm-num">4.14</span><span class="hm-lbl">平台均分</span></div>
          <div class="hm"><span class="hm-num">3</span><span class="hm-lbl">竞赛项目</span></div>
        </div>
      </div>
    </section>

    <!-- Right: Login Panel -->
    <section class="login-panel">
      <div class="panel-glass">
        <div class="panel-inner">
          <div class="panel-head">
            <h2>欢迎回来</h2>
            <p>登录后查看你的竞赛协作画像与待评价项目</p>
          </div>

          <el-form :model="form" @submit.prevent="handleLogin">
            <div class="fld">
              <label class="fld-label">学号</label>
              <el-input v-model="form.studentNo" placeholder="请输入学号" size="large" :prefix-icon="UserFilled" />
            </div>
            <div class="fld">
              <label class="fld-label">密码</label>
              <el-input v-model="form.password" type="password" show-password placeholder="请输入密码" size="large" :prefix-icon="Lock" />
            </div>
            <button type="button" class="btn-login" :disabled="loading" @click="handleLogin">
              <span v-if="loading" class="btn-spin"></span>
              <span v-else>登 录</span>
            </button>
          </el-form>

          <div class="panel-foot">
            <span>还没有账号？<router-link to="/register">去注册</router-link></span>
          </div>

          <div class="panel-note">
            <el-icon :size="13"><InfoFilled /></el-icon>
            <span>普通用户只看到匿名评价，管理员保留完整记录用于争议追溯</span>
          </div>
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
import BrandLogo from "@/components/BrandLogo.vue";
import { useUserStore } from "@/store/user";

const router = useRouter();
const userStore = useUserStore();
const loading = ref(false);

const form = reactive({
  studentNo: "2023001",
  password: "Stu@123456"
});

async function handleLogin() {
  if (loading.value) return;
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
/* ===== Full-screen ===== */
.login-page {
  min-height: 100dvh;
  height: 100dvh;
  display: flex;
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(ellipse 70% 50% at 12% 20%, rgba(75,92,240,0.09) 0%, transparent 50%),
    radial-gradient(ellipse 60% 40% at 85% 75%, rgba(24,169,153,0.06) 0%, transparent 50%),
    linear-gradient(155deg, #f7f9ff 0%, #eef4fc 45%, #f8fbff 100%);
}

/* ---- Ambient orbs ---- */
.amb-orbs { position: absolute; inset: 0; pointer-events: none; z-index: 0; }
.amb-orb { position: absolute; border-radius: 50%; filter: blur(120px); }
.ao-1 { width: 460px; height: 460px; background: rgba(75,92,240,0.05); top: -10%; left: -4%; animation: driftA 16s ease-in-out infinite; }
.ao-2 { width: 340px; height: 340px; background: rgba(24,169,153,0.04); bottom: 8%; right: -6%; animation: driftB 18s ease-in-out infinite; }
.ao-3 { width: 240px; height: 240px; background: rgba(75,92,240,0.03); top: 50%; left: 60%; animation: driftA 20s ease-in-out infinite reverse; }
@keyframes driftA { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(24px,-16px) scale(1.04)} 66%{transform:translate(-18px,14px) scale(0.96)} }
@keyframes driftB { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-22px,20px) scale(1.05)} }

/* ===== Network background ===== */
.login-network { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0; opacity: 0.55; }
.nn { animation: nodePulse 4s ease-in-out infinite; }
.nn-2 { animation-delay: 0.6s; } .nn-3 { animation-delay: 1.2s; } .nn-4 { animation-delay: 1.8s; } .nn-5 { animation-delay: 2.4s; } .nn-6 { animation-delay: 3s; }
@keyframes nodePulse { 0%,100%{opacity:0.4} 50%{opacity:1} }

/* ===== Left Hero 58% ===== */
.login-hero {
  flex: 58;
  display: flex; align-items: center;
  padding: clamp(32px, 5vw, 56px) clamp(40px, 6vw, 80px);
  position: relative; z-index: 1;
}
.login-hero::after {
  content: ""; position: absolute; right: 0; top: 10%; bottom: 10%;
  width: 1px;
  background: linear-gradient(180deg, transparent, rgba(75,92,240,0.10), rgba(24,169,153,0.06), transparent);
}

.hero-inner {
  max-width: 680px;
  display: flex; flex-direction: column;
  animation: heroIn 620ms ease both;
}
@keyframes heroIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }

.hero-brand { display: flex; align-items: center; gap: 16px; margin-bottom: clamp(24px, 3vw, 40px); }
.hero-brand-text { display: flex; flex-direction: column; gap: 1px; }
.hero-brand-text strong { font-size: 17px; color: var(--brand-ink); font-weight: 650; }
.hero-brand-text span { font-size: 11px; color: var(--brand-faint); letter-spacing: 0.6px; }

/* Headline */
.hero-headline { margin: 0; }
.hl-line { display: block; font-size: clamp(48px, 5.2vw, 68px); font-weight: 800; color: var(--brand-ink); letter-spacing: -2.8px; line-height: 1.06; }
.hl-grad {
  background: linear-gradient(135deg, #4b5cf0, #6d5dfc);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
}
.hero-desc { margin: clamp(14px, 1.5vw, 22px) 0 0; color: #5f6f89; font-size: 16px; line-height: 1.75; max-width: 500px; }

/* Feature cards */
.hero-features { display: grid; gap: clamp(6px, 0.6vw, 8px); margin-top: clamp(20px, 2.5vw, 32px); }
.hf-card {
  display: flex; gap: 14px; align-items: flex-start;
  padding: clamp(10px, 1vw, 14px) 16px; border-radius: var(--radius-md);
  border: 1px solid rgba(148,163,184,0.14);
  background: rgba(255,255,255,0.52);
  backdrop-filter: blur(10px);
  animation: heroIn 480ms ease both;
  animation-delay: calc(var(--d) * 100ms + 150ms);
  transition: all var(--transition-base);
}
.hf-card:hover {
  border-color: rgba(75,92,240,0.22);
  background: rgba(255,255,255,0.85);
  box-shadow: var(--shadow-sm);
  transform: translateX(4px);
}
.hf-card strong { display: block; font-size: 14px; color: var(--brand-ink); margin-bottom: 1px; }
.hf-card p { margin: 0; font-size: 12px; color: var(--brand-muted); line-height: 1.5; }
.hf-icon { width: 36px; height: 36px; border-radius: 10px; display: grid; place-items: center; flex-shrink: 0; border: 1px solid rgba(0,0,0,0.04); }
.hf-icon-a { background: rgba(75,92,240,0.08); color: #4B5CF0; }
.hf-icon-b { background: rgba(24,169,153,0.08); color: var(--brand-teal); }
.hf-icon-c { background: rgba(217,145,59,0.08); color: var(--brand-amber); }

/* Metrics */
.hero-metrics { display: flex; gap: clamp(24px, 3vw, 44px); margin-top: clamp(20px, 2.5vw, 36px); }
.hm { display: flex; flex-direction: column; gap: 2px; }
.hm-num { font-size: clamp(24px, 2.4vw, 30px); font-weight: 700; color: var(--brand-ink); letter-spacing: -0.4px; }
.hm-lbl { font-size: 12px; color: var(--brand-faint); }

/* ===== Right Login Panel 42% ===== */
.login-panel {
  flex: 42;
  display: flex; align-items: center; justify-content: center;
  padding: clamp(24px, 4vw, 56px) clamp(24px, 3vw, 48px);
  position: relative; z-index: 1;
}

.panel-glass {
  width: 100%; max-width: 420px;
  background: rgba(255,255,255,0.58);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(120,135,180,0.14);
  border-radius: var(--radius-xl);
  box-shadow: 0 20px 60px rgba(15,23,42,0.06);
  animation: heroIn 560ms ease 180ms both;
}

.panel-inner { padding: clamp(28px, 3vw, 40px) clamp(24px, 2.5vw, 36px); }

.panel-head { margin-bottom: clamp(22px, 2.5vw, 32px); }
.panel-head h2 { margin: 0; font-size: 28px; font-weight: 750; color: var(--brand-ink); letter-spacing: -0.4px; }
.panel-head p { margin: 8px 0 0; color: var(--brand-muted); font-size: 14px; line-height: 1.5; }

.fld { margin-bottom: 16px; }
.fld-label { display: block; font-size: 13px; font-weight: 600; color: var(--brand-muted); margin-bottom: 5px; }

/* Premium login button */
.btn-login {
  width: 100%; margin-top: 12px; height: 52px; font-size: 16px; font-weight: 650;
  letter-spacing: 0.4px; border-radius: 16px; border: none; cursor: pointer;
  color: #fff;
  background: linear-gradient(135deg, #5867f2 0%, #4857e8 54%, #3f4ed8 100%);
  box-shadow: 0 16px 34px rgba(72,87,232,0.28), inset 0 1px 0 rgba(255,255,255,0.26);
  transition: all var(--transition-base);
  display: flex; align-items: center; justify-content: center;
}
.btn-login:hover {
  transform: translateY(-1px);
  box-shadow: 0 20px 42px rgba(72,87,232,0.34), inset 0 1px 0 rgba(255,255,255,0.32);
}
.btn-login:active { transform: translateY(1px); box-shadow: 0 8px 20px rgba(72,87,232,0.22); }
.btn-login:disabled { opacity: 0.7; cursor: not-allowed; }
.btn-spin {
  width: 22px; height: 22px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff;
  border-radius: 50%; animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.panel-foot { text-align: center; margin-top: 18px; font-size: 14px; color: var(--brand-muted); }
.panel-foot a { color: var(--brand-primary); font-weight: 600; margin-left: 5px; }

.panel-note {
  display: flex; align-items: center; gap: 7px; margin-top: 20px;
  padding: 9px 13px; border-radius: var(--radius-sm);
  background: rgba(145,163,184,0.05); font-size: 12px; color: var(--brand-faint); line-height: 1.5;
}

/* ===== Responsive ===== */
@media (max-width: 960px) {
  .login-page { flex-direction: column; min-height: auto; }
  .login-hero { padding: 40px 28px 28px; flex: auto; }
  .login-hero::after { display: none; }
  .hl-line { font-size: 42px; }
  .login-panel { padding: 20px 24px 44px; flex: auto; }
  .panel-glass { max-width: 100%; }
  .panel-inner { padding: 28px 24px; }
  .hero-metrics { gap: 28px; flex-wrap: wrap; }
  .hm-num { font-size: 24px; }
}

@media (prefers-reduced-motion: reduce) {
  .amb-orb, .nn, .hf-card, .panel-glass { animation: none !important; }
}
</style>
