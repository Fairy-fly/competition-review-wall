import http from "./http";

export function createReview(data) {
  return http.post("/reviews", data);
}

export function getReceivedReviews(userId) {
  return http.get(`/reviews/received/${userId}`);
}

