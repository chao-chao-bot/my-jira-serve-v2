const db = require('../db/index')
const { connectToDatabase } = require('../db/index')
exports.getTasks = async (req, res) => {
  const db = await connectToDatabase()
  const { project_id, task_name, type, order_id, creator_id } = req.query
  let sql = `select * from tasks where project_id=${project_id}`
  if (task_name) {
    sql += ` and task_name like "%${task_name}%"`
  }
  if (type) {
    sql += ` and type = ${type}`
  }
  if (creator_id) {
    sql += ` and creator_id = ${creator_id}`
  }
  sql += ` order by order_id`
  const [rows] = await db.query(sql)
  res.ssend(rows)
  await db.end()
}
