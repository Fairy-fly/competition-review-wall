import http from "./http";

export function getProfile(userId) {
  return http.get(`/profile/${userId}`);
}

