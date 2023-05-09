const express = require('express')
const router = express.Router()

// 导入用户路由处理函数模块
const userHandler = require('../router_handler/user')

// 注册新用户
router.post('/auth/register', userHandler.regUser)
// 登录
router.post('/auth/login', userHandler.login)

//获取负责人列表
// router.get('/users', userHandler.getUser)

//获取所有用户列表
// router.get('/users/all', userHandler.getAllUsers)

module.exports = router
