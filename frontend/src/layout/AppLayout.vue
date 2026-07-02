<template>
  <div class="app-layout">
    <aside class="app-sidebar desktop-only" :class="{ collapsed: appStore.collapsed }">
      <div class="brand-block">
        <BrandLogo :size="appStore.collapsed ? 36 : 44" />
        <div v-if="!appStore.collapsed" class="brand-copy">
          <strong>竞赛队友测评墙</strong>
          <span>竞赛协作控制台</span>
        </div>
      </div>

      <el-menu
        :default-active="route.path"
        :collapse="appStore.collapsed"
        background-color="#0b1220"
        text-color="#8b99b0"
        active-text-color="#ffffff"
        router
      >
        <el-menu-item index="/">
          <span>测评墙</span>
        </el-menu-item>
        <el-menu-item index="/recommend">
          <span>队友推荐</span>
        </el-menu-item>
        <el-menu-item index="/profile">
          <span>个人中心</span>
        </el-menu-item>
        <el-menu-item index="/projects">
          <span>竞赛项目</span>
        </el-menu-item>
        <el-menu-item index="/reviews/create">
          <span>提交评价</span>
        </el-menu-item>
        <el-menu-item v-if="userStore.role === 'admin'" index="/admin">
          <span>管理员后台</span>
        </el-menu-item>
      </el-menu>
    </aside>

    <div class="app-main-area" :class="{ 'sidebar-collapsed': appStore.collapsed }">
      <header class="app-topbar">
        <div class="topbar-left">
          <span class="mobile-only menu-trigger" @click="drawerVisible = true">&#9776;</span>
          <span class="mobile-only brand-mark mobile-brand">CW</span>
          <div>
            <div class="topbar-title">欢迎回来，{{ userStore.currentUser?.realName }}</div>
            <div class="topbar-subtitle">
              {{ userStore.currentUser?.college || "未填写学院" }} · {{ userStore.currentUser?.major || "未填写专业" }}
            </div>
          </div>
        </div>

        <div class="topbar-right">
          <el-button class="desktop-only" text @click="appStore.toggleSidebar()">
            {{ appStore.collapsed ? "展开" : "收起" }}
          </el-button>
          <el-tag class="desktop-only" :type="userStore.role === 'admin' ? 'danger' : 'success'">
            {{ userStore.role === "admin" ? "管理员" : "学生" }}
          </el-tag>
          <el-button class="desktop-only" @click="handleLogout">退出登录</el-button>
        </div>
      </header>

      <main class="app-content">
        <router-view />
      </main>
    </div>

    <nav class="bottom-nav mobile-only">
      <router-link to="/" class="nav-item" :class="{ active: route.path === '/' }">
        <span class="nav-label">测评墙</span>
      </router-link>
      <router-link to="/projects" class="nav-item" :class="{ active: route.path.startsWith('/projects') }">
        <span class="nav-label">项目</span>
      </router-link>
      <router-link to="/reviews/create" class="nav-item" :class="{ active: route.path === '/reviews/create' }">
        <span class="nav-label">评价</span>
      </router-link>
      <router-link to="/profile" class="nav-item" :class="{ active: route.path === '/profile' }">
        <span class="nav-label">我的</span>
      </router-link>
    </nav>

    <el-drawer v-model="drawerVisible" direction="ltr" size="72%" title="导航菜单">
      <el-menu :default-active="route.path" router @select="drawerVisible = false">
        <el-menu-item index="/">
          <span>测评墙</span>
        </el-menu-item>
        <el-menu-item index="/recommend">
          <span>队友推荐</span>
        </el-menu-item>
        <el-menu-item index="/profile">
          <span>个人中心</span>
        </el-menu-item>
        <el-menu-item index="/projects">
          <span>竞赛项目</span>
        </el-menu-item>
        <el-menu-item index="/reviews/create">
          <span>提交评价</span>
        </el-menu-item>
        <el-menu-item v-if="userStore.role === 'admin'" index="/admin">
          <span>管理员后台</span>
        </el-menu-item>
      </el-menu>

      <div class="drawer-footer">
        <div class="drawer-user">
          <strong>{{ userStore.currentUser?.realName }}</strong>
          <el-tag size="small" :type="userStore.role === 'admin' ? 'danger' : 'success'" style="margin-left:8px">
            {{ userStore.role === "admin" ? "管理员" : "学生" }}
          </el-tag>
        </div>
        <el-button size="small" @click="handleLogout">退出登录</el-button>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import BrandLogo from "@/components/BrandLogo.vue";
import { useAppStore } from "@/store/app";
import { useUserStore } from "@/store/user";

const appStore = useAppStore();
const userStore = useUserStore();
const route = useRoute();
const router = useRouter();

const drawerVisible = ref(false);

function handleLogout() {
  drawerVisible.value = false;
  userStore.clearSession();
  router.push("/login");
}
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
}

.app-sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 50;
  background:
    linear-gradient(rgba(75,92,240,0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(75,92,240,0.055) 1px, transparent 1px),
    linear-gradient(180deg, var(--sidebar-bg-2), var(--sidebar-bg));
  background-size: 28px 28px, 28px 28px, auto;
  width: var(--sidebar-width);
  transition: width var(--transition-base);
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}

.app-sidebar.collapsed {
  width: var(--sidebar-collapsed);
}

/* Override el-menu in sidebar */
.app-sidebar :deep(.el-menu) {
  border-right: none;
  background: transparent;
}

.app-sidebar :deep(.el-menu-item) {
  color: var(--sidebar-text);
  transition: all var(--transition-base);
  margin: 4px 10px;
  border-radius: 14px;
  padding-left: 20px !important;
  font-weight: 600;
}

.app-sidebar :deep(.el-menu-item:hover) {
  background: var(--sidebar-hover);
  color: #e2e8f0;
}

.app-sidebar :deep(.el-menu-item.is-active) {
  color: #ffffff;
  background: linear-gradient(90deg, rgba(75,92,240,0.62) 0%, rgba(24,169,153,0.20) 100%);
  box-shadow: inset 3px 0 0 var(--brand-teal), 0 10px 22px rgba(2,6,23,0.18);
}

.brand-block {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 16px;
  color: #fff;
  flex-shrink: 0;
}

.brand-block::after {
  content: "";
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(148,163,184,0.28), transparent);
}

.brand-block {
  position: relative;
}

.brand-logo-img {
  border-radius: 8px;
  object-fit: contain;
  flex-shrink: 0;
  transition: width var(--transition-base), height var(--transition-base);
}

.brand-mark {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #2563eb;
  display: grid;
  place-items: center;
  font-weight: 700;
  flex-shrink: 0;
}

.mobile-brand {
  width: 32px;
  height: 32px;
  font-size: 12px;
  flex-shrink: 0;
}

.brand-copy {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 12px;
  color: #cbd5e1;
}

.brand-copy strong {
  color: #ffffff;
  font-size: 14px;
}

.app-main-area {
  margin-left: var(--sidebar-width);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  transition: margin-left var(--transition-base);
}

/* When sidebar is collapsed, reduce the margin */
.app-main-area.sidebar-collapsed {
  margin-left: var(--sidebar-collapsed);
}

.app-topbar {
  position: sticky;
  top: 0;
  z-index: 40;
  height: 72px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(148,163,184,0.18);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  flex-shrink: 0;
}

.topbar-left,
.topbar-right {
  display: flex;
  align-items: center;
  gap: 14px;
}

.topbar-title {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
}

.topbar-subtitle {
  font-size: 12px;
  color: #6b7280;
}

.menu-trigger {
  font-size: 22px;
  cursor: pointer;
  color: #374151;
  padding: 4px;
  line-height: 1;
  user-select: none;
}

.app-content {
  background: transparent;
  flex: 1;
  padding-bottom: 0;
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  min-height: 62px;
  background: rgba(255,255,255,0.94);
  backdrop-filter: blur(12px);
  border-top: 1px solid rgba(148,163,184,0.18);
  display: flex;
  z-index: 100;
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.nav-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: var(--text-faint);
  font-size: 13px;
  transition: color 0.15s, background-color 0.15s;
  margin: 8px 6px;
  border-radius: 16px;
}

.nav-item.active {
  color: var(--brand-primary);
  font-weight: 750;
  background: var(--primary-soft);
  box-shadow: inset 0 -2px 0 rgba(75,92,240,0.45);
}

.nav-label {
  line-height: 1;
}

.drawer-footer {
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
  margin-top: 12px;
}

.drawer-user {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  font-size: 15px;
}

@media (max-width: 768px) {
  .app-sidebar {
    position: static;
    width: 0;
    overflow: hidden;
  }

  .app-sidebar.collapsed {
    width: 0;
  }

  .app-main-area {
    margin-left: 0 !important;
  }

  .app-topbar {
    position: sticky;
    top: 0;
    padding: 0 14px;
    height: 60px;
  }

  .topbar-title {
    font-size: 15px;
  }

  .topbar-left {
    gap: 10px;
  }

  .app-content {
    padding-bottom: 56px;
  }
}
</style>
