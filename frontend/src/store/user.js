import { defineStore } from "pinia";

import { login, register } from "@/api/authApi";
import { getCurrentUser } from "@/api/userApi";

const TOKEN_KEY = "competition_review_wall_token";
const USER_KEY = "competition_review_wall_user";

export const useUserStore = defineStore("user", {
  state: () => ({
    token: localStorage.getItem(TOKEN_KEY) || "",
    currentUser: JSON.parse(localStorage.getItem(USER_KEY) || "null")
  }),
  getters: {
    isLoggedIn: (state) => Boolean(state.token),
    role: (state) => state.currentUser?.role || "guest"
  },
  actions: {
    persistSession(token, user) {
      this.token = token;
      this.currentUser = user;
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    },
    clearSession() {
      this.token = "";
      this.currentUser = null;
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    },
    async login(form) {
      const response = await login(form);
      this.persistSession(response.data.token, response.data.user);
      return response.data;
    },
    async register(form) {
      const response = await register(form);
      this.persistSession(response.data.token, response.data.user);
      return response.data;
    },
    async fetchCurrentUser() {
      if (!this.token) {
        return null;
      }

      try {
        const response = await getCurrentUser();
        this.persistSession(this.token, response.data);
        return response.data;
      } catch (error) {
        this.clearSession();
        throw error;
      }
    }
  }
});

