import http from "./http";

export function createProject(data) {
  return http.post("/projects", data);
}

export function getMyProjects() {
  return http.get("/projects/my");
}

export function getProjectDetail(id) {
  return http.get(`/projects/${id}`);
}

export function getProjectReviewProgress(id) {
  return http.get(`/projects/${id}/review-progress`);
}

export function addProjectMember(id, data) {
  return http.post(`/projects/${id}/members`, data);
}

export function updateProjectStatus(id, data) {
  return http.put(`/projects/${id}/status`, data);
}
