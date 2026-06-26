import axios from "axios";
import { ElMessage } from "element-plus";

const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 10000
});

service.interceptors.request.use((config) => {
  const token = localStorage.getItem("competition_review_wall_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

service.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || "请求失败";
    if (error.response?.status === 401) {
      localStorage.removeItem("competition_review_wall_token");
      localStorage.removeItem("competition_review_wall_user");
      if (window.location.pathname !== "/login") {
        ElMessage.error("登录状态已过期，请重新登录");
        window.location.href = "/login";
      }
    }
    return Promise.reject(new Error(message));
  }
);

export default service;
