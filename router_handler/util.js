const { connectToDatabase } = require('../db/index')
exports.reorderData = async (table, fromId, referenceId, id) => {
  const db = await connectToDatabase()

  await db.end() // 关闭连接
}
