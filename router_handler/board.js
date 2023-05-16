const db = require('../db/index')
const { connectToDatabase } = require('../db/index')
exports.getBoardList = async (req, res) => {
  const db = await connectToDatabase()
  const { project_id } = req.query

  const sql = `select * from boards where project_id = ${project_id} order by order_id asc`
  const [results] = await db.query(sql)
  res.ssend(results)
  await db.end()
}
