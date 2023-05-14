const db = require('../db/index')
const { connectToDatabase } = require('../db/index')
//获取项目列表
exports.getProjects = async (req, res) => {
  //查出当前用户身份 1.通过队员身份 2.通过领导身份
  const db = await connectToDatabase()
  const { user_id } = req
  const { project_name, leader_id } = req.query
  console.log(leader_id)
  let sql = `select * from projects where 
  project_id in (select project_id from project_visibility where team_id in (select team_id from team_members where user_id = ${user_id})) or leader_id = ${user_id}`
  if (project_name) {
    sql += ` and project_name like "%${project_name}%"`
  }
  let sql_leader = null
  if (leader_id) {
    sql_leader = `select * from (${sql}) as t where t.leader_id = ${leader_id}`
  }
  console.log(sql)
  const [projects] = await db.query(leader_id ? sql_leader : sql)
  res.ssend(projects)
  await db.end()
}
