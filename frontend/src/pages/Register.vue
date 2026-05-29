<template>
  <div class="auth-page">
    <section class="auth-surface auth-wide">
      <div class="auth-header">
        <h1>创建学生账号</h1>
        <p>课程设计 Demo 版先把基本身份信息和协作方向建起来。</p>
      </div>

      <el-form :model="form" label-width="88px" @submit.prevent="handleRegister">
        <el-form-item label="学号">
          <el-input v-model="form.studentNo" placeholder="请输入学号" />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="form.realName" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="学院">
          <el-input v-model="form.college" placeholder="例如：计算机学院" />
        </el-form-item>
        <el-form-item label="专业">
          <el-input v-model="form.major" placeholder="例如：软件工程" />
        </el-form-item>
        <el-form-item label="年级">
          <el-input v-model="form.grade" placeholder="例如：2023级" />
        </el-form-item>
        <el-form-item label="技能方向">
          <el-input v-model="form.skillDirection" placeholder="例如：前端 / 算法 / 文档答辩" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" show-password placeholder="不少于 6 位" />
        </el-form-item>
        <el-form-item label="确认密码">
          <el-input v-model="form.confirmPassword" type="password" show-password placeholder="再次输入密码" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="auth-submit" :loading="loading" @click="handleRegister">注册并登录</el-button>
        </el-form-item>
      </el-form>

      <div class="auth-footer">
        <span>已经有账号了？</span>
        <router-link to="/login">返回登录</router-link>
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
  studentNo: "",
  realName: "",
  college: "",
  major: "",
  grade: "",
  skillDirection: "",
  password: "",
  confirmPassword: ""
});

async function handleRegister() {
  if (form.password !== form.confirmPassword) {
    ElMessage.error("两次输入的密码不一致");
    return;
  }

  loading.value = true;
  try {
    await userStore.register(form);
    ElMessage.success("注册成功，欢迎进入系统");
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
  background: linear-gradient(135deg, #dbeafe 0%, #f8fafc 50%, #e0e7ff 100%);
}

.auth-surface {
  width: min(100%, 520px);
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.08);
}

.auth-header h1 {
  margin: 0;
  font-size: 28px;
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

