const express = require('express')
const router = express.Router()
const teamHandler = require('../router_handler/team')

//获取所有某个项目下的任务
router.get('/team/leader', teamHandler.getTeamLeader)
module.exports = router
