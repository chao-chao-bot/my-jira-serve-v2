const express = require('express')
const router = express.Router()
const taskHandler = require('../router_handler/task')

//获取所有某个项目下的任务
router.get('/task/list', taskHandler.getTasks)
router.get('/task/creatorList', taskHandler.getCreatorList)
router.get('/task/status', taskHandler.getStatus)
router.post('/task/create', taskHandler.createTask)
router.post('/task/edit', taskHandler.editTask)
router.post('/task/delete', taskHandler.deleteTask)
module.exports = router
