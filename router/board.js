const express = require('express')
const router = express.Router()

// 导入用户路由处理函数模块
const boardHandler = require('../router_handler/board')

router.get('/board/list', boardHandler.getBoardList)
router.post('/board/reorder', boardHandler.reorderBoard)
router.post('/board/add', boardHandler.addBoard)
router.post('/board/delete', boardHandler.deleteBoard)
router.post('/board/edit', boardHandler.editBoard)

module.exports = router
