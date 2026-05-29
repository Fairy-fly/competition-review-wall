import http from "./http";

export function getAdminUsers() {
  return http.get("/admin/users");
}

export function getAdminProjects() {
  return http.get("/admin/projects");
}

export function getAdminReviews() {
  return http.get("/admin/reviews");
}

export function hideReview(id) {
  return http.put(`/admin/reviews/${id}/hide`);
}

