const jwt = require("jsonwebtoken");

function signToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      role: user.role
    },
    process.env.JWT_SECRET || "competition-review-wall-demo-secret",
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d"
    }
  );
}

function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET || "competition-review-wall-demo-secret");
}

module.exports = {
  signToken,
  verifyToken
};

