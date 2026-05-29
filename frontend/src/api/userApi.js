import http from "./http";

export function getCurrentUser() {
  return http.get("/users/me");
}

export function updateCurrentUser(data) {
  return http.put("/users/me", data);
}

export function getWallUsers(params) {
  return http.get("/users/wall", { params });
}

