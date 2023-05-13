const db = require('../db/index')
const { connectToDatabase } = require('../db/index')
//获取项目列表
exports.getProjects = async (req, res) => {
  //查出当前用户身份
  const db = await connectToDatabase()
  const { user_id } = req
  const { project_name, leader_id } = req.query
  console.log('后续通过-leaderid进行筛选--', leader_id)
  let sql = `select * from projects where 
  project_id in (select project_id from project_visibility where team_id in (select team_id from team_members where user_id = ?))`
  if (project_name) {
    sql += ` and project_name like "%${project_name}%"`
  }
  const [projects] = await db.query(sql, [user_id])
  res.ssend(projects)
  await db.end()
}
