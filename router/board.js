const express = require('express')
const router = express.Router()

// 导入用户路由处理函数模块
const boardHandler = require('../router_handler/board')

router.get('/board/list', boardHandler.getBoardList)
// 登录
router.post('/board/edit')

module.exports = router
