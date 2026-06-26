import http from "./http";

export function getDashboardSummary() {
  return http.get("/dashboard/summary");
}

export function getRecentActivity() {
  return http.get("/dashboard/activity");
}

export function getUserTodos() {
  return http.get("/dashboard/todos");
}

export function getAdminStats() {
  return http.get("/dashboard/admin-stats");
}
