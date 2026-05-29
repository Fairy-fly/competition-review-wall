const projectService = require("../services/projectService");
const { sendSuccess } = require("../utils/response");

async function createProject(req, res, next) {
  try {
    const data = await projectService.createProject(req.user, req.body);
    sendSuccess(res, data, "创建项目成功", 201);
  } catch (error) {
    next(error);
  }
}

async function getMyProjects(req, res, next) {
  try {
    const data = await projectService.getMyProjects(req.user);
    sendSuccess(res, data, "获取我的项目成功");
  } catch (error) {
    next(error);
  }
}

async function getProjectDetail(req, res, next) {
  try {
    const data = await projectService.getProjectDetail(req.user, Number(req.params.id));
    sendSuccess(res, data, "获取项目详情成功");
  } catch (error) {
    next(error);
  }
}

async function addMember(req, res, next) {
  try {
    const data = await projectService.addMember(req.user, Number(req.params.id), req.body);
    sendSuccess(res, data, "添加成员成功");
  } catch (error) {
    next(error);
  }
}

async function updateStatus(req, res, next) {
  try {
    const data = await projectService.updateStatus(req.user, Number(req.params.id), req.body);
    sendSuccess(res, data, "修改项目状态成功");
  } catch (error) {
    next(error);
  }
}

module.exports = {
  addMember,
  createProject,
  getMyProjects,
  getProjectDetail,
  updateStatus
};

