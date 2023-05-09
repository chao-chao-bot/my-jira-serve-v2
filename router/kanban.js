const express = require('express')
const router = express.Router()

// 导入用户路由处理函数模块
const kanbanHandler = require('../router_handler/kanban')

// 注册新用户
router.post('/kanban/list')
// 登录
router.post('/kanban/edit')

module.exports = router
