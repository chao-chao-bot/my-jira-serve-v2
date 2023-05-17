const db = require('../db/index')
const { connectToDatabase } = require('../db/index')
// 获取看板列表
exports.getBoardList = async (req, res) => {
  const db = await connectToDatabase()
  const { project_id } = req.query
  const sql = `select * from boards where project_id = ${project_id} order by order_id asc`
  const [boardList] = await db.query(sql)

  const selectProjectSQl = `select board_id from tasks where project_id = ${project_id}`
  const [taskList] = await db.query(selectProjectSQl)
  console.log(taskList)
  const boardDisabledId = []
  for (let i = 0; i < taskList.length; i++) {
    const push_id = taskList[i].board_id
    if (boardDisabledId.indexOf(push_id) === -1) {
      boardDisabledId.push(push_id)
    }
  }
  for (let i = 0; i < boardList.length; i++) {
    if (boardDisabledId.includes(boardList[i].board_id)) {
      boardList[i]['disabled'] = true
    } else {
      boardList[i]['disabled'] = false
    }
  }
  res.ssend(boardList)
  await db.end()
}

// 看板排序
exports.reorderBoard = async (req, res) => {
  const db = await connectToDatabase()
  const { fromId, referenceId, project_id, type } = req.body
  if (fromId < referenceId) {
    await db.query(
      `UPDATE boards SET order_id = -1 WHERE order_id = ${fromId} and project_id=${project_id}`
    )
    await db.query(
      `UPDATE boards SET order_id = order_id - 1 WHERE order_id > ${fromId} and order_id <= ${referenceId} and project_id=${project_id}`
    )
    await db.query(
      `UPDATE boards SET order_id = ${referenceId} WHERE order_id = -1 and project_id=${project_id}`
    )
  } else {
    await db.query(
      `UPDATE boards SET order_id = -1  WHERE order_id = ${fromId} and project_id=${project_id}`
    )
    await db.query(
      `UPDATE boards SET order_id = order_id + 1 WHERE order_id < ${fromId} and order_id >= ${referenceId}`
    )
    await db.query(`UPDATE boards SET order_id = ${referenceId} WHERE order_id = -1`)
  }
  const searchSql = `select * from boards where project_id=${project_id}`
  const [result] = await db.query(searchSql)
  res.ssend(result)
  await db.end()
}
// 创建看板
exports.addBoard = async (req, res) => {
  const db = await connectToDatabase()
  const { board_name, project_id } = req.body
  const selectMaxSQl = `select max(order_id) as max_order_id from boards where project_id = ${project_id}`
  const [maxOrder] = await db.query(selectMaxSQl)
  const maxOrderId = maxOrder[0].max_order_id + 1
  const insertData = { board_name, project_id, order_id: maxOrderId, project_id }
  const insetSql = `insert into boards set ? `
  const [result] = await db.query(insetSql, [insertData])
  if (result.affectedRows !== 1) {
    res.esend('创建失败，请稍后再试！')
  }
  res.ssend()
  await db.end()
}
//看板删除
exports.deleteBoard = async (req, res) => {
  const db = await connectToDatabase()
  const { board_id } = req.body
  const deleteSql = `delete from boards where board_id = ${board_id}`
  const [deleteResult] = await db.query(deleteSql)
  if (deleteResult.affectedRows !== 1) {
    return res.esend()
  }
  res.ssend()
  await db.end()
}
