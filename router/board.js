const express = require('express')
const router = express.Router()

// 导入用户路由处理函数模块
const boardHandler = require('../router_handler/board')

// 注册新用户
router.post('/board/list')
// 登录
router.post('/board/edit')

module.exports = router
