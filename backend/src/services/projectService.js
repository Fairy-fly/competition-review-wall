const projectDao = require("../dao/projectDao");
const reviewDao = require("../dao/reviewDao");
const userDao = require("../dao/userDao");
const { camelizeProject, camelizeUser } = require("../utils/helpers");
const { logOperation } = require("../utils/logger");
const { AppError } = require("../utils/response");

const VALID_STATUSES = ["ongoing", "reviewable", "archived"];

async function createProject(currentUser, payload) {
  if (!payload.name) {
    throw new AppError("项目名称不能为空");
  }

  const projectId = await projectDao.createProject({
    name: payload.name,
    type: payload.type || "",
    teamName: payload.teamName || "",
    startDate: payload.startDate || null,
    endDate: payload.endDate || null,
    creatorId: currentUser.userId,
    status: "ongoing",
    description: payload.description || ""
  });

  await projectDao.addMember(projectId, currentUser.userId, "队长");
  await logOperation(currentUser.userId, "project.create", `projectId=${projectId}`);
  return getProjectDetail(currentUser, projectId);
}

async function getMyProjects(currentUser) {
  const rows = await projectDao.listProjectsByUserId(currentUser.userId);
  return rows.map(camelizeProject);
}

async function getProjectDetail(currentUser, projectId) {
  const project = await projectDao.getProjectById(projectId);
  if (!project) {
    throw new AppError("项目不存在", 404);
  }

  const isMember = await projectDao.isUserMember(projectId, currentUser.userId);
  if (!isMember && currentUser.role !== "admin") {
    throw new AppError("无权查看该项目", 403);
  }

  const members = await projectDao.listProjectMembers(projectId);
  const reviewedUserIds = await reviewDao.listReviewedUserIds(projectId, currentUser.userId);
  const reviewedSet = new Set(reviewedUserIds);

  return {
    ...camelizeProject(project),
    members: members.map((member) => ({
      id: member.user_id,
      studentNo: member.student_no,
      realName: member.real_name,
      college: member.college,
      major: member.major,
      grade: member.grade,
      skillDirection: member.skill_direction,
      role: member.role,
      roleInTeam: member.role_in_team,
      isCreator: member.user_id === project.creator_id,
      canReview:
        member.user_id !== currentUser.userId &&
        project.status !== "ongoing" &&
        !reviewedSet.has(member.user_id)
    }))
  };
}

async function addMember(currentUser, projectId, payload) {
  const project = await projectDao.getProjectById(projectId);
  if (!project) {
    throw new AppError("项目不存在", 404);
  }

  if (project.creator_id !== currentUser.userId && currentUser.role !== "admin") {
    throw new AppError("只有项目创建者可以添加成员", 403);
  }

  if (!payload.studentNo) {
    throw new AppError("请输入队友学号");
  }

  const user = await userDao.findByStudentNo(payload.studentNo);
  if (!user) {
    throw new AppError("未找到该学号对应的用户");
  }

  const alreadyMember = await projectDao.isUserMember(projectId, user.id);
  if (alreadyMember) {
    throw new AppError("该用户已经在项目成员中");
  }

  await projectDao.addMember(projectId, user.id, payload.roleInTeam || "队员");
  await logOperation(currentUser.userId, "project.addMember", `projectId=${projectId}, userId=${user.id}`);
  return getProjectDetail(currentUser, projectId);
}

async function updateStatus(currentUser, projectId, payload) {
  const project = await projectDao.getProjectById(projectId);
  if (!project) {
    throw new AppError("项目不存在", 404);
  }

  if (project.creator_id !== currentUser.userId && currentUser.role !== "admin") {
    throw new AppError("只有项目创建者可以修改项目状态", 403);
  }

  if (!VALID_STATUSES.includes(payload.status)) {
    throw new AppError("项目状态非法");
  }

  await projectDao.updateProjectStatus(projectId, payload.status);
  await logOperation(currentUser.userId, "project.updateStatus", `projectId=${projectId}, status=${payload.status}`);
  return getProjectDetail(currentUser, projectId);
}

async function getAdminProjects() {
  return projectDao.listAllProjects();
}

module.exports = {
  addMember,
  createProject,
  getAdminProjects,
  getMyProjects,
  getProjectDetail,
  updateStatus
};
