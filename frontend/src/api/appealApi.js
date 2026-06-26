import http from "./http";

export function createAppeal(data) {
  return http.post("/appeals", data);
}

export function getAppeals(params) {
  return http.get("/appeals", { params });
}

export function processAppeal(id, data) {
  return http.put(`/appeals/${id}/process`, data);
}
