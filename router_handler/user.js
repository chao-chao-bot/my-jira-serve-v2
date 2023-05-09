const db = require('../db/index')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('../config')
const { connectToDatabase } = require('../db/index')
exports.regUser = async (req, res) => {
  const db = await connectToDatabase()
  const userinfo = req.body
  if (!userinfo.username || !userinfo.password) {
    return res.esend('用户名或密码不能为空！')
  }
  const sql = `select * from user where username=?`
  const [rows] = await db.query(sql, [userinfo.username])
  if (rows.length > 0) {
    return res.esend('用户名被占用，请更换其他用户名!')
  }
  userinfo.password = bcrypt.hashSync(userinfo.password, 10)
  const insertSql = 'insert into user set ?'
  const [inserRows] = await db.query(insertSql, [
    { username: userinfo.username, password: userinfo.password }
  ])
  const user = { ...inserRows[0], id: inserRows.insertId, password: '' }
  const tokenStr = jwt.sign(user, config.jwtSecretKey, {
    expiresIn: '10h'
  })
  return res.ssend({
    token: 'Bearer ' + tokenStr,
    username: userinfo.username,
    id: inserRows.insertId
  })
  await db.end()
}
exports.login = async (req, res) => {
  const db = await connectToDatabase()
  const userinfo = req.body
  // 判断数据是否合法
  if (!userinfo.username || !userinfo.password) {
    return res.esend('用户名或密码不能为空！')
  }
  const sql = `select * from user where username=?`
  const [rows] = await db.query(sql, [userinfo.username])
  if (rows.length !== 1) return res.esend('登录失败,请检查账号和密码')
  const compareResult = await bcrypt.compareSync(userinfo.password, rows[0].password)
  if (!compareResult) {
    return res.esend('登录失败,请检查账号和密码')
  }
  const user = { ...rows[0], password: '' }
  const tokenStr = jwt.sign(user, config.jwtSecretKey, {
    expiresIn: '40h'
  })
  setTimeout(() => {
    res.ssend({
      token: 'Bearer ' + tokenStr,
      username: rows[0].username,
      id: rows[0].id
    })
  }, 2000)
  await db.end()
}
