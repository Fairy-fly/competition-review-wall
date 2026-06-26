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

export function lookupUser(params) {
  return http.get("/users/lookup", { params });
}

export function getFavorites() {
  return http.get("/users/favorites");
}

export function addFavorite(targetUserId) {
  return http.post("/users/favorites", { targetUserId });
}

export function removeFavorite(targetUserId) {
  return http.delete(`/users/favorites/${targetUserId}`);
}
