const db = require('../db/index')
const { connectToDatabase } = require('../db/index')
//获取任务列表
exports.getTasks = async (req, res) => {
  const db = await connectToDatabase()
  const { project_id, task_name, type, order_id, creator_id, priority } = req.query
  let sql = `select tasks.*,users.username as creator_name from tasks join users  on tasks.creator_id = users.user_id and tasks.project_id=${project_id}`
  if (task_name) {
    sql += ` and task_name like "%${task_name}%"`
  }
  if (type) {
    sql += ` and type = "${type}"`
  }
  if (creator_id) {
    sql += ` and creator_id =  ${creator_id}`
  }
  if (priority) {
    sql += ` and priority = "${priority}"`
  }
  sql += ` order by order_id`
  const [rows] = await db.query(sql)
  res.ssend(rows)
  await db.end()
}
//返回任务创建者
// select tasks.creator_id,users.username as creator_name from tasks join users on users.user_id = tasks.creator_id;
exports.getCreatorList = async (req, res) => {
  const db = await connectToDatabase()
  const { project_id } = req.query
  let sql = `select tasks.creator_id,users.username as creator_name from tasks join users on users.user_id = tasks.creator_id and tasks.project_id = ${project_id}`
  const [rows] = await db.query(sql)
  res.ssend(rows)
  await db.end()
}
