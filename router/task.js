const express = require('express')
const router = express.Router()
const taskHandler = require('../router_handler/task')

//获取所有某个项目下的任务
router.get('/task/list', taskHandler.getTasks)
module.exports = router
