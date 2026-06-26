import http from "./http";

export function getAdminUsers() {
  return http.get("/admin/users");
}

export function getAdminProjects() {
  return http.get("/admin/projects");
}

export function getAdminReviews(params) {
  return http.get("/admin/reviews", { params });
}

export function hideReview(id, data) {
  return http.put(`/admin/reviews/${id}/hide`, data);
}
