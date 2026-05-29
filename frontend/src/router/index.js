import { createRouter, createWebHistory } from "vue-router";

import AppLayout from "@/layout/AppLayout.vue";
import AdminDashboard from "@/pages/AdminDashboard.vue";
import Home from "@/pages/Home.vue";
import Login from "@/pages/Login.vue";
import Profile from "@/pages/Profile.vue";
import ProjectCreate from "@/pages/ProjectCreate.vue";
import ProjectDetail from "@/pages/ProjectDetail.vue";
import ProjectList from "@/pages/ProjectList.vue";
import Register from "@/pages/Register.vue";
import ReviewCreate from "@/pages/ReviewCreate.vue";
import UserDetail from "@/pages/UserDetail.vue";
import { useUserStore } from "@/store/user";

const routes = [
  {
    path: "/login",
    component: Login,
    meta: { guestOnly: true }
  },
  {
    path: "/register",
    component: Register,
    meta: { guestOnly: true }
  },
  {
    path: "/",
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      { path: "", component: Home },
      { path: "profile", component: Profile },
      { path: "projects", component: ProjectList },
      { path: "projects/create", component: ProjectCreate },
      { path: "projects/:id", component: ProjectDetail },
      { path: "reviews/create", component: ReviewCreate },
      { path: "users/:id", component: UserDetail },
      { path: "admin", component: AdminDashboard, meta: { requiresAdmin: true } }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach(async (to) => {
  const userStore = useUserStore();

  if (userStore.token && !userStore.currentUser) {
    try {
      await userStore.fetchCurrentUser();
    } catch (error) {
      return "/login";
    }
  }

  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    return "/login";
  }

  if (to.meta.guestOnly && userStore.isLoggedIn) {
    return "/";
  }

  if (to.meta.requiresAdmin && userStore.role !== "admin") {
    return "/";
  }

  return true;
});

export default router;

