<template>
  <div class="register-page">
    <div class="reg-shell">
      <!-- Left: Brand -->
      <section class="reg-hero">
        <div class="reg-hero-inner">
          <div class="reg-brand">
            <BrandLogo :size="48" />
            <div>
              <strong>竞赛队友测评墙</strong>
              <span>课程设计 Demo</span>
            </div>
          </div>
          <h1 class="reg-headline">加入协作画像</h1>
          <p class="reg-desc">创建一个账号，开始记录你的竞赛协作经历。匿名互评、协作画像和队友推荐都会基于真实合作数据生成。</p>
          <div class="reg-features">
            <div class="rf-chip">匿名互评</div>
            <div class="rf-chip">协作画像</div>
            <div class="rf-chip">队友推荐</div>
          </div>
        </div>
      </section>

      <!-- Right: Register form -->
      <section class="reg-panel">
        <div class="reg-card">
          <h2>创建账号</h2>
          <p class="reg-card-sub">注册后即可加入项目并开始互评</p>
          <el-form :model="form" @submit.prevent="handleRegister">
            <el-form-item><el-input v-model="form.studentNo" placeholder="学号" size="large" :prefix-icon="UserFilled" /></el-form-item>
            <el-form-item><el-input v-model="form.realName" placeholder="真实姓名" size="large" /></el-form-item>
            <div class="reg-row">
              <el-form-item><el-input v-model="form.college" placeholder="学院" size="large" /></el-form-item>
              <el-form-item><el-input v-model="form.major" placeholder="专业" size="large" /></el-form-item>
            </div>
            <div class="reg-row">
              <el-form-item><el-input v-model="form.grade" placeholder="年级" size="large" /></el-form-item>
              <el-form-item><el-input v-model="form.skillDirection" placeholder="技能方向" size="large" /></el-form-item>
            </div>
            <el-form-item><el-input v-model="form.password" type="password" show-password placeholder="密码，不少于 6 位" size="large" :prefix-icon="Lock" /></el-form-item>
            <el-form-item><el-input v-model="form.confirmPassword" type="password" show-password placeholder="确认密码" size="large" :prefix-icon="Lock" /></el-form-item>
            <button type="button" class="reg-btn" :disabled="loading" @click="handleRegister">
              <span v-if="loading" class="btn-spin"></span>
              <span v-else>注册并登录</span>
            </button>
          </el-form>
          <div class="reg-foot">
            <span>已经有账号了？<router-link to="/login">返回登录</router-link></span>
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
import { UserFilled, Lock } from "@element-plus/icons-vue";
import BrandLogo from "@/components/BrandLogo.vue";
import { useUserStore } from "@/store/user";

const router = useRouter();
const userStore = useUserStore();
const loading = ref(false);

const form = reactive({
  studentNo: "", realName: "", college: "", major: "", grade: "",
  skillDirection: "", password: "", confirmPassword: ""
});

async function handleRegister() {
  if (form.password !== form.confirmPassword) { ElMessage.error("两次输入的密码不一致"); return; }
  loading.value = true;
  try { await userStore.register(form); ElMessage.success("注册成功，欢迎进入系统"); router.push("/"); }
  catch (e) { ElMessage.error(e.message); }
  finally { loading.value = false; }
}
</script>

<style scoped>
.register-page { min-height:100dvh; height:100dvh; display:flex; position:relative; overflow:hidden; background:
  linear-gradient(rgba(75,92,240,0.045) 1px, transparent 1px),
  linear-gradient(90deg, rgba(75,92,240,0.035) 1px, transparent 1px),
  linear-gradient(155deg, #f7f9ff 0%, #eef4fc 45%, #f8fbff 100%);
  background-size:30px 30px,30px 30px,auto;
}

.reg-shell { display:flex; flex:1; position:relative; z-index:1; }
.reg-hero { flex:48; display:flex; align-items:center; padding:clamp(32px,5vw,56px) clamp(40px,6vw,80px); }
.reg-hero::after { content:""; position:absolute; right:0; top:10%; bottom:10%; width:1px; background:linear-gradient(180deg,transparent,rgba(91,108,255,0.10),rgba(24,169,153,0.06),transparent); }
.reg-hero-inner { max-width:500px; animation:fadeUp 600ms ease both; }
@keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
.reg-brand { display:flex; align-items:center; gap:14px; margin-bottom:36px; }
.reg-brand strong { display:block; font-size:16px; color:var(--brand-ink); }
.reg-brand span { font-size:11px; color:var(--brand-faint); }
.reg-headline { margin:0; font-size:clamp(36px,4.5vw,52px); font-weight:750; color:var(--brand-ink); letter-spacing:-1px; }
.reg-desc { margin:18px 0 0; color:var(--brand-muted); font-size:15px; line-height:1.7; max-width:440px; }
.reg-features { display:flex; gap:8px; margin-top:28px; flex-wrap:wrap; }
.rf-chip { padding:5px 16px; border-radius:20px; font-size:13px; font-weight:500; background:rgba(255,255,255,0.55); border:1px solid rgba(148,163,184,0.14); color:var(--brand-muted); backdrop-filter:blur(6px); }

.reg-panel { flex:52; display:flex; align-items:center; justify-content:center; padding:clamp(24px,4vw,56px) clamp(24px,3vw,48px); }
.reg-card { width:100%; max-width:440px; background:rgba(255,255,255,0.68); backdrop-filter:blur(22px); -webkit-backdrop-filter:blur(22px); border:1px solid rgba(255,255,255,0.7); border-radius:var(--radius-xl); box-shadow:0 28px 80px rgba(31,41,80,0.10), inset 0 1px 0 rgba(255,255,255,0.75); padding:clamp(28px,3vw,40px) clamp(24px,2.5vw,36px); animation:fadeUp 560ms ease 180ms both; }
.reg-card h2 { margin:0 0 6px; font-size:26px; font-weight:700; color:var(--brand-ink); }
.reg-card-sub { margin:0 0 24px; color:var(--brand-muted); font-size:14px; }

.reg-row { display:flex; gap:10px; }
.reg-row .el-form-item { flex:1; margin-bottom:18px; }
.reg-card .el-form-item { margin-bottom:14px; }

.reg-btn { width:100%; height:50px; border-radius:16px; border:none; cursor:pointer; color:#fff; font-size:16px; font-weight:600; background:linear-gradient(135deg,#6470F7,#4F5FEA); box-shadow:0 12px 28px rgba(79,95,234,0.22); transition:all var(--transition-base); display:flex; align-items:center; justify-content:center; margin-top:8px; }
.reg-btn:hover { transform:translateY(-1px); box-shadow:0 16px 36px rgba(79,95,234,0.28); }
.reg-btn:active { transform:translateY(1px); }
.reg-btn:disabled { opacity:0.7; cursor:not-allowed; }
.btn-spin { width:22px; height:22px; border:2px solid rgba(255,255,255,0.3); border-top-color:#fff; border-radius:50%; animation:spin 0.7s linear infinite; }
@keyframes spin { to{transform:rotate(360deg)} }
.reg-foot { text-align:center; margin-top:18px; font-size:14px; color:var(--brand-muted); }
.reg-foot a { color:var(--brand-primary); font-weight:600; margin-left:5px; }

@media (max-width:860px) {
  .register-page { height:auto; min-height:100dvh; overflow:auto; }
  .reg-shell { flex-direction:column; width:100%; min-height:100dvh; }
  .reg-hero { flex:none; padding:28px 24px 10px; }
  .reg-hero::after { display:none; }
  .reg-brand { margin-bottom:18px; }
  .reg-headline { font-size:32px; }
  .reg-desc { margin-top:10px; font-size:14px; }
  .reg-features { margin-top:16px; }
  .reg-panel { flex:none; padding:12px 18px 34px; }
  .reg-card { max-width:100%; padding:24px 18px; }
  .reg-row { flex-direction:column; gap:0; }
  .reg-row .el-form-item { margin-bottom:14px; }
}
@media (prefers-reduced-motion:reduce) { .reg-card { animation:none !important; } }
</style>
