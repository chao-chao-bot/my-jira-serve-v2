const express = require('express')
const router = express.Router()

// 导入用户路由处理函数模块
const projectHandler = require('../router_handler/project')

//获取项目列表
router.get('/project/list', projectHandler.getProjects)
//项目创建
router.post('/project/create', projectHandler.addProject)
//项目编辑
router.post('/project/edit', projectHandler.editProject)
// 项目删除
router.post('/project/delete', projectHandler.deleteProject)
module.exports = router
