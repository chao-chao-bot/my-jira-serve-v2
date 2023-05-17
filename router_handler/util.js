const { connectToDatabase } = require('../db/index')
exports.swapOrderId = async (table, fromId, referenceId, project_id) => {
  const db = await connectToDatabase()
  if (fromId < referenceId) {
    await db.query(
      `UPDATE ${table} SET order_id = -1 WHERE order_id = ${fromId} and project_id = ${project_id}`
    )
    await db.query(
      `UPDATE ${table} SET order_id = order_id - 1 WHERE order_id > ${fromId} AND order_id <= ${referenceId} and project_id = ${project_id}`
    )
    await db.query(
      `UPDATE ${table} SET order_id = ${referenceId} WHERE order_id = -1 and project_id = ${project_id}`
    )
  } else {
    await db.query(
      `UPDATE ${table} SET order_id = -1 WHERE order_id = ${fromId} and project_id = ${project_id}`
    )
    await db.query(
      `UPDATE ${table} SET order_id = order_id + 1 WHERE order_id < ${fromId} AND order_id >= ${referenceId} and project_id = ${project_id}`
    )
    await db.query(
      `UPDATE ${table} SET order_id = ${referenceId} WHERE order_id = -1 and project_id = ${project_id}`
    )
  }
  await db.end()
}
