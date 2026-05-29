const bcrypt = require("bcryptjs");

const userDao = require("../dao/userDao");
const { camelizeUser } = require("../utils/helpers");
const { signToken } = require("../utils/jwt");
const { logOperation } = require("../utils/logger");
const { AppError } = require("../utils/response");

function validateRegisterPayload(payload) {
  if (!payload.studentNo || !payload.realName || !payload.password) {
    throw new AppError("学号、姓名和密码不能为空");
  }

  if (String(payload.password).length < 6) {
    throw new AppError("密码长度不能少于 6 位");
  }
}

async function register(payload) {
  validateRegisterPayload(payload);

  const existingUser = await userDao.findByStudentNo(payload.studentNo);
  if (existingUser) {
    throw new AppError("学号已存在");
  }

  const password = await bcrypt.hash(payload.password, 10);
  const userId = await userDao.createUser({
    studentNo: payload.studentNo,
    realName: payload.realName,
    password,
    college: payload.college || "",
    major: payload.major || "",
    grade: payload.grade || "",
    skillDirection: payload.skillDirection || "",
    role: "student"
  });

  const createdUser = await userDao.findById(userId);
  const token = signToken(createdUser);
  await logOperation(userId, "user.register", `studentNo=${payload.studentNo}`);

  return {
    token,
    user: camelizeUser(createdUser)
  };
}

async function login(payload) {
  if (!payload.studentNo || !payload.password) {
    throw new AppError("请输入学号和密码");
  }

  const user = await userDao.findByStudentNo(payload.studentNo);
  if (!user) {
    throw new AppError("学号或密码错误", 401);
  }

  const matched = await bcrypt.compare(payload.password, user.password);
  if (!matched) {
    throw new AppError("学号或密码错误", 401);
  }

  const token = signToken(user);
  await logOperation(user.id, "user.login", `studentNo=${payload.studentNo}`);

  return {
    token,
    user: camelizeUser(user)
  };
}

module.exports = {
  login,
  register
};

