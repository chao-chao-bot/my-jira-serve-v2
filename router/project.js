const express = require('express')
const router = express.Router()

// 导入用户路由处理函数模块
const projectHandler = require('../router_handler/project')

// 获取项目列表
router.get('/project/list', projectHandler.getProjects)
//
router.post('/project/edit')

module.exports = router
