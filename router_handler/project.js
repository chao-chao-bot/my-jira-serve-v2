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

  console.log('project_id---', insertResult.insertId)
  const insertVisSql = 'insert into project_visibility set ?'
  const visParam = { project_id: insertResult.insertId, team_id }
  const [visResult] = await db.query(insertVisSql, [visParam])
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
  const mapData = projects.map(project => ({ ...project, operable: project.leader_id === user_id }))
  res.ssend(mapData)
  await db.end()
}
