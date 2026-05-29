import http from "./http";

export function getTags() {
  return http.get("/tags");
}

