const db = require('../db/index')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('../config')
const { connectToDatabase } = require('../db/index')
exports.regUser = async (req, res) => {
  const db = await connectToDatabase()
  const { username, password, role_id } = req.body
  if (!username || !password) {
    return res.esend('用户名或密码不能为空！')
  }
  const sql = `select * from users where username=?`
  const [rows] = await db.query(sql, [username])
  if (rows.length > 0) {
    return res.esend('用户名被占用，请更换其他用户名!')
  }
  const insertSql = 'insert into users set ?'
  const [inserRows] = await db.query(insertSql, [{ username, password, role_id }])
  const authSql = `select * from roles where role_id = ?`
  const [authRows] = await db.query(authSql, [role_id])
  const user = { ...inserRows[0], id: inserRows.insertId, password: '' }
  const tokenStr = jwt.sign(user, config.jwtSecretKey, {
    expiresIn: '10h'
  })
  return res.ssend({
    token: 'Bearer ' + tokenStr,
    username: username,
    id: inserRows.insertId,
    auth: authRows[0]
  })
  await db.end()
}

exports.login = async (req, res) => {
  const db = await connectToDatabase()
  const { username, password, role_id } = req.body
  // 判断数据是否合法
  if (!username || !password) {
    return res.esend('用户名或密码不能为空！')
  }
  const sql = `select * from users where username=?`
  const [rows] = await db.query(sql, [username])
  if (rows.length !== 1) return res.esend('登录失败,请检查账号和密码')
  if (!rows[0].password === password) {
    return res.esend('登录失败,请检查账号和密码')
  }
  const authSql = `select * from roles where role_id = ?`
  const [authRows] = await db.query(authSql, [role_id])
  const user = { ...rows[0], password: '' }
  const tokenStr = jwt.sign(user, config.jwtSecretKey, {
    expiresIn: '40h'
  })
  setTimeout(() => {
    res.ssend({
      token: 'Bearer ' + tokenStr,
      username: rows[0].username,
      id: rows[0].id,
      auth: authRows[0]
    })
  }, 2000)
  await db.end()
}
//获取所有的队长和队员
exports.getAllUser = async (req, res) => {
  const db = await connectToDatabase()
  const { code } = req.query
  const sql = `select * from users where username like "%${code}%" and role_id != 1`
  const [rows] = await db.query(sql)
  res.ssend(rows)
  await db.end()
}
