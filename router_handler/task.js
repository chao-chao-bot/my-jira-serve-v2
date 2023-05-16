const db = require('../db/index')
const { connectToDatabase } = require('../db/index')
//获取任务列表
exports.getTasks = async (req, res) => {
  const db = await connectToDatabase()
  const { project_id, task_name, type, order_id, creator_id, priority } = req.query
  const { user_id } = req
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
  const [tasks] = await db.query(sql)
  const mapData = tasks.map(task => ({
    ...task,
    disabled: task.creator_id !== user_id
  }))
  res.ssend(mapData)
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
//返回任务状态列表
exports.getStatus = async (req, res) => {
  const db = await connectToDatabase()
  const { project_id } = req.query
  const sql = `select * from boards where project_id = ${project_id}`
  const [rows] = await db.query(sql)
  res.ssend(rows)
  await db.end()
}

// 创建任务
exports.createTask = async (req, res) => {
  const db = await connectToDatabase()
  const { user_id } = req
  console.log(req.body)
  const { task_name, project_id, type, board_id, priority, end_date, task_description } = req.body
  const searchNameSql = `select * from tasks where task_name = "${task_name}" and project_id = ${project_id}`
  const [repeatTask] = await db.query(searchNameSql)
  if (repeatTask.length > 0) {
    return res.esend('当前项目下，任务名已经存在')
  }
  //1. 查找出最大的order_id
  const selectMaxSQl = `select max(order_id) as max_order_id from tasks where project_id = ${project_id}`
  const [maxOrder] = await db.query(selectMaxSQl)
  const order_id = maxOrder[0].max_order_id + 1
  const inserData = {
    task_name,
    project_id,
    type,
    board_id,
    priority,
    end_date,
    task_description,
    order_id,
    creator_id: user_id
  }
  const insertSql = `insert into tasks set ?`
  const [rows] = await db.query(insertSql, [inserData])
  if (rows.affectedRows !== 1) {
    return res.esend('创建失败，请稍后再试！')
  }
  res.ssend()
  await db.end()
}
// 任务编辑
exports.editTask = async (req, res) => {
  const db = await connectToDatabase()
  const { id, task_name, task_description, project_id, type, board_id, priority, end_date } =
    req.body
  const sql = `update tasks set task_name = "${task_name}",task_description = "${task_description}", project_id=${project_id},type="${type}",board_id=${board_id},
  priority="${priority}", end_date="${end_date}" where task_id = ${id}`
  const [updateTask] = await db.query(sql)
  if (updateTask.affectedRows !== 1) {
    return res.ssend('编辑失败，请稍后再试！')
  }
  res.ssend()
  await db.end()
}
// 任务删除
exports.deleteTask = async (req, res) => {
  const db = await connectToDatabase()
  const { task_id } = req.body
  const delteTaskSql = `delete from tasks where task_id = ${task_id}`
  const [deleteResult] = await db.query(delteTaskSql)
  if (deleteResult.affectedRows !== 1) {
    return res.esend('删除失败请稍后再试！')
  }
  res.ssend()
  await db.end()
}
