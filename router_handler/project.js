const db = require('../db/index')
const { connectToDatabase } = require('../db/index')
exports.getProjects = async (req, res) => {
  //查出当前用户身份
  const db = await connectToDatabase()
  const { id } = req
  const { role_id, project_name } = req.query
  const sql = `select * from projects where 
  project_id in (select project_id from project_visibility where team_id in (select team_id from team_members where user_id = ?))`
  const [projects] = await db.query(sql, [id])
  if (project_name) {
    sql += ` and project_name like "%${project_name}%"`
  }
  res.ssend(projects)
  await db.end()
}
