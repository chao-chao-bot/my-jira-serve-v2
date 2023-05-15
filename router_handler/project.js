const db = require('../db/index')
const { connectToDatabase } = require('../db/index')
// 创建项目
exports.addProject = async (req, res) => {
  const db = await connectToDatabase()
  let min = 10400
  let max = 10425
  let randomNum = Math.floor(Math.random() * (max - min + 1)) + min
  const image = `https://admin.atlassian.net/rest/api/2/universal_avatar/view/type/project/avatar/${randomNum}`
  const { user_id } = req
  const { project_description, project_name, team_id } = req.body
  const allSql = `select * from projects where 
  project_id in (select project_id from project_visibility where team_id in (select team_id from team_members where user_id = ${user_id})) or leader_id = ${user_id}`
  const [repeat] = await db.query(allSql)
  if (repeat.some(item => item.project_name === project_name)) {
    return res.esend('项目名称已经存在，请重试')
  }
  const insertSql = 'insert into projects set ?'
  const param = { project_name, project_description, team_id, leader_id: user_id, image }
  const [insertResult] = await db.query(insertSql, [param])
  if (insertResult.affectedRows !== 1) {
    return res.esend('创建项目失败')
  }
  const insertVisSql = 'insert into project_visibility set ?'
  const visParam = { project_id: insertResult.insertId, team_id }
  const [visResult] = await db.query(insertVisSql, [visParam])

  //一个项目创建好后 需要自动新建三个看板在 board表
  //1.查找出在project_id下最大的order_id
  const max_order_id_arr = [1, 2, 3]
  const initStatus = ['in_review', 'in_progress', 'complete']
  const intStatusMap = [
    { board_name: 'in_review', order_id: 1 },
    { board_name: 'in_progress', order_id: 2 },
    { board_name: 'complete', order_id: 3 }
  ]
  const project_id = insertResult.insertId
  const insBoaradSql = `insert into boards set ?`
  //插入到board
  for (let i = 0; i < intStatusMap.length; i++) {
    const insertData = {
      board_name: intStatusMap[i].board_name,
      order_id: intStatusMap[i].order_id,
      project_id
    }
    const [result] = await db.query(insBoaradSql, [insertData])
    if (result.affectedRows !== 1) {
      return res.esend('创建项目失败啦')
    }
  }
  if (visResult.affectedRows !== 1) {
    return res.esend('创建项目失败啦')
  }
  res.ssend()
  await db.end()
}

//获取项目列表
exports.getProjects = async (req, res) => {
  //查出当前用户身份 1.通过队员身份 2.通过领导身份
  const db = await connectToDatabase()
  const { user_id } = req
  const { project_name, leader_id } = req.query
  let sql = `select * from projects where 
  project_id in (select project_id from project_visibility where team_id in (select team_id from team_members where user_id = ${user_id})) or leader_id = ${user_id}`
  if (project_name) {
    sql += ` and project_name like "%${project_name}%"`
  }
  let sql_leader = null
  if (leader_id) {
    sql_leader = `select * from (${sql}) as t where t.leader_id = ${leader_id}`
  }
  const [projects] = await db.query(leader_id ? sql_leader : sql)
  const mapData = projects.map(project => ({ ...project, operable: project.leader_id !== user_id }))
  res.ssend(mapData)
  await db.end()
}

/** 项目编辑*/
exports.editProject = async (req, res) => {
  const db = await connectToDatabase()
  const { user_id } = req
  const { project_id, project_name, project_description, team_id } = req.body
  const allSql = `select * from projects where 
  project_id in (select project_id from project_visibility where team_id in (select team_id from team_members where user_id = ${user_id})) or leader_id = ${user_id}`
  const [repeat] = await db.query(allSql)
  if (repeat.some(item => item.project_name === project_name && item.project_id !== project_id)) {
    return res.esend('项目名称已经存在，请重试')
  }

  const updateProjectSQl = `update projects set project_name="${project_name}", project_description="${project_description}",team_id=${team_id} where project_id=${project_id}`
  const [rows] = await db.query(updateProjectSQl)
  if (rows.affectedRows !== 1) {
    return res.esend('项目编辑错误,请重试')
  }
  const updateVisSql = `update project_visibility set team_id = ${team_id} where project_id = ${project_id}`
  const [visRows] = await db.query(updateVisSql)
  if (visRows.affectedRows !== 1) {
    return res.esend('项目编辑错误,请重试')
  }
  return res.ssend()
  await db.end()
}
/** 项目删除*/
exports.deleteProject = async (req, res) => {
  const db = await connectToDatabase()
  const { project_id } = req.body
  const { user_id } = req
  // 删除项目下的看板 任务列表  项目可见表 任务表
  const deleteBoard = `delete from boards where project_id = ${project_id}`
  const [deleteBoardesult] = await db.query(deleteBoard)
  const deleteTask = `delete from tasks where project_id = ${project_id}`
  const [ddeleteTaskResult] = await db.query(deleteTask)
  const deleteVis = `delete from project_visibility where project_id = ${project_id}`
  const [ddeleteVisResult] = await db.query(deleteVis)
  const deleteProject = `delete from projects where project_id = ${project_id}`
  const [deleteProjectResult] = await db.query(deleteProject)
  if (deleteProjectResult.affectedRows !== 1) {
    return res.esend('删除失败！')
  }
  res.ssend()
  await db.end()
}
