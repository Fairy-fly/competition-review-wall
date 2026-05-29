<template>
  <div class="auth-page">
    <section class="auth-surface">
      <div class="auth-header">
        <h1>竞赛队友测评墙</h1>
        <p>先登录，再把竞赛协作的真实口碑串起来。</p>
      </div>

      <el-form :model="form" @submit.prevent="handleLogin">
        <el-form-item label="学号">
          <el-input v-model="form.studentNo" placeholder="请输入学号" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" show-password placeholder="请输入密码" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="auth-submit" :loading="loading" @click="handleLogin">登录</el-button>
        </el-form-item>
      </el-form>

      <div class="auth-footer">
        <span>还没有账号？</span>
        <router-link to="/register">去注册</router-link>
      </div>
    </section>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";

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
.auth-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #e0e7ff 0%, #f8fafc 40%, #dbeafe 100%);
}

.auth-surface {
  width: min(100%, 440px);
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.08);
}

.auth-header h1 {
  margin: 0;
  font-size: 30px;
  color: #111827;
}

.auth-header p {
  margin: 10px 0 24px;
  color: #64748b;
}

.auth-submit {
  width: 100%;
}

.auth-footer {
  margin-top: 8px;
  color: #64748b;
}

.auth-footer a {
  margin-left: 6px;
  color: #2563eb;
}
</style>

